import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  assignTaskSchema,
  addTaskCommentSchema,
} from '../validation/task.validation';
import { getFileUrl } from '../config/storage';

export class TaskController {
  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createTaskSchema.parse(req.body);
      
      // Handle file attachments if present
      let attachments: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        attachments = req.files.map(file => getFileUrl('attachments', file.filename));
      }

      const task = await taskService.createTask({
        ...validatedData,
        attachments,
        created_by: req.user?.userId,
      });

      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }

  async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        branch_id: req.query.branch_id as string,
        assigned_to: req.query.assigned_to as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
        task_type: req.query.task_type as string,
      };

      const tasks = await taskService.getTasks(filters);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = updateTaskSchema.parse({ ...req.body, id: req.params.id });
      
      // Handle file attachments if present
      if (req.files && Array.isArray(req.files)) {
        const newAttachments = req.files.map(file => getFileUrl('attachments', file.filename));
        validatedData.attachments = [
          ...(validatedData.attachments || []),
          ...newAttachments,
        ];
      }

      const task = await taskService.updateTask(validatedData.id, validatedData);
      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async updateTaskStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = updateTaskStatusSchema.parse({ ...req.body, id: req.params.id });
      const task = await taskService.updateTaskStatus(
        validatedData.id,
        validatedData.status,
        validatedData.completion_notes,
        req.user?.userId
      );
      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async assignTask(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = assignTaskSchema.parse({ ...req.body, id: req.params.id });
      const task = await taskService.assignTask(validatedData.id, validatedData.assigned_to);
      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await taskService.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Task Comments
  async addTaskComment(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = addTaskCommentSchema.parse(req.body);
      const comment = await taskService.addTaskComment({
        ...validatedData,
        user_id: req.user?.userId!,
      });
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  async getTaskComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const comments = await taskService.getTaskComments(taskId);
      res.json(comments);
    } catch (error) {
      next(error);
    }
  }

  async deleteTaskComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await taskService.deleteTaskComment(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Statistics
  async getTaskStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branch_id as string | undefined;
      const statistics = await taskService.getTaskStatistics(branchId);
      res.json(statistics);
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
