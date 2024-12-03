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

export function AgentDetails() {
  const { id = "1" } = useParams();
  const [agentData, setAgentData] = useState(mockAgentData);
  const [isLoading, setIsLoading] = useState(true);

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
    </div>
  );
}
