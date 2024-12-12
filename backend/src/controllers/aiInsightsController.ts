import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for AI provider settings
const aiProviderSchema = z.object({
  provider: z.enum(['openai', 'anthropic']),
  apiKey: z.string().min(1)
});

// Cache duration in hours
const CACHE_DURATION = 24;

type InsightType = 'security_posture' | 'agent_performance' | 'threat_analysis';

interface SystemInfo {
  health?: number;
  cpu_usage?: number;
  memory_percent?: number;
}

const calculateSystemHealth = (agents: any[]): number => {
  if (agents.length === 0) return 0;
  
  return agents.reduce((acc, agent) => {
    const info = agent.systemInfo as SystemInfo | null;
    return acc + (info?.health || 0);
  }, 0) / agents.length;
};

const mapAgentMetrics = (agents: any[]) => {
  return agents.map(agent => {
    const info = agent.systemInfo as SystemInfo | null;
    return {
      name: agent.name,
      health: info?.health,
      cpu: info?.cpu_usage,
      memory: info?.memory_percent
    };
  });
};

const generatePrompts: Record<InsightType, (data: any) => string> = {
  security_posture: (data) => `Analyze this security data and provide insights:
    Active Agents: ${data.activeAgents}
    System Health: ${data.systemHealth}%
    Critical Alerts: ${data.criticalAlerts}
    Recent Incidents: ${JSON.stringify(data.recentIncidents)}
    
    Provide a detailed analysis of the security posture, including:
    1. Overall security status
    2. Key risks and vulnerabilities
    3. Specific recommendations for improvement
    4. Trends and patterns in the data`,

  agent_performance: (data) => `Analyze this agent performance data:
    ${JSON.stringify(data.agentMetrics)}
    
    Provide insights on:
    1. Agent health and efficiency
    2. Resource utilization patterns
    3. Optimization recommendations
    4. Potential bottlenecks or issues`,

  threat_analysis: (data) => `Analyze these security events and alerts:
    ${JSON.stringify(data.securityEvents)}
    
    Provide insights on:
    1. Threat patterns and trends
    2. Risk assessment
    3. Recommended security measures
    4. Potential attack vectors to monitor`
};

export const aiInsightsController = {
  async generateInsights(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: 'User ID required' });

      // Get user's AI preferences
      const userPrefs = await prisma.userPreferences.findUnique({
        where: { userId: userId as string }
      });

      if (!userPrefs?.aiApiKey) {
        return res.status(400).json({ error: 'AI API key not configured' });
      }

      // Check for existing non-expired insights
      const existingInsights = await prisma.aIInsight.findMany({
        where: {
          userId: userId as string,
          expiresAt: { gt: new Date() }
        }
      });

      if (existingInsights.length > 0) {
        return res.json({ insights: existingInsights });
      }

      // Gather data for analysis
      const [agents, alerts] = await Promise.all([
        prisma.agent.findMany({ where: { userId: userId as string } }),
        prisma.alert.findMany({
          where: { userId: userId as string },
          take: 100,
          orderBy: { timestamp: 'desc' }
        })
      ]);

      // Initialize AI client based on provider
      let aiClient: OpenAI | Anthropic;
      if (userPrefs.aiProvider === 'anthropic') {
        aiClient = new Anthropic({ apiKey: userPrefs.aiApiKey });
      } else {
        aiClient = new OpenAI({ apiKey: userPrefs.aiApiKey });
      }

      // Generate insights for each type
      const insightTypes: InsightType[] = ['security_posture', 'agent_performance', 'threat_analysis'];
      const insights = await Promise.all(
        insightTypes.map(async (type) => {
          const data = {
            activeAgents: agents.length,
            systemHealth: calculateSystemHealth(agents),
            criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
            recentIncidents: alerts.slice(0, 10),
            agentMetrics: mapAgentMetrics(agents),
            securityEvents: alerts
          };

          let response: any;
          if (userPrefs.aiProvider === 'anthropic') {
            response = await (aiClient as Anthropic).messages.create({
              model: 'claude-2',
              max_tokens: 1000,
              messages: [{ role: 'user', content: generatePrompts[type](data) }]
            });
          } else {
            response = await (aiClient as OpenAI).chat.completions.create({
              model: 'gpt-4',
              messages: [{ role: 'user', content: generatePrompts[type](data) }],
              max_tokens: 1000
            });
          }

          const content = userPrefs.aiProvider === 'anthropic' 
            ? response.content
            : response.choices[0].message.content;

          return prisma.aIInsight.create({
            data: {
              userId: userId as string,
              type,
              content: { analysis: content },
              expiresAt: new Date(Date.now() + CACHE_DURATION * 60 * 60 * 1000)
            }
          });
        })
      );

      res.json({ insights });
    } catch (error) {
      console.error('Error generating AI insights:', error);
      res.status(500).json({ error: 'Failed to generate insights' });
    }
  },

  async getInsights(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: 'User ID required' });

      const insights = await prisma.aIInsight.findMany({
        where: {
          userId: userId as string,
          expiresAt: { gt: new Date() }
        },
        orderBy: { generatedAt: 'desc' }
      });

      res.json({ insights });
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      res.status(500).json({ error: 'Failed to fetch insights' });
    }
  },

  async updateAISettings(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const { provider, apiKey } = aiProviderSchema.parse(req.body);

      await prisma.userPreferences.update({
        where: { userId: userId as string },
        data: { aiProvider: provider, aiApiKey: apiKey }
      });

      res.json({ message: 'AI settings updated successfully' });
    } catch (error) {
      console.error('Error updating AI settings:', error);
      res.status(500).json({ error: 'Failed to update AI settings' });
    }
  }
}; 