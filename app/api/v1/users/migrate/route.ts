import { NextResponse } from "next/server";
import { verifyApiToken } from "@/lib/auth";
import { query } from "@/lib/db/client";

// Migration operations for existing installations
export async function POST(req: Request) {
  const authError = verifyApiToken(req);
  if (authError) {
    return authError;
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    switch (action) {
      case "set_default_from_current": {
        // Set each user's default_balance to their current balance
        const result = await query(`
          UPDATE users 
            SET default_balance = balance
            WHERE (deleted = FALSE OR deleted IS NULL)
            RETURNING id, name, balance, default_balance;
        `);
        
        return NextResponse.json({
          success: true,
          message: `Set default_balance from current balance for ${result.rows.length} users`,
          users_affected: result.rows.length,
          users: result.rows.map(u => ({
            id: u.id,
            name: u.name,
            balance: Number(u.balance),
            default_balance: Number(u.default_balance),
          })),
        });
      }

      case "set_default_from_init": {
        // Set all users' default_balance to INIT_BALANCE
        const initBalance = process.env.INIT_BALANCE || "0";
        const result = await query(`
          UPDATE users 
            SET default_balance = CAST($1 AS DECIMAL(16,4))
            WHERE (deleted = FALSE OR deleted IS NULL)
            RETURNING id;
        `, [initBalance]);
        
        return NextResponse.json({
          success: true,
          message: `Set default_balance to ${initBalance} for ${result.rows.length} users`,
          users_affected: result.rows.length,
          init_balance: parseFloat(initBalance),
        });
      }

      case "set_default_value": {
        // Set all users' default_balance to a specific value
        const { value } = body;
        if (typeof value !== "number") {
          return NextResponse.json(
            { error: "Value must be a number" },
            { status: 400 }
          );
        }
        
        const result = await query(`
          UPDATE users 
            SET default_balance = CAST($1 AS DECIMAL(16,4))
            WHERE (deleted = FALSE OR deleted IS NULL)
            RETURNING id;
        `, [value]);
        
        return NextResponse.json({
          success: true,
          message: `Set default_balance to ${value} for ${result.rows.length} users`,
          users_affected: result.rows.length,
          default_balance: value,
        });
      }

      case "status": {
        // Get migration status
        const usersResult = await query(`
          SELECT 
            COUNT(*) as total_users,
            COUNT(CASE WHEN default_balance IS NOT NULL AND default_balance > 0 THEN 1 END) as users_with_default,
            COUNT(CASE WHEN default_balance IS NULL OR default_balance = 0 THEN 1 END) as users_without_default
          FROM users
          WHERE (deleted = FALSE OR deleted IS NULL);
        `);
        
        const columnResult = await query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'default_balance'
          ) as has_default_balance_column;
        `);
        
        const settingsResult = await query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'system_settings'
          ) as has_system_settings;
        `);
        
        return NextResponse.json({
          success: true,
          migration_status: {
            has_default_balance_column: columnResult.rows[0].has_default_balance_column,
            has_system_settings_table: settingsResult.rows[0].has_system_settings,
            total_users: parseInt(usersResult.rows[0].total_users),
            users_with_default_balance: parseInt(usersResult.rows[0].users_with_default),
            users_without_default_balance: parseInt(usersResult.rows[0].users_without_default),
          },
          environment: {
            init_balance: process.env.INIT_BALANCE || "0",
            balance_reset_day: process.env.BALANCE_RESET_DAY || "1",
          },
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: "Unknown action. Available actions: set_default_from_current, set_default_from_init, set_default_value, status",
          available_actions: [
            {
              action: "status",
              description: "Get migration status and statistics",
            },
            {
              action: "set_default_from_current",
              description: "Set each user's default_balance to their current balance",
            },
            {
              action: "set_default_from_init",
              description: "Set all users' default_balance to INIT_BALANCE environment variable",
            },
            {
              action: "set_default_value",
              description: "Set all users' default_balance to a specific value",
              params: { value: "number" },
            },
          ],
        }, { status: 400 });
    }
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Migration failed",
      },
      { status: 500 }
    );
  }
}
