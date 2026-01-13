import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const API_KEY = process.env.API_KEY
const ACCESS_TOKEN = process.env.ACCESS_TOKEN

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (
        pathname.startsWith('/api/v1/inlet') ||
        pathname.startsWith('/api/v1/outlet') ||
        pathname.startsWith('/api/v1/models') ||
        pathname.startsWith('/api/v1/panel') ||
        pathname.startsWith('/api/v1/config') ||
        pathname.startsWith('/api/v1/users')
    ) {
        const token =
            pathname.startsWith('/api/v1/panel') ||
            pathname.startsWith('/api/v1/config') ||
            pathname.startsWith('/api/v1/users') ||
            pathname.startsWith('/api/v1/models')
                ? ACCESS_TOKEN
                : API_KEY

        if (!token) {
            console.error('API Key or Access Token is not set')
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            )
        }

        const authHeader = request.headers.get('authorization')
        const providedKey = authHeader?.replace('Bearer ', '')

        if (!providedKey || providedKey !== token) {
            console.log('Invalid API key or token')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return NextResponse.next()
    } else if (!pathname.startsWith('/api/')) {
        if (!ACCESS_TOKEN) {
            console.error('ACCESS_TOKEN is not set')
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            )
        }

        if (pathname === '/token') {
            return NextResponse.next()
        }

        const response = NextResponse.next()
        response.headers.set(
            'Cache-Control',
            'no-store, no-cache, must-revalidate, proxy-revalidate'
        )
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')

        return response
    } else if (pathname.startsWith('/api/config/key')) {
        return NextResponse.next()
    } else if (pathname.startsWith('/api/init')) {
        return NextResponse.next()
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
