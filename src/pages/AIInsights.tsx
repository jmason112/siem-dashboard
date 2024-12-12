import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { Switch } from "../components/ui/switch";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Loader2,
  Search,
  Zap,
  Shield,
  Activity,
  Cpu,
} from "lucide-react";
import { useChat } from "ai/react";

// Mock data for insights
const overallInsights = [
  { category: "High Risk", value: 15, color: "#FF4136" },
  { category: "Medium Risk", value: 45, color: "#FF851B" },
  { category: "Low Risk", value: 120, color: "#FFDC00" },
  { category: "Secure", value: 320, color: "#2ECC40" },
];

const agentPerformance = [
  { name: "Agent-001", performance: 95, events: 1200, cpu: 45, memory: 60 },
  { name: "Agent-002", performance: 88, events: 980, cpu: 55, memory: 70 },
  { name: "Agent-003", performance: 76, events: 1500, cpu: 80, memory: 85 },
  { name: "Agent-004", performance: 92, events: 800, cpu: 40, memory: 55 },
  { name: "Agent-005", performance: 85, events: 1100, cpu: 60, memory: 75 },
];

const timeSeriesData = [
  { time: "00:00", threats: 5, anomalies: 2 },
  { time: "04:00", threats: 3, anomalies: 1 },
  { time: "08:00", threats: 7, anomalies: 3 },
  { time: "12:00", threats: 12, anomalies: 5 },
  { time: "16:00", threats: 8, anomalies: 4 },
  { time: "20:00", threats: 6, anomalies: 2 },
];

const InsightCard = ({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: React.ReactNode;
  icon: any;
  trend?: number;
}) => (
  <Card>
    <CardContent className="flex items-center p-6">
      <div className="rounded-full p-3 bg-primary/10">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
      {trend && (
        <Badge
          variant={trend > 0 ? "destructive" : "secondary"}
          className="ml-auto"
        >
          {trend > 0 ? `+${trend}%` : `${trend}%`}
        </Badge>
      )}
    </CardContent>
  </Card>
);

const AnimatedNumber = ({ value }: { value: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    let timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start === end) clearInterval(timer);
    }, 20);

    return () => {
      clearInterval(timer);
    };
  }, [value]);

  return <span>{displayValue}</span>;
};

