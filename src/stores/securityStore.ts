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
  
  // Compliance
  compliance: Compliance[];
  complianceStats: ComplianceStats | null;
  complianceLoading: boolean;
  complianceError: string | null;
  
  // Filters
  filters: {
    severity?: string[];
    status?: string[];
    framework?: string[];
    riskLevel?: string[];
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
  setFilters: (filters: Partial<SecurityState['filters']>) => void;
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
  compliance: [],
  complianceStats: null,
  complianceLoading: false,
  complianceError: null,
  filters: {},
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
    const { filters, page } = get();
    set({ vulnerabilityLoading: true, vulnerabilityError: null });
    
    try {
      const params = new URLSearchParams();
      if (filters.severity?.length) params.append('severity', filters.severity.join(','));
      if (filters.status?.length) params.append('status', filters.status.join(','));
      params.append('page', page.toString());
      
      console.log('Fetching vulnerabilities with params:', params.toString());
      const response = await axios.get(`/api/security/vulnerabilities?${params}`);
      console.log('Received vulnerabilities:', response.data);
      
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
    const { filters, page } = get();
    set({ complianceLoading: true, complianceError: null });
    
    try {
      const params = new URLSearchParams();
      if (filters.framework?.length) params.append('framework', filters.framework.join(','));
      if (filters.riskLevel?.length) params.append('risk_level', filters.riskLevel.join(','));
      params.append('page', page.toString());
      
      console.log('Fetching compliance with params:', params.toString());
      const response = await axios.get(`/api/security/compliance?${params}`);
      console.log('Received compliance data:', response.data);
      
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
  
  setFilters: (newFilters) => {
    const currentFilters = get().filters;
    
    // Create new filters object, properly handling 'all' values
    const processedFilters = {
      ...currentFilters // Start with current filters as base
    };

    // Process each filter type
    if (newFilters.severity) {
      if (newFilters.severity[0] === 'all') {
        delete processedFilters.severity;
      } else {
        processedFilters.severity = newFilters.severity;
      }
    }
    
    if (newFilters.status) {
      if (newFilters.status[0] === 'all') {
        delete processedFilters.status;
      } else {
        processedFilters.status = newFilters.status;
      }
    }
    
    if (newFilters.framework) {
      if (newFilters.framework[0] === 'all') {
        delete processedFilters.framework;
      } else {
        processedFilters.framework = newFilters.framework;
      }
    }
    
    if (newFilters.riskLevel) {
      if (newFilters.riskLevel[0] === 'all') {
        delete processedFilters.riskLevel;
      } else {
        processedFilters.riskLevel = newFilters.riskLevel;
      }
    }

    set({ 
      filters: processedFilters,
      page: 1 // Reset to first page when filters change
    });

    // Refresh data with new filters
    const { fetchVulnerabilities, fetchVulnerabilityStats } = get();
    fetchVulnerabilities();
    fetchVulnerabilityStats();
  },
  
  setPage: (page) => set({ page })
})); 