import { query } from '@/lib/db/client'
import { NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/auth'

export async function GET(req: Request) {
    const authError = verifyApiToken(req)
    if (authError) {
        return authError
    }

    try {
        const records = await query(`
      SELECT 
        nickname,
        use_time,
        model_name,
        input_tokens,
        output_tokens,
        cost,
        balance_after
      FROM user_usage_records
      ORDER BY use_time DESC
    `)

        const csvHeaders = [
            'User',
            'Time',
            'Model',
            'Input tokens',
            'Output tokens',
            'Cost',
            'Balance',
        ]
        const rows = records.rows.map((record) => [
            record.nickname,
            new Date(record.use_time).toLocaleString(),
            record.model_name,
            record.input_tokens,
            record.output_tokens,
            Number(record.cost).toFixed(4),
            Number(record.balance_after).toFixed(4),
        ])

        const csvContent = [
            csvHeaders.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n')

        const responseHeaders = new Headers()
        responseHeaders.set('Content-Type', 'text/csv; charset=utf-8')
        responseHeaders.set(
            'Content-Disposition',
            'attachment; filename=usage_records.csv'
        )

        return new Response(csvContent, {
            headers: responseHeaders,
        })
    } catch (error) {
        console.error('Fail to export records:', error)
        return NextResponse.json(
            { error: 'Fail to export records' },
            { status: 500 }
        )
    }
}
