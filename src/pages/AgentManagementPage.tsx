import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { AgentTable } from "../components/agents/AgentTable";
import { DeployAgentModal } from "../components/agents/DeployAgentModal";
import { EditAgentModal } from "../components/agents/EditAgentModal";
import type { Agent, AgentFormData } from "../types/agent";

// Mock data - replace with actual data fetching
const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Production Server 1",
    status: "active",
    lastSeen: new Date(),
    version: "1.0.0",
    ipAddress: "192.168.1.100",
    operatingSystem: "Ubuntu 22.04",
    installedAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-12-01"),
  },
  {
    id: "2",
    name: "Development Server",
    status: "inactive",
    lastSeen: new Date("2023-11-30"),
    version: "0.9.0",
    ipAddress: "192.168.1.101",
    operatingSystem: "Windows Server 2022",
    installedAt: new Date("2023-02-15"),
    updatedAt: new Date("2023-11-15"),
  },
];

export const AgentManagementPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async (data: AgentFormData) => {
    try {
      // Mock API call - replace with actual API call
      const newAgent: Agent = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name,
        status: "inactive",
        lastSeen: new Date(),
        version: "1.0.0",
        installedAt: new Date(),
        updatedAt: new Date(),
      };

      setAgents([...agents, newAgent]);
      setIsDeployModalOpen(false);
      setError(null);
    } catch (err) {
      setError("Failed to deploy agent");
    }
  };

  const handleEdit = async (id: string, data: AgentFormData) => {
    try {
      // Mock API call - replace with actual API call
      const updatedAgents = agents.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              name: data.name,
              version: data.version || agent.version,
              updatedAt: new Date(),
            }
          : agent
      );

      setAgents(updatedAgents);
      setIsEditModalOpen(false);
      setSelectedAgent(null);
      setError(null);
    } catch (err) {
      setError("Failed to update agent");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      // Mock API call - replace with actual API call
      const updatedAgents = agents.filter((agent) => agent.id !== id);
      setAgents(updatedAgents);
      setError(null);
    } catch (err) {
      setError("Failed to remove agent");
    }
  };

  const handleEditClick = (agent: Agent) => {
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

      {error && (
        <Card className="p-4 bg-destructive/10 text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        </Card>
      )}

      <Card>
        <AgentTable
          agents={agents}
          onEditClick={handleEditClick}
          onRemoveClick={handleRemove}
        />
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
