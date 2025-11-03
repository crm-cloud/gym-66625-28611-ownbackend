import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(authenticate);

// Get all settings for current context
router.get('/', settingsController.getAllSettings);

// Get/update specific category settings
router.get('/:category', settingsController.getSettingsByCategory);
router.post('/:category', authorize(['admin', 'super_admin']), settingsController.updateSettings);

// Test settings (send test email/SMS)
router.post('/:category/test', authorize(['admin', 'super_admin']), settingsController.testSettings);

export default router;
