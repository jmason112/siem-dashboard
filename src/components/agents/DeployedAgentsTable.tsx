import React from "react";
import { useNavigate } from "react-router-dom";
import type { DeployedAgent } from "../../hooks/useDeployedAgents";

interface DeployedAgentsTableProps {
  agents: DeployedAgent[];
  onStopAgent: (agentId: string) => void;
  onEditClick: (agent: DeployedAgent) => void;
}

export function DeployedAgentsTable({
  agents,
  onStopAgent,
  onEditClick,
}: DeployedAgentsTableProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border border-border">
      <table className="min-w-full divide-y divide-border">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-muted text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Name/Host
            </th>
            <th className="px-6 py-3 bg-muted text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 bg-muted text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              System Info
            </th>
            <th className="px-6 py-3 bg-muted text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Resources
            </th>
            <th className="px-6 py-3 bg-muted text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Last Active
            </th>
            <th className="px-6 py-3 bg-muted text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-background divide-y divide-border">
          {agents.map((agent) => (
            <tr key={agent.id}>
              <td className="px-6 py-4">
                <div className="text-sm">
                  <div
                    className="font-medium text-foreground hover:text-primary cursor-pointer"
                    onClick={() => navigate(`/agents/${agent.id}`)}
                  >
                    {agent.name}
                  </div>
                  {agent.systemInfo && (
                    <div className="text-muted-foreground">
                      {agent.systemInfo.hostname}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    agent.status === "running"
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                      : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100"
                  }`}
                >
                  {agent.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {agent.systemInfo && (
                  <div className="text-sm text-foreground">
                    <p>{agent.systemInfo.os}</p>
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                {agent.systemInfo && (
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">CPU:</span>
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2"
                          style={{
                            width: `${agent.systemInfo.cpu_usage}%`,
                          }}
                        />
                      </div>
                      <span className="text-foreground">
                        {agent.systemInfo.cpu_usage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">RAM:</span>
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2"
                          style={{
                            width: `${agent.systemInfo.memory_percent}%`,
                          }}
                        />
                      </div>
                      <span className="text-foreground">
                        {agent.systemInfo.memory_percent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Disk:</span>
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2"
                          style={{
                            width: `${agent.systemInfo.disk_percent}%`,
                          }}
                        />
                      </div>
                      <span className="text-foreground">
                        {agent.systemInfo.disk_percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {new Date(agent.lastActive).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap space-x-2">
                <button
                  onClick={() => onEditClick(agent)}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Edit
                </button>
                {agent.status === "running" && (
                  <button
                    onClick={() => onStopAgent(agent.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium"
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
  );
}
