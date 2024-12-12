import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownIcon,
  ArrowUpIcon,
  Cpu,
  HardDrive,
  Activity,
  Minimize2,
  Maximize2,
} from "lucide-react";
import axios from "axios";

interface AgentMetric {
  id: string;
  name: string;
  cpu: number;
  memory: number;
  diskUsage: number;
  eventsPerMinute: number;
  responseTime: number;
  lastUpdated: string;
}

const getHealthStatus = (metric: number) => {
  if (metric < 50) return "good";
  if (metric < 80) return "warning";
  return "critical";
};

const HealthIndicator = ({ value }: { value: number }) => {
  const status = getHealthStatus(value);
  return (
    <Badge
      variant={
        status === "good"
          ? "outline"
          : status === "warning"
          ? "secondary"
          : "destructive"
      }
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export function AgentHealthMetrics() {
  const [metrics, setMetrics] = useState<AgentMetric[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<
    "cpu" | "memory" | "diskUsage"
  >("cpu");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isMinimized, setIsMinimized] = useState(false);

  const fetchAgentMetrics = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await axios.get(`/api/agents/deployed?userId=${userId}`);
      const agents = response.data;

      const agentMetrics: AgentMetric[] = agents.map((agent: any) => ({
        id: agent._id,
        name: agent.name,
        cpu: agent.systemInfo?.cpu_usage || 0,
        memory: agent.systemInfo?.memory_percent || 0,
        diskUsage: agent.systemInfo?.disk_percent || 0,
        eventsPerMinute: 0, // Could be calculated from alerts frequency
        responseTime: 0, // Could be added as a new metric
        lastUpdated: new Date(agent.lastActive).toLocaleString(),
      }));

      setMetrics(agentMetrics);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching agent metrics:", error);
    }
  };

  useEffect(() => {
    fetchAgentMetrics();
    const interval = setInterval(fetchAgentMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const chartData = metrics.map((agent) => ({
    name: agent.name,
    value: agent[selectedMetric],
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">
              Agent Health Metrics
            </CardTitle>
            <CardDescription>
              Performance and health overview of active agents
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-muted"
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            ) : (
              <Minimize2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            )}
          </Button>
        </div>
      </CardHeader>
      {!isMinimized && (
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Detailed Metrics</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map((agent) => (
                  <Card key={agent.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {agent.name}
                      </CardTitle>
                      <HealthIndicator
                        value={Math.max(
                          agent.cpu,
                          agent.memory,
                          agent.diskUsage
                        )}
                      />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {agent.eventsPerMinute} events/min
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last updated: {agent.lastUpdated}
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>CPU</span>
                          <span>{agent.cpu.toFixed(1)}%</span>
                        </div>
                        <Progress value={agent.cpu} className="h-1" />
                        <div className="flex items-center justify-between text-sm">
                          <span>Memory</span>
                          <span>{agent.memory.toFixed(1)}%</span>
                        </div>
                        <Progress value={agent.memory} className="h-1" />
                        <div className="flex items-center justify-between text-sm">
                          <span>Disk</span>
                          <span>{agent.diskUsage.toFixed(1)}%</span>
                        </div>
                        <Progress value={agent.diskUsage} className="h-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="details">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Select
                    value={selectedMetric}
                    onValueChange={(value) =>
                      setSelectedMetric(value as "cpu" | "memory" | "diskUsage")
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpu">CPU Usage</SelectItem>
                      <SelectItem value="memory">Memory Usage</SelectItem>
                      <SelectItem value="diskUsage">Disk Usage</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <ArrowDownIcon className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {metrics.map((agent) => (
                    <Card key={agent.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {agent.name}
                        </CardTitle>
                        <HealthIndicator
                          value={Math.max(
                            agent.cpu,
                            agent.memory,
                            agent.diskUsage
                          )}
                        />
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Cpu className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              CPU: {agent.cpu.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center">
                            <HardDrive className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              Memory: {agent.memory.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              Response Time: {agent.responseTime}ms
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
            <Button variant="outline" size="sm" onClick={fetchAgentMetrics}>
              <ArrowUpIcon className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
