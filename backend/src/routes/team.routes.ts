import { Router } from 'express';
import { teamController } from '../controllers/team.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(authenticate);

// Team members
router.post('/members', authorize(['admin', 'manager']), teamController.createTeamMember);
router.get('/members', authorize(['admin', 'super_admin', 'manager']), teamController.getTeamMembers);
router.get('/members/:memberId', authorize(['admin', 'super_admin', 'manager']), teamController.getTeamMember);
router.put('/members/:memberId', authorize(['admin', 'manager']), teamController.updateTeamMember);
router.delete('/members/:memberId', authorize(['admin', 'manager']), teamController.deleteTeamMember);

// Work shifts
router.post('/shifts', authorize(['admin', 'manager']), teamController.createShift);
router.get('/shifts', authorize(['admin', 'super_admin', 'manager', 'staff']), teamController.getShifts);
router.put('/shifts/:shiftId', authorize(['admin', 'manager']), teamController.updateShift);
router.delete('/shifts/:shiftId', authorize(['admin', 'manager']), teamController.deleteShift);

export default router;
