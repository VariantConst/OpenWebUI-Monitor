'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function AuthCheck({ children }: { children: React.ReactNode }) {
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const initDb = async () => {
            try {
                await fetch('/api/init')
            } catch (error) {
                console.error('Failed to initialize database:', error)
            }
        }

        initDb()
    }, [])

    useEffect(() => {
        const checkAuth = async () => {
            if (pathname === '/token') {
                setIsLoading(false)
                setIsAuthorized(true)
                return
            }

            const token = localStorage.getItem('access_token')
            if (!token) {
                router.push('/token')
                return
            }

            try {
                const res = await fetch('/api/v1/config', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!res.ok) {
                    localStorage.removeItem('access_token')
                    router.push('/token')
                    return
                }

                setIsAuthorized(true)
            } catch (error) {
                localStorage.removeItem('access_token')
                router.push('/token')
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [router, pathname])

    if (isLoading || !isAuthorized) {
        return null
    }

    return <>{children}</>
}
