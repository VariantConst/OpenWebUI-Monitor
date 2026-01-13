import { query } from '@/lib/db/client'
import { NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/auth'

export async function GET(req: Request) {
    const authError = verifyApiToken(req)
    if (authError) {
        return authError
    }

    try {
        const users = await query('SELECT * FROM users ORDER BY id')
        const modelPrices = await query(
            'SELECT * FROM model_prices ORDER BY id'
        )
        const records = await query(
            'SELECT * FROM user_usage_records ORDER BY id'
        )

        const exportData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            data: {
                users: users.rows,
                model_prices: modelPrices.rows,
                user_usage_records: records.rows,
            },
        }

        const headers = new Headers()
        headers.set('Content-Type', 'application/json')
        headers.set(
            'Content-Disposition',
            `attachment; filename=openwebui_monitor_backup_${
                new Date().toISOString().split('T')[0]
            }.json`
        )

        return new Response(JSON.stringify(exportData, null, 2), {
            headers,
        })
    } catch (error) {
        console.error('Fail to export database:', error)
        return NextResponse.json(
            { error: 'Fail to export database' },
            { status: 500 }
        )
    }
}
