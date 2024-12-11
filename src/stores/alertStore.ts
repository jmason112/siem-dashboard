import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

export interface Alert {
  _id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'info';
  status: 'new' | 'in_progress' | 'resolved' | 'dismissed';
  source: string;
  sourceIp?: string;
  timestamp: string;
  tags: string[];
  affectedAssets: string[];
  assignedTo?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
}

interface AlertFilters {
  severity?: string[];
  status?: string[];
  startDate?: string;
  endDate?: string;
  source?: string[];
}

interface AlertStats {
  total: number;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
}

interface AlertStore {
  alerts: Alert[];
  stats: AlertStats;
  loading: boolean;
  error: string | null;
  filters: AlertFilters;
  page: number;
  totalPages: number;
  websocket: WebSocket | null;
  
  // Actions
  fetchAlerts: (page?: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  updateAlert: (id: string, data: Partial<Alert>) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  setFilters: (filters: Partial<AlertFilters>) => void;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Get user ID from local storage
const getUserId = () => localStorage.getItem('userId');

// Add axios instance with default headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token') || 'test-token'}`
  }
});

export const useAlertStore = create<AlertStore>()(
  devtools(
    (set, get) => ({
      alerts: [],
      stats: { total: 0, bySeverity: {}, byStatus: {} },
      loading: false,
      error: null,
      filters: {},
      page: 1,
      totalPages: 1,
      websocket: null,

      fetchAlerts: async (page = 1) => {
        set({ loading: true, error: null });
        try {
          const { filters } = get();
          const params = new URLSearchParams();
          const userId = getUserId();
          
          if (!userId) {
            throw new Error('User ID not found');
          }
          
          params.append('userId', userId);
          params.append('page', page.toString());
          
          if (filters.severity) params.append('severity', filters.severity.join(','));
          if (filters.status) params.append('status', filters.status.join(','));
          if (filters.startDate) params.append('startDate', filters.startDate);
          if (filters.endDate) params.append('endDate', filters.endDate);
          if (filters.source) params.append('source', filters.source.join(','));

          const response = await api.get(`/api/alerts?${params}`);
          set({
            alerts: response.data.alerts,
            page: response.data.page,
            totalPages: response.data.totalPages,
            loading: false
          });
        } catch (error) {
          set({ 
            error: 'Failed to fetch alerts',
            loading: false
          });
        }
      },

      fetchStats: async () => {
        try {
          const userId = getUserId();
          if (!userId) {
            throw new Error('User ID not found');
          }
          
          const response = await api.get(`/api/alerts/stats?userId=${userId}`);
          set({ stats: response.data });
        } catch (error) {
          set({ error: 'Failed to fetch stats' });
        }
      },

      updateAlert: async (id: string, data: Partial<Alert>) => {
        try {
          const userId = getUserId();
          if (!userId) {
            throw new Error('User ID not found');
          }
          
          const response = await api.put(`/api/alerts/${id}?userId=${userId}`, data);
          const { alerts } = get();
          const updatedAlerts = alerts.map(alert => 
            alert._id === id ? response.data : alert
          );
          set({ alerts: updatedAlerts });
          await get().fetchStats();
        } catch (error) {
          set({ error: 'Failed to update alert' });
        }
      },

      deleteAlert: async (id: string) => {
        try {
          const userId = getUserId();
          if (!userId) {
            throw new Error('User ID not found');
          }
          
          await api.delete(`/api/alerts/${id}?userId=${userId}`);
          const { alerts } = get();
          set({ alerts: alerts.filter(alert => alert._id !== id) });
          await get().fetchStats();
        } catch (error) {
          set({ error: 'Failed to delete alert' });
        }
      },

      setFilters: (newFilters: Partial<AlertFilters>) => {
        set({ 
          filters: { ...get().filters, ...newFilters },
          page: 1
        });
        get().fetchAlerts(1);
      },

      connectWebSocket: () => {
        const ws = new WebSocket(`ws://localhost:3000/ws`);
        set({ websocket: ws });

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'alert') {
            get().fetchAlerts();
            get().fetchStats();
          }
        };

        ws.onclose = () => {
          set({ websocket: null });
          // Try to reconnect after 5 seconds
          setTimeout(() => get().connectWebSocket(), 5000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket connection error:', error);
        };
      },

      disconnectWebSocket: () => {
        const { websocket } = get();
        if (websocket) {
          websocket.close();
          set({ websocket: null });
        }
      }
    })
  )
);