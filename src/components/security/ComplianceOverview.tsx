import React from 'react';
import { FileCheck } from 'lucide-react';
import type { ComplianceStatus } from '../../types/security';

type ComplianceOverviewProps = {
  compliance: ComplianceStatus[];
};

export function ComplianceOverview({ compliance }: ComplianceOverviewProps) {
  const getStatusColor = (status: ComplianceStatus['status']) => {
    switch (status) {
      case 'compliant':
        return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'non_compliant':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'partial':
        return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Compliance Status
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {compliance.map((item) => (
          <div
            key={item.framework}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{item.framework}</h3>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  item.status
                )}`}
              >
                {item.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Controls Passed</span>
                <span className="font-medium">{item.controls.passed}/{item.controls.total}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${(item.controls.passed / item.controls.total) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last assessed: {item.lastAssessment.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}