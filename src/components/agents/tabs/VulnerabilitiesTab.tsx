import React, { useState } from "react";
import { Card } from "../../ui/card";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "../../ui/button";

interface Vulnerability {
  _id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  asset_id: string;
  cve_id?: string;
  cvss_score?: number;
  status: string;
  discovered_at: string;
}

interface VulnerabilitiesTabProps {
  vulnerabilities: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    vulnerabilities?: Vulnerability[];
  };
}

export function VulnerabilitiesTab({
  vulnerabilities,
}: VulnerabilitiesTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "high":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 dark:bg-red-900/10";
      case "high":
        return "bg-orange-50 dark:bg-orange-900/10";
      case "medium":
        return "bg-yellow-50 dark:bg-yellow-900/10";
      default:
        return "bg-blue-50 dark:bg-blue-900/10";
    }
  };

  // Sort vulnerabilities by discovered_at (newest first)
  const sortedVulnerabilities = [
    ...(vulnerabilities.vulnerabilities || []),
  ].sort(
    (a, b) =>
      new Date(b.discovered_at).getTime() - new Date(a.discovered_at).getTime()
  );

  // Pagination logic
  const totalPages = Math.ceil(sortedVulnerabilities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVulnerabilities = sortedVulnerabilities.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total</p>
              <p className="text-2xl font-bold">{vulnerabilities.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Critical</p>
              <p className="text-2xl font-bold">{vulnerabilities.critical}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">High</p>
              <p className="text-2xl font-bold">{vulnerabilities.high}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Medium</p>
              <p className="text-2xl font-bold">{vulnerabilities.medium}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Low</p>
              <p className="text-2xl font-bold">{vulnerabilities.low}</p>
            </div>
            <Info className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {paginatedVulnerabilities.length === 0 ? (
          <Card className="p-4">
            <p className="text-center text-gray-500">
              No vulnerabilities found
            </p>
          </Card>
        ) : (
          <>
            {paginatedVulnerabilities.map((vuln) => (
              <Card
                key={vuln._id}
                className={`p-4 ${getSeverityClass(vuln.severity)}`}
              >
                <div className="flex items-start gap-4">
                  {getSeverityIcon(vuln.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{vuln.title}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(vuln.discovered_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {vuln.description}
                    </p>
                    {vuln.cve_id && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">CVE: </span>
                        <span className="text-blue-600">{vuln.cve_id}</span>
                        {vuln.cvss_score && (
                          <span className="ml-2">
                            (CVSS: {vuln.cvss_score.toFixed(1)})
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mt-2">
                      <span className="text-sm px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                        {vuln.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Pagination controls */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1}-
                {Math.min(
                  startIndex + itemsPerPage,
                  sortedVulnerabilities.length
                )}{" "}
                of {sortedVulnerabilities.length} vulnerabilities
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
