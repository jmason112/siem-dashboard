import React from "react";
import { Settings, Globe, Bell } from "lucide-react";
import { useSettingsStore } from "../../stores/settingsStore";
import type {
  Language,
  Theme,
  NotificationChannel,
} from "../../types/settings";
import { Alert, AlertDescription } from "../ui/alert";
import { toast } from "../ui/use-toast";

export function PreferencesSection() {
  const { preferences, updatePreferences, isLoading } = useSettingsStore();

  const languages: { value: Language; label: string }[] = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "ja", label: "日本語" },
  ];

  const themes: { value: Theme; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  const notificationChannels: { value: NotificationChannel; label: string }[] =
    [
      { value: "email", label: "Email" },
      { value: "sms", label: "SMS" },
      { value: "push", label: "Push Notifications" },
      { value: "in_app", label: "In-App Notifications" },
    ];

  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney",
    "Pacific/Auckland",
  ];

  const handlePreferenceUpdate = async (
    update: Partial<typeof preferences>
  ) => {
    try {
      await updatePreferences(update);
      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          User Preferences
        </h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Language & Region
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Language
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) =>
                    handlePreferenceUpdate({
                      language: e.target.value as Language,
                    })
                  }
                  disabled={isLoading}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 disabled:opacity-50"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Time Zone
                </label>
                <select
                  value={preferences.timezone}
                  onChange={(e) =>
                    handlePreferenceUpdate({ timezone: e.target.value })
                  }
                  disabled={isLoading}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 disabled:opacity-50"
                >
                  {timezones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                {notificationChannels.map((channel) => (
                  <label
                    key={channel.value}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={preferences.notifications.channels.includes(
                        channel.value
                      )}
                      onChange={(e) => {
                        const channels = e.target.checked
                          ? [
                              ...preferences.notifications.channels,
                              channel.value,
                            ]
                          : preferences.notifications.channels.filter(
                              (c) => c !== channel.value
                            );
                        handlePreferenceUpdate({
                          notifications: {
                            ...preferences.notifications,
                            channels,
                          },
                        });
                      }}
                      disabled={isLoading}
                      className="rounded border-gray-300 disabled:opacity-50"
                    />
                    <span className="text-sm">{channel.label}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                {Object.entries({
                  alerts: "Security Alerts",
                  updates: "System Updates",
                  marketing: "Marketing Communications",
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        preferences.notifications[
                          key as "alerts" | "updates" | "marketing"
                        ]
                      }
                      onChange={(e) =>
                        handlePreferenceUpdate({
                          notifications: {
                            ...preferences.notifications,
                            [key]: e.target.checked,
                          },
                        })
                      }
                      disabled={isLoading}
                      className="rounded border-gray-300 disabled:opacity-50"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
