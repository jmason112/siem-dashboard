import React from "react";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface Alert {
  id: string;
  severity: "critical" | "warning" | "info";
  message: string;
  source: string;
  timestamp: Date;
  status: "active" | "resolved";
}

interface AlertsTabProps {
  alerts: {
    total: number;
    critical: number;
    warning: number;
    info: number;
    items?: Alert[];
  };
}

// Mock data - replace with real data
const mockAlerts: Alert[] = [
  {
    id: "1",
    severity: "critical",
    message: "High CPU usage detected",
    source: "System Monitor",
    timestamp: new Date(),
    status: "active",
  },
  {
    id: "2",
    severity: "warning",
    message: "Memory usage above 80%",
    source: "Resource Monitor",
    timestamp: new Date(Date.now() - 3600000),
    status: "active",
  },
  {
    id: "3",
    severity: "info",
    message: "System update available",
    source: "Update Service",
    timestamp: new Date(Date.now() - 7200000),
    status: "active",
  },
];

export function AlertsTab({ alerts }: AlertsTabProps) {
  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "info":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <h3 className="text-2xl font-bold">{alerts.total}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Critical
              </p>
              <h3 className="text-2xl font-bold text-red-500">
                {alerts.critical}
              </h3>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Warning
              </p>
              <h3 className="text-2xl font-bold text-yellow-500">
                {alerts.warning}
              </h3>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Info</p>
              <h3 className="text-2xl font-bold text-blue-500">
                {alerts.info}
              </h3>
            </div>
            <Info className="h-8 w-8 text-blue-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Alert List */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Severity</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(alerts.items || mockAlerts).map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(alert.severity)}
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.charAt(0).toUpperCase() +
                        alert.severity.slice(1)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{alert.message}</TableCell>
                <TableCell>{alert.source}</TableCell>
                <TableCell>{formatDate(alert.timestamp)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      alert.status === "active" ? "destructive" : "default"
                    }
                  >
                    {alert.status.charAt(0).toUpperCase() +
                      alert.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
