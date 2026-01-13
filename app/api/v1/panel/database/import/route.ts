import { query } from '@/lib/db/client'
import { NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/auth'

export async function POST(req: Request) {
    const authError = verifyApiToken(req)
    if (authError) {
        return authError
    }

    try {
        const data = await req.json()

        if (!data.version || !data.data) {
            throw new Error('Invalid import data format')
        }

        try {
            await query('BEGIN')

            await query('TRUNCATE TABLE user_usage_records CASCADE')
            await query('TRUNCATE TABLE model_prices CASCADE')
            await query('TRUNCATE TABLE users CASCADE')

            if (data.data.users?.length) {
                for (const user of data.data.users) {
                    await query(
                        `INSERT INTO users (id, email, name, role, balance)
             VALUES ($1, $2, $3, $4, $5)`,
                        [
                            user.id,
                            user.email,
                            user.name,
                            user.role,
                            user.balance,
                        ]
                    )
                }
            }

            if (data.data.model_prices?.length) {
                for (const price of data.data.model_prices) {
                    await query(
                        `INSERT INTO model_prices (id, name, input_price, output_price)
             VALUES ($1, $2, $3, $4)`,
                        [
                            price.id,
                            price.name,
                            price.input_price,
                            price.output_price,
                        ]
                    )
                }
            }

            if (data.data.user_usage_records?.length) {
                for (const record of data.data.user_usage_records) {
                    await query(
                        `INSERT INTO user_usage_records (
              user_id, nickname, use_time, model_name, 
              input_tokens, output_tokens, cost, balance_after
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                        [
                            record.user_id,
                            record.nickname,
                            record.use_time,
                            record.model_name,
                            record.input_tokens,
                            record.output_tokens,
                            record.cost,
                            record.balance_after,
                        ]
                    )
                }
            }

            await query('COMMIT')

            return NextResponse.json({
                success: true,
                message: 'Data import successful',
            })
        } catch (error) {
            await query('ROLLBACK')
            throw error
        }
    } catch (error) {
        console.error('Fail to import database:', error)
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Fail to import database',
            },
            { status: 500 }
        )
    }
}
