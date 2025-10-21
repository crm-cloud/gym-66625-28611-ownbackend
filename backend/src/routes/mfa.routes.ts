import { Router } from 'express';
import { mfaController } from '../controllers/mfa.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All MFA routes require authentication
router.use(authenticate);

// MFA setup and management
router.post('/setup', mfaController.setup);
router.post('/enable', mfaController.enable);
router.post('/disable', mfaController.disable);
router.get('/status', mfaController.getStatus);

// Backup codes
router.post('/backup-codes', mfaController.generateBackupCodes);
router.post('/verify-backup', mfaController.verifyBackupCode);

// MFA verification (used during login)
router.post('/verify', mfaController.verify);

export default router;
