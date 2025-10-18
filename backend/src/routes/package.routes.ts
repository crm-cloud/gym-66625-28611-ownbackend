import { Router } from 'express';
import { packageController } from '../controllers/package.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
router.use(authenticate);

router.post('/', authorize(['admin', 'manager', 'staff']), packageController.createPackage);
router.get('/', packageController.getPackages);
router.get('/member/:memberId/usage', packageController.getPackageUsage);
router.get('/:id', packageController.getPackageById);
router.put('/:id', authorize(['admin', 'manager']), packageController.updatePackage);

export default router;
