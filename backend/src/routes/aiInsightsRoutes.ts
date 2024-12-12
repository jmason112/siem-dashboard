import express from 'express';
import { aiInsightsController } from '../controllers/aiInsightsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Generate new insights
router.post('/generate', aiInsightsController.generateInsights);

// Get existing insights
router.get('/', aiInsightsController.getInsights);

// Update AI settings
router.put('/settings', aiInsightsController.updateAISettings);

export default router; 