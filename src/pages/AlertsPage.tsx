import React, { useMemo } from 'react';
import { Bell } from 'lucide-react';
import { AlertFilters } from '../components/alerts/AlertFilters';
import { AlertsTable } from '../components/alerts/AlertsTable';
import { useAlertStore } from '../stores/alertStore';
import { isWithinInterval } from 'date-fns';

export function AlertsPage() {
  const { alerts, filters, selectedAlerts, setFilters, toggleAlertSelection, selectAll, clearSelection, acknowledgeAlerts } = useAlertStore();

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Filter by severity
      if (filters.severity && !filters.severity.includes(alert.severity)) {
        return false;
      }

      // Filter by status
      if (filters.status === 'active' && alert.acknowledged) {
        return false;
      }
      if (filters.status === 'resolved' && !alert.acknowledged) {
        return false;
      }

      // Filter by date range
      if (filters.dateRange.start && filters.dateRange.end) {
        if (!isWithinInterval(alert.timestamp, {
          start: filters.dateRange.start,
          end: filters.dateRange.end,
        })) {
          return false;
        }
      }

      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          alert.description.toLowerCase().includes(searchLower) ||
          alert.source.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [alerts, filters]);

  const handleSelectAll = () => {
    if (selectedAlerts.size === filteredAlerts.length) {
      clearSelection();
    } else {
      selectAll();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Alerts
          {selectedAlerts.size > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              {selectedAlerts.size} selected
            </span>
          )}
        </h1>
        {selectedAlerts.size > 0 && (
          <button
            onClick={() => acknowledgeAlerts(Array.from(selectedAlerts))}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Acknowledge Selected
          </button>
        )}
      </div>

      <AlertFilters
        filters={filters}
        onFilterChange={setFilters}
      />

      <AlertsTable
        alerts={filteredAlerts}
        selectedAlerts={selectedAlerts}
        onToggleSelect={toggleAlertSelection}
        onSelectAll={handleSelectAll}
        onAcknowledge={acknowledgeAlerts}
      />
    </div>
  );
}