import { Router } from 'express';
import { equipmentController } from '../controllers/equipment.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', equipmentController.getEquipment);
router.get('/:id', equipmentController.getEquipmentById);
router.post('/', authorize({ roles: ['super_admin', 'admin', 'manager'] }), equipmentController.createEquipment);
router.put('/:id', authorize({ roles: ['super_admin', 'admin', 'manager'] }), equipmentController.updateEquipment);
router.delete('/:id', authorize({ roles: ['super_admin', 'admin'] }), equipmentController.deleteEquipment);

export default router;
