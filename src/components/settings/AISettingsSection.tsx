import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { useSettingsStore } from "../../stores/settingsStore";
import { toast } from "../ui/use-toast";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import axios from "axios";

export function AISettingsSection() {
  const { profile, updateProfile, isLoading } = useSettingsStore();
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState(profile?.aiProvider || "openai");

  const handleSaveSettings = async () => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      await axios.put(`/api/ai-insights/settings?userId=${userId}`, {
        provider,
        apiKey,
      });

      await updateProfile({ aiProvider: provider });

      toast({
        title: "Success",
        description: "AI settings updated successfully",
      });

      setApiKey(""); // Clear the API key from state for security
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update AI settings",
        variant: "destructive",
      });
    }
  };

  if (!profile) {
    return (
      <Alert>
        <AlertDescription>
          Unable to load AI settings. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Settings
        </h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">AI Provider</label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select AI provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Choose your preferred AI provider for generating insights
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
            />
            <p className="text-sm text-gray-500">
              Your API key is encrypted and stored securely
            </p>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSaveSettings}
              disabled={isLoading || !apiKey}
              className="w-full sm:w-auto"
            >
              Save AI Settings
            </Button>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-medium mb-2">About AI Insights</h3>
          <p className="text-sm text-gray-500">
            AI insights provide advanced analysis of your security data,
            including:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-500 list-disc list-inside">
            <li>Security posture analysis</li>
            <li>Agent performance optimization</li>
            <li>Threat pattern detection</li>
            <li>Automated security recommendations</li>
          </ul>
          <p className="mt-4 text-sm text-gray-500">
            Insights are cached for 24 hours to minimize API usage while keeping
            information current.
          </p>
        </div>
      </div>
    </div>
  );
}
