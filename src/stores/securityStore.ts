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
  };
  
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
  
  // Pagination
  page: number;
  totalPages: number;
  
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
  setPage: (page: number) => void;
}

export const useSecurityStore = create<SecurityState>((set, get) => ({
  // Initial state
  ws: null,
  connected: false,
  vulnerabilities: [],
  vulnerabilityStats: null,
  vulnerabilityLoading: false,
  vulnerabilityError: null,
  vulnerabilityFilters: {},
  compliance: [],
  complianceStats: null,
  complianceLoading: false,
  complianceError: null,
  complianceFilters: {},
  page: 1,
  totalPages: 1,
  
  // WebSocket actions
  connectWebSocket: () => {
    const ws = new WebSocket('ws://localhost:3000/ws');
    
    ws.onopen = () => {
      console.log('Security WebSocket connected');
      set({ ws, connected: true });
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'vulnerability_update') {
        // Update vulnerabilities when new scan results arrive
        const { fetchVulnerabilities, fetchVulnerabilityStats } = get();
        fetchVulnerabilities();
        fetchVulnerabilityStats();
      } else if (data.type === 'compliance_update') {
        // Update compliance when new check results arrive
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
  
  // Actions
  fetchVulnerabilities: async () => {
    const { vulnerabilityFilters, page } = get();
    set({ vulnerabilityLoading: true, vulnerabilityError: null });
    
    try {
      const params = new URLSearchParams();
      if (vulnerabilityFilters.severity?.length) params.append('severity', vulnerabilityFilters.severity.join(','));
      if (vulnerabilityFilters.status?.length) params.append('status', vulnerabilityFilters.status.join(','));
      params.append('page', page.toString());
      
      const response = await axios.get(`/api/security/vulnerabilities?${params}`);
      
      set({ 
        vulnerabilities: response.data.vulnerabilities,
        totalPages: response.data.totalPages,
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
  
  fetchVulnerabilityStats: async () => {
    try {
      const response = await axios.get('/api/security/vulnerabilities/stats');
      set({ vulnerabilityStats: response.data });
    } catch (error) {
      console.error('Error fetching vulnerability stats:', error);
      set({ vulnerabilityError: 'Error fetching vulnerability statistics' });
    }
  },
  
  fetchCompliance: async () => {
    const { complianceFilters, page } = get();
    set({ complianceLoading: true, complianceError: null });
    
    try {
      const params = new URLSearchParams();
      
      // Handle array filters
      if (complianceFilters.framework?.length) {
        params.append('framework', complianceFilters.framework.join(','));
      }
      if (complianceFilters.status?.length) {
        params.append('status', complianceFilters.status.join(','));
      }
      if (complianceFilters.riskLevel?.length) {
        params.append('risk_level', complianceFilters.riskLevel.join(','));
      }
      
      // Handle search
      if (complianceFilters.search) {
        params.append('control_name', complianceFilters.search);
      }
      
      params.append('page', page.toString());
      
      console.log('Fetching compliance with params:', params.toString()); // Debug log
      const response = await axios.get(`/api/security/compliance?${params}`);
      
      set({ 
        compliance: response.data.compliance,
        totalPages: response.data.totalPages,
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
  
  fetchComplianceStats: async () => {
    try {
      const response = await axios.get('/api/security/compliance/stats');
      set({ complianceStats: response.data });
    } catch (error) {
      console.error('Error fetching compliance stats:', error);
      set({ complianceError: 'Error fetching compliance statistics' });
    }
  },
  
  updateVulnerabilityStatus: async (id: string, status: string) => {
    try {
      await axios.put(`/api/security/vulnerabilities/${id}/status`, { status });
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
      await axios.put(`/api/security/compliance/${id}/status`, { status });
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
    
    // Process each filter type, removing if 'all' is selected
    const processedFilters = {
      ...currentFilters
    };

    if (newFilters.severity) {
      processedFilters.severity = newFilters.severity[0] === 'all' ? undefined : newFilters.severity;
    }
    
    if (newFilters.status) {
      processedFilters.status = newFilters.status[0] === 'all' ? undefined : newFilters.status;
    }

    set({ 
      vulnerabilityFilters: processedFilters,
      page: 1
    });

    const { fetchVulnerabilities, fetchVulnerabilityStats } = get();
    fetchVulnerabilities();
    fetchVulnerabilityStats();
  },
  
  setComplianceFilters: (newFilters) => {
    const currentFilters = get().complianceFilters;
    
    // Process each filter type, removing if 'all' is selected
    const processedFilters = {
      ...currentFilters
    };

    if (newFilters.status) {
      processedFilters.status = newFilters.status[0] === 'all' ? undefined : newFilters.status;
    }
    
    if (newFilters.framework) {
      processedFilters.framework = newFilters.framework[0] === 'all' ? undefined : newFilters.framework;
    }
    
    if (newFilters.riskLevel) {
      processedFilters.riskLevel = newFilters.riskLevel[0] === 'all' ? undefined : newFilters.riskLevel;
    }

    if (newFilters.search !== undefined) {
      processedFilters.search = newFilters.search || undefined;
    }

    set({ 
      complianceFilters: processedFilters,
      page: 1
    });

    const { fetchCompliance, fetchComplianceStats } = get();
    fetchCompliance();
    fetchComplianceStats();
  },
  
  setPage: (page) => set({ page })
})); 