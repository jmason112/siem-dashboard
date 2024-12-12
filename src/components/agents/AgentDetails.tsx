import React, { useState, useEffect } from "react";
import { Card } from "./../ui/card";
import { Activity, AlertCircle, Database } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./../ui/tabs";
import { AlertsTab } from "./tabs/AlertsTab";
import { VulnerabilitiesTab } from "./tabs/VulnerabilitiesTab";
import { ComplianceTab } from "./tabs/ComplianceTab";
import { SystemInfoTab } from "./tabs/SystemInfoTab";
import { OSQueryTab } from "./tabs/OSQueryTab";
import { DeployedAgentsTable } from "./DeployedAgentsTable";
import { Alert } from "./tabs/AlertsTab";
import { getAuthStore } from "../../stores/authStore";
import { useAuth } from "../../lib/auth";
import axios from "axios";
import type { DeployedAgent } from "../../hooks/useDeployedAgents";

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

export function AgentDetails() {
  const { id } = useParams<{ id: string }>();
  const [agentData, setAgentData] = useState<DeployedAgent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deployedAgents, setDeployedAgents] = useState<DeployedAgent[]>([]);
  const { user } = useAuth();
  const authStore = getAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [id, user]);

  const fetchData = async () => {
    if (!id || !user) return;

    try {
      console.log("Fetching agent data for id:", id);
      setIsLoading(true);
      setError(null);

      const userId = localStorage.getItem("userId");
      const response = await axios.get(
        `http://localhost:3000/api/agents/deployed?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!userId) {
        throw new Error("No userId found");
      }

      console.log("Response data:", response.data);
      setDeployedAgents(
        response.data.map((agent: any) => ({
          ...agent,
          id: agent._id,
          agentId: agent.id,
          userId: userId,
        }))
      );

      // Find agent by any of its possible IDs
      const agent = response.data.find(
        (a: any) => a.agentId === id || a._id === id || a.id === id
      );

      console.log("Found agent:", agent);

      if (!agent) {
        setError("Agent not found");
        return;
      }

      setAgentData({
        id: agent._id,
        agentId: agent.id,
        name: agent.name,
        status: agent.status,
        deployedAt: agent.deployedAt,
        lastActive: agent.lastActive,
        systemInfo: agent.systemInfo,
        osqueryData: agent.osqueryData,
        userId: agent.userId || userId || "",
      });
    } catch (error) {
      console.error("Error fetching agent data:", error);
      setError("Failed to load agent data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopAgent = async (agentId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/agents/${agentId}/stop`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to stop agent");
      }
      await fetchData();
    } catch (error) {
      console.error("Failed to stop agent:", error);
    }
  };

  useEffect(() => {
    if (!authStore.token || !agentData?.systemInfo?.hostname) return;

    const ws = new WebSocket(`ws://localhost:3000/ws?token=${authStore.token}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(
        JSON.stringify({
          type: "subscribe_agent_alerts",
          agentName: agentData.systemInfo!.hostname,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket received data:", data);
      if (data.type === "agent_alerts") {
        console.log("Setting agent alerts:", data.data);
        setAgentData((prev) => {
          if (!prev) return prev;
          const alerts = Array.isArray(data.data.alerts)
            ? data.data.alerts
            : [];
          return {
            ...prev,
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

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [agentData?.systemInfo?.hostname, authStore.token]);

  const formatBytes = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

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
          <TabsTrigger value="osquery">OSQuery Data</TabsTrigger>
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

        <TabsContent value="osquery">
          <OSQueryTab osqueryData={agentData.osqueryData || {}} />
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
          onEditClick={() => {}}
        />
      </div>
    </div>
  );
}
