import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/db/client'

let initialized = false

export async function GET() {
    if (!initialized) {
        try {
            await initDatabase()
            initialized = true
            return NextResponse.json({
                success: true,
                message: '数据库初始化成功',
            })
        } catch (error) {
            console.error('数据库初始化失败:', error)
            return NextResponse.json(
                { success: false, error: '数据库初始化失败' },
                { status: 500 }
            )
        }
    } else {
        return NextResponse.json({ success: true, message: '数据库已初始化' })
    }
}
