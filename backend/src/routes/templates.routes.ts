import { Router } from 'express';
import { templatesController } from '../controllers/templates.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(authenticate);

// Email templates
router.post('/email', authorize(['admin', 'manager']), templatesController.createEmailTemplate);
router.get('/email', authorize(['admin', 'super_admin', 'manager']), templatesController.getEmailTemplates);
router.get('/email/:templateId', authorize(['admin', 'super_admin', 'manager']), templatesController.getEmailTemplate);
router.put('/email/:templateId', authorize(['admin', 'manager']), templatesController.updateEmailTemplate);
router.delete('/email/:templateId', authorize(['admin', 'manager']), templatesController.deleteEmailTemplate);

// SMS templates
router.post('/sms', authorize(['admin', 'manager']), templatesController.createSmsTemplate);
router.get('/sms', authorize(['admin', 'super_admin', 'manager']), templatesController.getSmsTemplates);
router.get('/sms/:templateId', authorize(['admin', 'super_admin', 'manager']), templatesController.getSmsTemplate);
router.put('/sms/:templateId', authorize(['admin', 'manager']), templatesController.updateSmsTemplate);
router.delete('/sms/:templateId', authorize(['admin', 'manager']), templatesController.deleteSmsTemplate);

export default router;
