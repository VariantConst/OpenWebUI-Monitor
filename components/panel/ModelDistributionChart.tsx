'use client'

import { useRef, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import type { ECharts } from 'echarts'
import { Card as ShadcnCard } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { MetricToggle } from '@/components/ui/metric-toggle'
import { useTranslation } from 'react-i18next'
import { PieChartOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

interface ModelUsage {
    model_name: string
    total_cost: number
    total_count: number
}

interface ModelDistributionChartProps {
    loading: boolean
    models: ModelUsage[]
    metric: 'cost' | 'count'
    onMetricChange: (metric: 'cost' | 'count') => void
}

const getPieOption = (
    models: ModelUsage[],
    metric: 'cost' | 'count',
    t: (key: string) => string
) => {
    const pieData = models
        .map((item) => ({
            type: item.model_name,
            value:
                metric === 'cost' ? Number(item.total_cost) : item.total_count,
        }))
        .filter((item) => item.value > 0)

    const total = pieData.reduce((sum, item) => sum + item.value, 0)

    const sortedData = [...pieData]
        .sort((a, b) => b.value - a.value)
        .reduce(
            (acc, curr) => {
                const percentage = (curr.value / total) * 100
                if (percentage < 5) {
                    const otherIndex = acc.findIndex(
                        (item) => item.name === t('panel.modelUsage.others')
                    )
                    if (otherIndex >= 0) {
                        acc[otherIndex].value += curr.value
                    } else {
                        acc.push({
                            name: t('panel.modelUsage.others'),
                            value: curr.value,
                        })
                    }
                } else {
                    acc.push({
                        name: curr.type,
                        value: curr.value,
                    })
                }
                return acc
            },
            [] as { name: string; value: number }[]
        )

    const isSmallScreen = window.innerWidth < 640

    return {
        tooltip: {
            show: true,
            trigger: 'item',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderColor: 'rgba(0, 0, 0, 0.05)',
            borderWidth: 1,
            padding: [14, 18],
            textStyle: {
                color: '#333',
                fontSize: 13,
                lineHeight: 20,
            },
            formatter: (params: any) => {
                const percentage = ((params.value / total) * 100).toFixed(1)
                return `
          <div class="flex flex-col gap-1.5">
            <div class="font-medium text-gray-800">${params.name}</div>
            <div class="flex items-center gap-2">
              <span class="inline-block w-2 h-2 rounded-full" style="background-color: ${
                  params.color
              }"></span>
              <span class="text-sm">
                ${metric === 'cost' ? t('panel.byAmount') : t('panel.byCount')}
              </span>
              <span class="font-mono text-sm font-medium text-gray-900">
                ${
                    metric === 'cost'
                        ? `${t('common.currency')}${params.value.toFixed(4)}`
                        : `${params.value} ${t('common.count')}`
                }
              </span>
            </div>
            <div class="text-xs text-gray-500">
              占 <span class="font-medium text-gray-700">${percentage}%</span>
            </div>
          </div>
        `
            },
            extraCssText:
                'box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); border-radius: 8px;',
        },
        legend: {
            show: true,
            orient: 'horizontal',
            bottom: isSmallScreen ? 20 : 10,
            type: 'scroll',
            itemWidth: 16,
            itemHeight: 16,
            itemGap: 20,
            textStyle: {
                fontSize: 13,
                color: '#555',
                padding: [0, 0, 0, 4],
            },
            pageIconSize: 12,
            pageTextStyle: {
                color: '#666',
            },
        },
        series: [
            {
                name:
                    metric === 'cost'
                        ? t('panel.byAmount')
                        : t('panel.byCount'),
                type: 'pie',
                radius: isSmallScreen ? ['35%', '65%'] : ['45%', '75%'],
                center: ['50%', '45%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: '#fff',
                    shadowBlur: 8,
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                },
                label: {
                    show: !isSmallScreen,
                    position: 'outside',
                    alignTo: 'labelLine',
                    margin: 6,
                    formatter: (params: any) => {
                        const percentage = (
                            (params.value / total) *
                            100
                        ).toFixed(1)
                        return [
                            `{name|${params.name}}`,
                            `{value|${
                                metric === 'cost'
                                    ? `${t('common.currency')}${params.value.toFixed(4)}`
                                    : `${params.value} ${t('common.count')}`
                            }}`,
                            `{per|${percentage}%}`,
                        ].join('\n')
                    },
                    rich: {
                        name: {
                            fontSize: 13,
                            color: '#444',
                            padding: [0, 0, 3, 0],
                            fontWeight: 500,
                            width: 120,
                            overflow: 'break',
                        },
                        value: {
                            fontSize: 12,
                            color: '#666',
                            padding: [3, 0],
                            fontFamily: 'monospace',
                        },
                        per: {
                            fontSize: 12,
                            color: '#888',
                            padding: [2, 0, 0, 0],
                        },
                    },
                    lineHeight: 16,
                },
                labelLayout: {
                    hideOverlap: true,
                    moveOverlap: 'shiftY',
                },
                labelLine: {
                    show: !isSmallScreen,
                    length: 20,
                    length2: 20,
                    minTurnAngle: 90,
                    maxSurfaceAngle: 90,
                    smooth: true,
                },
                data: sortedData,
                zlevel: 0,
                padAngle: 2,
                emphasis: {
                    scale: true,
                    scaleSize: 8,
                    focus: 'self',
                    itemStyle: {
                        shadowBlur: 16,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.15)',
                    },
                    label: {
                        show: !isSmallScreen,
                    },
                    labelLine: {
                        show: !isSmallScreen,
                        lineStyle: {
                            width: 2,
                        },
                    },
                },
                select: {
                    disabled: true,
                },
            },
        ],
        graphic: [
            {
                type: 'text',
                left: 'center',
                top: '40%',
                style: {
                    text:
                        metric === 'cost'
                            ? `${t('common.total')}\n${t('common.currency')}${total.toFixed(
                                  2
                              )}`
                            : `${t('common.total')}\n${total}${t('common.count')}`,
                    textAlign: 'center',
                    fontSize: 15,
                    fontWeight: '500',
                    lineHeight: 22,
                    fill: '#333',
                },
                zlevel: 2,
            },
        ],
        animation: true,
        animationDuration: 500,
        universalTransition: true,
    }
}

export default function ModelDistributionChart({
    loading,
    models,
    metric,
    onMetricChange,
}: ModelDistributionChartProps) {
    const chartRef = useRef<ECharts>()
    const { t } = useTranslation('common')

    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current) {
                chartRef.current.resize()
                chartRef.current.setOption(getPieOption(models, metric, t))
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [metric, models, t])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-full bg-gradient-to-br from-card to-card/95 text-card-foreground rounded-xl border shadow-sm overflow-hidden"
        >
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />

                <div className="relative p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center rounded-xl shrink-0">
                                <PieChartOutlined className="text-xl text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-semibold bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
                                    {t('panel.modelUsage.title')}
                                </h3>
                            </div>
                        </div>
                        <div className="sm:ml-auto">
                            <MetricToggle
                                value={metric}
                                onChange={onMetricChange}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="h-[350px] sm:h-[450px] flex items-center justify-center">
                            <Skeleton className="w-full h-full rounded-lg" />
                        </div>
                    ) : (
                        <div className="h-[350px] sm:h-[450px] transition-all duration-300">
                            <ReactECharts
                                option={getPieOption(models, metric, t)}
                                style={{ height: '100%', width: '100%' }}
                                onChartReady={(instance) =>
                                    (chartRef.current = instance)
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
