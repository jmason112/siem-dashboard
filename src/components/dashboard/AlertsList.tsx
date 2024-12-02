import React from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { format } from "date-fns";
import type { Alert } from "../../types";

type AlertsListProps = {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
};

export function AlertsList({ alerts, onAcknowledge }: AlertsListProps) {
  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Recent Alerts</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {alerts.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No recent alerts
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {alert.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {alert.description}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{alert.source}</span>
                    <span>•</span>
                    <span>
                      {format(new Date(alert.timestamp), "MMM d, HH:mm")}
                    </span>
                  </div>
                </div>
                {alert.status === "new" && (
                  <button
                    onClick={() => onAcknowledge(alert._id)}
                    className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
