import React, { useState, useEffect } from "react";
import { DeployedAgentsTable } from "./DeployedAgentsTable";

export function AgentTable() {
  const [deployedAgents, setDeployedAgents] = useState([]);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Deployed Agents</h2>
      </div>
      <DeployedAgentsTable
        agents={deployedAgents}
        onStopAgent={handleStopAgent}
      />
    </div>
  );
}
