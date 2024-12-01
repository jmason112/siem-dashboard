import { Alert } from './index';

export type AlertFilters = {
  severity: Alert['severity'][] | null;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  status: 'active' | 'resolved' | 'all';
  search: string;
};

export type AlertAction = {
  id: string;
  description: string;
  required: boolean;
  completed: boolean;
};

export type DetailedAlert = Alert & {
  actions: AlertAction[];
  assignee?: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  relatedAlerts: string[];
};