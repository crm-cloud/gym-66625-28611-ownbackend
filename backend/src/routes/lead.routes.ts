import { Router } from 'express';
import { leadController } from '../controllers/lead.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
router.use(authenticate);

router.post('/', authorize(['admin', 'manager', 'staff']), leadController.createLead);
router.get('/', authorize(['admin', 'manager', 'staff']), leadController.getLeads);
router.get('/stats', authorize(['admin', 'manager']), leadController.getLeadStats);
router.get('/:id', authorize(['admin', 'manager', 'staff']), leadController.getLeadById);
router.put('/:id', authorize(['admin', 'manager', 'staff']), leadController.updateLead);
router.delete('/:id', authorize(['admin', 'manager']), leadController.deleteLead);
router.post('/follow-up', authorize(['admin', 'manager', 'staff']), leadController.addFollowUp);
router.post('/:id/convert', authorize(['admin', 'manager']), leadController.convertLead);

export default router;
