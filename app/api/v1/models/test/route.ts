import { NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/auth'

export async function POST(req: Request) {
    const authError = verifyApiToken(req)
    if (authError) {
        return authError
    }

    try {
        const { modelId } = await req.json()

        if (!modelId) {
            return NextResponse.json({
                success: false,
                message: 'Model ID cannot be empty',
            })
        }

        const domain = process.env.OPENWEBUI_DOMAIN
        const apiKey = process.env.OPENWEBUI_API_KEY

        if (!domain || !apiKey) {
            return NextResponse.json({
                success: false,
                message: 'Environment variables not configured correctly',
            })
        }

        const apiUrl = domain.replace(/\/+$/, '') + '/api/chat/completions'

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: modelId,
                messages: [
                    {
                        role: 'user',
                        content: 'test, just say hi',
                    },
                ],
            }),
        })

        const responseText = await response.text()
        let data

        try {
            data = JSON.parse(responseText)
        } catch (e) {
            return NextResponse.json({
                success: false,
                message: `Fail to resolve response: ${responseText}`,
            })
        }

        if (!response.ok) {
            return NextResponse.json({
                success: false,
                message:
                    data.error ||
                    `API request failed: ${response.status} ${response.statusText}`,
            })
        }

        if (!data.choices?.[0]?.message?.content) {
            return NextResponse.json({
                success: false,
                message: 'Invalid response format',
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Test successful',
            response: data.choices[0].message.content,
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
        })
    }
}
