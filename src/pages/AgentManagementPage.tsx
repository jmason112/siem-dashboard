import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { DeployedAgentsTable } from "../components/agents/DeployedAgentsTable";
import { DeployAgentModal } from "../components/agents/DeployAgentModal";
import { EditAgentModal } from "../components/agents/EditAgentModal";
import { useDeployedAgents } from "../hooks/useDeployedAgents";
import type { AgentFormData } from "../types/agent";
import axios from "axios";

export const AgentManagementPage: React.FC = () => {
  const {
    agents,
    loading,
    error: fetchError,
    stopAgent,
    refetch,
  } = useDeployedAgents();
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async (data: AgentFormData) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("No user ID found");
        return;
      }

      await axios.post(`/api/agents/deploy?userId=${userId}`, data);
      refetch();
      setIsDeployModalOpen(false);
      setError(null);
    } catch (err) {
      setError("Failed to deploy agent");
      console.error("Error deploying agent:", err);
    }
  };

  const handleEdit = async (id: string, data: AgentFormData) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("No user ID found");
        return;
      }

      await axios.put(`/api/agents/${id}?userId=${userId}`, data);
      refetch();
      setIsEditModalOpen(false);
      setSelectedAgent(null);
      setError(null);
    } catch (err) {
      setError("Failed to update agent");
      console.error("Error updating agent:", err);
    }
  };

  const handleEditClick = (agent: any) => {
    setSelectedAgent(agent);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Agent Management</h1>
          <p className="text-muted-foreground">
            Deploy and manage security monitoring agents
          </p>
        </div>
        <Button onClick={() => setIsDeployModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Deploy New Agent
        </Button>
      </div>

      {(error || fetchError) && (
        <Card className="p-4 bg-destructive/10 text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p>{error || fetchError}</p>
          </div>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="p-4 text-center">Loading agents...</div>
        ) : (
          <DeployedAgentsTable
            agents={agents}
            onStopAgent={stopAgent}
            onEditClick={handleEditClick}
          />
        )}
      </Card>

      <DeployAgentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onDeploy={handleDeploy}
      />

      <EditAgentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAgent(null);
        }}
        onEdit={handleEdit}
        agent={selectedAgent}
      />
    </div>
  );
};
