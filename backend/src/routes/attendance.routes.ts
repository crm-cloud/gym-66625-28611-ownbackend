import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Attendance records
router.get('/', authorize({ roles: ['super_admin', 'admin', 'manager', 'staff', 'trainer'] }), attendanceController.getAttendance);
router.post('/', authorize({ roles: ['super_admin', 'admin', 'manager', 'staff'] }), attendanceController.createAttendance);
router.put('/:id', authorize({ roles: ['super_admin', 'admin', 'manager', 'staff'] }), attendanceController.updateAttendance);

// Attendance devices
router.get('/devices', authorize({ roles: ['super_admin', 'admin', 'manager'] }), attendanceController.getDevices);
router.post('/devices', authorize({ roles: ['super_admin', 'admin'] }), attendanceController.createDevice);
router.put('/devices/:id', authorize({ roles: ['super_admin', 'admin'] }), attendanceController.updateDevice);

export default router;
