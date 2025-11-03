import { Router } from 'express';
import { maintenanceController } from '../controllers/maintenance.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(authenticate);

// Get maintenance records
router.get('/', maintenanceController.getRecords);
router.get('/:id', maintenanceController.getRecordById);

// Create/Update/Delete (restricted to staff and above)
router.post('/', authorize(['admin', 'manager', 'staff']), maintenanceController.createRecord);
router.put('/:id', authorize(['admin', 'manager', 'staff']), maintenanceController.updateRecord);
router.delete('/:id', authorize(['admin', 'manager']), maintenanceController.deleteRecord);

export default router;
