import React from 'react';
import { Shield, Smartphone, History } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { format } from 'date-fns';

export function SecuritySection() {
  const { profile, devices, loginHistory, updateProfile, removeDevice } =
    useSettingsStore();

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
                    ? 'Two-factor authentication is enabled'
                    : 'Add an extra layer of security to your account'}
                </p>
              </div>
              <button
                onClick={() =>
                  updateProfile({ twoFactorEnabled: !profile.twoFactorEnabled })
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  profile.twoFactorEnabled
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400'
                }`}
              >
                {profile.twoFactorEnabled ? 'Disable' : 'Enable'}
              </button>
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
                    Last active:{' '}
                    {format(device.lastActive, "MMM d, yyyy 'at' HH:mm")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {device.location}
                  </p>
                </div>
                <button
                  onClick={() => removeDevice(device.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Remove
                </button>
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
                    {format(login.timestamp, "MMM d, yyyy 'at' HH:mm")}
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
    </div>
  );
}