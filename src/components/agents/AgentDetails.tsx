import React, { useState, useEffect } from "react";
import { Card } from "./../ui/card";
import { Activity, AlertCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./../ui/tabs";
import { AlertsTab } from "./tabs/AlertsTab";
import { VulnerabilitiesTab } from "./tabs/VulnerabilitiesTab";
import { ComplianceTab } from "./tabs/ComplianceTab";
import { SystemInfoTab } from "./tabs/SystemInfoTab";

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
  };
}

export function AgentDetails() {
  const { id = "1" } = useParams();
  const [agentData, setAgentData] = useState(mockAgentData);
  const [isLoading, setIsLoading] = useState(true);
  const [deployedAgents, setDeployedAgents] = useState<DeployedAgent[]>([]);

  // Simulate data fetch
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setAgentData({ ...mockAgentData, id });
      } catch (error) {
        console.error("Failed to fetch agent data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentData();
  }, [id]);

  useEffect(() => {
    const fetchDeployedAgents = async () => {
      try {
        console.log("Fetching agents..."); // Debug log
        const response = await fetch("/api/agents/deployed");
        console.log("Response status:", response.status); // Debug log

        if (!response.ok) {
          throw new Error("Failed to fetch agents");
        }

        const data = await response.json();
        console.log("Fetched agents data:", data); // Debug log
        setDeployedAgents(data);
      } catch (error) {
        console.error("Failed to fetch deployed agents:", error);
      }
    };

    fetchDeployedAgents();
    const interval = setInterval(fetchDeployedAgents, 5000);
    return () => clearInterval(interval);
  }, []);

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
              ...agentData,
              os: agentData.operatingSystem,
            }}
          />
        </TabsContent>

        <TabsContent value="alerts">
          <AlertsTab alerts={agentData.alerts} />
        </TabsContent>

        <TabsContent value="vulnerabilities">
          <VulnerabilitiesTab vulnerabilities={agentData.vulnerabilities} />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceTab compliance={agentData.compliance} />
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Deployed Agents</h2>
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name/Host
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  System Info
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resources
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deployedAgents.map((agent) => (
                <tr key={agent.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {agent.name}
                      </div>
                      {agent.systemInfo && (
                        <div className="text-gray-500">
                          {agent.systemInfo.hostname}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        agent.status === "running"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {agent.systemInfo && (
                      <div className="text-sm text-gray-900">
                        <p>{agent.systemInfo.os}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {agent.systemInfo && (
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">CPU:</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 rounded-full h-2"
                              style={{
                                width: `${agent.systemInfo.cpu_usage}%`,
                              }}
                            />
                          </div>
                          <span>{agent.systemInfo.cpu_usage.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">RAM:</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 rounded-full h-2"
                              style={{
                                width: `${agent.systemInfo.memory_percent}%`,
                              }}
                            />
                          </div>
                          <span>
                            {agent.systemInfo.memory_percent.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Disk:</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 rounded-full h-2"
                              style={{
                                width: `${agent.systemInfo.disk_percent}%`,
                              }}
                            />
                          </div>
                          <span>
                            {agent.systemInfo.disk_percent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(agent.lastActive).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {agent.status === "running" && (
                      <button
                        onClick={() => handleStopAgent(agent.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Stop
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
