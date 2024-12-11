import { Router } from 'express';
import { agentController } from '../controllers/agentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Agent deployment and registration
router.post('/deploy', agentController.deployAgent);

// Get all deployed agents
router.get('/deployed', authMiddleware, agentController.getDeployedAgents);

// Agent status endpoints
router.post('/:id/status', agentController.updateAgentStatus);
router.get('/:id/status', agentController.getAgentStatus);

// Agent data endpoints
router.get('/:id/alerts', agentController.getAgentAlerts);
router.get('/:id/vulnerabilities', agentController.getAgentVulnerabilities);
router.get('/:id/compliance', agentController.getAgentCompliance);

// OSQuery endpoint
router.post('/:id/osquery', agentController.updateOSQueryData);

export default router; 