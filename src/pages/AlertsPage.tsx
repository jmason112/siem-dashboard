import { useEffect } from "react";
import { useAlertStore } from "../stores/alertStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { DateRangePicker } from "../components/DateRangePicker";
import { format } from "date-fns";

const severityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
  info: "bg-gray-500",
};

const statusColors = {
  new: "bg-blue-500",
  in_progress: "bg-yellow-500",
  resolved: "bg-green-500",
  dismissed: "bg-gray-500",
};

export default function AlertsPage() {
  const {
    alerts,
    stats,
    loading,
    error,
    filters,
    page,
    totalPages,
    fetchAlerts,
    fetchStats,
    updateAlert,
    setFilters,
    connectWebSocket,
    disconnectWebSocket,
  } = useAlertStore();

  useEffect(() => {
    fetchAlerts();
    fetchStats();
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, []);

  const handleSeverityFilter = (severity: string) => {
    setFilters({ severity: severity === "all" ? undefined : [severity] });
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ status: status === "all" ? undefined : [status] });
  };

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setFilters({
      startDate: range.from.toISOString(),
      endDate: range.to.toISOString(),
    });
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateAlert(id, { status: status as any });
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        {Object.entries(stats.bySeverity).map(([severity, count]) => (
          <Card key={severity}>
            <CardHeader>
              <CardTitle className="capitalize">{severity} Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select
          onValueChange={handleSeverityFilter}
          defaultValue={filters.severity?.[0] || "all"}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={handleStatusFilter}
          defaultValue={filters.status?.[0] || "all"}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>

        <DateRangePicker
          onDateChange={handleDateRangeChange}
          className="w-[320px]"
        />
      </div>

      {/* Alerts Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No alerts found
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((alert) => (
                <TableRow key={alert._id}>
                  <TableCell>
                    {format(new Date(alert.timestamp), "PPpp")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${severityColors[alert.severity]} text-white`}
                    >
                      {alert.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>{alert.source}</TableCell>
                  <TableCell>{alert.description}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${statusColors[alert.status]} text-white`}
                    >
                      {alert.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      onValueChange={(value) =>
                        handleUpdateStatus(alert._id, value)
                      }
                      defaultValue={alert.status}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="dismissed">Dismissed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Button
          onClick={() => fetchAlerts(page - 1)}
          disabled={page === 1 || loading}
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          onClick={() => fetchAlerts(page + 1)}
          disabled={page === totalPages || loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
