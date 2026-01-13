'use client'

import { useState, useEffect } from 'react'
import dayjs from '@/lib/dayjs'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar as CalendarIcon,
    Clock,
    Sun,
    CalendarDays,
    CalendarRange,
    CalendarClock,
    CalendarCheck,
} from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export type TimeRangeType =
    | 'today'
    | 'week'
    | 'month'
    | '30days'
    | 'all'
    | 'custom'

interface TimeRangeSelectorProps {
    timeRange: [Date, Date]
    timeRangeType: TimeRangeType
    availableTimeRange: {
        minTime: Date
        maxTime: Date
    }
    onTimeRangeChange: (range: [Date, Date], type: TimeRangeType) => void
}

const checkTimeRangeType = (
    startTime: dayjs.Dayjs,
    endTime: dayjs.Dayjs,
    availableTimeRange: { minTime: Date; maxTime: Date }
): TimeRangeType => {
    if (
        dayjs(startTime).isSame(availableTimeRange.minTime, 'hour') &&
        dayjs(endTime).isSame(availableTimeRange.maxTime, 'hour')
    ) {
        return 'all'
    }

    const now = dayjs()
    const isToday = startTime.isSame(now.startOf('day')) && endTime.isSame(now)
    const isWeek = startTime.isSame(now.startOf('week')) && endTime.isSame(now)
    const isMonth =
        startTime.isSame(now.startOf('month')) && endTime.isSame(now)
    const is30Days =
        startTime.isSame(now.subtract(30, 'day'), 'hour') && endTime.isSame(now)

    if (isToday) return 'today'
    if (isWeek) return 'week'
    if (isMonth) return 'month'
    if (is30Days) return '30days'

    return 'custom'
}

