import { create } from 'zustand';
import axios from 'axios';
import type { 
  Vulnerability, 
  Compliance, 
  VulnerabilityStats, 
  ComplianceStats 
} from '../types';

interface SecurityState {
  // WebSocket
  ws: WebSocket | null;
  connected: boolean;
  
  // Vulnerabilities
  vulnerabilities: Vulnerability[];
  vulnerabilityStats: VulnerabilityStats | null;
  vulnerabilityLoading: boolean;
  vulnerabilityError: string | null;
  vulnerabilityFilters: {
    severity?: string[];
    status?: string[];
    search?: string;
  };
  vulnerabilityPage: number;
  vulnerabilityTotalPages: number;
  
  // Compliance
  compliance: Compliance[];
  complianceStats: ComplianceStats | null;
  complianceLoading: boolean;
  complianceError: string | null;
  complianceFilters: {
    status?: string[];
    framework?: string[];
    riskLevel?: string[];
    search?: string;
  };
  compliancePage: number;
  complianceTotalPages: number;
  
  // Actions
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  fetchVulnerabilities: () => Promise<void>;
  fetchVulnerabilityStats: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchComplianceStats: () => Promise<void>;
  updateVulnerabilityStatus: (id: string, status: string) => Promise<void>;
  updateComplianceStatus: (id: string, status: string) => Promise<void>;
  setVulnerabilityFilters: (filters: Partial<SecurityState['vulnerabilityFilters']>) => void;
  setComplianceFilters: (filters: Partial<SecurityState['complianceFilters']>) => void;
  setVulnerabilityPage: (page: number) => void;
  setCompliancePage: (page: number) => void;
}

// Get user ID from local storage
const getUserId = () => localStorage.getItem('userId');

