import { NextResponse } from "next/server";
import { verifyApiToken } from "@/lib/auth";
import { resetAllBalancesToDefault, resetUserBalanceToDefault, getLastResetDate, updateLastResetDate } from "@/lib/db/users";
import { getSchedulerStatus } from "@/lib/scheduler";

// Get the configured reset day from environment (1-31), default is 1 (first of month)
function getResetDay(): number {
  const day = parseInt(process.env.BALANCE_RESET_DAY || "1", 10);
  return Math.min(Math.max(day, 1), 31); // Clamp between 1 and 31
}

// Check if today is the reset day and if reset hasn't been done this month
async function shouldAutoReset(): Promise<boolean> {
  const resetDay = getResetDay();
  const today = new Date();
  const currentDay = today.getDate();
  
  if (currentDay !== resetDay) {
    return false;
  }
  
  // Check if we already reset this month
  const lastReset = await getLastResetDate();
  if (lastReset) {
    const lastResetMonth = lastReset.getMonth();
    const lastResetYear = lastReset.getFullYear();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Already reset this month
    if (lastResetMonth === currentMonth && lastResetYear === currentYear) {
      return false;
    }
  }
  
  return true;
}

// GET: Check reset status and configuration
export async function GET(req: Request) {
  const authError = verifyApiToken(req);
  if (authError) {
    return authError;
  }

  try {
    const resetDay = getResetDay();
    const lastReset = await getLastResetDate();
    const shouldReset = await shouldAutoReset();
    const schedulerStatus = getSchedulerStatus();
    
    return NextResponse.json({
      success: true,
      reset_day: resetDay,
      last_reset: lastReset?.toISOString() || null,
      should_reset_today: shouldReset,
      scheduler: schedulerStatus,
    });
  } catch (error) {
    console.error("Error checking reset status:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check reset status" },
      { status: 500 }
    );
  }
}

// Reset all users' balances to their default_balance
export async function POST(req: Request) {
  const authError = verifyApiToken(req);
  if (authError) {
    return authError;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { userId, force } = body;

    if (userId) {
      // Reset single user
      const newBalance = await resetUserBalanceToDefault(userId);
      return NextResponse.json({
        success: true,
        message: `Balance reset for user ${userId}`,
        new_balance: newBalance,
      });
    } else {
      // Check if auto-reset should happen (unless forced)
      if (!force) {
        const shouldReset = await shouldAutoReset();
        if (!shouldReset) {
          const resetDay = getResetDay();
          const lastReset = await getLastResetDate();
          return NextResponse.json({
            success: false,
            message: `Reset not needed. Reset day is ${resetDay}, last reset was ${lastReset?.toISOString() || 'never'}`,
            reset_day: resetDay,
            last_reset: lastReset?.toISOString() || null,
          });
        }
      }
      
      // Reset all users
      const count = await resetAllBalancesToDefault();
      await updateLastResetDate();
      
      return NextResponse.json({
        success: true,
        message: `Reset balances for ${count} users to their default values`,
        users_affected: count,
        reset_date: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error resetting balances:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to reset balances",
      },
      { status: 500 }
    );
  }
}