export default function AIInsightsPage() {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [showAnomalies, setShowAnomalies] = useState(true);
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <motion.h1
        className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        AI-Powered Security Insights
      </motion.h1>
      <p className="text-xl text-muted-foreground">
        Harness the power of AI to gain deep insights into your security
        landscape.
      </p>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-1/2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Insights</TabsTrigger>
          <TabsTrigger value="aiChat">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InsightCard
              title="Total Threats Detected"
              value={<AnimatedNumber value="187" />}
              icon={Shield}
              trend={-12}
            />
            <InsightCard
              title="Active Anomalies"
              value={<AnimatedNumber value="23" />}
              icon={AlertTriangle}
              trend={5}
            />
            <InsightCard
              title="System Health Score"
              value="92%"
              icon={Activity}
              trend={3}
            />
            <InsightCard title="AI Confidence Level" value="High" icon={Cpu} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Posture Overview</CardTitle>
                <CardDescription>
                  Distribution of security risks across your infrastructure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overallInsights}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {overallInsights.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  {overallInsights.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm">{item.category}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Threat and Anomaly Trends</CardTitle>
                <CardDescription>
                  24-hour overview of detected threats and anomalies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="threats"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                      {showAnomalies && (
                        <Line
                          type="monotone"
                          dataKey="anomalies"
                          stroke="#82ca9d"
                          strokeWidth={2}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[#8884d8] rounded-full"></div>
                    <span className="text-sm">Threats</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[#82ca9d] rounded-full"></div>
                    <span className="text-sm">Anomalies</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Show Anomalies</span>
                    <Switch
                      checked={showAnomalies}
                      onCheckedChange={setShowAnomalies}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Security Recommendations</CardTitle>
              <CardDescription>
                Actionable insights to improve your security posture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {[
                  {
                    icon: AlertTriangle,
                    color: "text-red-500",
                    text: "Critical: Update firmware on all edge devices to patch CVE-2023-1234",
                  },
                  {
                    icon: AlertTriangle,
                    color: "text-yellow-500",
                    text: "High: Implement network segmentation to isolate IoT devices",
                  },
                  {
                    icon: HelpCircle,
                    color: "text-blue-500",
                    text: "Medium: Conduct phishing awareness training for all employees",
                  },
                  {
                    icon: CheckCircle,
                    color: "text-green-500",
                    text: "Low: Review and update password policies to enforce complexity",
                  },
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-center p-3 bg-muted rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${item.color}`} />
                    <span>{item.text}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Matrix</CardTitle>
              <CardDescription>
                AI-analyzed performance metrics across all monitored agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={agentPerformance}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#82ca9d"
                    />
                    <Tooltip />
                    <Bar
                      yAxisId="left"
                      dataKey="performance"
                      fill="#8884d8"
                      name="Performance Score"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="events"
                      fill="#82ca9d"
                      name="Events Processed"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent-Specific Insights</CardTitle>
              <CardDescription>
                Select an agent to view detailed AI-generated insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agentPerformance.map((agent) => (
                    <SelectItem key={agent.name} value={agent.name}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <AnimatePresence>
                {selectedAgent && (
                  <motion.div
                    key={selectedAgent}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 space-y-4"
                  >
                    <h3 className="text-xl font-semibold">
                      Insights for {selectedAgent}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="font-medium">Performance Score</p>
                        <div className="flex items-center">
                          <Progress
                            value={
                              agentPerformance.find(
                                (a) => a.name === selectedAgent
                              )?.performance || 0
                            }
                            className="flex-1 mr-4"
                          />
                          <span className="font-bold">
                            {agentPerformance.find(
                              (a) => a.name === selectedAgent
                            )?.performance || 0}
                            %
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium">Events Processed</p>
                        <p className="text-2xl font-bold">
                          {agentPerformance.find(
                            (a) => a.name === selectedAgent
                          )?.events || 0}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium">CPU Usage</p>
                        <div className="flex items-center">
                          <Progress
                            value={
                              agentPerformance.find(
                                (a) => a.name === selectedAgent
                              )?.cpu || 0
                            }
                            className="flex-1 mr-4"
                          />
                          <span className="font-bold">
                            {agentPerformance.find(
                              (a) => a.name === selectedAgent
                            )?.cpu || 0}
                            %
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium">Memory Usage</p>
                        <div className="flex items-center">
                          <Progress
                            value={
                              agentPerformance.find(
                                (a) => a.name === selectedAgent
                              )?.memory || 0
                            }
                            className="flex-1 mr-4"
                          />
                          <span className="font-bold">
                            {agentPerformance.find(
                              (a) => a.name === selectedAgent
                            )?.memory || 0}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <h4 className="font-semibold">AI Recommendations</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          Optimize event processing algorithms to improve
                          performance
                        </li>
                        <li>
                          Investigate recent spike in CPU usage during off-peak
                          hours
                        </li>
                        <li>
                          Consider upgrading memory capacity to handle increased
                          workload
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aiChat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Security Assistant</CardTitle>
              <CardDescription>
                Ask questions about your security environment and receive
                AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-[400px] overflow-y-auto border rounded-lg p-4 bg-muted">
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`mb-4 ${
                        m.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      <span
                        className={`inline-block p-3 rounded-lg ${
                          m.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted-foreground/10 text-foreground"
                        }`}
                      >
                        {m.content}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center space-x-2"
                >
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask about your security posture..."
                    className="flex-1"
                  />
                  <Button type="submit">
                    <Zap className="mr-2 h-4 w-4" />
                    Ask AI
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
