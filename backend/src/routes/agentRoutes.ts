import express from 'express';
import { agentController } from '../controllers/agentController';

const router = express.Router();

router.get('/status/:id', agentController.getAgentStatus);
router.get('/deployed', agentController.getDeployedAgents);

router.post('/deploy', agentController.deployAgent);
router.post('/:id/stop', agentController.stopAgent);
router.post('/:id/heartbeat', agentController.heartbeat);
router.get('/:id/status', agentController.getAgentStatus);

export default router; 