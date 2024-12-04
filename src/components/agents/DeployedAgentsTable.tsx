import React from "react";
import { useNavigate } from "react-router-dom";

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

interface DeployedAgentsTableProps {
  agents: DeployedAgent[];
  onStopAgent: (agentId: string) => void;
}

export function DeployedAgentsTable({
  agents,
  onStopAgent,
}: DeployedAgentsTableProps) {
  const navigate = useNavigate();

  return (
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
          {agents.map((agent) => (
            <tr key={agent.id}>
              <td className="px-6 py-4">
                <div className="text-sm">
                  <div
                    className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                    onClick={() => navigate(`/agents/${agent.id}`)}
                  >
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
                      <span>{agent.systemInfo.memory_percent.toFixed(1)}%</span>
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
                      <span>{agent.systemInfo.disk_percent.toFixed(1)}%</span>
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
                    onClick={() => onStopAgent(agent.id)}
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
  );
}