export default function TimeRangeSelector({
    timeRange,
    timeRangeType,
    availableTimeRange,
    onTimeRangeChange,
}: TimeRangeSelectorProps) {
    const { t, i18n } = useTranslation('common')
    const [isCustomOpen, setIsCustomOpen] = useState(false)
    const [startOpen, setStartOpen] = useState(false)
    const [endOpen, setEndOpen] = useState(false)

    const [startDate, setStartDate] = useState<Date>(timeRange[0])
    const [endDate, setEndDate] = useState<Date>(timeRange[1])

    useEffect(() => {
        setStartDate(timeRange[0])
        setEndDate(timeRange[1])
    }, [timeRange])

    const timeOptions = [
        {
            id: 'today',
            type: 'today' as TimeRangeType,
            label: t('panel.timeRange.timeOptions.day'),
            icon: Sun,
            getRange: () =>
                [
                    dayjs().startOf('day').toDate(),
                    dayjs().endOf('day').toDate(),
                ] as [Date, Date],
        },
        {
            id: 'week',
            type: 'week' as TimeRangeType,
            label: t('panel.timeRange.timeOptions.week'),
            icon: CalendarDays,
            getRange: () =>
                [
                    dayjs().startOf('week').toDate(),
                    dayjs().endOf('week').toDate(),
                ] as [Date, Date],
        },
        {
            id: 'month',
            type: 'month' as TimeRangeType,
            label: t('panel.timeRange.timeOptions.month'),
            icon: CalendarRange,
            getRange: () =>
                [
                    dayjs().startOf('month').toDate(),
                    dayjs().endOf('month').toDate(),
                ] as [Date, Date],
        },
        {
            id: '30days',
            type: '30days' as TimeRangeType,
            label: t('panel.timeRange.timeOptions.30Days'),
            icon: CalendarClock,
            getRange: () =>
                [
                    dayjs().subtract(29, 'days').startOf('day').toDate(),
                    dayjs().endOf('day').toDate(),
                ] as [Date, Date],
        },
        {
            id: 'all',
            type: 'all' as TimeRangeType,
            label: t('panel.timeRange.timeOptions.all'),
            icon: CalendarCheck,
            getRange: () =>
                [
                    dayjs(availableTimeRange.minTime).startOf('day').toDate(),
                    dayjs(availableTimeRange.maxTime).endOf('day').toDate(),
                ] as [Date, Date],
        },
    ]

    const handleTimeOptionClick = (type: TimeRangeType) => {
        const option = timeOptions.find((opt) => opt.type === type)
        if (!option) return

        const range = option.getRange()
        setStartDate(range[0])
        setEndDate(range[1])
        setIsCustomOpen(false)
        onTimeRangeChange(range, type)
    }

    const handleCustomButtonClick = () => {
        const isOpening = !isCustomOpen
        setIsCustomOpen(isOpening)

        if (isOpening) {
            onTimeRangeChange([startDate, endDate], 'custom')
        }
    }

    const handleDateChange = (start?: Date, end?: Date) => {
        if (!start || !end) return

        const newStart = dayjs(start).startOf('day').toDate()
        const newEnd = dayjs(end).endOf('day').toDate()

        setStartDate(newStart)
        setEndDate(newEnd)
        onTimeRangeChange([newStart, newEnd], 'custom')
    }

    const formatDate = (date?: Date) => {
        if (!date) return t('panel.timeRange.selectDate')
        return format(date, 'yyyy-MM-dd', {
            locale: i18n.language === 'zh' ? zhCN : undefined,
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-medium">
                <Clock className="w-5 h-5 text-primary" />
                <h3>{t('panel.timeRange.title')}</h3>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {timeOptions.map(({ id, type, label, icon: Icon }) => (
                        <motion.div
                            key={id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                variant={
                                    timeRangeType === type
                                        ? 'default'
                                        : 'outline'
                                }
                                className="w-full h-full min-h-[52px] flex flex-col gap-1.5 items-center justify-center"
                                onClick={() => handleTimeOptionClick(type)}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm">{label}</span>
                            </Button>
                        </motion.div>
                    ))}

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            variant={
                                timeRangeType === 'custom'
                                    ? 'default'
                                    : 'outline'
                            }
                            className="w-full h-full min-h-[52px] flex flex-col gap-1.5 items-center justify-center"
                            onClick={handleCustomButtonClick}
                        >
                            <CalendarIcon className="w-4 h-4" />
                            <span className="text-sm">
                                {t('panel.timeRange.timeOptions.custom')}
                            </span>
                        </Button>
                    </motion.div>
                </div>

                <AnimatePresence>
                    {isCustomOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                        >
                            <div className="text-sm text-muted-foreground">
                                {t('panel.timeRange.customRange')}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Popover
                                    open={startOpen}
                                    onOpenChange={setStartOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            className={cn(
                                                'justify-start text-left font-normal w-full sm:w-[240px]',
                                                !startDate &&
                                                    'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formatDate(startDate)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            defaultMonth={startDate}
                                            onSelect={(date) => {
                                                if (date) {
                                                    handleDateChange(
                                                        date,
                                                        endDate
                                                    )
                                                    setStartOpen(false)
                                                }
                                            }}
                                            disabled={(date) =>
                                                endDate
                                                    ? dayjs(date).isAfter(
                                                          endDate,
                                                          'day'
                                                      )
                                                    : false
                                            }
                                            initialFocus
                                            locale={
                                                i18n.language === 'zh'
                                                    ? zhCN
                                                    : undefined
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>

                                <Popover
                                    open={endOpen}
                                    onOpenChange={setEndOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            className={cn(
                                                'justify-start text-left font-normal w-full sm:w-[240px]',
                                                !endDate &&
                                                    'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formatDate(endDate)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            defaultMonth={endDate}
                                            onSelect={(date) => {
                                                if (date) {
                                                    handleDateChange(
                                                        startDate,
                                                        date
                                                    )
                                                    setEndOpen(false)
                                                }
                                            }}
                                            disabled={(date) =>
                                                startDate
                                                    ? dayjs(date).isBefore(
                                                          startDate,
                                                          'day'
                                                      )
                                                    : false
                                            }
                                            initialFocus
                                            locale={
                                                i18n.language === 'zh'
                                                    ? zhCN
                                                    : undefined
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
