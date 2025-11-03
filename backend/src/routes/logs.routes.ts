import { Router } from 'express';
import { logsController } from '../controllers/logs.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(authenticate);

// Email logs
router.get('/email', authorize(['admin', 'super_admin']), logsController.getEmailLogs);

// SMS logs
router.get('/sms', authorize(['admin', 'super_admin']), logsController.getSMSLogs);

// Audit logs
router.get('/audit', authorize(['admin', 'super_admin']), logsController.getAuditLogs);

export default router;
