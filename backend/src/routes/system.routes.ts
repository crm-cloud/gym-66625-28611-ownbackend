import { Router } from 'express';
import { systemController } from '../controllers/system.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(authenticate);
router.use(authorize(['super_admin'])); // All system routes restricted to super admin

// System health
router.get('/health', systemController.getDetailedHealth);

// Backups
router.get('/backups', systemController.getBackups);
router.post('/backups/create', systemController.createBackup);
router.post('/backups/:id/restore', systemController.restoreBackup);

// Logs
router.get('/logs', systemController.getLogs);

export default router;
