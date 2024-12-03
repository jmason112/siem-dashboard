import React from "react";
import { Card } from "../../ui/card";
import { Progress } from "../../ui/progress";
import { Shield } from "lucide-react";

interface ComplianceCategory {
  name: string;
  score: number;
}

interface ComplianceTabProps {
  compliance: {
    score: number;
    categories: ComplianceCategory[];
  };
}

export function ComplianceTab({ compliance }: ComplianceTabProps) {
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
            <Progress value={category.score} className="h-2" />
          </Card>
        ))}
      </div>
    </div>
  );
}
