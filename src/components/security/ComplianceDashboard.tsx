import React from "react";
import { useSecurityStore } from "../../stores/securityStore";
import { Card } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { ComplianceFilters } from "./ComplianceFilters";

const statusColors = {
  compliant:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  non_compliant: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  partially_compliant:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const riskColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export const ComplianceDashboard: React.FC = () => {
  const {
    compliance,
    complianceStats,
    complianceLoading,
    updateComplianceStatus,
    complianceFilters,
    page,
    totalPages,
    setPage,
  } = useSecurityStore();

  const handleStatusChange = async (id: string, status: string) => {
    await updateComplianceStatus(id, status);
  };

  // Filter compliance data based on search
  const filteredCompliance = compliance?.filter((item) => {
    if (complianceFilters.search) {
      return item.control_name
        .toLowerCase()
        .includes(complianceFilters.search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Controls
          </h3>
          <p className="text-2xl font-bold mt-2">
            {complianceStats?.byFramework?.reduce(
              (acc, curr) => acc + curr.total,
              0
            ) || 0}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Compliant
          </h3>
          <p className="text-2xl font-bold mt-2 text-green-600">
            {complianceStats?.byFramework?.reduce(
              (acc, curr) => acc + curr.compliant,
              0
            ) || 0}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Non-Compliant
          </h3>
          <p className="text-2xl font-bold mt-2 text-red-600">
            {complianceStats?.byFramework?.reduce(
              (acc, curr) => acc + curr.nonCompliant,
              0
            ) || 0}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            High Risk
          </h3>
          <p className="text-2xl font-bold mt-2 text-orange-600">
            {complianceStats?.byRiskLevel?.high || 0}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <ComplianceFilters />

      {/* Compliance Table */}
      <Card>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Compliance Controls</h2>
        </div>
        {complianceLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !filteredCompliance?.length ? (
          <div className="text-center py-8 text-gray-500">
            No compliance data found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Framework</TableHead>
                <TableHead>Control</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Last Checked</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompliance.map((control) => (
                <TableRow key={control._id}>
                  <TableCell>{control.framework}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{control.control_name}</p>
                      <p className="text-sm text-gray-500">
                        {control.control_id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[control.status]}>
                      {control.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={riskColors[control.risk_level]}>
                      {control.risk_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(control.last_checked).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <select
                      value={control.status}
                      onChange={(e) =>
                        handleStatusChange(control._id, e.target.value)
                      }
                      className="border rounded p-1 text-sm bg-background text-foreground dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                    >
                      <option value="compliant">Compliant</option>
                      <option value="non_compliant">Non-Compliant</option>
                      <option value="partially_compliant">
                        Partially Compliant
                      </option>
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 p-4">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
