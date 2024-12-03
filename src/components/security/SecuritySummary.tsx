"use client";

import React, { useEffect } from "react";
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
import { useSecurityStore } from "../../stores/securityStore";

interface SecurityMetric {
  category: string;
  count: number;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
}

export function SecuritySummary() {
  const {
    vulnerabilityStats,
    complianceStats,
    fetchVulnerabilityStats,
    fetchComplianceStats,
  } = useSecurityStore();

  // Fetch data when component mounts
  useEffect(() => {
    fetchVulnerabilityStats();
    fetchComplianceStats();
  }, []);

  const vulnerabilityData: SecurityMetric[] = [
    {
      category: "Critical Vulnerabilities",
      count: vulnerabilityStats?.bySeverity?.critical || 0,
      severity: "critical",
      description: "Immediate attention required",
    },
    {
      category: "High Risk Issues",
      count: vulnerabilityStats?.bySeverity?.high || 0,
      severity: "high",
      description: "Action required within 24 hours",
    },
    {
      category: "Medium Risk Issues",
      count: vulnerabilityStats?.bySeverity?.medium || 0,
      severity: "medium",
      description: "Action required within 7 days",
    },
  ];

  // Calculate compliance score based on actual compliance data
  const calculateComplianceScore = () => {
    if (!complianceStats?.byFramework?.length) return 0;

    const totalControls = complianceStats.byFramework.reduce(
      (acc: number, framework) => acc + framework.total,
      0
    );

    const compliantControls = complianceStats.byFramework.reduce(
      (acc: number, framework) => acc + (framework.compliant || 0),
      0
    );

    return totalControls > 0
      ? Math.round((compliantControls / totalControls) * 100)
      : 0;
  };

  // Calculate number of non-compliant policies
  const calculateNonCompliantPolicies = () => {
    if (!complianceStats?.byFramework?.length) return 0;

    return complianceStats.byFramework.reduce(
      (acc: number, framework) => acc + (framework.nonCompliant || 0),
      0
    );
  };

  const complianceScore = calculateComplianceScore();
  const nonCompliantPolicies = calculateNonCompliantPolicies();

  // Get compliance status text
  const getComplianceStatusText = (score: number) => {
    if (score >= 90) return "Excellent compliance status";
    if (score >= 75) return "Good compliance status";
    if (score >= 60) return "Needs improvement";
    return "Critical attention required";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Vulnerability Summary
          </CardTitle>
          <CardDescription>
            Overview of system vulnerabilities by severity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vulnerabilityData.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{item.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div
                  className={`rounded-full px-2 py-1 text-xs font-semibold
                  ${
                    item.severity === "critical"
                      ? "bg-red-500/10 text-red-500"
                      : item.severity === "high"
                      ? "bg-orange-500/10 text-orange-500"
                      : "bg-yellow-500/10 text-yellow-500"
                  }`}
                >
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Compliance Status
          </CardTitle>
          <CardDescription>Overall compliance score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <div className="flex w-full justify-between">
                <span className="text-sm font-medium">Compliance Score</span>
                <span className="text-sm font-medium">{complianceScore}%</span>
              </div>
              <Progress value={complianceScore} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {getComplianceStatusText(complianceScore)}
              </p>
            </div>
            <div className="mt-4 rounded-lg bg-muted p-2">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>
                  {nonCompliantPolicies} compliance{" "}
                  {nonCompliantPolicies === 1
                    ? "policy requires"
                    : "policies require"}{" "}
                  review
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
