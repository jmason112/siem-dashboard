import React, { useState } from "react";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { SecurityPage } from "./pages/SecurityPage";
import AlertsPage from "./pages/AlertsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { MetricCard } from "./components/dashboard/MetricCard";
import { AlertsList } from "./components/dashboard/AlertsList";
import { TimeSeriesChart } from "./components/dashboard/TimeSeriesChart";
import { generateMockTimeSeriesData } from "./lib/utils";
import type { Alert, MetricCard as MetricCardType } from "./types";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "security" | "alerts" | "settings"
  >("dashboard");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState(
    generateMockTimeSeriesData(30)
  );

  const metrics: MetricCardType[] = [
    {
      id: "1",
      title: "Active Threats",
      value: 12,
      change: 25,
      trend: "up",
    },
    {
      id: "2",
      title: "System Health",
      value: 98,
      change: 2,
      trend: "up",
    },
    {
      id: "3",
      title: "Failed Login Attempts",
      value: 45,
      change: -15,
      trend: "down",
    },
    {
      id: "4",
      title: "Network Load",
      value: 76,
      change: 0,
      trend: "neutral",
    },
  ];

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
              {metrics.map((metric) => (
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
                  onAcknowledge={(id) =>
                    setAlerts((prev) =>
                      prev.map((alert) =>
                        alert.id === id
                          ? { ...alert, acknowledged: true }
                          : alert
                      )
                    )
                  }
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
