import React, { useState, useEffect } from "react";
import {
  Settings,
  User,
  Monitor,
  Shield,
  Search,
  Loader2,
  Sparkles,
} from "lucide-react";
import { PreferencesSection } from "../components/settings/PreferencesSection";
import { DisplaySection } from "../components/settings/DisplaySection";
import { SecuritySection } from "../components/settings/SecuritySection";
import { AISettingsSection } from "../components/settings/AISettingsSection";
import { useSettingsStore } from "../stores/settingsStore";
import { useAuth } from "../lib/auth";
import { Alert, AlertDescription } from "../components/ui/alert";

type SettingsTab = "preferences" | "display" | "security" | "ai";

export function SettingsPage() {
  const [currentTab, setCurrentTab] = useState<SettingsTab>("preferences");
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoading, error, fetchUserSettings } = useSettingsStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user, fetchUserSettings]);

  const tabs = [
    {
      id: "preferences" as const,
      label: "Preferences",
      icon: User,
    },
    {
      id: "display" as const,
      label: "Display",
      icon: Monitor,
    },
    {
      id: "security" as const,
      label: "Security",
      icon: Shield,
    },
    {
      id: "ai" as const,
      label: "AI Settings",
      icon: Sparkles,
    },
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      );
    }

    if (!user) {
      return (
        <Alert className="bg-yellow-100 dark:bg-yellow-900/30">
          <AlertDescription>
            Please sign in to access your settings.
          </AlertDescription>
        </Alert>
      );
    }

    switch (currentTab) {
      case "preferences":
        return <PreferencesSection />;
      case "display":
        return <DisplaySection />;
      case "security":
        return <SecuritySection />;
      case "ai":
        return <AISettingsSection />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Settings
        </h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 w-64"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1">
        <nav className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === tab.id
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
              disabled={isLoading}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {renderContent()}
    </div>
  );
}
