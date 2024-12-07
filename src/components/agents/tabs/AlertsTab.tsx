import React, { useState, useEffect } from "react";
import { Card } from "../../ui/card";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface Alert {
  _id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  source: string;
  timestamp: string;
  status: string;
}

interface AlertsTabProps {
  alerts: {
    total: number;
    critical: number;
    warning: number;
    info: number;
    alerts?: Alert[];
  };
}

export function AlertsTab({ alerts }: AlertsTabProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 dark:bg-red-900/10";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/10";
      default:
        return "bg-blue-50 dark:bg-blue-900/10";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Alerts</p>
              <p className="text-2xl font-bold">{alerts.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Critical</p>
              <p className="text-2xl font-bold">{alerts.critical}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Warning</p>
              <p className="text-2xl font-bold">{alerts.warning}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Info</p>
              <p className="text-2xl font-bold">{alerts.info}</p>
            </div>
            <Info className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {alerts.alerts?.map((alert) => (
          <Card
            key={alert._id}
            className={`p-4 ${getSeverityClass(alert.severity)}`}
          >
            <div className="flex items-start gap-4">
              {getSeverityIcon(alert.severity)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{alert.title}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {alert.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
