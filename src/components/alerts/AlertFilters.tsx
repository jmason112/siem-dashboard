import React from 'react';
import { Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import type { AlertFilters } from '../../types/alerts';

type AlertFiltersProps = {
  filters: AlertFilters;
  onFilterChange: (filters: Partial<AlertFilters>) => void;
};

export function AlertFilters({ filters, onFilterChange }: AlertFiltersProps) {
  const severityOptions: Array<{ value: string; label: string }> = [
    { value: 'critical', label: 'Critical' },
    { value: 'warning', label: 'Warning' },
    { value: 'info', label: 'Info' },
  ];

  const statusOptions: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </h3>
        <button
          onClick={() =>
            onFilterChange({
              severity: null,
              dateRange: { start: null, end: null },
              status: 'all',
              search: '',
            })
          }
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Severity</label>
          <select
            value={filters.severity?.[0] || ''}
            onChange={(e) =>
              onFilterChange({
                severity: e.target.value ? [e.target.value as Alert['severity']] : null,
              })
            }
            className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
          >
            <option value="">All severities</option>
            {severityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <select
            value={filters.status}
            onChange={(e) =>
              onFilterChange({ status: e.target.value as AlertFilters['status'] })
            }
            className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">From</label>
          <input
            type="date"
            value={filters.dateRange.start ? format(filters.dateRange.start, 'yyyy-MM-dd') : ''}
            onChange={(e) =>
              onFilterChange({
                dateRange: {
                  ...filters.dateRange,
                  start: e.target.value ? new Date(e.target.value) : null,
                },
              })
            }
            className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">To</label>
          <input
            type="date"
            value={filters.dateRange.end ? format(filters.dateRange.end, 'yyyy-MM-dd') : ''}
            onChange={(e) =>
              onFilterChange({
                dateRange: {
                  ...filters.dateRange,
                  end: e.target.value ? new Date(e.target.value) : null,
                },
              })
            }
            className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
          />
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder="Search alerts..."
          className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-4 pr-10 text-sm"
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange({ search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}