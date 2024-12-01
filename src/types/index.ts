export type Alert = {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  source: string;
  description: string;
  acknowledged: boolean;
};

export type MetricCard = {
  id: string;
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
};

export type TimeSeriesData = {
  timestamp: Date;
  value: number;
};

export type Widget = {
  id: string;
  type: 'metric' | 'chart' | 'alerts';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
};