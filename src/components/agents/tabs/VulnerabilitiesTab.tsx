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
import { Shield, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Progress } from "../../ui/progress";

interface VulnerabilitiesTabProps {
  vulnerabilities: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export function VulnerabilitiesTab({
  vulnerabilities,
}: VulnerabilitiesTabProps) {
  const calculateRiskScore = () => {
    const total = vulnerabilities.total;
    if (total === 0) return 0;

    const score =
      ((vulnerabilities.critical * 10 +
        vulnerabilities.high * 7 +
        vulnerabilities.medium * 4 +
        vulnerabilities.low * 1) /
        (total * 10)) *
      100;

    return Math.round(score);
  };

  return (
    <div className="space-y-6">
      {/* Risk Score */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-lg font-medium">Overall Risk Score</h3>
            <p className="text-sm text-muted-foreground">
              Based on vulnerability severity and quantity
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Risk Level</span>
            <span className="text-sm font-medium">{calculateRiskScore()}%</span>
          </div>
          <Progress value={calculateRiskScore()} className="h-2" />
        </div>
      </Card>

      {/* Vulnerability Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Critical
              </p>
              <h3 className="text-2xl font-bold text-red-500">
                {vulnerabilities.critical}
              </h3>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">High</p>
              <h3 className="text-2xl font-bold text-orange-500">
                {vulnerabilities.high}
              </h3>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Medium
              </p>
              <h3 className="text-2xl font-bold text-yellow-500">
                {vulnerabilities.medium}
              </h3>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Low</p>
              <h3 className="text-2xl font-bold text-blue-500">
                {vulnerabilities.low}
              </h3>
            </div>
            <Info className="h-8 w-8 text-blue-500 opacity-20" />
          </div>
        </Card>
      </div>
    </div>
  );
}
