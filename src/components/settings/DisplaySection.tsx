import React from "react";
import { Monitor } from "lucide-react";
import { useSettingsStore } from "../../stores/settingsStore";
import type { FontSize, Contrast, Layout } from "../../types/settings";
import { toast } from "../ui/use-toast";

export function DisplaySection() {
  const { preferences, updatePreferences, isLoading } = useSettingsStore();

  const fontSizes: { value: FontSize; label: string }[] = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ];

  const contrasts: { value: Contrast; label: string }[] = [
    { value: "normal", label: "Normal" },
    { value: "high", label: "High Contrast" },
  ];

  const layouts: { value: Layout; label: string }[] = [
    { value: "compact", label: "Compact" },
    { value: "comfortable", label: "Comfortable" },
    { value: "spacious", label: "Spacious" },
  ];

  const handleDisplayUpdate = async (update: Partial<typeof preferences>) => {
    try {
      await updatePreferences(update);
      toast({
        title: "Display settings updated",
        description: "Your display settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update display settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Display Settings
        </h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Font Size</label>
            <select
              value={preferences.fontSize}
              onChange={(e) =>
                handleDisplayUpdate({ fontSize: e.target.value as FontSize })
              }
              disabled={isLoading}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 disabled:opacity-50"
            >
              {fontSizes.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contrast</label>
            <select
              value={preferences.contrast}
              onChange={(e) =>
                handleDisplayUpdate({ contrast: e.target.value as Contrast })
              }
              disabled={isLoading}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 disabled:opacity-50"
            >
              {contrasts.map((contrast) => (
                <option key={contrast.value} value={contrast.value}>
                  {contrast.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Layout Density
            </label>
            <select
              value={preferences.layout}
              onChange={(e) =>
                handleDisplayUpdate({ layout: e.target.value as Layout })
              }
              disabled={isLoading}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 disabled:opacity-50"
            >
              {layouts.map((layout) => (
                <option key={layout.value} value={layout.value}>
                  {layout.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Accessibility</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.reducedMotion}
                onChange={(e) =>
                  handleDisplayUpdate({ reducedMotion: e.target.checked })
                }
                disabled={isLoading}
                className="rounded border-gray-300 disabled:opacity-50"
              />
              <span className="text-sm">Reduce motion</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.screenReader}
                onChange={(e) =>
                  handleDisplayUpdate({ screenReader: e.target.checked })
                }
                disabled={isLoading}
                className="rounded border-gray-300 disabled:opacity-50"
              />
              <span className="text-sm">Optimize for screen readers</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
