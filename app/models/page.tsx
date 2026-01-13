'use client'

import { useState, useEffect } from 'react'
import { Table, message, Tooltip } from 'antd'
import {
    DownloadOutlined,
    ExperimentOutlined,
    CheckOutlined,
    CloseOutlined,
    InfoCircleOutlined,
    UpOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Progress } from 'antd'
import { toast, Toaster } from 'sonner'
import { EditableCell } from '@/components/editable-cell'

interface ModelResponse {
    id: string
    name: string
    base_model_id: string
    system_prompt: string
    imageUrl: string
    input_price: number
    output_price: number
    per_msg_price: number
}

interface Model {
    id: string
    name: string
    base_model_id: string
    system_prompt: string
    imageUrl: string
    input_price: number
    output_price: number
    per_msg_price: number
    testStatus?: 'success' | 'error' | 'testing'
    syncStatus?: 'syncing' | 'success' | 'error'
}

const TestStatusIndicator = ({ status }: { status: Model['testStatus'] }) => {
    if (!status) return null

    const variants = {
        testing: {
            container: 'bg-blue-100',
            icon: 'w-3 h-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin',
        },
        success: {
            container: 'bg-green-100',
            icon: 'text-[10px] text-green-500',
        },
        error: {
            container: 'bg-red-100',
            icon: 'text-[10px] text-red-500',
        },
    }

    const variant = variants[status]

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-4 h-4 rounded-full ${variant.container} flex items-center justify-center`}
        >
            {status === 'testing' ? (
                <div className={variant.icon} />
            ) : status === 'success' ? (
                <CheckOutlined className={variant.icon} />
            ) : (
                <CloseOutlined className={variant.icon} />
            )}
        </motion.div>
    )
}

const TestProgressPanel = ({
    isVisible,
    models,
    isComplete,
    t,
}: {
    isVisible: boolean
    models: Model[]
    isComplete: boolean
    t: (key: string) => string
}) => {
    const [isExpanded, setIsExpanded] = useState(true)
    const successCount = models.filter((m) => m.testStatus === 'success').length
    const errorCount = models.filter((m) => m.testStatus === 'error').length
    const testingCount = models.filter((m) => m.testStatus === 'testing').length
    const totalCount = models.length
    const progress = Math.round(
        ((successCount + errorCount) / totalCount) * 100
    )

    useEffect(() => {
        if (testingCount > 0) {
            setIsExpanded(true)
        }
    }, [testingCount])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="rounded-xl bg-card border shadow-sm overflow-hidden"
                >
                    <div className="p-6 space-y-6">
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold">
                                    {isComplete
                                        ? t('models.testComplete')
                                        : t('models.testingModels')}
                                </h3>
                                <TestStatusIndicator
                                    status={
                                        testingCount > 0
                                            ? 'testing'
                                            : isComplete
                                              ? 'success'
                                              : 'error'
                                    }
                                />
                            </div>
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <UpOutlined className="text-lg text-muted-foreground" />
                            </motion.div>
                        </div>

                        <AnimatePresence initial={false}>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6 overflow-hidden"
                                >
                                    <div className="space-y-4">
                                        <Progress
                                            percent={progress}
                                            strokeColor={{
                                                '0%': '#4F46E5',
                                                '100%': '#10B981',
                                            }}
                                            trailColor="#E5E7EB"
                                            className="!m-0"
                                        />

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <div className="text-2xl font-semibold text-green-500">
                                                    {successCount}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {t('models.testSuccess')}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-2xl font-semibold text-red-500">
                                                    {errorCount}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {t('models.testFailed')}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-2xl font-semibold text-blue-500">
                                                    {testingCount}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {t('models.testing')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <motion.div
                                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                                        initial="hidden"
                                        animate="visible"
                                        variants={{
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                },
                                            },
                                        }}
                                    >
                                        {models.map((model) => (
                                            <motion.div
                                                key={model.id}
                                                variants={{
                                                    hidden: {
                                                        opacity: 0,
                                                        y: 20,
                                                    },
                                                    visible: {
                                                        opacity: 1,
                                                        y: 0,
                                                    },
                                                }}
                                                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                                            >
                                                <Image
                                                    src={model.imageUrl}
                                                    alt={model.name}
                                                    width={24}
                                                    height={24}
                                                    className="rounded-full"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">
                                                        {model.name}
                                                    </div>
                                                </div>
                                                <TestStatusIndicator
                                                    status={model.testStatus}
                                                />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const LoadingState = ({ t }: { t: (key: string) => string }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary/10 border-t-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium text-foreground/70">
            {t('models.loading')}
        </h3>
    </div>
)

export default function ModelsPage() {
    const { t } = useTranslation('common')
    const [models, setModels] = useState<Model[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingCell, setEditingCell] = useState<{
        id: string
        field: 'input_price' | 'output_price' | 'per_msg_price'
    } | null>(null)
    const [testing, setTesting] = useState(false)
    const [apiKey, setApiKey] = useState<string | null>(null)
    const [isTestComplete, setIsTestComplete] = useState(false)
    const [syncing, setSyncing] = useState(false)

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const token = localStorage.getItem('access_token')
                const response = await fetch('/api/v1/models', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                if (!response.ok) {
                    throw new Error(t('error.model.failToFetchModels'))
                }
                const data = (await response.json()) as ModelResponse[]
                setModels(
                    data.map((model: ModelResponse) => ({
                        ...model,
                        input_price: model.input_price ?? 60,
                        output_price: model.output_price ?? 60,
                        per_msg_price: model.per_msg_price ?? -1,
                    }))
                )
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : t('error.model.unknownError')
                )
            } finally {
                setLoading(false)
            }
        }

        fetchModels()
    }, [])

    useEffect(() => {
        const fetchApiKey = async () => {
            try {
                const token = localStorage.getItem('access_token')
                const response = await fetch('/api/v1/config/key', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                if (!response.ok) {
                    throw new Error(
                        `${t('error.model.failToFetchApiKey')}: ${response.status}`
                    )
                }
                const data = await response.json()
                if (!data.apiKey) {
                    throw new Error(t('error.model.ApiKeyNotConfigured'))
                }
                setApiKey(data.apiKey)
            } catch (error) {
                console.error(t('error.model.failToFetchApiKey'), error)
                message.error(
                    error instanceof Error
                        ? error.message
                        : t('error.model.failToFetchApiKey')
                )
            }
        }

        fetchApiKey()
    }, [])

    const handlePriceUpdate = async (
        id: string,
        field: 'input_price' | 'output_price' | 'per_msg_price',
        value: number
    ): Promise<void> => {
        try {
            const model = models.find((m) => m.id === id)
            if (!model) return

            const validValue = Number(value)
            if (
                field !== 'per_msg_price' &&
                (!isFinite(validValue) || validValue < 0)
            ) {
                throw new Error(t('error.model.nonePositiveNumber'))
            }
            if (field === 'per_msg_price' && !isFinite(validValue)) {
                throw new Error(t('error.model.invalidNumber'))
            }

            const input_price =
                field === 'input_price' ? validValue : model.input_price
            const output_price =
                field === 'output_price' ? validValue : model.output_price
            const per_msg_price =
                field === 'per_msg_price' ? validValue : model.per_msg_price

            const token = localStorage.getItem('access_token')
            const response = await fetch('/api/v1/models/price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    updates: [
                        {
                            id,
                            input_price: Number(input_price),
                            output_price: Number(output_price),
                            per_msg_price: Number(per_msg_price),
                        },
                    ],
                }),
            })

            const data = await response.json()
            if (!response.ok)
                throw new Error(data.error || t('error.model.priceUpdateFail'))

            if (data.results && data.results[0]?.success) {
                setModels((prevModels) =>
                    prevModels.map((model) =>
                        model.id === id
                            ? {
                                  ...model,
                                  input_price: Number(
                                      data.results[0].data.input_price
                                  ),
                                  output_price: Number(
                                      data.results[0].data.output_price
                                  ),
                                  per_msg_price: Number(
                                      data.results[0].data.per_msg_price
                                  ),
                              }
                            : model
                    )
                )
                toast.success(t('error.model.priceUpdateSuccess'))
            } else {
                throw new Error(
                    data.results[0]?.error || t('error.model.priceUpdateFail')
                )
            }
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : t('error.model.priceUpdateFail')
            )
            throw err
        }
    }

    const handleTestSingleModel = async (model: Model) => {
        try {
            setModels((prev) =>
                prev.map((m) =>
                    m.id === model.id ? { ...m, testStatus: 'testing' } : m
                )
            )

            const result = await testModel(model)

            setModels((prev) =>
                prev.map((m) =>
                    m.id === model.id
                        ? {
                              ...m,
                              testStatus: result.success ? 'success' : 'error',
                          }
                        : m
                )
            )
        } catch (error) {
            setModels((prev) =>
                prev.map((m) =>
                    m.id === model.id ? { ...m, testStatus: 'error' } : m
                )
            )
        }
    }

    const handleSyncAllDerivedModels = async () => {
        try {
            setSyncing(true)

            const token = localStorage.getItem('access_token')
            const response = await fetch('/api/v1/models/sync-all-prices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || t('models.syncFail'))
            }

            if (data.syncedModels && data.syncedModels.length > 0) {
                setModels((prev) =>
                    prev.map((model) => {
                        const syncedModel = data.syncedModels.find(
                            (m: any) => m.id === model.id && m.success
                        )
                        if (syncedModel) {
                            return {
                                ...model,
                                input_price: syncedModel.input_price,
                                output_price: syncedModel.output_price,
                                per_msg_price: syncedModel.per_msg_price,
                            }
                        }
                        return model
                    })
                )

                if (data.syncedModels.every((m: any) => m.success)) {
                    toast.success(t('models.syncAllSuccess'))
                } else {
                    toast.warning(t('models.syncAllFail'))
                }
            } else {
                toast.info(t('models.noDerivedModels'))
            }
        } catch (error) {
            console.error('Sync all derived models failed:', error)
            toast.error(
                error instanceof Error ? error.message : t('models.syncFail')
            )
        } finally {
            setSyncing(false)
        }
    }

    const columns: ColumnsType<Model> = [
        {
            title: t('models.table.name'),
            key: 'model',
            width: 200,
            render: (_, record) => (
                <div className="flex items-center gap-3 relative">
                    <div
                        className="relative cursor-pointer"
                        onClick={() => handleTestSingleModel(record)}
                    >
                        {record.imageUrl && (
                            <Image
                                src={record.imageUrl}
                                alt={record.name}
                                width={32}
                                height={32}
                                className="rounded-full object-cover"
                            />
                        )}
                        {record.testStatus && (
                            <div className="absolute -top-1 -right-1">
                                {record.testStatus === 'testing' && (
                                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                                        <div className="w-3 h-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                                    </div>
                                )}
                                {record.testStatus === 'success' && (
                                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckOutlined className="text-[10px] text-green-500" />
                                    </div>
                                )}
                                {record.testStatus === 'error' && (
                                    <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                                        <CloseOutlined className="text-[10px] text-red-500" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="font-medium min-w-0 flex-1">
                        <div className="truncate">{record.name}</div>
                        <div className="text-xs text-gray-500 truncate opacity-60">
                            {record.id}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: t('models.table.inputPrice'),
            key: 'input_price',
            width: 150,
            dataIndex: 'input_price',
            sorter: (a, b) => a.input_price - b.input_price,
            sortDirections: ['descend', 'ascend', 'descend'],
            render: (_, record) => renderPriceCell('input_price', record, true),
        },
        {
            title: t('models.table.outputPrice'),
            key: 'output_price',
            width: 150,
            dataIndex: 'output_price',
            sorter: (a, b) => a.output_price - b.output_price,
            sortDirections: ['descend', 'ascend', 'descend'],
            render: (_, record) =>
                renderPriceCell('output_price', record, true),
        },
        {
            title: (
                <span>
                    {t('models.table.perMsgPrice')}{' '}
                    <Tooltip title={t('models.table.perMsgPriceTooltip')}>
                        <InfoCircleOutlined className="text-gray-400 cursor-help" />
                    </Tooltip>
                </span>
            ),
            key: 'per_msg_price',
            width: 150,
            dataIndex: 'per_msg_price',
            sorter: (a, b) => a.per_msg_price - b.per_msg_price,
            sortDirections: ['descend', 'ascend', 'descend'],
            render: (_, record) =>
                renderPriceCell('per_msg_price', record, true),
        },
    ]

    const handleExportPrices = () => {
        const priceData = models.map((model) => ({
            id: model.id,
            input_price: model.input_price,
            output_price: model.output_price,
            per_msg_price: model.per_msg_price,
        }))

        const blob = new Blob([JSON.stringify(priceData, null, 2)], {
            type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `model_prices_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handleImportPrices = (file: File) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target?.result as string)

                if (!Array.isArray(importedData)) {
                    throw new Error(t('error.model.invalidImportFormat'))
                }

                const validUpdates = importedData.filter((item) =>
                    models.some((model) => model.id === item.id)
                )

                const response = await fetch('/api/v1/models/price', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        updates: validUpdates,
                    }),
                })

                if (!response.ok) {
                    throw new Error(t('error.model.batchPriceUpdateFail'))
                }

                const data = await response.json()
                console.log(t('error.model.serverResponse'), data)

                if (data.results) {
                    setModels((prevModels) =>
                        prevModels.map((model) => {
                            const update = data.results.find(
                                (r: any) =>
                                    r.id === model.id && r.success && r.data
                            )
                            if (update) {
                                return {
                                    ...model,
                                    input_price: Number(
                                        update.data.input_price
                                    ),
                                    output_price: Number(
                                        update.data.output_price
                                    ),
                                    per_msg_price: Number(
                                        update.data.per_msg_price
                                    ),
                                }
                            }
                            return model
                        })
                    )
                }

                message.success(
                    `${t('error.model.updateSuccess')} ${
                        data.results.filter((r: any) => r.success).length
                    } ${t('error.model.numberOfModelPrice')}`
                )
            } catch (err) {
                console.error(t('error.model.failToImport'), err)
                message.error(
                    err instanceof Error
                        ? err.message
                        : t('error.model.failToImport')
                )
            }
        }
        reader.readAsText(file)
        return false
    }

    const testModel = async (
        model: Model
    ): Promise<{
        id: string
        success: boolean
        error?: string
    }> => {
        if (!apiKey) {
            return {
                id: model.id,
                success: false,
                error: t('error.model.ApiKeyNotFetched'),
            }
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)

        try {
            const token = localStorage.getItem('access_token')
            const response = await fetch('/api/v1/models/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    modelId: model.id,
                }),
                signal: controller.signal,
            })

            clearTimeout(timeoutId)
            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.error || t('error.model.failToTest'))
            }

            return {
                id: model.id,
                success: true,
            }
        } catch (error) {
            clearTimeout(timeoutId)
            return {
                id: model.id,
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : t('error.model.unknownError'),
            }
        }
    }

    const handleTestModels = async () => {
        if (!apiKey) {
            message.error(t('error.model.failToTestWithoutApiKey'))
            return
        }

        try {
            setModels((prev) =>
                prev.map((m) => ({ ...m, testStatus: 'testing' }))
            )
            setTesting(true)
            setIsTestComplete(false)

            const testPromises = models.map((model) =>
                testModel(model).then((result) => {
                    setModels((prev) =>
                        prev.map((m) =>
                            m.id === model.id
                                ? {
                                      ...m,
                                      testStatus: result.success
                                          ? 'success'
                                          : 'error',
                                  }
                                : m
                        )
                    )
                    return result
                })
            )

            await Promise.all(testPromises)
            setIsTestComplete(true)
        } catch (error) {
            console.error(t('error.model.failToTest'), error)
            message.error(t('error.model.failToTest'))
        } finally {
            setTesting(false)
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

    const MobileCard = ({ record }: { record: Model }) => {
        const isPerMsgEnabled = record.per_msg_price >= 0

        return (
            <div
                className="p-4 sm:p-6 bg-card rounded-xl border border-border/40 
        shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
            >
                <div className="flex items-center gap-3">
                    <div
                        className="relative cursor-pointer group shrink-0"
                        onClick={() => handleTestSingleModel(record)}
                    >
                        <div className="relative">
                            {record.imageUrl && (
                                <Image
                                    src={record.imageUrl}
                                    alt={record.name}
                                    width={40}
                                    height={40}
                                    className="rounded-xl object-cover transition-transform group-hover:scale-105"
                                />
                            )}
                            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5"></div>
                        </div>
                        {record.testStatus && (
                            <div className="absolute -top-1 -right-1 z-10">
                                <TestStatusIndicator
                                    status={record.testStatus}
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold tracking-tight truncate">
                            {record.name}
                        </h3>
                        <p className="text-xs text-muted-foreground/80 truncate font-mono">
                            {record.id}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[
                        {
                            label: t('models.table.mobile.inputPrice'),
                            field: 'input_price' as const,
                            disabled: isPerMsgEnabled,
                        },
                        {
                            label: t('models.table.mobile.outputPrice'),
                            field: 'output_price' as const,
                            disabled: isPerMsgEnabled,
                        },
                        {
                            label: t('models.table.mobile.perMsgPrice'),
                            field: 'per_msg_price' as const,
                            disabled: false,
                        },
                    ].map(({ label, field, disabled }) => (
                        <div
                            key={field}
                            className={`space-y-1.5 ${disabled ? 'opacity-50' : ''}`}
                        >
                            <span className="text-xs text-muted-foreground/80 block truncate">
                                {label}
                            </span>
                            {renderPriceCell(field, record, false)}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderPriceCell = (
        field: 'input_price' | 'output_price' | 'per_msg_price',
        record: Model,
        showTooltip: boolean = true
    ) => {
        const isEditing =
            editingCell?.id === record.id && editingCell?.field === field
        const currentValue = Number(record[field])
        const isDisabled =
            field !== 'per_msg_price' && record.per_msg_price >= 0

        return (
            <EditableCell
                value={currentValue}
                isEditing={isEditing}
                onEdit={() => setEditingCell({ id: record.id, field })}
                onSubmit={async (value) => {
                    try {
                        await handlePriceUpdate(record.id, field, value)
                        setEditingCell(null)
                    } catch {}
                }}
                t={t}
                disabled={isDisabled}
                onCancel={() => setEditingCell(null)}
                tooltipText={
                    showTooltip && isDisabled
                        ? t('models.table.priceOverriddenByPerMsg')
                        : undefined
                }
                placeholder={t('models.table.enterPrice')}
                validateValue={(value) => ({
                    isValid:
                        field === 'per_msg_price'
                            ? isFinite(value)
                            : isFinite(value) && value >= 0,
                    errorMessage:
                        field === 'per_msg_price'
                            ? t('models.table.invalidNumber')
                            : t('models.table.nonePositiveNumber'),
                })}
                isPerMsgPrice={field === 'per_msg_price'}
            />
        )
    }

    if (error) {
        return (
            <div className="p-4 text-red-500">
                {t('common.error')}: {error}
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 space-y-8">
            <Toaster
                richColors
                position="top-center"
                theme="light"
                expand
                duration={1500}
            />

            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">
                    {t('models.title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('models.description')}
                </p>
            </div>

            <div className="flex flex-wrap gap-4">
                <Button
                    variant="default"
                    size="default"
                    onClick={handleTestModels}
                    className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                    disabled={testing && !isTestComplete}
                >
                    <motion.div
                        animate={testing ? { rotate: 360 } : { rotate: 0 }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    >
                        <ExperimentOutlined className="h-4 w-4" />
                    </motion.div>
                    {testing ? t('models.testing') : t('models.testAll')}
                    <Tooltip title={t('models.testTooltip')}>
                        <InfoCircleOutlined className="h-3.5 w-3.5 text-white/80 hover:text-white" />
                    </Tooltip>
                </Button>

                <Button
                    variant="default"
                    size="default"
                    onClick={handleSyncAllDerivedModels}
                    className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                    disabled={syncing}
                >
                    <motion.div
                        animate={syncing ? { rotate: 360 } : { rotate: 0 }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                    </motion.div>
                    {syncing
                        ? t('models.syncing')
                        : t('models.syncAllDerivedModels')}
                    <Tooltip title={t('models.syncTooltip')}>
                        <InfoCircleOutlined className="h-3.5 w-3.5 text-white/80 hover:text-white" />
                    </Tooltip>
                </Button>

                <Button
                    variant="outline"
                    size="default"
                    onClick={handleExportPrices}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 text-zinc-800 border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-200"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                    </svg>
                    {t('models.exportConfig')}
                </Button>

                <Button
                    variant="outline"
                    size="default"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 text-zinc-800 border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-200"
                    onClick={() =>
                        document.getElementById('import-input')?.click()
                    }
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                    {t('models.importConfig')}
                </Button>
                <input
                    id="import-input"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                            handleImportPrices(file)
                        }
                        e.target.value = ''
                    }}
                />
            </div>

            <TestProgressPanel
                isVisible={testing || isTestComplete}
                models={models}
                isComplete={isTestComplete}
                t={t}
            />

            <div className="hidden sm:block">
                <div className="rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden">
                    {loading ? (
                        <LoadingState t={t} />
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={models}
                            rowKey="id"
                            loading={false}
                            pagination={false}
                            size="middle"
                            className={tableClassName}
                            scroll={{ x: 500 }}
                            rowClassName={() => 'group'}
                        />
                    )}
                </div>
            </div>

            <div className="sm:hidden">
                {loading ? (
                    <LoadingState t={t} />
                ) : (
                    <div className="grid gap-4">
                        {models.map((model) => (
                            <MobileCard key={model.id} record={model} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
