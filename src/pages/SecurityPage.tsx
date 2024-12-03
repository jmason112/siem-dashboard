import React, { useEffect } from "react";
import { useSecurityStore } from "../stores/securityStore";
import { VulnerabilityDashboard } from "../components/security/VulnerabilityDashboard";
import { ComplianceDashboard } from "../components/security/ComplianceDashboard";
import { SecuritySummary } from "../components/security/SecuritySummary";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";

export const SecurityPage: React.FC = () => {
  const {
    fetchVulnerabilities,
    fetchVulnerabilityStats,
    fetchCompliance,
    fetchComplianceStats,
    vulnerabilityLoading,
    complianceLoading,
    vulnerabilityError,
    complianceError,
    connectWebSocket,
    disconnectWebSocket,
  } = useSecurityStore();

  useEffect(() => {
    // Initial data fetch
    const fetchData = async () => {
      await Promise.all([
        fetchVulnerabilities(),
        fetchVulnerabilityStats(),
        fetchCompliance(),
        fetchComplianceStats(),
      ]);
    };

    // Connect WebSocket and fetch initial data
    connectWebSocket();
    fetchData();

    // Cleanup
    return () => {
      disconnectWebSocket();
    };
  }, []);

  const handleRefresh = async () => {
    await Promise.all([
      fetchVulnerabilities(),
      fetchVulnerabilityStats(),
      fetchCompliance(),
      fetchComplianceStats(),
    ]);
  };

  if (vulnerabilityError || complianceError) {
    return (
      <Card className="m-4 p-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">
            Error Loading Security Data
          </h2>
          <p className="text-gray-600 mt-2">
            {vulnerabilityError || complianceError}
          </p>
          <Button onClick={handleRefresh} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Security Dashboard</h1>
        <Button
          onClick={handleRefresh}
          disabled={vulnerabilityLoading || complianceLoading}
        >
          {vulnerabilityLoading || complianceLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      <div className="mb-6">
        <SecuritySummary />
      </div>

      <Tabs defaultValue="vulnerabilities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="vulnerabilities">
          <VulnerabilityDashboard />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
