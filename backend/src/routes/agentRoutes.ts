import express from 'express';
import { agentController } from '../controllers/agentController';

const router = express.Router();

router.get('/status/:id', agentController.getAgentStatus);
router.get('/deployed', agentController.getDeployedAgents);

router.post('/deploy', agentController.deployAgent);
router.post('/:id/stop', agentController.stopAgent);
router.post('/:id/heartbeat', agentController.heartbeat);

router.get('/alerts/agent/:id', agentController.getAgentAlerts);
router.get('/security/vulnerabilities/agent/:id', agentController.getAgentVulnerabilities);
router.get('/security/compliance/agent/:id', agentController.getAgentCompliance);

export default router; 