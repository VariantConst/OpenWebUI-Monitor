'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface TestProgressProps {
    isVisible: boolean
    models: Array<{
        id: string
        name: string
        testStatus?: 'success' | 'error' | 'testing'
    }>
    isComplete: boolean
}

export function TestProgress({
    isVisible,
    models,
    isComplete,
}: TestProgressProps) {
    const { t } = useTranslation('common')
    const [expandedSection, setExpandedSection] = useState<
        'success' | 'error' | null
    >(null)

    const totalModels = models.length
    const testedModels = models.filter(
        (m) => m.testStatus && m.testStatus !== 'testing'
    ).length
    const successModels = models.filter((m) => m.testStatus === 'success')
    const failedModels = isComplete
        ? models.filter((m) => m.testStatus !== 'success')
        : models.filter((m) => m.testStatus === 'error')
    const pendingModels = models.filter(
        (m) => !m.testStatus || m.testStatus === 'testing'
    )
    const progress = (testedModels / totalModels) * 100

    const StatusSection = ({
        type,
        models,
        count,
        icon,
        color,
        label,
    }: {
        type: 'success' | 'error' | 'pending'
        models: typeof successModels
        count: number
        icon: JSX.Element
        color: string
        label: string
    }) => (
        <div
            className={cn(
                'rounded-lg p-4 transition-colors duration-200',
                color,
                type !== 'pending' &&
                    expandedSection === type &&
                    'ring-2 ring-primary ring-offset-2',
                type !== 'pending' && 'hover:bg-opacity-80 cursor-pointer'
            )}
            onClick={() =>
                type !== 'pending' &&
                setExpandedSection(
                    expandedSection === type
                        ? null
                        : (type as 'success' | 'error')
                )
            }
        >
            <div className="flex items-center gap-2">
                <div className="flex-shrink-0">{icon}</div>
                <div>
                    <div className="text-sm font-medium">{count}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                </div>
            </div>
        </div>
    )

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                >
                    <div className="bg-card border rounded-lg p-4 mb-6">
                        <div className="space-y-4">
                            {isComplete ? (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-sm text-left pb-2"
                                    >
                                        <span className="text-muted-foreground">
                                            {t('models.test.result.complete')}
                                        </span>
                                    </motion.div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-1">
                                            <StatusSection
                                                type="success"
                                                models={successModels}
                                                count={successModels.length}
                                                icon={
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                }
                                                color="bg-green-50"
                                                label={t(
                                                    'models.test.status.valid'
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <StatusSection
                                                type="error"
                                                models={failedModels}
                                                count={failedModels.length}
                                                icon={
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                }
                                                color="bg-red-50"
                                                label={t(
                                                    'models.test.status.invalid'
                                                )}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-3 gap-4">
                                        <StatusSection
                                            type="success"
                                            models={successModels}
                                            count={successModels.length}
                                            icon={
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            }
                                            color="bg-green-50"
                                            label={t(
                                                'models.test.status.valid'
                                            )}
                                        />
                                        <StatusSection
                                            type="error"
                                            models={failedModels}
                                            count={failedModels.length}
                                            icon={
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            }
                                            color="bg-red-50"
                                            label={t(
                                                'models.test.status.invalid'
                                            )}
                                        />
                                        <StatusSection
                                            type="pending"
                                            models={pendingModels}
                                            count={pendingModels.length}
                                            icon={
                                                <Clock className="w-5 h-5 text-blue-500" />
                                            }
                                            color="bg-blue-50"
                                            label={t(
                                                'models.test.status.pending'
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {t(
                                                    'models.test.progress.title'
                                                )}
                                            </span>
                                            <span className="font-medium whitespace-nowrap ml-4">
                                                {testedModels} / {totalModels}
                                            </span>
                                        </div>
                                        <Progress
                                            value={progress}
                                            className="h-2"
                                        />
                                    </div>
                                </>
                            )}

                            <AnimatePresence mode="wait">
                                {expandedSection && (
                                    <motion.div
                                        key={expandedSection}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-3 border-t">
                                            <div className="text-sm font-medium mb-3">
                                                {expandedSection === 'success'
                                                    ? t(
                                                          'models.test.result.success'
                                                      )
                                                    : t(
                                                          'models.test.result.failed'
                                                      )}
                                            </div>
                                            <ScrollArea className="h-[200px] pr-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {(expandedSection ===
                                                    'success'
                                                        ? successModels
                                                        : failedModels
                                                    ).map((model) => (
                                                        <motion.div
                                                            key={model.id}
                                                            initial={{
                                                                x: -20,
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                x: 0,
                                                                opacity: 1,
                                                            }}
                                                            className="flex items-center gap-2 p-2 rounded-md bg-gray-50/80"
                                                        >
                                                            {expandedSection ===
                                                            'success' ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                                            )}
                                                            <span className="text-sm text-muted-foreground truncate">
                                                                {model.name}
                                                            </span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
