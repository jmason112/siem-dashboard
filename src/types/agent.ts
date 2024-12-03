export interface Agent {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  lastSeen: Date;
  version: string;
  ipAddress?: string;
  operatingSystem?: string;
  installedAt: Date;
  updatedAt: Date;
}

export interface AgentFormData {
  name: string;
  version?: string;
}

export interface AgentStats {
  total: number;
  active: number;
  inactive: number;
  needsUpdate: number;
} 