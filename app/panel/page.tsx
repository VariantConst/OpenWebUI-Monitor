'use client'

import { useState, useEffect } from 'react'
import Head from 'next/head'
import dayjs from '@/lib/dayjs'
import type { TablePaginationConfig } from 'antd/es/table'
import type { SorterResult } from 'antd/es/table/interface'
import type { FilterValue } from 'antd/es/table/interface'
import { message } from 'antd'
import TimeRangeSelector, {
    TimeRangeType,
} from '@/components/panel/TimeRangeSelector'
import ModelDistributionChart from '@/components/panel/ModelDistributionChart'
import UserRankingChart from '@/components/panel/UserRankingChart'
import UsageRecordsTable from '@/components/panel/UsageRecordsTable'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { toast, Toaster } from 'sonner'
import { Card } from '@/components/ui/card'
import {
    BarChartOutlined,
    PieChartOutlined,
    TableOutlined,
} from '@ant-design/icons'
import { Crown, Trophy } from 'lucide-react'

interface ModelUsage {
    model_name: string
    total_cost: number
    total_count: number
}

interface UserUsage {
    nickname: string
    total_cost: number
    total_count: number
}

interface UsageData {
    models: ModelUsage[]
    users: UserUsage[]
    timeRange: {
        minTime: string
        maxTime: string
    }
    stats?: {
        totalTokens: number
        totalCalls: number
    }
}

interface UsageRecord {
    id: number
    nickname: string
    use_time: string
    model_name: string
    input_tokens: number
    output_tokens: number
    cost: number
    balance_after: number
}

interface TableParams {
    pagination: TablePaginationConfig
    sortField?: string
    sortOrder?: 'ascend' | 'descend' | undefined
    filters?: Record<string, FilterValue | null>
}

