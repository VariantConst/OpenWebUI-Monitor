import { query } from './client'

export interface User {
    id: string
    email: string
    name: string
    role: string
    balance: number
}

export async function ensureUserTableExists() {
    const tableExists = await query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'users'
    );
  `)

    if (tableExists.rows[0].exists) {
        await query(`
      ALTER TABLE users 
        ALTER COLUMN balance TYPE DECIMAL(16,4);
    `)

        const columnExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'created_at'
      );
    `)

        if (!columnExists.rows[0].exists) {
            await query(`
        ALTER TABLE users 
          ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      `)
        }

        const deletedColumnExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'deleted'
      );
    `)

        if (!deletedColumnExists.rows[0].exists) {
            await query(`
        ALTER TABLE users 
          ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
      `)
        }
    } else {
        await query(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        balance DECIMAL(16,4) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted BOOLEAN DEFAULT FALSE
      );
    `)

        await query(`
      CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
    `)
    }
}

export async function getOrCreateUser(userData: any) {
    const result = await query(
        `
    INSERT INTO users (id, email, name, role, balance)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE
      SET email = $2, name = $3
      RETURNING *`,
        [
            userData.id,
            userData.email,
            userData.name,
            userData.role || 'user',
            process.env.INIT_BALANCE || '0',
        ]
    )

    return result.rows[0]
}

export async function updateUserBalance(
    userId: string,
    cost: number
): Promise<number> {
    await ensureUserTableExists()

    if (cost > 999999.9999) {
        throw new Error('Balance exceeds maximum allowed value')
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
    )

    if (result.rows.length === 0) {
        throw new Error('User not found')
    }

    return Number(result.rows[0].balance)
}

async function ensureDeletedColumnExists() {
    const deletedColumnExists = await query(`
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'deleted'
    );
  `)

    if (!deletedColumnExists.rows[0].exists) {
        await query(`
      ALTER TABLE users 
        ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
    `)
    }
}

export async function deleteUser(userId: string) {
    await ensureDeletedColumnExists()

    const updateResult = await query(
        `
    UPDATE users 
      SET deleted = TRUE 
      WHERE id = $1`,
        [userId]
    )

    console.log(`User with ID ${userId} marked as deleted.`, updateResult)
}

interface GetUsersOptions {
    page?: number
    pageSize?: number
    sortField?: string | null
    sortOrder?: string | null
    search?: string | null
}

export async function getUsers({
    page = 1,
    pageSize = 20,
    sortField = null,
    sortOrder = null,
    search = null,
}: GetUsersOptions = {}) {
    await ensureDeletedColumnExists()

    const offset = (page - 1) * pageSize

    let whereClause = 'deleted = FALSE'
    const queryParams: any[] = []

    if (search) {
        queryParams.push(`%${search}%`, `%${search}%`)
        whereClause += `
      AND (
        name ILIKE $${queryParams.length - 1} OR 
        email ILIKE $${queryParams.length}
      )`
    }

    const countResult = await query(
        `SELECT COUNT(*) FROM users WHERE ${whereClause}`,
        search ? queryParams : []
    )
    const total = parseInt(countResult.rows[0].count)

    let orderClause = 'created_at DESC'
    if (search) {
        orderClause = `
      CASE 
        WHEN name ILIKE $${queryParams.length + 1} THEN 1
        WHEN name ILIKE $${queryParams.length + 2} THEN 2
        WHEN email ILIKE $${queryParams.length + 3} THEN 3
        ELSE 4
      END`
        queryParams.push(`${search}%`, `%${search}%`, `%${search}%`)
    } else if (sortField && sortOrder) {
        const allowedFields = ['balance', 'name', 'email', 'role']
        if (allowedFields.includes(sortField)) {
            orderClause = `${sortField} ${sortOrder === 'ascend' ? 'ASC' : 'DESC'}`
        }
    }

    queryParams.push(pageSize, offset)
    const result = await query(
        `
    SELECT id, email, name, role, balance, deleted
      FROM users
      WHERE ${whereClause}
      ORDER BY ${orderClause}
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
        queryParams
    )

    return {
        users: result.rows,
        total,
    }
}

export async function getAllUsers(includeDeleted: boolean = false) {
    const whereClause = includeDeleted
        ? ''
        : 'WHERE (deleted = FALSE OR deleted IS NULL)'

    const result = await query(`
    SELECT id, email, name, role, balance, deleted
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
  `)

    return result.rows
}
