import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { MetricCard as MetricCardType } from '../../types';

type MetricCardProps = {
  metric: MetricCardType;
};

export function MetricCard({ metric }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold">{metric.value}</p>
        <div className={cn('ml-2 flex items-center text-sm', getTrendColor())}>
          {getTrendIcon()}
          <span className="ml-1">{Math.abs(metric.change)}%</span>
        </div>
      </div>
    </div>
  );
}