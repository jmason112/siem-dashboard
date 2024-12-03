import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Agent } from "../../types/agent";

interface AgentTableProps {
  agents: Agent[];
  onEditClick: (agent: Agent) => void;
  onRemoveClick: (id: string) => void;
}

export const AgentTable: React.FC<AgentTableProps> = ({
  agents,
  onEditClick,
  onRemoveClick,
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusColor = (status: Agent["status"]) => {
    return status === "active"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Seen</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Operating System</TableHead>
          <TableHead>IP Address</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {agents.map((agent) => (
          <TableRow key={agent.id}>
            <TableCell className="font-medium">{agent.name}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(agent.status)}>
                {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(agent.lastSeen)}</TableCell>
            <TableCell>{agent.version}</TableCell>
            <TableCell>{agent.operatingSystem || "Unknown"}</TableCell>
            <TableCell>{agent.ipAddress || "Unknown"}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditClick(agent)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onRemoveClick(agent.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
        {agents.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-6">
              No agents found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
