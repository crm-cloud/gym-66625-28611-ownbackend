import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { uploadTaskAttachments } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Task CRUD Routes
router.post(
  '/',
  authorize(['admin', 'manager', 'staff']),
  uploadTaskAttachments,
  taskController.createTask.bind(taskController)
);

router.get(
  '/',
  authorize(['admin', 'manager', 'staff', 'trainer']),
  taskController.getTasks.bind(taskController)
);

router.get(
  '/statistics',
  authorize(['admin', 'manager']),
  taskController.getTaskStatistics.bind(taskController)
);

router.get(
  '/:id',
  authorize(['admin', 'manager', 'staff', 'trainer']),
  taskController.getTaskById.bind(taskController)
);

router.put(
  '/:id',
  authorize(['admin', 'manager', 'staff']),
  uploadTaskAttachments,
  taskController.updateTask.bind(taskController)
);

router.patch(
  '/:id/status',
  authorize(['admin', 'manager', 'staff']),
  taskController.updateTaskStatus.bind(taskController)
);

router.patch(
  '/:id/assign',
  authorize(['admin', 'manager']),
  taskController.assignTask.bind(taskController)
);

router.delete(
  '/:id',
  authorize(['admin', 'manager']),
  taskController.deleteTask.bind(taskController)
);

// Task Comments Routes
router.post(
  '/comments',
  authorize(['admin', 'manager', 'staff', 'trainer']),
  taskController.addTaskComment.bind(taskController)
);

router.get(
  '/:taskId/comments',
  authorize(['admin', 'manager', 'staff', 'trainer']),
  taskController.getTaskComments.bind(taskController)
);

router.delete(
  '/comments/:id',
  authorize(['admin', 'manager']),
  taskController.deleteTaskComment.bind(taskController)
);

export default router;
