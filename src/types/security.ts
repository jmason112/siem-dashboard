export type SecurityControl = {
  id: string;
  name: string;
  status: 'enabled' | 'disabled' | 'warning';
  lastUpdated: Date;
  description: string;
  category: 'firewall' | 'encryption' | 'access' | 'monitoring';
};

export type VulnerabilityScan = {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  asset: string;
  description: string;
  discoveredAt: Date;
  status: 'open' | 'in_progress' | 'resolved';
};

export type ComplianceStatus = {
  framework: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  lastAssessment: Date;
  controls: {
    total: number;
    passed: number;
    failed: number;
  };
};