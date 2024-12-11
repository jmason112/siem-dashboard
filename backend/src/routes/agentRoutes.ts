import express from 'express';
import { agentController } from '../controllers/agentController';

const router = express.Router();

// Agent deployment and registration
router.post('/deploy', agentController.deployAgent);

// Get all deployed agents
router.get('/deployed', agentController.getDeployedAgents);

// Agent status endpoints
router.post('/:id/status', agentController.updateAgentStatus);
router.get('/:id/status', agentController.getAgentStatus);

// Agent data endpoints
router.get('/:id/alerts', agentController.getAgentAlerts);
router.get('/:id/vulnerabilities', agentController.getAgentVulnerabilities);
router.get('/:id/compliance', agentController.getAgentCompliance);

export default router; 