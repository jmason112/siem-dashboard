import React, { useState } from "react";
import { Shield, Smartphone, History } from "lucide-react";
import { useSettingsStore } from "../../stores/settingsStore";
import { format } from "date-fns";
import { toast } from "../ui/use-toast";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import type { UserProfile } from "../../types/settings";

export function SecuritySection() {
  const {
    profile,
    devices,
    loginHistory,
    updateProfile,
    removeDevice,
    isLoading,
  } = useSettingsStore();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const handleProfileUpdate = async (
    update: Partial<Omit<UserProfile, "id">>
  ) => {
    if (!profile) return;

    try {
      await updateProfile(update);
      toast({
        title: "Security settings updated",
        description: "Your security settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeviceRemoval = async (deviceId: string) => {
    try {
      await removeDevice(deviceId);
      setSelectedDevice(null);
      toast({
        title: "Device removed",
        description: "The device has been removed from your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove device. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!profile) {
    return (
      <Alert className="bg-yellow-100 dark:bg-yellow-900/30">
        <AlertDescription>
          Unable to load security settings. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profile.twoFactorEnabled
                    ? "Two-factor authentication is enabled"
                    : "Add an extra layer of security to your account"}
                </p>
              </div>
              <Button
                onClick={() =>
                  handleProfileUpdate({
                    twoFactorEnabled: !profile.twoFactorEnabled,
                  })
                }
                disabled={isLoading}
                variant={profile.twoFactorEnabled ? "destructive" : "default"}
                className="px-4 py-2 rounded-lg text-sm font-medium"
              >
                {profile.twoFactorEnabled ? "Disable" : "Enable"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Connected Devices
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {devices.map((device) => (
            <div key={device.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">{device.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last active:{" "}
                    {format(
                      new Date(device.lastActive),
                      "MMM d, yyyy 'at' HH:mm"
                    )}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {device.location}
                  </p>
                </div>
                <Button
                  onClick={() => setSelectedDevice(device.id)}
                  disabled={isLoading}
                  variant="destructive"
                  size="sm"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5" />
            Login History
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {loginHistory.map((login) => (
            <div key={login.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">
                    {login.success ? (
                      <span className="text-green-600 dark:text-green-400">
                        Successful login
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">
                        Failed login attempt
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {format(
                      new Date(login.timestamp),
                      "MMM d, yyyy 'at' HH:mm"
                    )}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {login.device} • {login.browser} • {login.location}
                  </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {login.ip}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog
        open={!!selectedDevice}
        onOpenChange={() => setSelectedDevice(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Device</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this device? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedDevice(null)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedDevice && handleDeviceRemoval(selectedDevice)
              }
              disabled={isLoading}
            >
              Remove Device
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
