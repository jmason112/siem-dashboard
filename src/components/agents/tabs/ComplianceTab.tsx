import React, { useState } from "react";
import { Card } from "../../ui/card";
import { Progress } from "../../ui/progress";
import { Shield, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "../../ui/button";

interface ComplianceCheck {
  _id: string;
  framework: string;
  control_id: string;
  control_name: string;
  description: string;
  status: "compliant" | "non_compliant" | "partially_compliant";
  evidence: string;
  risk_level: string;
  last_checked: string;
  next_check: string;
  remediation_plan?: string;
  hostname: string;
}

interface ComplianceCategory {
  name: string;
  total: number;
  passed: number;
  score: number;
}

interface ComplianceTabProps {
  compliance: {
    score: number;
    categories: ComplianceCategory[];
    checks: ComplianceCheck[];
  };
}

export function ComplianceTab({ compliance }: ComplianceTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sort checks by last_checked (newest first)
  const sortedChecks = [...(compliance.checks || [])].sort(
    (a, b) =>
      new Date(b.last_checked).getTime() - new Date(a.last_checked).getTime()
  );

  // Pagination logic
  const totalPages = Math.ceil((sortedChecks?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedChecks = sortedChecks.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusIcon = (status: ComplianceCheck["status"]) => {
    switch (status) {
      case "compliant":
        return <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />;
      case "partially_compliant":
        return <Shield className="h-5 w-5 text-yellow-500 mt-0.5" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500 mt-0.5" />;
    }
  };

  const getStatusClass = (status: ComplianceCheck["status"]) => {
    switch (status) {
      case "compliant":
        return "bg-green-50 dark:bg-green-900/10";
      case "partially_compliant":
        return "bg-yellow-50 dark:bg-yellow-900/10";
      default:
        return "bg-red-50 dark:bg-red-900/10";
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Compliance Score */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-lg font-medium">Overall Compliance Score</h3>
            <p className="text-sm text-muted-foreground">
              Based on security policies and best practices
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-5xl font-bold text-primary">
            {compliance.score}%
          </div>
          <Progress value={compliance.score} className="w-full h-2" />
        </div>
      </Card>

      {/* Compliance Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {compliance.categories.map((category) => (
          <Card key={category.name} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">{category.name}</h4>
              <span className="text-lg font-bold">{category.score}%</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Controls Passed</span>
                <span>
                  {category.passed}/{category.total}
                </span>
              </div>
              <Progress value={category.score} className="h-2" />
            </div>
          </Card>
        ))}
      </div>

      {/* Compliance Checks */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Compliance Checks</h3>
        {paginatedChecks.length === 0 ? (
          <Card className="p-4">
            <p className="text-center text-gray-500">
              No compliance checks found
            </p>
          </Card>
        ) : (
          <>
            {paginatedChecks.map((check) => (
              <Card
                key={check._id}
                className={`p-4 ${getStatusClass(check.status)}`}
              >
                <div className="flex items-start gap-4">
                  {getStatusIcon(check.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{check.control_name}</h4>
                      <span className="text-sm text-gray-500">
                        {new Date(check.last_checked).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {check.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-sm px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                        {check.framework}
                      </span>
                      <span className="text-sm px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                        {check.control_id}
                      </span>
                      <span className="text-sm px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                        Risk: {check.risk_level}
                      </span>
                    </div>
                    {check.remediation_plan && (
                      <p className="text-sm text-gray-500 mt-2">
                        Remediation: {check.remediation_plan}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {/* Pagination controls */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, sortedChecks.length)} of{" "}
                {sortedChecks.length} checks
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
