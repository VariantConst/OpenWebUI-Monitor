import { NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/auth'

export async function GET(req: Request) {
    const authError = verifyApiToken(req)
    if (authError) {
        return authError
    }

    const apiKey = process.env.API_KEY

    if (!apiKey) {
        return NextResponse.json(
            { error: 'API Key Not Configured' },
            { status: 500 }
        )
    }

    return NextResponse.json({ apiKey })
}
