import React, { useState } from "react";
import { Card } from "../../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { ScrollArea } from "../../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Badge } from "../../ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface OSQueryTabProps {
  osqueryData: {
    processes?: any[];
    network?: any[];
    system?: any;
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function OSQueryTab({ osqueryData }: OSQueryTabProps) {
  const [processSearch, setProcessSearch] = useState("");
  const [networkSearch, setNetworkSearch] = useState("");
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [selectedConnection, setSelectedConnection] = useState<any>(null);

  // Process data for charts
  const processStats = osqueryData.processes?.reduce((acc: any, curr: any) => {
    const state = curr.data.state || "UNKNOWN";
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {});

  const processChartData = Object.entries(processStats || {}).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const networkStats = osqueryData.network?.reduce((acc: any, curr: any) => {
    const protocol = curr.data.protocol || "UNKNOWN";
    acc[protocol] = (acc[protocol] || 0) + 1;
    return acc;
  }, {});

  const networkChartData = Object.entries(networkStats || {}).map(
    ([name, value]) => ({
      name: name === "6" ? "TCP" : name === "17" ? "UDP" : name,
      value,
    })
  );

  const filteredProcesses = osqueryData.processes?.filter((process) => {
    const searchLower = processSearch.toLowerCase();
    return (
      process.data.name?.toLowerCase().includes(searchLower) ||
      process.data.path?.toLowerCase().includes(searchLower) ||
      process.data.command?.toLowerCase().includes(searchLower)
    );
  });

  const filteredNetwork = osqueryData.network?.filter((conn) => {
    const searchLower = networkSearch.toLowerCase();
    return (
      conn.data.process_name?.toLowerCase().includes(searchLower) ||
      conn.data.local_address?.includes(searchLower) ||
      conn.data.local_port?.toString().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <Tabs defaultValue="processes" className="w-full">
        <TabsList>
          <TabsTrigger value="processes">
            Processes ({osqueryData.processes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="network">
            Network ({osqueryData.network?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="processes" className="space-y-4">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <Input
                placeholder="Search processes..."
                value={processSearch}
                onChange={(e) => setProcessSearch(e.target.value)}
                className="max-w-sm"
              />
              <Badge variant="outline">
                Total: {osqueryData.processes?.length || 0}
              </Badge>
            </div>

            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Parent PID</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcesses?.map((process) => (
                    <TableRow key={process._id}>
                      <TableCell>{process.data.pid}</TableCell>
                      <TableCell>{process.data.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            process.data.state === "STILL_ACTIVE"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {process.data.state}
                        </Badge>
                      </TableCell>
                      <TableCell>{process.data.parent_pid}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProcess(process)}
                            >
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Process Details: {process.data.name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <p>
                                  <strong>PID:</strong> {process.data.pid}
                                </p>
                                <p>
                                  <strong>Name:</strong> {process.data.name}
                                </p>
                                <p>
                                  <strong>State:</strong> {process.data.state}
                                </p>
                                <p>
                                  <strong>Parent PID:</strong>{" "}
                                  {process.data.parent_pid}
                                </p>
                                <p>
                                  <strong>Path:</strong> {process.data.path}
                                </p>
                                <p>
                                  <strong>Command:</strong>{" "}
                                  {process.data.command}
                                </p>
                                <p>
                                  <strong>User ID:</strong>{" "}
                                  {process.data.user_id}
                                </p>
                                <p>
                                  <strong>Timestamp:</strong>{" "}
                                  {new Date(process.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <Input
                placeholder="Search network connections..."
                value={networkSearch}
                onChange={(e) => setNetworkSearch(e.target.value)}
                className="max-w-sm"
              />
              <Badge variant="outline">
                Total: {osqueryData.network?.length || 0}
              </Badge>
            </div>

            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Process</TableHead>
                    <TableHead>Local Address</TableHead>
                    <TableHead>Local Port</TableHead>
                    <TableHead>Protocol</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNetwork?.map((conn) => (
                    <TableRow key={conn._id}>
                      <TableCell>{conn.data.process_name}</TableCell>
                      <TableCell>{conn.data.local_address}</TableCell>
                      <TableCell>{conn.data.local_port}</TableCell>
                      <TableCell>
                        <Badge>
                          {conn.data.protocol === "6"
                            ? "TCP"
                            : conn.data.protocol === "17"
                            ? "UDP"
                            : conn.data.protocol}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedConnection(conn)}
                            >
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Connection Details: {conn.data.process_name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <p>
                                  <strong>Process:</strong>{" "}
                                  {conn.data.process_name}
                                </p>
                                <p>
                                  <strong>Process Path:</strong>{" "}
                                  {conn.data.process_path}
                                </p>
                                <p>
                                  <strong>Local Address:</strong>{" "}
                                  {conn.data.local_address}
                                </p>
                                <p>
                                  <strong>Local Port:</strong>{" "}
                                  {conn.data.local_port}
                                </p>
                                <p>
                                  <strong>Protocol:</strong>{" "}
                                  {conn.data.protocol === "6"
                                    ? "TCP"
                                    : conn.data.protocol === "17"
                                    ? "UDP"
                                    : conn.data.protocol}
                                </p>
                                <p>
                                  <strong>Timestamp:</strong>{" "}
                                  {new Date(conn.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                Process States Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={processChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {processChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                Network Protocols Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={networkChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
