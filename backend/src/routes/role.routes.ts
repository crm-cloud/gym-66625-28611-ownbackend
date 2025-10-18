import { Router } from 'express';
import { roleController } from '../controllers/role.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Role management (admin only)
router.get('/', authorize(['admin', 'super_admin']), roleController.getRoles);
router.get('/permissions', authorize(['admin', 'super_admin']), roleController.getPermissionsByModule);
router.get('/:id', authorize(['admin', 'super_admin']), roleController.getRoleById);
router.get('/:id/permissions', authorize(['admin', 'super_admin']), roleController.getRolePermissions);
router.post('/', authorize(['admin', 'super_admin']), roleController.createRole);
router.put('/:id', authorize(['admin', 'super_admin']), roleController.updateRole);
router.delete('/:id', authorize(['super_admin']), roleController.deleteRole);

// Permission assignment
router.put('/:id/permissions', authorize(['admin', 'super_admin']), roleController.assignPermissions);

// User role assignment
router.post('/assign', authorize(['admin', 'super_admin']), roleController.assignUserRole);
router.delete('/:userId/:roleId', authorize(['admin', 'super_admin']), roleController.removeUserRole);
router.get('/user/:userId', authorize(['admin', 'super_admin', 'manager']), roleController.getUserRoles);

export default router;
