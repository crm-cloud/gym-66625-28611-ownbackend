import { Router } from 'express';
import { announcementController } from '../controllers/announcement.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', announcementController.getAnnouncements); // All authenticated users can view
router.get('/:id', announcementController.getAnnouncement);
router.post('/', authorize({ roles: ['super_admin', 'admin', 'manager'] }), announcementController.createAnnouncement);
router.put('/:id', authorize({ roles: ['super_admin', 'admin', 'manager'] }), announcementController.updateAnnouncement);
router.delete('/:id', authorize({ roles: ['super_admin', 'admin'] }), announcementController.deleteAnnouncement);

export default router;
