import prisma from '../config/database';
import { getFileUrl, deleteFile, getFilePath } from '../config/storage.js';
import { Prisma } from '@prisma/client';

export class TaskService {
  async createTask(data: Prisma.TasksCreateInput) {
    return await prisma.tasks.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async getTasks(filters: {
    branch_id?: string;
    assigned_to?: string;
    status?: string;
    priority?: string;
    task_type?: string;
  }) {
    const where: Prisma.TasksWhereInput = {};
    
    if (filters.branch_id) where.branchId = filters.branch_id;
    if (filters.assigned_to) where.assignedTo = filters.assigned_to;
    if (filters.status) where.status = filters.status as any;
    if (filters.priority) where.priority = filters.priority as any;
    if (filters.task_type) where.taskType = filters.task_type as any;

    return await prisma.tasks.findMany({
      where,
      include: {
        branch: {
          select: { name: true }
        },
        assignee: {
          select: { fullName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTaskById(id: string) {
    return await prisma.tasks.findUnique({
      where: { id },
      include: {
        branch: {
          select: { name: true }
        },
        assignee: {
          select: { fullName: true }
        },
        creator: {
          select: { fullName: true }
        }
      }
    });
  }

  async updateTask(id: string, data: Prisma.TasksUpdateInput) {
    return await prisma.tasks.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async updateTaskStatus(id: string, status: string, completionNotes?: string, completedById?: string) {
    const updateData: Prisma.TasksUpdateInput = {
      status: status as any,
      updatedAt: new Date(),
    };

    if (status === 'completed') {
      updateData.completedAt = new Date();
      updateData.completedBy = completedById ? { connect: { id: completedById } } : undefined;
      updateData.completionNotes = completionNotes;
    }

    return await prisma.tasks.update({
      where: { id },
      data: updateData,
    });
  }

  async assignTask(id: string, assignedTo: string) {
    return await prisma.tasks.update({
      where: { id },
      data: {
        assignedTo: { connect: { id: assignedTo } },
        updatedAt: new Date(),
      },
    });
  }

  async deleteTask(id: string) {
    // Get task to delete associated attachments
    const task = await prisma.tasks.findUnique({
      where: { id },
      select: { attachments: true }
    });
    
    if (task?.attachments) {
      for (const attachmentUrl of task.attachments) {
        try {
          const filename = attachmentUrl.split('/').pop();
          if (filename) {
            await deleteFile(getFilePath('attachments', filename));
          }
        } catch (error) {
          console.error('Failed to delete attachment:', error);
        }
      }
    }
    
    // Delete task and related records in a transaction
    await prisma.$transaction([
      prisma.taskComments.deleteMany({ where: { taskId: id } }),
      prisma.tasks.delete({ where: { id } })
    ]);
  }

  // Task Comments
  async addTaskComment(data: { taskId: string; userId: string; comment: string }) {
    return await prisma.taskComments.create({
      data: {
        task: { connect: { id: data.taskId } },
        user: { connect: { id: data.userId } },
        comment: data.comment,
      },
    });
  }

  async getTaskComments(taskId: string) {
    return await prisma.taskComments.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deleteTaskComment(id: string) {
    await prisma.taskComments.delete({ where: { id } });
  }

  // Statistics
  async getTaskStatistics(branchId?: string) {
    const where: Prisma.TasksWhereInput = branchId ? { branchId } : {};
    
    const [
      total,
      pending,
      inProgress,
      completed,
      overdue
    ] = await Promise.all([
      prisma.tasks.count({ where }),
      prisma.tasks.count({ 
        where: { ...where, status: 'PENDING' } 
      }),
      prisma.tasks.count({ 
        where: { ...where, status: 'IN_PROGRESS' } 
      }),
      prisma.tasks.count({ 
        where: { ...where, status: 'COMPLETED' } 
      }),
      prisma.tasks.count({
        where: {
          ...where,
          status: { not: 'COMPLETED' },
          dueDate: { lt: new Date() }
        }
      })
    ]);

    return {
      total,
      pending,
      in_progress: inProgress,
      completed,
      overdue,
    };
  }
}

export const taskService = new TaskService();