export const useSecurityStore = create<SecurityState>((set, get) => ({
  // Initial state
  ws: null,
  connected: false,
  vulnerabilities: [],
  vulnerabilityStats: null,
  vulnerabilityLoading: false,
  vulnerabilityError: null,
  vulnerabilityFilters: {},
  vulnerabilityPage: 1,
  vulnerabilityTotalPages: 1,
  compliance: [],
  complianceStats: null,
  complianceLoading: false,
  complianceError: null,
  complianceFilters: {},
  compliancePage: 1,
  complianceTotalPages: 1,
  
  // WebSocket actions
  connectWebSocket: () => {
    const ws = new WebSocket(`ws://localhost:3000/ws`);
    
    ws.onopen = () => {
      console.log('Security WebSocket connected');
      set({ ws, connected: true });
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'vulnerability_update') {
        const { fetchVulnerabilities, fetchVulnerabilityStats } = get();
        fetchVulnerabilities();
        fetchVulnerabilityStats();
      } else if (data.type === 'compliance_update') {
        const { fetchCompliance, fetchComplianceStats } = get();
        fetchCompliance();
        fetchComplianceStats();
      }
    };
    
    ws.onclose = () => {
      console.log('Security WebSocket disconnected');
      set({ ws: null, connected: false });
      // Attempt to reconnect after 5 seconds
      setTimeout(() => get().connectWebSocket(), 5000);
    };
    
    ws.onerror = (error) => {
      console.error('Security WebSocket error:', error);
    };
  },
  
  disconnectWebSocket: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null, connected: false });
    }
  },
  
  // Vulnerability actions
  fetchVulnerabilities: async () => {
    const { vulnerabilityFilters, vulnerabilityPage } = get();
    set({ vulnerabilityLoading: true, vulnerabilityError: null });
    
    try {
      const params = new URLSearchParams();
      const userId = getUserId();
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      params.append('userId', userId);
      if (vulnerabilityFilters.severity?.length) params.append('severity', vulnerabilityFilters.severity.join(','));
      if (vulnerabilityFilters.status?.length) params.append('status', vulnerabilityFilters.status.join(','));
      if (vulnerabilityFilters.search) params.append('search', vulnerabilityFilters.search);
      params.append('page', vulnerabilityPage.toString());
      
      const response = await axios.get(`/api/security/vulnerabilities?${params}`);
      
      set({ 
        vulnerabilities: response.data.vulnerabilities,
        vulnerabilityTotalPages: response.data.totalPages,
        vulnerabilityLoading: false 
      });
    } catch (error) {
      console.error('Error fetching vulnerabilities:', error);
      set({ 
        vulnerabilityError: 'Error fetching vulnerabilities',
        vulnerabilityLoading: false 
      });
    }
  },
  
  // Compliance actions
  fetchCompliance: async () => {
    const { complianceFilters, compliancePage } = get();
    set({ complianceLoading: true, complianceError: null });
    
    try {
      const params = new URLSearchParams();
      const userId = getUserId();
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      params.append('userId', userId);
      if (complianceFilters.framework?.length) {
        params.append('framework', complianceFilters.framework.join(','));
      }
      if (complianceFilters.status?.length) {
        params.append('status', complianceFilters.status.join(','));
      }
      if (complianceFilters.riskLevel?.length) {
        params.append('risk_level', complianceFilters.riskLevel.join(','));
      }
      if (complianceFilters.search) {
        params.append('search', complianceFilters.search);
      }
      
      params.append('page', compliancePage.toString());
      
      const response = await axios.get(`/api/security/compliance?${params}`);
      
      set({ 
        compliance: response.data.compliance,
        complianceTotalPages: response.data.totalPages,
        complianceLoading: false 
      });
    } catch (error) {
      console.error('Error fetching compliance:', error);
      set({ 
        complianceError: 'Error fetching compliance data',
        complianceLoading: false 
      });
    }
  },
  
  // Other actions
  fetchVulnerabilityStats: async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const response = await axios.get(`/api/security/vulnerabilities/stats?userId=${userId}`);
      set({ vulnerabilityStats: response.data });
    } catch (error) {
      console.error('Error fetching vulnerability stats:', error);
      set({ vulnerabilityError: 'Error fetching vulnerability statistics' });
    }
  },
  
  fetchComplianceStats: async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const response = await axios.get(`/api/security/compliance/stats?userId=${userId}`);
      set({ complianceStats: response.data });
    } catch (error) {
      console.error('Error fetching compliance stats:', error);
      set({ complianceError: 'Error fetching compliance statistics' });
    }
  },
  
  updateVulnerabilityStatus: async (id: string, status: string) => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      await axios.put(`/api/security/vulnerabilities/${id}/status?userId=${userId}`, { status });
      const { fetchVulnerabilities, fetchVulnerabilityStats } = get();
      await Promise.all([
        fetchVulnerabilities(),
        fetchVulnerabilityStats()
      ]);
    } catch (error) {
      console.error('Error updating vulnerability status:', error);
      set({ vulnerabilityError: 'Error updating vulnerability status' });
    }
  },
  
  updateComplianceStatus: async (id: string, status: string) => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      await axios.put(`/api/security/compliance/${id}/status?userId=${userId}`, { status });
      const { fetchCompliance, fetchComplianceStats } = get();
      await Promise.all([
        fetchCompliance(),
        fetchComplianceStats()
      ]);
    } catch (error) {
      console.error('Error updating compliance status:', error);
      set({ complianceError: 'Error updating compliance status' });
    }
  },
  
  setVulnerabilityFilters: (newFilters) => {
    const currentFilters = get().vulnerabilityFilters;
    
    const processedFilters = {
      ...currentFilters,
      ...newFilters
    };

    if (newFilters.severity) {
      processedFilters.severity = newFilters.severity[0] === 'all' ? undefined : newFilters.severity;
    }
    
    if (newFilters.status) {
      processedFilters.status = newFilters.status[0] === 'all' ? undefined : newFilters.status;
    }

    if (newFilters.search !== undefined) {
      processedFilters.search = newFilters.search || undefined;
    }

    set({ 
      vulnerabilityFilters: processedFilters,
      vulnerabilityPage: 1
    });

    const { fetchVulnerabilities, fetchVulnerabilityStats } = get();
    fetchVulnerabilities();
    fetchVulnerabilityStats();
  },
  
  setComplianceFilters: (newFilters) => {
    set({ 
      complianceFilters: { ...get().complianceFilters, ...newFilters },
      compliancePage: 1
    });
    get().fetchCompliance();
  },
  
  setVulnerabilityPage: (page) => {
    set({ vulnerabilityPage: page });
    get().fetchVulnerabilities();
  },
  
  setCompliancePage: (page) => {
    set({ compliancePage: page });
    get().fetchCompliance();
  }
})); 