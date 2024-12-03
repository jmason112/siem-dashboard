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

export interface Vulnerability {
  _id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvss_score: number;
  cve_id?: string;
  affected_component: string;
  affected_versions: string[];
  remediation: string;
  discovered_at: Date;
  status: 'open' | 'in_progress' | 'resolved' | 'false_positive';
  scan_source: string;
  asset_id: string;
  asset_type: string;
  tags: string[];
}

export interface Compliance {
  _id: string;
  framework: 'ISO27001' | 'SOC2' | 'GDPR';
  control_id: string;
  control_name: string;
  description: string;
  status: 'compliant' | 'non_compliant' | 'partially_compliant';
  evidence: string;
  last_checked: Date;
  next_check: Date;
  assigned_to?: string;
  risk_level: 'high' | 'medium' | 'low';
  remediation_plan?: string;
  comments?: string;
  attachments?: string[];
  tags: string[];
}

export interface VulnerabilityStats {
  total: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byStatus: {
    open: number;
    in_progress: number;
    resolved: number;
    false_positive: number;
  };
  topAssets: Array<{
    _id: string;
    count: number;
    critical: number;
  }>;
}

export interface ComplianceStats {
  byFramework: Array<{
    _id: string;
    total: number;
    compliant: number;
    partial: number;
    nonCompliant: number;
  }>;
  byRiskLevel: {
    high: number;
    medium: number;
    low: number;
  };
  upcomingDeadlines: Compliance[];
} 