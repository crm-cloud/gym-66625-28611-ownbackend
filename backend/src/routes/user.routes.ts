import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User management (admin/manager only)
router.get('/', authorize(['admin', 'super_admin', 'manager']), userController.getUsers);
router.get('/stats', authorize(['admin', 'super_admin', 'manager']), userController.getUserStats);
router.get('/:id', authorize(['admin', 'super_admin', 'manager']), userController.getUserById);
router.post('/', authorize(['admin', 'super_admin', 'manager']), userController.createUser);
router.put('/:id', authorize(['admin', 'super_admin', 'manager']), userController.updateUser);
router.delete('/:id', authorize(['admin', 'super_admin']), userController.deleteUser);

// Profile management (authenticated users)
router.put('/profile/me', userController.updateProfile);

export default router;
