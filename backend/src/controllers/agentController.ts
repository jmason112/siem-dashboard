import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { Agent } from '../models/Agent';
import { Alert } from '../models/Alert';
import { randomBytes } from 'crypto';

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
            const { name } = req.body;
            const userId = req.user?.id || req.query.userId as string;

            if (!userId) {
                logger.error('No userId provided for agent deployment');
                return res.status(400).json({ error: 'userId is required' });
            }

            if (!name) {
                logger.error('No name provided for agent deployment');
                return res.status(400).json({ error: 'name is required' });
            }

            // Generate a unique agent ID using crypto
            const agentId = randomBytes(8).toString('hex');

            // Check if an agent with this name already exists for this user
            const existingAgent = await Agent.findOne({ name, userId });
            
            if (existingAgent) {
                // If agent exists but is stopped, restart it
                if (existingAgent.status === 'stopped') {
                    const updatedAgent = await Agent.findOneAndUpdate(
                        { _id: existingAgent._id },
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

            // Create new agent
            const agent = new Agent({
                agentId,
                name,
                userId,
                status: 'running',
                deployedAt: new Date(),
                lastActive: new Date()
            });

            await agent.save();
            logger.info('New agent deployed:', agent);
            res.json(agent);
        } catch (error) {
            logger.error('Error deploying agent:', error);
            res.status(500).json({ error: 'Failed to deploy agent' });
        }
    },

    getDeployedAgents: async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id || req.query.userId as string;

            if (!userId) {
                logger.error('No userId provided for fetching deployed agents');
                return res.status(400).json({ error: 'userId is required' });
            }

            const agents = await Agent.find({ userId });
            logger.info(`Found ${agents.length} agents for user ${userId}`);
            res.json(agents);
        } catch (error) {
            logger.error('Error fetching deployed agents:', error);
            res.status(500).json({ error: 'Failed to fetch deployed agents' });
        }
    },

    updateAgentStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id || req.query.userId as string;

            if (!userId) {
                logger.error('No userId provided for agent status update');
                return res.status(400).json({ error: 'userId is required' });
            }

            const { status, systemInfo, lastActive } = req.body;

            const agent = await Agent.findOneAndUpdate(
                { 
                    agentId: id,
                    userId: userId
                },
                { 
                    status,
                    systemInfo,
                    lastActive: lastActive || new Date(),
                },
                { new: true }
            );

            if (!agent) {
                return res.status(404).json({ error: 'Agent not found' });
            }

            res.json(agent);
        } catch (error) {
            logger.error('Error updating agent status:', error);
            res.status(500).json({ error: 'Failed to update agent status' });
        }
    },

    getAgentStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id || req.query.userId as string;

            if (!userId) {
                logger.error('No userId provided for agent status check');
                return res.status(400).json({ error: 'userId is required' });
            }

            const agent = await Agent.findOne({ 
                agentId: id,
                userId: userId
            });

            if (agent) {
                logger.info(`Sending status for agent ${id}: ${agent.status}`);
                res.json(agent);
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
            const userId = req.user?.id || req.query.userId as string;

            if (!userId) {
                logger.error('No userId provided for agent alerts');
                return res.status(400).json({ error: 'userId is required' });
            }

            logger.info(`Fetching alerts for agent ID: ${id}`);
            
            // Get agent name from the database
            const agent = await Agent.findOne({ 
                agentId: id,
                userId: userId
            });
            if (!agent) {
                logger.error(`Agent not found with ID: ${id}`);
                return res.status(404).json({ error: 'Agent not found' });
            }

            // Directly query alerts by source name and userId
            const alerts = await Alert.find({ 
                source: agent.name ? { $regex: new RegExp(agent.name, 'i') } : '',
                userId: userId
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