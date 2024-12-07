import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { SecurityPage } from "./pages/SecurityPage";
import AlertsPage from "./pages/AlertsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AgentManagementPage } from "./pages/AgentManagementPage";
import { AgentDetails } from "./components/agents/AgentDetails";
import { MetricCard } from "./components/dashboard/MetricCard";
import { AlertsList } from "./components/dashboard/AlertsList";
import { TimeSeriesChart } from "./components/dashboard/TimeSeriesChart";
import { SecuritySummary } from "./components/security/SecuritySummary";
import axios from "axios";
import type { Alert } from "./types";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<string>("dashboard");

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<
    Array<{
      timestamp: Date;
      critical: number;
      warning: number;
      info: number;
    }>
  >([]);
  const [metrics, setMetrics] = useState({
    activeAgents: 0,
    systemHealth: 100,
    criticalAlerts: 0,
    agentsNeedingUpdate: 0,
  });

  // Fetch alerts and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch agents data
        const agentsResponse = await axios.get("/api/agents/deployed");
        const agents = agentsResponse.data;
        const activeAgents = agents.filter(
          (a: any) => a.status === "running"
        ).length;

        // Calculate average system health from all agents
        const systemHealth =
          agents.reduce((acc: number, agent: any) => {
            if (!agent.systemInfo) return acc;
            const cpuHealth = 100 - agent.systemInfo.cpu_usage;
            const memoryHealth = 100 - agent.systemInfo.memory_percent;
            const diskHealth = 100 - agent.systemInfo.disk_percent;
            return acc + (cpuHealth + memoryHealth + diskHealth) / 3;
          }, 0) / (agents.length || 1);

        // Fetch alert stats
        const alertsResponse = await axios.get("/api/alerts/stats");
        const criticalAlerts = alertsResponse.data.bySeverity.critical || 0;

        // Calculate agents needing updates
        const latestVersion = "1.0.0"; // You should get this from your config or API
        const agentsNeedingUpdate = agents.filter((agent: any) => {
          const agentVersion = agent.systemInfo?.version || "0.0.0";
          return agentVersion < latestVersion;
        }).length;

        // Update metrics
        setMetrics({
          activeAgents,
          systemHealth: Math.round(systemHealth),
          criticalAlerts,
          agentsNeedingUpdate,
        });

        // Fetch alerts for other components
        const alertsDataResponse = await axios.get("/api/alerts?limit=5");
        setAlerts(alertsDataResponse.data.alerts);

        // Generate time series data from the last 7 days
        const timeSeriesResponse = await axios.get(
          "/api/alerts?startDate=" +
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        );

        // Group alerts by day and severity
        const groupedData = timeSeriesResponse.data.alerts.reduce(
          (acc: any, alert: Alert) => {
            const date = new Date(alert.timestamp);
            date.setHours(0, 0, 0, 0);
            const key = date.toISOString();

            if (!acc[key]) {
              acc[key] = {
                timestamp: date,
                critical: 0,
                warning: 0,
                info: 0,
              };
            }

            acc[key][alert.severity]++;
            return acc;
          },
          {}
        );

        setTimeSeriesData(Object.values(groupedData));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const metricCards = [
    {
      id: "1",
      title: "Active Agents",
      value: metrics.activeAgents,
      change: 0,
      trend: "neutral" as const,
    },
    {
      id: "2",
      title: "System Health",
      value: metrics.systemHealth,
      change: 0,
      trend: "neutral" as const,
      unit: "%",
    },
    {
      id: "3",
      title: "Critical Alerts",
      value: metrics.criticalAlerts,
      change: 0,
      trend: "neutral" as const,
    },
    {
      id: "4",
      title: "Agents Needing Update",
      value: metrics.agentsNeedingUpdate,
      change: 0,
      trend: "neutral" as const,
    },
  ];

  const handleAlertAcknowledge = async (id: string) => {
    try {
      await axios.put(`http://localhost:3000/api/alerts/${id}`, {
        status: "in_progress",
      });
      setAlerts(
        alerts.map((alert) =>
          alert._id === id ? { ...alert, status: "in_progress" } : alert
        )
      );
    } catch (error) {
      console.error("Error acknowledging alert:", error);
    }
  };

  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metricCards.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <TimeSeriesChart
            data={timeSeriesData}
            title="Security Events Over Time"
          />
        </div>
        <div>
          <AlertsList alerts={alerts} onAcknowledge={handleAlertAcknowledge} />
        </div>
      </div>
      <div className="mb-6">
        <SecuritySummary />
      </div>
    </>
  );

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={(page) => setCurrentPage(page)}
        />
        <main className="lg:pl-64 pt-16">
          <div className="container mx-auto p-6">
            <Routes>
              <Route path="/" element={renderDashboard()} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/agents" element={<AgentManagementPage />} />
              <Route path="/agents/:id" element={<AgentDetails />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
