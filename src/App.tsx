import React, { useState, useEffect } from "react";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { SecurityPage } from "./pages/SecurityPage";
import AlertsPage from "./pages/AlertsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { MetricCard } from "./components/dashboard/MetricCard";
import { AlertsList } from "./components/dashboard/AlertsList";
import { TimeSeriesChart } from "./components/dashboard/TimeSeriesChart";
import axios from "axios";
import type { Alert } from "./types";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "security" | "alerts" | "settings"
  >("dashboard");

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
    activeThreats: 0,
    systemHealth: 100,
    failedLogins: 0,
    networkLoad: 0,
  });

  // Fetch alerts and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recent alerts
        const alertsResponse = await axios.get(
          "http://localhost:3000/api/alerts?limit=5"
        );
        setAlerts(alertsResponse.data.alerts);

        // Fetch alert stats
        const statsResponse = await axios.get(
          "http://localhost:3000/api/alerts/stats"
        );
        const { bySeverity } = statsResponse.data;

        // Update metrics
        setMetrics({
          activeThreats: (bySeverity.critical || 0) + (bySeverity.warning || 0),
          systemHealth: 100 - (bySeverity.critical || 0) * 10,
          failedLogins: Math.floor(Math.random() * 100), // This should come from auth service
          networkLoad: Math.floor(Math.random() * 100), // This should come from network monitoring
        });

        // Generate time series data from the last 7 days
        const timeSeriesResponse = await axios.get(
          "http://localhost:3000/api/alerts?startDate=" +
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
      title: "Active Threats",
      value: metrics.activeThreats,
      change: 0,
      trend: "neutral" as const,
    },
    {
      id: "2",
      title: "System Health",
      value: metrics.systemHealth,
      change: 0,
      trend: "neutral" as const,
    },
    {
      id: "3",
      title: "Failed Login Attempts",
      value: metrics.failedLogins,
      change: 0,
      trend: "neutral" as const,
    },
    {
      id: "4",
      title: "Network Load",
      value: metrics.networkLoad,
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

  const renderContent = () => {
    switch (currentPage) {
      case "security":
        return <SecurityPage />;
      case "alerts":
        return <AlertsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {metricCards.map((metric) => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TimeSeriesChart
                  data={timeSeriesData}
                  title="Security Events Over Time"
                />
              </div>
              <div>
                <AlertsList
                  alerts={alerts}
                  onAcknowledge={handleAlertAcknowledge}
                />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />

      <main
        className={`pt-16 transition-all duration-200 ${
          sidebarOpen ? "lg:pl-64" : ""
        }`}
      >
        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  );
}

export default App;
