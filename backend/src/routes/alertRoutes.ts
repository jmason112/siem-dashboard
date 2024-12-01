import express from 'express';
import { alertController } from '../controllers/alertController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Alert routes
router.get('/', alertController.getAlerts);
router.post('/', alertController.createAlert);
router.put('/:id', alertController.updateAlert);
router.delete('/:id', alertController.deleteAlert);
router.get('/stats', alertController.getAlertStats);

export default router; 