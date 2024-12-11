import { useState, useEffect } from 'react';
import axios from 'axios';

export interface DeployedAgent {
  id: string;
  name: string;
  status: "running" | "stopped";
  deployedAt: string;
  lastActive: string;
  systemInfo?: {
    hostname: string;
    os: string;
    cpu_usage: number;
    memory_total: number;
    memory_used: number;
    memory_percent: number;
    disk_total: number;
    disk_used: number;
    disk_percent: number;
  };
}

export function useDeployedAgents() {
  const [agents, setAgents] = useState<DeployedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('No user ID found');
        return;
      }

      const response = await axios.get(`/api/agents/deployed?userId=${userId}`);
      setAgents(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch agents');
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const stopAgent = async (agentId: string) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('No user ID found');
        return;
      }

      await axios.post(`/api/agents/${agentId}/status?userId=${userId}`, {
        status: 'stopped'
      });
      
      // Refetch agents to get updated status
      fetchAgents();
    } catch (err) {
      setError('Failed to stop agent');
      console.error('Error stopping agent:', err);
    }
  };

  useEffect(() => {
    fetchAgents();
    // Set up polling interval
    const interval = setInterval(fetchAgents, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    agents,
    loading,
    error,
    stopAgent,
    refetch: fetchAgents
  };
} 