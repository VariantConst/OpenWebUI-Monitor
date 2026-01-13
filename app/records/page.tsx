'use client'

import { useState, useEffect } from 'react'
import { Table, DatePicker, Space } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { FilterValue, SorterResult } from 'antd/es/table/interface'
import {
    DownloadOutlined,
    CalendarOutlined,
    TableOutlined,
} from '@ant-design/icons'
import type { RangePickerProps } from 'antd/es/date-picker'
import zhCN from 'antd/lib/locale/zh_CN'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { toast, Toaster } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const { RangePicker } = DatePicker

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
    sortOrder?: string
    filters?: Record<string, FilterValue | null>
    dateRange?: RangePickerProps['value']
}

export default function RecordsPage() {
    const { t } = useTranslation('common')
    const [loading, setLoading] = useState(true)
    const [records, setRecords] = useState<UsageRecord[]>([])
    const [users, setUsers] = useState<string[]>([])
    const [models, setModels] = useState<string[]>([])
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10,
            total: 0,
        },
    })

    const columns: ColumnsType<UsageRecord> = [
        {
            title: t('records.columns.user'),
            dataIndex: 'nickname',
            key: 'nickname',
            filters: users.map((user) => ({ text: user, value: user })),
            filterMode: 'tree',
            filterSearch: true,
            width: 200,
            render: (text) => <div className="font-medium">{text}</div>,
        },
        {
            title: t('records.columns.time'),
            dataIndex: 'use_time',
            key: 'use_time',
            render: (text) => (
                <div className="text-muted-foreground">
                    {new Date(text).toLocaleString()}
                </div>
            ),
            sorter: true,
            width: 180,
        },
        {
            title: t('records.columns.model'),
            dataIndex: 'model_name',
            key: 'model_name',
            filters: models.map((model) => ({ text: model, value: model })),
            filterMode: 'tree',
            filterSearch: true,
            width: 200,
        },
        {
            title: t('records.columns.tokens'),
            dataIndex: 'input_tokens',
            key: 'input_tokens',
            align: 'right',
            sorter: true,
            width: 120,
            render: (input, record) => (
                <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                        {t('records.input')}: {input}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {t('records.output')}: {record.output_tokens}
                    </div>
                </div>
            ),
        },
        {
            title: t('records.columns.cost'),
            dataIndex: 'cost',
            key: 'cost',
            align: 'right',
            width: 120,
            render: (value) => (
                <div className="font-medium text-primary">
                    {t('common.currency')}
                    {Number(value).toFixed(4)}
                </div>
            ),
            sorter: true,
        },
        {
            title: t('records.columns.balance'),
            dataIndex: 'balance_after',
            key: 'balance_after',
            align: 'right',
            width: 120,
            render: (value) => (
                <div className="font-medium">
                    {t('common.currency')}
                    {Number(value).toFixed(4)}
                </div>
            ),
            sorter: true,
        },
    ]

    const fetchRecords = async (params: TableParams) => {
        setLoading(true)
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

            if (params.dateRange) {
                const [start, end] = params.dateRange
                if (start && end) {
                    searchParams.append('startDate', start.format('YYYY-MM-DD'))
                    searchParams.append('endDate', end.format('YYYY-MM-DD'))
                }
            }

            if (params.filters) {
                if (params.filters.nickname) {
                    searchParams.append(
                        'user',
                        params.filters.nickname[0] as string
                    )
                }
                if (params.filters.model_name) {
                    searchParams.append(
                        'model',
                        params.filters.model_name[0] as string
                    )
                }
            }

            const response = await fetch(
                `/api/v1/panel/records?${searchParams.toString()}`
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

            setUsers(data.users as string[])
            setModels(data.models as string[])
        } catch (error) {
            toast.error(t('error.panel.fetchUsageDataFail'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRecords(tableParams)
    }, [])

    const handleTableChange = (
        pagination: TablePaginationConfig,
        filters: Record<string, FilterValue | null>,
        sorter: SorterResult<UsageRecord> | SorterResult<UsageRecord>[]
    ) => {
        const newParams: TableParams = {
            pagination,
            filters,
            sortField: Array.isArray(sorter)
                ? undefined
                : sorter.field?.toString(),
            sortOrder: Array.isArray(sorter)
                ? undefined
                : sorter.order === null
                  ? undefined
                  : sorter.order,
            dateRange: tableParams.dateRange,
        }
        setTableParams(newParams)
        fetchRecords(newParams)
    }

    const handleExport = async () => {
        try {
            const response = await fetch('/api/v1/panel/records/export')
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `usage_records_${
                new Date().toISOString().split('T')[0]
            }.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            toast.error(t('error.model.failToExport'))
        }
    }

    const tableClassName = `
    [&_.ant-table]:!border-b-0 
    [&_.ant-table-container]:!rounded-xl 
    [&_.ant-table-container]:!border-hidden
    [&_.ant-table-cell]:!border-border/40
    [&_.ant-table-thead_.ant-table-cell]:!bg-muted/30
    [&_.ant-table-thead_.ant-table-cell]:!text-muted-foreground
    [&_.ant-table-thead_.ant-table-cell]:!font-medium
    [&_.ant-table-thead_.ant-table-cell]:!text-sm
    [&_.ant-table-thead]:!border-b
    [&_.ant-table-thead]:border-border/40
    [&_.ant-table-row]:!transition-colors
    [&_.ant-table-row:hover>*]:!bg-muted/60
    [&_.ant-table-tbody_.ant-table-row]:!cursor-pointer
    [&_.ant-table-tbody_.ant-table-cell]:!py-4
    [&_.ant-table-row:last-child>td]:!border-b-0
    [&_.ant-table-cell:first-child]:!pl-6
    [&_.ant-table-cell:last-child]:!pr-6
  `

    return (
        <>
            <Toaster
                richColors
                position="top-center"
                theme="light"
                expand
                duration={1500}
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 space-y-8">
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('records.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('records.description')}
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="p-6">
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <CalendarOutlined className="text-primary" />
                                    <span className="font-medium">
                                        {t('records.dateRange')}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <RangePicker
                                        locale={zhCN.DatePicker}
                                        className="!w-full sm:!w-auto"
                                        onChange={(dates) => {
                                            const newParams = {
                                                ...tableParams,
                                                dateRange: dates,
                                                pagination: {
                                                    ...tableParams.pagination,
                                                    current: 1,
                                                },
                                            }
                                            setTableParams(newParams)
                                            fetchRecords(newParams)
                                        }}
                                    />
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        onClick={handleExport}
                                    >
                                        <DownloadOutlined />
                                        {t('records.export')}
                                    </Button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <Table
                                    columns={columns}
                                    dataSource={records}
                                    rowKey="id"
                                    pagination={{
                                        ...tableParams.pagination,
                                        className: '!justify-end',
                                        showTotal: (total) =>
                                            `${t('common.total')} ${total} ${t('common.count')}`,
                                    }}
                                    loading={loading}
                                    onChange={handleTableChange}
                                    className={tableClassName}
                                    scroll={{ x: 800 }}
                                />
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </>
    )
}
