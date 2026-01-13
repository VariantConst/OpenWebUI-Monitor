'use client'

import { useState } from 'react'
import { toast, Toaster } from 'sonner'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { HelpCircle, Loader2, Key, LockKeyhole } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern'

export default function TokenPage() {
    const [token, setToken] = useState('')
    const [loading, setLoading] = useState(false)
    const [showToken, setShowToken] = useState(false)
    const { t } = useTranslation('common')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token.trim()) {
            toast.error(t('auth.accessTokenRequired'))
            return
        }

        setLoading(true)
        try {
            localStorage.setItem('access_token', token)
            const res = await fetch('/api/v1/config', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (res.ok) {
                toast.success(t('auth.loginSuccess'))
                window.location.href = '/'
            } else {
                toast.error(t('auth.invalidToken'))
                localStorage.removeItem('access_token')
            }
        } catch (error) {
            toast.error(t('auth.verificationFailed'))
            localStorage.removeItem('access_token')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-slate-50 to-teal-50 relative overflow-hidden">
            <Toaster
                richColors
                position="top-center"
                theme="light"
                expand
                duration={1500}
            />

            <AnimatedGridPattern
                numSquares={30}
                maxOpacity={0.03}
                duration={3}
                repeatDelay={1}
                className={cn(
                    '[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)]',
                    'absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-12 z-0'
                )}
            />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-rose-100/20 via-slate-100/20 to-teal-100/20 rounded-full blur-3xl opacity-40" />
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-pink-100/10 to-indigo-100/10 rounded-full blur-3xl opacity-30" />
            <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-gradient-to-br from-teal-100/10 to-slate-100/10 rounded-full blur-3xl opacity-30" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md space-y-10 z-10 px-6"
            >
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-center space-y-6"
                >
                    <div className="mx-auto w-20 h-20 flex items-center justify-center">
                        <img
                            src="/icon.png"
                            alt="Logo"
                            className="w-20 h-20 object-contain drop-shadow-xl"
                        />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent">
                        {t('common.appName')}
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="backdrop-blur-[20px] bg-white/[0.08] p-10 rounded-[2.5rem] border border-white/20 shadow-2xl relative overflow-hidden 
            hover:shadow-[0_8px_60px_rgba(120,119,198,0.15)] transition-shadow duration-300 group"
                >
                    <div
                        className="absolute inset-0 rounded-[2.5rem] p-[2px] 
            bg-gradient-to-br from-white/30 via-transparent to-transparent 
            [mask:linear-gradient(black,black)_content-box,linear-gradient(black,black)] 
            [mask-composite:xor] opacity-30 group-hover:opacity-50 transition-opacity"
                    ></div>

                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-100/5 via-transparent to-transparent opacity-20" />

                    <motion.form
                        onSubmit={handleSubmit}
                        className="space-y-8 relative"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1,
                                    delayChildren: 0.3,
                                },
                            },
                        }}
                    >
                        <motion.div
                            className="space-y-6"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                            }}
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <Key className="h-5 w-5 text-slate-500/80" />
                                    <Label
                                        htmlFor="token"
                                        className="text-sm font-medium text-slate-600/90 tracking-wide"
                                    >
                                        {t('auth.accessToken')}
                                    </Label>
                                    <TooltipProvider delayDuration={300}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent
                                                side="right"
                                                className="max-w-[260px] text-xs"
                                            >
                                                {t('auth.accessTokenHelp')}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="token"
                                        type={showToken ? 'text' : 'password'}
                                        value={token}
                                        onChange={(e) =>
                                            setToken(e.target.value)
                                        }
                                        placeholder={t(
                                            'auth.accessTokenPlaceholder'
                                        )}
                                        className="w-full bg-white/20 border-2 border-slate-300/30 hover:border-slate-400/50 
                      focus:border-slate-500/80 focus:ring-2 focus:ring-slate-400/20 
                      transition-all duration-300 placeholder:text-slate-500/70 
                      shadow-sm hover:shadow-md focus:shadow-lg pl-12
                      [&:focus]:bg-white/30 backdrop-blur-sm rounded-xl h-14 text-base"
                                        autoComplete="off"
                                    />
                                    <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500/70" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="flex items-center space-x-2"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                            }}
                        >
                            <Checkbox
                                id="showToken"
                                checked={showToken}
                                onCheckedChange={(checked) =>
                                    setShowToken(checked as boolean)
                                }
                                className="text-slate-600 focus:ring-slate-500 border-2 border-slate-300/50 data-[state=checked]:border-slate-600 data-[state=checked]:bg-slate-600/90"
                            />
                            <Label
                                htmlFor="showToken"
                                className="text-sm font-medium text-slate-600 cursor-pointer select-none"
                            >
                                {t('auth.showToken')}
                            </Label>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.5 }}
                        >
                            <Button
                                onClick={handleSubmit}
                                className="w-full h-14 font-semibold bg-gradient-to-r from-slate-700/90 to-slate-800/90 
                  hover:from-slate-800 hover:to-slate-900 text-white/95 
                  shadow-xl shadow-slate-500/10 hover:shadow-slate-500/20 
                  transition-all duration-300 rounded-xl
                  hover:scale-[0.98] transform-gpu
                  border border-white/10
                  hover:after:opacity-100
                  relative overflow-hidden
                  after:absolute after:inset-0 after:bg-[radial-gradient(200px_circle_at_center,_rgba(255,255,255,0.15)_0%,_transparent_80%)] 
                  after:opacity-0 after:transition-opacity after:duration-300"
                                disabled={loading}
                                size="lg"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        {t('auth.verifying')}
                                    </span>
                                ) : (
                                    <span className="tracking-wide">
                                        {t('common.confirm')}
                                    </span>
                                )}
                            </Button>
                        </motion.div>
                    </motion.form>
                </motion.div>
            </motion.div>
        </div>
    )
}
