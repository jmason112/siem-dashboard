import React, { useState } from 'react';
import { SecurityControls } from '../components/security/SecurityControls';
import { VulnerabilityList } from '../components/security/VulnerabilityList';
import { ComplianceOverview } from '../components/security/ComplianceOverview';
import type { SecurityControl, VulnerabilityScan, ComplianceStatus } from '../types/security';

export function SecurityPage() {
  const [controls] = useState<SecurityControl[]>([
    {
      id: '1',
      name: 'Firewall Rules',
      status: 'enabled',
      lastUpdated: new Date(),
      description: 'Network firewall rules and policies',
      category: 'firewall',
    },
    {
      id: '2',
      name: 'Data Encryption',
      status: 'enabled',
      lastUpdated: new Date(),
      description: 'End-to-end encryption for sensitive data',
      category: 'encryption',
    },
    {
      id: '3',
      name: 'Access Control',
      status: 'warning',
      lastUpdated: new Date(),
      description: 'Role-based access control policies',
      category: 'access',
    },
    {
      id: '4',
      name: 'Security Monitoring',
      status: 'enabled',
      lastUpdated: new Date(),
      description: '24/7 security event monitoring',
      category: 'monitoring',
    },
  ]);

  const [vulnerabilities] = useState<VulnerabilityScan[]>([
    {
      id: '1',
      severity: 'critical',
      asset: 'Web Server',
      description: 'CVE-2024-1234: Remote Code Execution Vulnerability',
      discoveredAt: new Date(),
      status: 'open',
    },
    {
      id: '2',
      severity: 'high',
      asset: 'Database Server',
      description: 'Outdated SSL certificates detected',
      discoveredAt: new Date(),
      status: 'in_progress',
    },
    {
      id: '3',
      severity: 'medium',
      asset: 'Load Balancer',
      description: 'Weak cipher suites enabled',
      discoveredAt: new Date(),
      status: 'resolved',
    },
  ]);

  const [compliance] = useState<ComplianceStatus[]>([
    {
      framework: 'ISO 27001',
      status: 'compliant',
      lastAssessment: new Date(),
      controls: {
        total: 100,
        passed: 98,
        failed: 2,
      },
    },
    {
      framework: 'SOC 2',
      status: 'partial',
      lastAssessment: new Date(),
      controls: {
        total: 75,
        passed: 65,
        failed: 10,
      },
    },
    {
      framework: 'GDPR',
      status: 'compliant',
      lastAssessment: new Date(),
      controls: {
        total: 50,
        passed: 50,
        failed: 0,
      },
    },
  ]);

  const handleToggleControl = (id: string) => {
    // In a real application, this would update the backend
    console.log('Toggling control:', id);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SecurityControls controls={controls} onToggleControl={handleToggleControl} />
        <VulnerabilityList vulnerabilities={vulnerabilities} />
      </div>
      <ComplianceOverview compliance={compliance} />
    </div>
  );
}