import React from "react";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";
import { cn } from "../../lib/utils";

type MetricCardProps = {
  metric: {
    id: string;
    title: string;
    value: number;
    change: number;
    trend: "up" | "down" | "neutral";
    unit?: string;
  };
};

export function MetricCard({ metric }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (metric.trend) {
      case "up":
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case "down":
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getValueColor = () => {
    if (metric.title === "System Health") {
      if (metric.value >= 90) return "text-green-500";
      if (metric.value >= 70) return "text-yellow-500";
      return "text-red-500";
    }
    if (metric.title === "Active Threats") {
      if (metric.value === 0) return "text-green-500";
      if (metric.value <= 5) return "text-yellow-500";
      return "text-red-500";
    }
    return "";
  };

  const formatValue = () => {
    if (
      metric.unit === "%" ||
      metric.title.includes("Health") ||
      metric.title.includes("Load")
    ) {
      return `${metric.value}%`;
    }
    return metric.value;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {metric.title}
      </h3>
      <div className="mt-2 flex items-baseline">
        <p className={cn("text-2xl font-semibold", getValueColor())}>
          {formatValue()}
        </p>
        {metric.change !== 0 && (
          <div
            className={cn("ml-2 flex items-center text-sm", getTrendColor())}
          >
            {getTrendIcon()}
            <span className="ml-1">{Math.abs(metric.change)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
