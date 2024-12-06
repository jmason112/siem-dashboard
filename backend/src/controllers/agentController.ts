import { Request, Response } from 'express';
import { logger } from '../config/logger';

interface DeployedAgent {
    id: string;
    name: string;
    status: 'running' | 'stopped';
    deployedAt: Date;
    lastActive: Date;
    systemInfo?: any;
}

// In-memory storage for deployed agents
let deployedAgents: DeployedAgent[] = [];

export const agentController = {
    deployAgent: (req: Request, res: Response) => {
        logger.info('Deploying agent with data:', req.body);
        const { name } = req.body;
        const newAgent: DeployedAgent = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            status: 'running',
            deployedAt: new Date(),
            lastActive: new Date()
        };
        deployedAgents.push(newAgent);
        logger.info('Agent deployed:', newAgent);
        res.json(newAgent);
    },

    getDeployedAgents: (_req: Request, res: Response) => {
        res.json(deployedAgents);
    },

    stopAgent: (req: Request, res: Response) => {
        const { id } = req.params;
        const agent = deployedAgents.find(a => a.id === id);
        if (agent) {
            agent.status = 'stopped';
            agent.lastActive = new Date();
            logger.info(`Agent ${id} marked as stopped`);
            res.json({ status: 'stopped' });
        } else {
            res.status(404).json({ error: 'Agent not found' });
        }
    },

    heartbeat: (req: Request, res: Response) => {
        const { id } = req.params;
        const { status, systemInfo } = req.body;
        const agent = deployedAgents.find(a => a.id === id);
        
        if (agent) {
            agent.status = status;
            agent.lastActive = new Date();
            agent.systemInfo = systemInfo;
            res.json(agent);
        } else {
            res.status(404).json({ error: 'Agent not found' });
        }
    },

    getAgentStatus: (req: Request, res: Response) => {
        const { id } = req.params;
        const agent = deployedAgents.find(a => a.id === id);
        
        if (agent) {
            logger.info(`Sending status for agent ${id}: ${agent.status}`);
            res.json({ status: agent.status });
        } else {
            res.status(404).json({ error: 'Agent not found' });
        }
    },

    getAgentAlerts: (req: Request, res: Response) => {
        res.json(null); // Placeholder, returns null for now
    },

    getAgentVulnerabilities: (req: Request, res: Response) => {
        res.json(null); // Placeholder, returns null for now
    },

    getAgentCompliance: (req: Request, res: Response) => {
        res.json(null); // Placeholder, returns null for now
    }
}; 