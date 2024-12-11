import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import LandingPage from "./pages/LandingPage";
import axios from "axios";
import type { Alert } from "./types";

interface TimeSeriesDataPoint {
  timestamp: Date;
  critical: number;
  warning: number;
  info: number;
  total: number;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<string>("dashboard");

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>(
    []
  );
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
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);

        const timeSeriesResponse = await axios.get(
          `/api/alerts?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=1000`
        );

        // Create an array of all dates in the last 7 days
        const dates = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          return date;
        });

        // Initialize data for all dates
        const initialData = dates.reduce((acc: any, date) => {
          acc[date.toISOString().split("T")[0]] = {
            timestamp: date,
            critical: 0,
            warning: 0,
            info: 0,
            total: 0,
          };
          return acc;
        }, {});

        // Group alerts by day and severity
        const groupedData = timeSeriesResponse.data.alerts.reduce(
          (acc: any, alert: Alert) => {
            const date = new Date(alert.timestamp);
            const key = date.toISOString().split("T")[0];

            if (acc[key]) {
              acc[key][alert.severity]++;
              acc[key].total++;
            }
            return acc;
          },
          initialData
        );

        // Convert to array and sort by date
        const timeSeriesData = Object.values(groupedData)
          .map((item) => item as TimeSeriesDataPoint)
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        setTimeSeriesData(timeSeriesData);
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
            description="Alert distribution over the past 7 days"
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

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    // Temporarily disable authentication check for testing
    // if (!isAuthenticated) {
    //   return <Navigate to="/" replace />;
    // }
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={(page) => setCurrentPage(page)}
        />
        <main className="lg:pl-64 pt-16">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute>{renderDashboard()}</ProtectedRoute>}
        />
        <Route
          path="/security"
          element={
            <ProtectedRoute>
              <SecurityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <AlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agents"
          element={
            <ProtectedRoute>
              <AgentManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agents/:id"
          element={
            <ProtectedRoute>
              <AgentDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
