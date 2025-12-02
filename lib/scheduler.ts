import { resetAllBalancesToDefault, getLastResetDate, updateLastResetDate } from "@/lib/db/users";

let schedulerInterval: ReturnType<typeof setInterval> | null = null;
let isInitialized = false;

// Get the configured reset day from environment (1-31), default is 1 (first of month)
function getResetDay(): number {
  const day = parseInt(process.env.BALANCE_RESET_DAY || "1", 10);
  return Math.min(Math.max(day, 1), 31);
}

// Check if auto-reset is enabled (BALANCE_RESET_DAY > 0)
function isAutoResetEnabled(): boolean {
  const day = parseInt(process.env.BALANCE_RESET_DAY || "1", 10);
  return day > 0;
}

// Check if today is the reset day and if reset hasn't been done this month
async function shouldAutoReset(): Promise<boolean> {
  if (!isAutoResetEnabled()) {
    return false;
  }

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

// Perform the automatic reset check
async function checkAndReset(): Promise<void> {
  try {
    const shouldReset = await shouldAutoReset();
    
    if (shouldReset) {
      console.log(`[Scheduler] Reset day reached. Resetting all balances to default...`);
      const count = await resetAllBalancesToDefault();
      await updateLastResetDate();
      console.log(`[Scheduler] Successfully reset balances for ${count} users.`);
    }
  } catch (error) {
    console.error("[Scheduler] Error during auto-reset check:", error);
  }
}

// Initialize the scheduler
export function initScheduler(): void {
  if (isInitialized) {
    console.log("[Scheduler] Already initialized, skipping...");
    return;
  }

  if (!isAutoResetEnabled()) {
    console.log("[Scheduler] Auto-reset disabled (BALANCE_RESET_DAY=0 or not set)");
    return;
  }

  const resetDay = getResetDay();
  console.log(`[Scheduler] Initializing with reset day: ${resetDay}`);

  // Check immediately on startup
  checkAndReset();

  // Check every hour (3600000ms)
  schedulerInterval = setInterval(checkAndReset, 60 * 60 * 1000);

  isInitialized = true;
  console.log("[Scheduler] Started - checking every hour for reset day");
}

// Stop the scheduler
export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    isInitialized = false;
    console.log("[Scheduler] Stopped");
  }
}

// Get scheduler status
export function getSchedulerStatus(): {
  enabled: boolean;
  resetDay: number;
  isRunning: boolean;
} {
  return {
    enabled: isAutoResetEnabled(),
    resetDay: getResetDay(),
    isRunning: isInitialized,
  };
}
