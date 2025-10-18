import { db } from '../config/database';
import { getFileUrl, deleteFile, getFilePath } from '../config/storage';

export class TaskService {
  async createTask(data: any) {
    const [task] = await db('tasks')
      .insert({
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');
    return task;
  }

  async getTasks(filters: {
    branch_id?: string;
    assigned_to?: string;
    status?: string;
    priority?: string;
    task_type?: string;
  }) {
    let query = db('tasks')
      .select(
        'tasks.*',
        'branches.name as branch_name',
        'profiles.full_name as assigned_to_name'
      )
      .leftJoin('branches', 'tasks.branch_id', 'branches.id')
      .leftJoin('profiles', 'tasks.assigned_to', 'profiles.user_id')
      .orderBy('tasks.created_at', 'desc');

    if (filters.branch_id) {
      query = query.where('tasks.branch_id', filters.branch_id);
    }

    if (filters.assigned_to) {
      query = query.where('tasks.assigned_to', filters.assigned_to);
    }

    if (filters.status) {
      query = query.where('tasks.status', filters.status);
    }

    if (filters.priority) {
      query = query.where('tasks.priority', filters.priority);
    }

    if (filters.task_type) {
      query = query.where('tasks.task_type', filters.task_type);
    }

    return await query;
  }

  async getTaskById(id: string) {
    return await db('tasks')
      .select(
        'tasks.*',
        'branches.name as branch_name',
        'profiles.full_name as assigned_to_name',
        'creator.full_name as created_by_name'
      )
      .leftJoin('branches', 'tasks.branch_id', 'branches.id')
      .leftJoin('profiles', 'tasks.assigned_to', 'profiles.user_id')
      .leftJoin('profiles as creator', 'tasks.created_by', 'creator.user_id')
      .where('tasks.id', id)
      .first();
  }

  async updateTask(id: string, data: any) {
    const [updated] = await db('tasks')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date(),
      })
      .returning('*');
    return updated;
  }

  async updateTaskStatus(id: string, status: string, completionNotes?: string, completedBy?: string) {
    const updateData: any = {
      status,
      updated_at: new Date(),
    };

    if (status === 'completed') {
      updateData.completed_at = new Date();
      updateData.completed_by = completedBy;
      updateData.completion_notes = completionNotes;
    }

    const [updated] = await db('tasks')
      .where('id', id)
      .update(updateData)
      .returning('*');
    return updated;
  }

  async assignTask(id: string, assignedTo: string) {
    const [updated] = await db('tasks')
      .where('id', id)
      .update({
        assigned_to: assignedTo,
        updated_at: new Date(),
      })
      .returning('*');
    return updated;
  }

  async deleteTask(id: string) {
    // Get task to delete associated attachments
    const task = await this.getTaskById(id);
    
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
    
    // Delete task comments
    await db('task_comments').where('task_id', id).delete();
    
    // Delete task
    await db('tasks').where('id', id).delete();
  }

  // Task Comments
  async addTaskComment(data: { task_id: string; user_id: string; comment: string }) {
    const [comment] = await db('task_comments')
      .insert({
        ...data,
        created_at: new Date(),
      })
      .returning('*');
    return comment;
  }

  async getTaskComments(taskId: string) {
    return await db('task_comments')
      .select(
        'task_comments.*',
        'profiles.full_name as commenter_name',
        'profiles.avatar_url as commenter_avatar'
      )
      .leftJoin('profiles', 'task_comments.user_id', 'profiles.user_id')
      .where('task_comments.task_id', taskId)
      .orderBy('task_comments.created_at', 'asc');
  }

  async deleteTaskComment(id: string) {
    await db('task_comments').where('id', id).delete();
  }

  // Statistics
  async getTaskStatistics(branchId?: string) {
    let query = db('tasks');
    
    if (branchId) {
      query = query.where('branch_id', branchId);
    }

    const totalTasks = await query.clone().count('* as count').first();
    const pendingTasks = await query.clone().where('status', 'pending').count('* as count').first();
    const inProgressTasks = await query.clone().where('status', 'in_progress').count('* as count').first();
    const completedTasks = await query.clone().where('status', 'completed').count('* as count').first();
    const overdueTasks = await query.clone()
      .where('status', '!=', 'completed')
      .where('due_date', '<', new Date())
      .count('* as count')
      .first();

    return {
      total: totalTasks?.count || 0,
      pending: pendingTasks?.count || 0,
      in_progress: inProgressTasks?.count || 0,
      completed: completedTasks?.count || 0,
      overdue: overdueTasks?.count || 0,
    };
  }
}

export const taskService = new TaskService();
