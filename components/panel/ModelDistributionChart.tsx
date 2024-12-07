"use client";

import { useRef, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import type { ECharts } from "echarts";
import { Card as ShadcnCard } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface ModelUsage {
  model_name: string;
  total_cost: number;
  total_count: number;
}

interface ModelDistributionChartProps {
  loading: boolean;
  models: ModelUsage[];
  metric: "cost" | "count";
  onMetricChange: (metric: "cost" | "count") => void;
}

const getPieOption = (models: ModelUsage[], metric: "cost" | "count") => {
  const pieData = models
    .map((item) => ({
      type: item.model_name,
      value: metric === "cost" ? Number(item.total_cost) : item.total_count,
    }))
    .filter((item) => item.value > 0);

  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  const sortedData = [...pieData]
    .sort((a, b) => b.value - a.value)
    .reduce((acc, curr) => {
      const percentage = (curr.value / total) * 100;
      if (percentage < 5) {
        const otherIndex = acc.findIndex((item) => item.name === "其他");
        if (otherIndex >= 0) {
          acc[otherIndex].value += curr.value;
        } else {
          acc.push({
            name: "其他",
            value: curr.value,
          });
        }
      } else {
        acc.push({
          name: curr.type,
          value: curr.value,
        });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  const isSmallScreen = window.innerWidth < 640;

  return {
    tooltip: {
      show: isSmallScreen,
      trigger: "item",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#eee",
      borderWidth: 1,
      padding: [12, 16],
      textStyle: {
        color: "#666",
        fontSize: 13,
      },
      formatter: (params: any) => {
        const percentage = ((params.value / total) * 100).toFixed(1);
        return `
          <div class="flex flex-col gap-1.5">
            <div class="font-medium text-gray-800">${params.name}</div>
            <div class="flex items-center gap-2">
              <span class="inline-block w-2 h-2 rounded-full" style="background-color: ${
                params.color
              }"></span>
              <span class="text-sm">${
                metric === "cost" ? "消耗金额" : "使用次数"
              }</span>
              <span class="font-mono text-sm font-medium text-gray-900">
                ${
                  metric === "cost"
                    ? `¥${params.value.toFixed(4)}`
                    : `${params.value}次`
                }
              </span>
            </div>
            <div class="text-xs text-gray-500">
              占 <span class="font-medium text-gray-700">${percentage}%</span>
            </div>
          </div>
        `;
      },
      extraCssText:
        "box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); border-radius: 6px;",
    },
    legend: {
      show: isSmallScreen,
      orient: "horizontal",
      bottom: 0,
      type: "scroll",
      itemWidth: 15,
      itemHeight: 15,
      textStyle: {
        fontSize: 12,
        color: "#666",
      },
    },
    series: [
      {
        name: metric === "cost" ? "消耗金额" : "使用次数",
        type: "pie",
        radius: isSmallScreen ? ["40%", "75%"] : ["50%", "80%"],
        center: isSmallScreen ? ["50%", "40%"] : ["50%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          shadowBlur: 4,
          shadowColor: "rgba(0, 0, 0, 0.1)",
        },
        label: {
          show: !isSmallScreen,
          position: "outside",
          alignTo: "labelLine",
          margin: 4,
          formatter: (params: any) => {
            const percentage = ((params.value / total) * 100).toFixed(1);
            return [
              `{name|${params.name}}`,
              `{value|${
                metric === "cost"
                  ? `¥${params.value.toFixed(4)}`
                  : `${params.value}次`
              }}`,
              `{per|${percentage}%}`,
            ].join("\n");
          },
          rich: {
            name: {
              fontSize: 12,
              color: "#666",
              padding: [0, 0, 2, 0],
              fontWeight: 500,
              width: 120,
              overflow: "break",
            },
            value: {
              fontSize: 11,
              color: "#333",
              padding: [2, 0],
            },
            per: {
              fontSize: 11,
              color: "#999",
            },
          },
          lineHeight: 14,
        },
        labelLayout: {
          hideOverlap: true,
          moveOverlap: "shiftY",
        },
        labelLine: {
          show: !isSmallScreen,
          length: 25,
          length2: 15,
          minTurnAngle: 60,
          maxSurfaceAngle: 60,
          smooth: 0.2,
        },
        data: sortedData,
        zlevel: 0,
        padAngle: 2,
        emphasis: {
          scale: false,
          scaleSize: 10,
          focus: "self",
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.2)",
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
        type: "text",
        left: "center",
        top: isSmallScreen ? "35%" : "middle",
        style: {
          text:
            metric === "cost"
              ? `总计\n¥${total.toFixed(2)}`
              : `总计\n${total}次`,
          textAlign: "center",
          fontSize: 14,
          fontWeight: "bold",
        },
        zlevel: 1,
      },
    ],
    animation: true,
    animationDuration: 500,
    universalTransition: true,
  };
};

export default function ModelDistributionChart({
  loading,
  models,
  metric,
  onMetricChange,
}: ModelDistributionChartProps) {
  const chartRef = useRef<ECharts>();

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.resize();
        chartRef.current.setOption(getPieOption(models, metric));
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [metric, models]);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">模型使用分布</h2>

        <RadioGroup
          value={metric}
          onValueChange={(value) => onMetricChange(value as "cost" | "count")}
          className="flex items-center space-x-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cost" id="pie-cost" />
            <Label htmlFor="pie-cost">按金额</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="count" id="pie-count" />
            <Label htmlFor="pie-count">按次数</Label>
          </div>
        </RadioGroup>
      </div>

      {loading ? (
        <div className="h-[450px] flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </div>
      ) : (
        <div className="h-[450px]">
          <ReactECharts
            option={getPieOption(models, metric)}
            style={{ height: "100%", width: "100%" }}
            onChartReady={(instance) => (chartRef.current = instance)}
          />
        </div>
      )}
    </div>
  );
}