export default function PanelPage() {
    const { t } = useTranslation('common')
    const [loading, setLoading] = useState(true)
    const [tableLoading, setTableLoading] = useState(true)
    const [dateRange, setDateRange] = useState<[Date, Date]>([
        new Date(),
        new Date(),
    ])
    const [availableTimeRange, setAvailableTimeRange] = useState<{
        minTime: Date
        maxTime: Date
    }>({
        minTime: new Date(),
        maxTime: new Date(),
    })
    const [usageData, setUsageData] = useState<UsageData>({
        models: [],
        users: [],
        timeRange: {
            minTime: '',
            maxTime: '',
        },
    })
    const [pieMetric, setPieMetric] = useState<'cost' | 'count'>('cost')
    const [barMetric, setBarMetric] = useState<'cost' | 'count'>('cost')
    const [records, setRecords] = useState<UsageRecord[]>([])
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10,
            total: 0,
        },
        filters: {
            nickname: null,
            model_name: null,
        },
    })
    const [timeRangeType, setTimeRangeType] = useState<TimeRangeType>('all')

    const fetchUsageData = async (range: [Date, Date]) => {
        setLoading(true)
        try {
            const startTime = dayjs(range[0])
                .startOf('day')
                .format('YYYY-MM-DDTHH:mm:ssZ')
            const endTime = dayjs(range[1])
                .endOf('day')
                .format('YYYY-MM-DDTHH:mm:ssZ')

            const url = `/api/v1/panel/usage?startTime=${startTime}&endTime=${endTime}`
            const token = localStorage.getItem('access_token')
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) throw new Error('Failed to fetch data')

            const data = await response.json()
            setUsageData(data)

            if (timeRangeType === 'all') {
                const minTime = new Date(data.timeRange.minTime)
                const maxTime = new Date(data.timeRange.maxTime)
                setAvailableTimeRange({ minTime, maxTime })
            }
        } catch (error) {
            console.error(t('error.panel.fetchUsageDataFail'), error)
        } finally {
            setLoading(false)
        }
    }

    const fetchRecords = async (params: TableParams, range: [Date, Date]) => {
        setTableLoading(true)
        try {
            const searchParams = new URLSearchParams()
            searchParams.append(
                'page',
                params.pagination.current?.toString() || '1'
            )
            searchParams.append(
                'pageSize',
                params.pagination.pageSize?.toString() || '10'
            )

            if (params.sortField) {
                searchParams.append('sortField', params.sortField)
                searchParams.append('sortOrder', params.sortOrder || 'ascend')
            }
            if (params.filters?.nickname?.length) {
                searchParams.append('users', params.filters.nickname.join(','))
            }
            if (params.filters?.model_name?.length) {
                searchParams.append(
                    'models',
                    params.filters.model_name.join(',')
                )
            }

            searchParams.append(
                'startDate',
                dayjs(range[0]).startOf('day').format('YYYY-MM-DDTHH:mm:ssZ')
            )
            searchParams.append(
                'endDate',
                dayjs(range[1]).endOf('day').format('YYYY-MM-DDTHH:mm:ssZ')
            )

            const token = localStorage.getItem('access_token')
            const response = await fetch(
                `/api/v1/panel/records?${searchParams.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            const data = await response.json()

            setRecords(data.records)
            setTableParams({
                ...params,
                pagination: {
                    ...params.pagination,
                    total: data.total,
                },
            })
        } catch (error) {
            message.error(t('error.panel.fetchUsageDataFail'))
        } finally {
            setTableLoading(false)
        }
    }

    useEffect(() => {
        const loadInitialData = async () => {
            const token = localStorage.getItem('access_token')
            const response = await fetch('/api/v1/panel/usage', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await response.json()

            const minTime = dayjs(data.timeRange.minTime)
                .startOf('day')
                .toDate()
            const maxTime = dayjs(data.timeRange.maxTime).endOf('day').toDate()
            setAvailableTimeRange({ minTime, maxTime })

            const allTimeRange: [Date, Date] = [minTime, maxTime]
            setDateRange(allTimeRange)
            setTimeRangeType('all')

            await fetchUsageData(allTimeRange)
            await fetchRecords(tableParams, allTimeRange)
        }

        loadInitialData()
    }, [])

    const handleTimeRangeChange = async (
        range: [Date, Date],
        type: TimeRangeType
    ) => {
        setTimeRangeType(type)
        setDateRange(range)
        await fetchUsageData(range)
        await fetchRecords(tableParams, range)
    }

    const getReportTitle = (
        type: TimeRangeType,
        t: (key: string) => string
    ) => {
        switch (type) {
            case 'today':
                return t('panel.report.daily')
            case 'week':
                return t('panel.report.weekly')
            case 'month':
                return t('panel.report.monthly')
            case '30days':
                return t('panel.report.thirtyDays')
            case 'all':
                return t('panel.report.overall')
            case 'custom':
                return t('panel.report.custom')
            default:
                return ''
        }
    }

    const renderDateRangeLabel = () => {
        if (dayjs(dateRange[0]).isSame(dateRange[1], 'day')) {
            return dayjs(dateRange[0]).format('YYYY-MM-DD')
        }
        return `${dayjs(dateRange[0]).format('YYYY-MM-DD')} ~ ${dayjs(
            dateRange[1]
        ).format('YYYY-MM-DD')}`
    }

    const formatNumber = (num: number): string => {
        if (num >= 1_000_000_000) {
            return (num / 1_000_000_000).toFixed(1) + 'B'
        }
        if (num >= 1_000_000) {
            return (num / 1_000_000).toFixed(1) + 'M'
        }
        if (num >= 1_000) {
            return (num / 1_000).toFixed(1) + 'K'
        }
        return num.toLocaleString()
    }

    const handleTableChange = (
        pagination: TablePaginationConfig,
        filters: Record<string, FilterValue | null>,
        sorter: SorterResult<UsageRecord> | SorterResult<UsageRecord>[]
    ) => {
        const processedFilters = Object.fromEntries(
            Object.entries(filters).map(([key, value]) => [
                key,
                Array.isArray(value) && value.length === 0 ? null : value,
            ])
        )

        const newParams: TableParams = {
            pagination,
            filters: processedFilters,
            sortField: Array.isArray(sorter)
                ? undefined
                : sorter.field?.toString(),
            sortOrder: Array.isArray(sorter)
                ? undefined
                : (sorter.order as 'ascend' | 'descend' | undefined),
        }
        setTableParams(newParams)
        fetchRecords(newParams, dateRange)
    }

    return (
        <>
            <Head>
                <title>{t('panel.header')}</title>
            </Head>

            <Toaster
                richColors
                position="top-center"
                theme="light"
                expand
                duration={1500}
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 space-y-8">
                <div className="space-y-4 pt-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('panel.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('panel.description')}
                    </p>
                </div>

                <TimeRangeSelector
                    timeRange={dateRange}
                    timeRangeType={timeRangeType}
                    availableTimeRange={availableTimeRange}
                    onTimeRangeChange={handleTimeRangeChange}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="col-span-full bg-gradient-to-br from-card to-card/95 text-card-foreground rounded-xl border shadow-sm overflow-hidden"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />

                            <div className="relative p-6 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center rounded-xl shrink-0">
                                        <BarChartOutlined className="text-xl text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-semibold bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
                                            {getReportTitle(timeRangeType, t)}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {renderDateRangeLabel()}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                    <div className="col-span-2 md:col-span-1 space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {t('panel.overview.totalCost')}
                                        </p>
                                        <p className="text-2xl font-bold text-primary">
                                            {loading
                                                ? '-'
                                                : `${t('common.currency')}${usageData.models
                                                      .reduce(
                                                          (sum, model) =>
                                                              sum +
                                                              model.total_cost,
                                                          0
                                                      )
                                                      .toFixed(2)}`}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {t('panel.overview.totalCalls')}
                                        </p>
                                        <p className="text-2xl font-bold text-emerald-600">
                                            {loading
                                                ? '-'
                                                : formatNumber(
                                                      usageData.stats
                                                          ?.totalCalls || 0
                                                  )}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {t('panel.overview.totalTokens')}
                                        </p>
                                        <p className="text-2xl font-bold text-emerald-600">
                                            {loading
                                                ? '-'
                                                : formatNumber(
                                                      usageData.stats
                                                          ?.totalTokens || 0
                                                  )}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {t('panel.overview.totalUsers')}
                                        </p>
                                        <p className="text-2xl font-bold text-amber-600">
                                            {loading
                                                ? '-'
                                                : usageData.users.length}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {t('panel.overview.totalModels')}
                                        </p>
                                        <p className="text-2xl font-bold text-violet-600">
                                            {loading
                                                ? '-'
                                                : usageData.models.length}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Crown className="w-4 h-4 text-amber-500" />
                                            <h4 className="font-medium">
                                                {t(
                                                    'panel.report.mostUsedModel'
                                                )}
                                            </h4>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-medium">
                                                {loading
                                                    ? '-'
                                                    : usageData.models.length >
                                                        0
                                                      ? usageData.models.reduce(
                                                            (prev, current) =>
                                                                current.total_count >
                                                                prev.total_count
                                                                    ? current
                                                                    : prev
                                                        ).model_name
                                                      : '-'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {loading
                                                    ? '-'
                                                    : usageData.models.length >
                                                        0
                                                      ? t(
                                                            'panel.report.usageCount',
                                                            {
                                                                count: usageData.models.reduce(
                                                                    (
                                                                        prev,
                                                                        current
                                                                    ) =>
                                                                        current.total_count >
                                                                        prev.total_count
                                                                            ? current
                                                                            : prev
                                                                ).total_count,
                                                            }
                                                        )
                                                      : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="w-4 h-4 text-rose-500" />
                                            <h4 className="font-medium">
                                                {t('panel.report.topUser')}
                                            </h4>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-medium">
                                                {loading
                                                    ? '-'
                                                    : usageData.users.length > 0
                                                      ? usageData.users.reduce(
                                                            (prev, current) =>
                                                                current.total_cost >
                                                                prev.total_cost
                                                                    ? current
                                                                    : prev
                                                        ).nickname
                                                      : '-'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {loading
                                                    ? '-'
                                                    : usageData.users.length > 0
                                                      ? t(
                                                            'panel.report.spentAmount',
                                                            {
                                                                amount: usageData.users
                                                                    .reduce(
                                                                        (
                                                                            prev,
                                                                            current
                                                                        ) =>
                                                                            current.total_cost >
                                                                            prev.total_cost
                                                                                ? current
                                                                                : prev
                                                                    )
                                                                    .total_cost.toFixed(
                                                                        2
                                                                    ),
                                                            }
                                                        )
                                                      : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="py-6 bg-card text-card-foreground"
                >
                    <ModelDistributionChart
                        loading={loading}
                        models={usageData.models}
                        metric={pieMetric}
                        onMetricChange={setPieMetric}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="py-6 bg-card text-card-foreground"
                >
                    <UserRankingChart
                        loading={loading}
                        users={usageData.users}
                        metric={barMetric}
                        onMetricChange={setBarMetric}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="py-6 bg-card text-card-foreground"
                >
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                                <TableOutlined className="text-primary" />
                                {t('panel.usageDetails.title')}
                            </h2>
                        </div>
                        <UsageRecordsTable
                            loading={tableLoading}
                            records={records}
                            tableParams={tableParams}
                            models={usageData.models}
                            users={usageData.users}
                            onTableChange={handleTableChange}
                        />
                    </div>
                </motion.div>
            </div>
        </>
    )
}
