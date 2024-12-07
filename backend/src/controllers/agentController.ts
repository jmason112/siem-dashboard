import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { Agent } from '../models/Agent';
import { Alert } from '../models/Alert';

interface DeployedAgent {
    id: string;
    name: string;
    status: 'running' | 'stopped';
    deployedAt: Date;
    lastActive: Date;
    systemInfo?: any;
}

export const agentController = {
    deployAgent: async (req: Request, res: Response) => {
        try {
            logger.info('Deploying agent with data:', req.body);
            const { name } = req.body;
            
            // Check if agent already exists
            const existingAgent = await Agent.findOne({ name });
            
            if (existingAgent) {
                // If agent exists but is stopped, restart it
                if (existingAgent.status === 'stopped') {
                    const updatedAgent = await Agent.findOneAndUpdate(
                        { name },
                        { 
                            status: 'running',
                            lastActive: new Date()
                        },
                        { new: true }
                    );
                    logger.info('Agent restarted:', updatedAgent);
                    return res.json(updatedAgent);
                }
                // If agent exists and is running, return it
                return res.json(existingAgent);
            }

            // Create new agent if it doesn't exist
            const newAgent = new Agent({
                agentId: Math.random().toString(36).substr(2, 9),
                name,
                status: 'running',
                deployedAt: new Date(),
                lastActive: new Date()
            });

            await newAgent.save();
            logger.info('Agent deployed:', newAgent);
            res.json(newAgent);
        } catch (error) {
            logger.error('Error deploying agent:', error);
            res.status(500).json({ error: 'Failed to deploy agent' });
        }
    },

    getDeployedAgents: async (_req: Request, res: Response) => {
        try {
            const agents = await Agent.find({});
            res.json(agents);
        } catch (error) {
            logger.error('Error fetching agents:', error);
            res.status(500).json({ error: 'Failed to fetch agents' });
        }
    },

    stopAgent: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const agent = await Agent.findOneAndUpdate(
                { id },
                { 
                    status: 'stopped',
                    lastActive: new Date()
                },
                { new: true }
            );

            if (agent) {
                logger.info(`Agent ${id} marked as stopped`);
                res.json({ status: 'stopped' });
            } else {
                res.status(404).json({ error: 'Agent not found' });
            }
        } catch (error) {
            logger.error('Error stopping agent:', error);
            res.status(500).json({ error: 'Failed to stop agent' });
        }
    },

    heartbeat: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { status, systemInfo } = req.body;
            
            const agent = await Agent.findOneAndUpdate(
                { id },
                {
                    status,
                    lastActive: new Date(),
                    systemInfo
                },
                { new: true }
            );

            if (agent) {
                res.json(agent);
            } else {
                res.status(404).json({ error: 'Agent not found' });
            }
        } catch (error) {
            logger.error('Error updating agent heartbeat:', error);
            res.status(500).json({ error: 'Failed to update agent heartbeat' });
        }
    },

    getAgentStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const agent = await Agent.findOne({ id });

            if (agent) {
                logger.info(`Sending status for agent ${id}: ${agent.status}`);
                res.json({ status: agent.status });
            } else {
                res.status(404).json({ error: 'Agent not found' });
            }
        } catch (error) {
            logger.error('Error fetching agent status:', error);
            res.status(500).json({ error: 'Failed to fetch agent status' });
        }
    },

    getAgentAlerts: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            logger.info(`Fetching alerts for agent ID: ${id}`);
            
            // Get agent name from the database
            const agent = await Agent.findOne({ agentId: id });
            if (!agent) {
                logger.error(`Agent not found with ID: ${id}`);
                return res.status(404).json({ error: 'Agent not found' });
            }

            // Directly query alerts by source name
            const alerts = await Alert.find({ 
                source: agent.name ? { $regex: new RegExp(agent.name, 'i') } : ''
            })
            .sort({ timestamp: -1 })
            .limit(100);

            logger.info(`Found ${alerts.length} alerts for agent ${agent.name}`);

            const response = {
                total: alerts.length,
                critical: alerts.filter(a => a.severity === 'critical').length,
                warning: alerts.filter(a => a.severity === 'warning').length,
                info: alerts.filter(a => a.severity === 'info').length,
                alerts: alerts
            };

            res.json(response);
        } catch (error) {
            logger.error('Error in getAgentAlerts:', error);
            res.status(500).json({ error: 'Failed to fetch alerts' });
        }
    },

    getAgentVulnerabilities: (req: Request, res: Response) => {
        res.json(null); // Placeholder, returns null for now
    },

    getAgentCompliance: (req: Request, res: Response) => {
        res.json(null); // Placeholder, returns null for now
    }
}; 