import { WebSocket } from 'ws';
import { Alert } from '../models/Alert';
import { Agent } from '../models/Agent';
import { logger } from '../config/logger';

export const setupWebSocketHandlers = (ws: WebSocket) => {
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message.toString());
            
            if (data.type === 'subscribe_agent_alerts') {
                const agentName = data.agentName;
                logger.info(`Subscribing to alerts for agent: ${agentName}`);

                const fetchAndSendAlerts = async () => {
                    try {
                        // First get the agent to get both name and hostname
                        const agent = await Agent.findOne({ name: agentName });
                        if (!agent) {
                            logger.error(`Agent not found: ${agentName}`);
                            return;
                        }

                        const hostname = agent.systemInfo?.hostname || '';
                        
                        // Query alerts matching either source or hostname
                        const alerts = await Alert.find({ 
                            $or: [
                                { source: agentName },
                                { source: agentName.toUpperCase() },
                                { source: hostname },
                                { source: hostname.toUpperCase() }
                            ]
                        })
                        .sort({ timestamp: -1 })
                        .limit(100);

                        logger.info(`Found ${alerts.length} alerts for agent ${agentName} (hostname: ${hostname})`);

                        ws.send(JSON.stringify({
                            type: 'agent_alerts',
                            data: {
                                total: alerts.length,
                                critical: alerts.filter(a => a.severity === 'critical').length,
                                warning: alerts.filter(a => a.severity === 'warning').length,
                                info: alerts.filter(a => a.severity === 'info').length,
                                alerts: alerts
                            }
                        }));
                    } catch (error) {
                        logger.error('Error fetching alerts:', error);
                    }
                };

                await fetchAndSendAlerts();
                const interval = setInterval(fetchAndSendAlerts, 5000);

                ws.on('close', () => {
                    clearInterval(interval);
                    logger.info(`Unsubscribed from alerts for ${agentName}`);
                });
            }
        } catch (error) {
            logger.error('WebSocket message handling error:', error);
        }
    });
}; 