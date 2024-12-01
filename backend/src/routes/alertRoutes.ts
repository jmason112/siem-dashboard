import { Router } from 'express';
import { alertController } from '../controllers/alertController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protected routes - temporarily disabled for testing
// router.use(authMiddleware);

// Get alerts with filtering and pagination
router.get('/', alertController.getAlerts);

// Get alert statistics
router.get('/stats', alertController.getStats);

// Create new alert
router.post('/', alertController.createAlert);

// Update alert
router.put('/:id', alertController.updateAlert);

// Delete alert
router.delete('/:id', alertController.deleteAlert);

export default router; 