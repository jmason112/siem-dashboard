import React from "react";
import { Filter, X } from "lucide-react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSecurityStore } from "../../stores/securityStore";

export function ComplianceFilters() {
  const { complianceFilters, setComplianceFilters } = useSecurityStore();

  const handleFilterChange = (key: string, value: string[]) => {
    setComplianceFilters({ [key]: value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComplianceFilters({ search: e.target.value });
  };

  const clearFilters = () => {
    setComplianceFilters({
      status: undefined,
      framework: undefined,
      riskLevel: undefined,
      search: undefined,
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Clear all
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <select
            value={complianceFilters.status?.[0] || "all"}
            onChange={(e) =>
              handleFilterChange(
                "status",
                e.target.value === "all" ? ["all"] : [e.target.value]
              )
            }
            className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="compliant">Compliant</option>
            <option value="non_compliant">Non-Compliant</option>
            <option value="partially_compliant">Partially Compliant</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Framework</label>
          <select
            value={complianceFilters.framework?.[0] || "all"}
            onChange={(e) =>
              handleFilterChange(
                "framework",
                e.target.value === "all" ? ["all"] : [e.target.value]
              )
            }
            className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
          >
            <option value="all">All Frameworks</option>
            <option value="ISO27001">ISO 27001</option>
            <option value="SOC2">SOC 2</option>
            <option value="GDPR">GDPR</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Risk Level</label>
          <select
            value={complianceFilters.riskLevel?.[0] || "all"}
            onChange={(e) =>
              handleFilterChange(
                "riskLevel",
                e.target.value === "all" ? ["all"] : [e.target.value]
              )
            }
            className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="relative">
        <Input
          type="text"
          value={complianceFilters.search || ""}
          onChange={handleSearchChange}
          placeholder="Search controls..."
          className="w-full pl-4 pr-10"
        />
        {complianceFilters.search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setComplianceFilters({ search: undefined })}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        )}
      </div>
    </Card>
  );
}
