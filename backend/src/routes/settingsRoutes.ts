import { Router } from 'express';
import { settingsController } from '../controllers/settingsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Preferences routes
router.get('/preferences', settingsController.getPreferences);
router.patch('/preferences', settingsController.updatePreferences);

// Devices routes
router.get('/devices', settingsController.getDevices);
router.delete('/devices/:id', settingsController.removeDevice);

// Login history routes
router.get('/login-history', settingsController.getLoginHistory);

export default router; 