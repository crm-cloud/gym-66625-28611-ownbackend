import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(authenticate);

// Get all settings - Only admin and super_admin
router.get('/', 
  authorize(['admin', 'super_admin']), 
  settingsController.getAllSettings
);

// Get specific category - Only admin and super_admin
router.get('/:category', 
  authorize(['admin', 'super_admin']), 
  settingsController.getSettingsByCategory
);

// Update settings - Only admin and super_admin
router.post('/:category', 
  authorize(['admin', 'super_admin']), 
  settingsController.updateSettings
);

// Test settings - Only admin and super_admin
router.post('/:category/test', 
  authorize(['admin', 'super_admin']), 
  settingsController.testSettings
);

export default router;
