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
            res.json(agent);
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
        logger.info(`Getting status for agent ${id}`);
        
        const agent = deployedAgents.find(a => a.id === id);
        logger.info(`Found agent:`, agent);
        
        if (agent) {
            const response = { status: agent.status };
            logger.info(`Sending response:`, response);
            res.json(response);
        } else {
            logger.info(`Agent ${id} not found`);
            res.status(404).json({ error: 'Agent not found' });
        }
    }
}; 