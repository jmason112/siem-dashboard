import { create } from 'zustand';
import { format, subDays } from 'date-fns';
import type { Alert } from '../types';
import type { AlertFilters } from '../types/alerts';

type AlertStore = {
  alerts: Alert[];
  filters: AlertFilters;
  selectedAlerts: Set<string>;
  setFilters: (filters: Partial<AlertFilters>) => void;
  toggleAlertSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  acknowledgeAlerts: (ids: string[]) => void;
};

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: Array.from({ length: 20 }, (_, i) => ({
    id: `alert-${i + 1}`,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    severity: ['critical', 'warning', 'info'][Math.floor(Math.random() * 3)] as Alert['severity'],
    source: ['Firewall', 'IDS', 'System', 'Database', 'Application'][Math.floor(Math.random() * 5)],
    description: [
      'Multiple failed login attempts detected',
      'Unusual network traffic pattern detected',
      'System resource usage exceeding threshold',
      'Database connection timeout',
      'SSL certificate expiring soon',
    ][Math.floor(Math.random() * 5)],
    acknowledged: false,
  })),
  filters: {
    severity: null,
    dateRange: {
      start: subDays(new Date(), 7),
      end: new Date(),
    },
    status: 'all',
    search: '',
  },
  selectedAlerts: new Set<string>(),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  toggleAlertSelection: (id) =>
    set((state) => {
      const newSelection = new Set(state.selectedAlerts);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return { selectedAlerts: newSelection };
    }),
  selectAll: () =>
    set((state) => ({
      selectedAlerts: new Set(state.alerts.map((alert) => alert.id)),
    })),
  clearSelection: () =>
    set(() => ({
      selectedAlerts: new Set(),
    })),
  acknowledgeAlerts: (ids) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        ids.includes(alert.id) ? { ...alert, acknowledged: true } : alert
      ),
      selectedAlerts: new Set(),
    })),
}));