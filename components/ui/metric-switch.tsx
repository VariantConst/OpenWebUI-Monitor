'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface MetricSwitchProps {
    value: 'cost' | 'count'
    onChange: (value: 'cost' | 'count') => void
    className?: string
}

export function MetricSwitch({
    value,
    onChange,
    className,
}: MetricSwitchProps) {
    const { t } = useTranslation('common')

    return (
        <div
            className={cn(
                'inline-flex h-9 items-center rounded-lg bg-muted p-1',
                className
            )}
        >
            <div className="relative flex items-center">
                <motion.div
                    className="absolute h-7 rounded-md bg-background shadow-sm"
                    initial={false}
                    animate={{
                        x: value === 'cost' ? 0 : '100%',
                        width: '50%',
                    }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
                <button
                    onClick={() => onChange('cost')}
                    className={cn(
                        'relative px-3 py-1 text-sm font-medium transition-colors duration-200',
                        value === 'cost'
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                    )}
                >
                    {t('panel.byAmount')}
                </button>
                <button
                    onClick={() => onChange('count')}
                    className={cn(
                        'relative px-3 py-1 text-sm font-medium transition-colors duration-200',
                        value === 'count'
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                    )}
                >
                    {t('panel.byCount')}
                </button>
            </div>
        </div>
    )
}
