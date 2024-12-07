import React, { useState } from "react";
import { Card } from "../../ui/card";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "../../ui/button";

export interface Alert {
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
  agentSource?: string;
}

export function AlertsTab({ alerts, agentSource }: AlertsTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Filter alerts by agent source if provided
  const filteredAlerts =
    alerts.alerts?.filter((alert) =>
      agentSource ? alert.source === agentSource : true
    ) || [];

  // Sort alerts by timestamp (newest first)
  const sortedAlerts = [...filteredAlerts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Pagination logic
  const totalPages = Math.ceil(sortedAlerts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAlerts = sortedAlerts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  console.log("Total alerts:", sortedAlerts.length);
  console.log("Current page:", currentPage);
  console.log("Total pages:", totalPages);
  console.log("Alerts per page:", paginatedAlerts.length);

  // Calculate totals for filtered alerts
  const filteredTotals = filteredAlerts.reduce(
    (acc, alert) => {
      acc.total++;
      acc[alert.severity]++;
      return acc;
    },
    { total: 0, critical: 0, warning: 0, info: 0 }
  );

  console.log("Agent source:", agentSource);
  console.log("Available alerts:", alerts.alerts);
  console.log("Filtered alerts:", filteredAlerts);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total Alerts</p>
              <p className="text-2xl font-bold">{filteredTotals.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Critical</p>
              <p className="text-2xl font-bold">{filteredTotals.critical}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Warning</p>
              <p className="text-2xl font-bold">{filteredTotals.warning}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Info</p>
              <p className="text-2xl font-bold">{filteredTotals.info}</p>
            </div>
            <Info className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {paginatedAlerts.length === 0 ? (
          <Card className="p-4">
            <p className="text-center text-gray-500">
              No alerts found for this agent
            </p>
          </Card>
        ) : (
          <>
            {paginatedAlerts.map((alert) => (
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

            {/* Pagination controls */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, filteredAlerts.length)} of{" "}
                {filteredAlerts.length} alerts
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
