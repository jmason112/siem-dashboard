import { Router } from 'express';
import { securityController } from '../controllers/securityController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Vulnerability routes
router.get('/vulnerabilities', securityController.getVulnerabilities);
router.get('/vulnerabilities/stats', securityController.getVulnerabilityStats);

// Compliance routes
router.get('/compliance', securityController.getCompliance);
router.get('/compliance/stats', securityController.getComplianceStats);

// Agent routes - these should be protected
router.post('/agent/vulnerability-scan', authMiddleware, securityController.receiveVulnerabilityScan);
router.post('/agent/compliance-check', authMiddleware, securityController.receiveComplianceCheck);

// Debug route to test agent authentication
router.get('/agent/test', authMiddleware, (req, res) => {
  res.json({ message: 'Agent authentication successful', user: req.user });
});

export default router; 