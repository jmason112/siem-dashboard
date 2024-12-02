import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

type TimeSeriesChartProps = {
  data: Array<{
    timestamp: Date;
    critical: number;
    warning: number;
    info: number;
  }>;
  title: string;
};

export function TimeSeriesChart({ data, title }: TimeSeriesChartProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-gray-700"
            />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(timestamp) =>
                format(new Date(timestamp), "MMM d")
              }
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis className="text-gray-600 dark:text-gray-400" />
            <Tooltip
              labelFormatter={(timestamp) =>
                format(new Date(timestamp), "MMM d, yyyy HH:mm")
              }
              contentStyle={{
                backgroundColor: "rgb(31 41 55)",
                border: "none",
                borderRadius: "0.375rem",
                color: "rgb(243 244 246)",
              }}
            />
            <Line
              type="monotone"
              dataKey="critical"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="Critical"
            />
            <Line
              type="monotone"
              dataKey="warning"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="Warning"
            />
            <Line
              type="monotone"
              dataKey="info"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Info"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
