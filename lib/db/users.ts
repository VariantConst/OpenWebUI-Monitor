import { query } from "./client";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  balance: number;
  default_balance: number;
}

export async function ensureUserTableExists() {
  const tableExists = await query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'users'
    );
  `);

  if (tableExists.rows[0].exists) {
    await query(`
      ALTER TABLE users 
        ALTER COLUMN balance TYPE DECIMAL(16,4);
    `);

    const columnExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'created_at'
      );
    `);

    if (!columnExists.rows[0].exists) {
      await query(`
        ALTER TABLE users 
          ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      `);
    }

    const deletedColumnExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'deleted'
      );
    `);

    if (!deletedColumnExists.rows[0].exists) {
      await query(`
        ALTER TABLE users 
          ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
      `);
    }

    // Check and add default_balance column (migration for existing installations)
    const defaultBalanceColumnExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'default_balance'
      );
    `);

    if (!defaultBalanceColumnExists.rows[0].exists) {
      console.log("[Migration] Adding default_balance column to users table...");
      await query(`
        ALTER TABLE users 
          ADD COLUMN default_balance DECIMAL(16,4) DEFAULT 0;
      `);
      
      // Initialize default_balance for existing users
      // Use INIT_BALANCE from environment, or fall back to 0
      const initBalance = process.env.INIT_BALANCE || "0";
      const result = await query(`
        UPDATE users 
          SET default_balance = COALESCE(CAST($1 AS DECIMAL(16,4)), 0)
          WHERE default_balance IS NULL OR default_balance = 0
          RETURNING id;
      `, [initBalance]);
      
      console.log(`[Migration] Initialized default_balance=${initBalance} for ${result.rows.length} existing users`);
    }
  } else {
    await query(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        balance DECIMAL(16,4) NOT NULL,
        default_balance DECIMAL(16,4) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted BOOLEAN DEFAULT FALSE
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
    `);
  }
}

export async function getOrCreateUser(userData: any) {
  const initBalance = process.env.INIT_BALANCE || "0";
  const result = await query(
    `
    INSERT INTO users (id, email, name, role, balance, default_balance)
      VALUES ($1, $2, $3, $4, $5, $5)
      ON CONFLICT (id) DO UPDATE
      SET email = $2, name = $3
      RETURNING *`,
    [
      userData.id,
      userData.email,
      userData.name,
      userData.role || "user",
      initBalance,
    ]
  );

  return result.rows[0];
}

export async function updateUserBalance(
  userId: string,
  cost: number
): Promise<number> {
  await ensureUserTableExists();

  if (cost > 999999.9999) {
    throw new Error("Balance exceeds maximum allowed value");
  }

  const result = await query(
    `
    UPDATE users 
      SET balance = LEAST(
        CAST($2 AS DECIMAL(16,4)),
        999999.9999
      )
      WHERE id = $1
      RETURNING balance`,
    [userId, cost]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return Number(result.rows[0].balance);
}

async function ensureDeletedColumnExists() {
  const deletedColumnExists = await query(`
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'deleted'
    );
  `);

  if (!deletedColumnExists.rows[0].exists) {
    await query(`
      ALTER TABLE users 
        ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
    `);
  }
}

export async function deleteUser(userId: string) {
  await ensureDeletedColumnExists();

  const updateResult = await query(
    `
    UPDATE users 
      SET deleted = TRUE 
      WHERE id = $1`,
    [userId]
  );

  console.log(`User with ID ${userId} marked as deleted.`, updateResult);
}

interface GetUsersOptions {
  page?: number;
  pageSize?: number;
  sortField?: string | null;
  sortOrder?: string | null;
  search?: string | null;
}

export async function getUsers({
  page = 1,
  pageSize = 20,
  sortField = null,
  sortOrder = null,
  search = null,
}: GetUsersOptions = {}) {
  await ensureDeletedColumnExists();

  const offset = (page - 1) * pageSize;

  let whereClause = "deleted = FALSE";
  const queryParams: any[] = [];

  if (search) {
    queryParams.push(`%${search}%`, `%${search}%`);
    whereClause += `
      AND (
        name ILIKE $${queryParams.length - 1} OR 
        email ILIKE $${queryParams.length}
      )`;
  }

  const countResult = await query(
    `SELECT COUNT(*) FROM users WHERE ${whereClause}`,
    search ? queryParams : []
  );
  const total = parseInt(countResult.rows[0].count);

  let orderClause = "created_at DESC";
  if (search) {
    orderClause = `
      CASE 
        WHEN name ILIKE $${queryParams.length + 1} THEN 1
        WHEN name ILIKE $${queryParams.length + 2} THEN 2
        WHEN email ILIKE $${queryParams.length + 3} THEN 3
        ELSE 4
      END`;
    queryParams.push(`${search}%`, `%${search}%`, `%${search}%`);
  } else if (sortField && sortOrder) {
    const allowedFields = ["balance", "name", "email", "role"];
    if (allowedFields.includes(sortField)) {
      orderClause = `${sortField} ${sortOrder === "ascend" ? "ASC" : "DESC"}`;
    }
  }

  queryParams.push(pageSize, offset);
  const result = await query(
    `
    SELECT id, email, name, role, balance, default_balance, deleted
      FROM users
      WHERE ${whereClause}
      ORDER BY ${orderClause}
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
    queryParams
  );

  return {
    users: result.rows,
    total,
  };
}

export async function getAllUsers(includeDeleted: boolean = false) {
  const whereClause = includeDeleted
    ? ""
    : "WHERE (deleted = FALSE OR deleted IS NULL)";

  const result = await query(`
    SELECT id, email, name, role, balance, default_balance, deleted
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
  `);

  return result.rows;
}

// Update default_balance for a specific user
export async function updateUserDefaultBalance(
  userId: string,
  defaultBalance: number
): Promise<number> {
  if (defaultBalance > 999999.9999) {
    throw new Error("Default balance exceeds maximum allowed value");
  }

  const result = await query(
    `
    UPDATE users 
      SET default_balance = LEAST(
        CAST($2 AS DECIMAL(16,4)),
        999999.9999
      )
      WHERE id = $1
      RETURNING default_balance`,
    [userId, defaultBalance]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return Number(result.rows[0].default_balance);
}

// Reset all users' balance to their default_balance (for monthly reset)
export async function resetAllBalancesToDefault(): Promise<number> {
  const result = await query(`
    UPDATE users 
      SET balance = default_balance
      WHERE (deleted = FALSE OR deleted IS NULL)
      RETURNING id
  `);

  return result.rows.length;
}

// Reset a single user's balance to their default_balance
export async function resetUserBalanceToDefault(userId: string): Promise<number> {
  const result = await query(
    `
    UPDATE users 
      SET balance = default_balance
      WHERE id = $1
      RETURNING balance`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return Number(result.rows[0].balance);
}

// Get the last balance reset date from system_settings
export async function getLastResetDate(): Promise<Date | null> {
  // Ensure system_settings table exists
  await query(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const result = await query(
    `SELECT value FROM system_settings WHERE key = 'last_balance_reset'`
  );

  if (result.rows.length === 0) {
    return null;
  }

  return new Date(result.rows[0].value);
}

// Update the last balance reset date
export async function updateLastResetDate(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(
    `INSERT INTO system_settings (key, value, updated_at)
     VALUES ('last_balance_reset', $1, CURRENT_TIMESTAMP)
     ON CONFLICT (key) DO UPDATE
     SET value = $1, updated_at = CURRENT_TIMESTAMP`,
    [new Date().toISOString()]
  );
}
