import React, { useState, useEffect } from "react";
import { Card } from "./../ui/card";
import { Activity, AlertCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./../ui/tabs";
import { AlertsTab } from "./tabs/AlertsTab";
import { VulnerabilitiesTab } from "./tabs/VulnerabilitiesTab";
import { ComplianceTab } from "./tabs/ComplianceTab";
import { SystemInfoTab } from "./tabs/SystemInfoTab";
import { DeployedAgentsTable } from "./DeployedAgentsTable";
import { Alert } from "./tabs/AlertsTab";

// Mock data for development
const mockAgentData = {
  id: "1",
  name: "Production Server 1",
  status: "active",
  lastSeen: new Date(),
  version: "1.0.0",
  ipAddress: "192.168.1.100",
  operatingSystem: "Ubuntu 22.04 LTS",
  uptime: "15 days",
  hostname: "prod-srv-01",
  cpu: {
    model: "Intel Xeon E5-2680 v4",
    cores: 8,
    usage: 45,
  },
  memory: {
    total: "32GB",
    used: "12GB",
    usage: 37.5,
  },
  disk: {
    total: "500GB",
    used: "200GB",
    usage: 40,
  },
  alerts: {
    total: 12,
    critical: 2,
    warning: 5,
    info: 5,
  },
  vulnerabilities: {
    total: 8,
    critical: 1,
    high: 2,
    medium: 3,
    low: 2,
  },
  compliance: {
    score: 85,
    categories: [
      { name: "Access Control", score: 90 },
      { name: "Data Protection", score: 85 },
      { name: "Network Security", score: 80 },
      { name: "System Hardening", score: 88 },
    ],
  },
};

interface DeployedAgent {
  id: string;
  name: string;
  status: "running" | "stopped";
  deployedAt: string;
  lastActive: string;
  systemInfo?: {
    hostname: string;
    os: string;
    cpu_usage: number;
    memory_total: number;
    memory_used: number;
    memory_percent: number;
    disk_total: number;
    disk_used: number;
    disk_percent: number;
    ip_addresses?: {
      interface: string;
      address: string;
    }[];
  };
  alerts?: {
    total: number;
    critical: number;
    warning: number;
    info: number;
    alerts?: Alert[];
  };
  vulnerabilities?: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  compliance?: {
    score: number;
    categories: {
      name: string;
      total: number;
      passed: number;
      score: number;
    }[];
    checks: any[];
  };
}

export function AgentDetails() {
  const { id = "1" } = useParams();
  const [agentData, setAgentData] = useState<DeployedAgent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deployedAgents, setDeployedAgents] = useState<DeployedAgent[]>([]);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/agents/deployed`);
        const agents = await response.json();
        const currentAgent = agents.find((a: DeployedAgent) => a.id === id);

        if (currentAgent) {
          // Fetch all data including alerts, vulnerabilities, and compliance
          const [vulnsRes, complianceRes, alertsRes] = await Promise.all([
            fetch(
              `/api/security/vulnerabilities?asset_id=${currentAgent.systemInfo?.hostname}&limit=1000`
            ).then((r) => (r.ok ? r.json() : null)),
            fetch(`/api/security/compliance?limit=1000`).then((r) =>
              r.ok ? r.json() : null
            ),
            fetch(
              `/api/alerts?source=${currentAgent.systemInfo?.hostname}&limit=1000`
            ).then((r) => (r.ok ? r.json() : { alerts: [] })),
          ]);

          // Process alerts, vulnerabilities, and compliance data
          const agentHostname = currentAgent.systemInfo?.hostname;
          const agentAlerts = alertsRes.alerts || [];
          const agentVulnerabilities = vulnsRes?.vulnerabilities || [];
          const allCompliance = complianceRes?.compliance || [];

          // Filter compliance data for this agent
          const agentCompliance = allCompliance.filter(
            (c: any) => c.hostname === agentHostname
          );

          // Calculate compliance score and categories
          const complianceScore =
            agentCompliance.length > 0
              ? Math.round(
                  (agentCompliance.filter((c: any) => c.status === "compliant")
                    .length /
                    agentCompliance.length) *
                    100
                )
              : 0;

          // Group compliance checks by category
          const complianceCategories = agentCompliance.reduce(
            (acc: any[], check: any) => {
              const category = acc.find((c) => c.name === check.framework);
              if (category) {
                category.total++;
                if (check.status === "compliant") category.passed++;
              } else {
                acc.push({
                  name: check.framework,
                  total: 1,
                  passed: check.status === "compliant" ? 1 : 0,
                  score: 0,
                });
              }
              return acc;
            },
            []
          );

          // Calculate scores for each category
          complianceCategories.forEach(
            (category: {
              name: string;
              total: number;
              passed: number;
              score: number;
            }) => {
              category.score = Math.round(
                (category.passed / category.total) * 100
              );
            }
          );

          console.log("Agent compliance data:", {
            total: agentCompliance.length,
            score: complianceScore,
            categories: complianceCategories,
            checks: agentCompliance,
          });

          setAgentData({
            ...currentAgent,
            alerts: {
              total: agentAlerts.length,
              critical: agentAlerts.filter(
                (a: Alert) => a.severity === "critical"
              ).length,
              warning: agentAlerts.filter(
                (a: Alert) => a.severity === "warning"
              ).length,
              info: agentAlerts.filter((a: Alert) => a.severity === "info")
                .length,
              alerts: agentAlerts,
            },
            vulnerabilities: {
              total: agentVulnerabilities.length,
              critical: agentVulnerabilities.filter(
                (v: any) => v.severity === "critical"
              ).length,
              high: agentVulnerabilities.filter(
                (v: any) => v.severity === "high"
              ).length,
              medium: agentVulnerabilities.filter(
                (v: any) => v.severity === "medium"
              ).length,
              low: agentVulnerabilities.filter((v: any) => v.severity === "low")
                .length,
              vulnerabilities: agentVulnerabilities,
            },
            compliance: {
              score: complianceScore,
              categories: complianceCategories,
              checks: agentCompliance,
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch agent data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentData();
    const interval = setInterval(fetchAgentData, 30000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    const fetchDeployedAgents = async () => {
      try {
        const response = await fetch("/api/agents/deployed");
        if (!response.ok) {
          throw new Error("Failed to fetch agents");
        }
        const data = await response.json();

        // Only update if data has changed
        setDeployedAgents((prev) => {
          return JSON.stringify(prev) !== JSON.stringify(data) ? data : prev;
        });
      } catch (error) {
        console.error("Failed to fetch deployed agents:", error);
      }
    };

    fetchDeployedAgents();
    // Reduced polling frequency to 15 seconds
    const interval = setInterval(fetchDeployedAgents, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000/ws");

    ws.onopen = () => {
      console.log("WebSocket connected");
      if (agentData?.systemInfo?.hostname) {
        ws.send(
          JSON.stringify({
            type: "subscribe_agent_alerts",
            agentName: agentData.systemInfo.hostname,
          })
        );
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket received data:", data);
      if (data.type === "agent_alerts") {
        console.log("Setting agent alerts:", data.data);
        setAgentData((prev) => {
          const alerts = Array.isArray(data.data.alerts)
            ? data.data.alerts
            : [];
          return {
            ...prev!,
            alerts: {
              total: alerts.length,
              critical: alerts.filter((a: Alert) => a.severity === "critical")
                .length,
              warning: alerts.filter((a: Alert) => a.severity === "warning")
                .length,
              info: alerts.filter((a: Alert) => a.severity === "info").length,
              alerts: alerts,
            },
          };
        });
      }
    };

    return () => {
      ws.close();
    };
  }, [agentData?.systemInfo?.hostname]);

  const handleStopAgent = async (agentId: string) => {
    try {
      await fetch(`/api/agents/${agentId}/stop`, {
        method: "POST",
      });
      const response = await fetch("/api/agents/deployed");
      const data = await response.json();
      setDeployedAgents(data);
    } catch (error) {
      console.error("Failed to stop agent:", error);
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading agent details...</p>
        </div>
      </div>
    );
  }

  if (!agentData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Agent not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {agentData.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ID: {agentData.id}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Status: {agentData.status}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList className="bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="system">System Info</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <SystemInfoTab
            system={{
              hostname: agentData.systemInfo?.hostname || "Unknown",
              os: agentData.systemInfo?.os || "Unknown",
              uptime: "N/A",
              ipAddress:
                agentData.systemInfo?.ip_addresses
                  ?.map((ip) => `${ip.interface}: ${ip.address}`)
                  .join(", ") || "N/A",
              cpu: {
                model: "N/A",
                cores: 0,
                usage: agentData.systemInfo?.cpu_usage || 0,
              },
              memory: {
                total: formatBytes(agentData.systemInfo?.memory_total || 0),
                used: formatBytes(agentData.systemInfo?.memory_used || 0),
                usage: agentData.systemInfo?.memory_percent || 0,
              },
              disk: {
                total: formatBytes(agentData.systemInfo?.disk_total || 0),
                used: formatBytes(agentData.systemInfo?.disk_used || 0),
                usage: agentData.systemInfo?.disk_percent || 0,
              },
            }}
          />
        </TabsContent>

        <TabsContent value="alerts">
          {agentData.alerts ? (
            <>
              {console.log("Agent Alerts Data:", agentData.alerts)}
              {console.log("Agent Source:", agentData.systemInfo?.hostname)}
              <AlertsTab
                alerts={agentData.alerts}
                agentSource={agentData.systemInfo?.hostname}
              />
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No alerts data available
            </div>
          )}
        </TabsContent>

        <TabsContent value="vulnerabilities">
          {agentData.vulnerabilities ? (
            <VulnerabilitiesTab vulnerabilities={agentData.vulnerabilities} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No vulnerability data available
            </div>
          )}
        </TabsContent>

        <TabsContent value="compliance">
          {agentData.compliance ? (
            <ComplianceTab compliance={agentData.compliance} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No compliance data available
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Deployed Agents</h2>
        <DeployedAgentsTable
          agents={deployedAgents}
          onStopAgent={handleStopAgent}
        />
      </div>
    </div>
  );
}
