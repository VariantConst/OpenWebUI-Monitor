import { NextResponse } from 'next/server'
import { query } from '@/lib/db/client'
import { verifyApiToken } from '@/lib/auth'

export async function GET(request: Request) {
    const authError = verifyApiToken(request)
    if (authError) {
        return authError
    }

    try {
        const { searchParams } = new URL(request.url)
        const startTime = searchParams.get('startTime')
        const endTime = searchParams.get('endTime')

        console.log('Query params:', [startTime, endTime])

        const timeFilter =
            startTime && endTime
                ? `WHERE use_time >= $1 AND use_time <= $2`
                : ''

        const params = startTime && endTime ? [startTime, endTime] : []

        const [modelResult, userResult, timeRangeResult, statsResult] =
            await Promise.all([
                query(
                    `
        SELECT 
          model_name,
          COUNT(*) as total_count,
          COALESCE(SUM(cost), 0) as total_cost
        FROM user_usage_records
        ${timeFilter}
        GROUP BY model_name
        ORDER BY total_cost DESC
      `,
                    params
                ),
                query(
                    `
        SELECT 
          nickname,
          COUNT(*) as total_count,
          COALESCE(SUM(cost), 0) as total_cost
        FROM user_usage_records
        ${timeFilter}
        GROUP BY nickname
        ORDER BY total_cost DESC
      `,
                    params
                ),
                query(`
        SELECT 
          MIN(use_time) as min_time,
          MAX(use_time) as max_time
        FROM user_usage_records
      `),
                query(
                    `
        SELECT 
          COALESCE(SUM(input_tokens + output_tokens), 0) as total_tokens,
          COUNT(*) as total_calls
        FROM user_usage_records
        ${timeFilter}
      `,
                    params
                ),
            ])

        const formattedData = {
            models: modelResult.rows.map((row) => ({
                model_name: row.model_name,
                total_count: parseInt(row.total_count),
                total_cost: parseFloat(row.total_cost),
            })),
            users: userResult.rows.map((row) => ({
                nickname: row.nickname,
                total_count: parseInt(row.total_count),
                total_cost: parseFloat(row.total_cost),
            })),
            timeRange: {
                minTime: timeRangeResult.rows[0].min_time,
                maxTime: timeRangeResult.rows[0].max_time,
            },
            stats: {
                totalTokens: parseInt(statsResult.rows[0].total_tokens),
                totalCalls: parseInt(statsResult.rows[0].total_calls),
            },
        }

        return NextResponse.json(formattedData)
    } catch (error) {
        console.error('Fail to fetch usage records:', error)
        if (error instanceof Error) {
            console.error('[DB Query Error]', error)
        }
        return NextResponse.json(
            { error: 'Fail to fetch usage records' },
            { status: 500 }
        )
    }
}
