import React from "react";
import { Card } from "../../ui/card";
import { Progress } from "../../ui/progress";
import { Cpu, CircuitBoard, HardDrive } from "lucide-react";

interface SystemInfo {
  os: string;
  hostname: string;
  ipAddress: string;
  uptime: string;
  cpu: {
    model: string;
    cores: number;
    usage: number;
  };
  memory: {
    total: string;
    used: string;
    usage: number;
  };
  disk: {
    total: string;
    used: string;
    usage: number;
  };
}

interface SystemInfoTabProps {
  system: SystemInfo;
}

export function SystemInfoTab({ system }: SystemInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Basic System Info */}
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Operating System</p>
            <p className="font-medium">{system.os}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Hostname</p>
            <p className="font-medium">{system.hostname}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">IP Address</p>
            <p className="font-medium">{system.ipAddress}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Uptime</p>
            <p className="font-medium">{system.uptime}</p>
          </div>
        </div>
      </Card>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CPU Usage */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">CPU Usage</p>
              <p className="font-medium">{system.cpu.cores} Cores</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Usage</span>
              <span className="text-sm font-medium">{system.cpu.usage}%</span>
            </div>
            <Progress value={system.cpu.usage} className="h-2" />
          </div>
        </Card>

        {/* Memory Usage */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <CircuitBoard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Memory Usage</p>
              <p className="font-medium">
                {system.memory.used} / {system.memory.total}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Usage</span>
              <span className="text-sm font-medium">
                {system.memory.usage}%
              </span>
            </div>
            <Progress value={system.memory.usage} className="h-2" />
          </div>
        </Card>

        {/* Disk Usage */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Disk Usage</p>
              <p className="font-medium">
                {system.disk.used} / {system.disk.total}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Usage</span>
              <span className="text-sm font-medium">{system.disk.usage}%</span>
            </div>
            <Progress value={system.disk.usage} className="h-2" />
          </div>
        </Card>
      </div>
    </div>
  );
}
