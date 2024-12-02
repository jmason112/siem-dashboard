export interface Alert {
  _id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'new' | 'in_progress' | 'resolved' | 'dismissed';
  source: string;
  sourceIp?: string;
  timestamp: Date;
  tags: string[];
  affectedAssets: string[];
  assignedTo?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
} 