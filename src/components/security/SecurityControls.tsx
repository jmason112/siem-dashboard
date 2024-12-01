import React from 'react';
import { Shield, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import type { SecurityControl } from '../../types/security';

type SecurityControlsProps = {
  controls: SecurityControl[];
  onToggleControl: (id: string) => void;
};

export function SecurityControls({ controls, onToggleControl }: SecurityControlsProps) {
  const getStatusIcon = (status: SecurityControl['status']) => {
    switch (status) {
      case 'enabled':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'disabled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Controls
        </h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {controls.map((control) => (
          <div
            key={control.id}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(control.status)}
                  <h3 className="font-medium">{control.name}</h3>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {control.description}
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {control.lastUpdated.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => onToggleControl(control.id)}
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  control.status === 'enabled'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {control.status === 'enabled' ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}