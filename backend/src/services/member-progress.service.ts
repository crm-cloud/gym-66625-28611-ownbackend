import { db } from '../config/database';
import { getFileUrl, deleteFile, getFilePath } from '../config/storage';

export class MemberProgressService {
  // Measurement History
  async createMeasurement(data: any) {
    const [measurement] = await db('member_measurements')
      .insert({
        ...data,
        created_at: new Date(),
      })
      .returning('*');
    return measurement;
  }

  async getMemberMeasurements(memberId: string, limit?: number) {
    let query = db('member_measurements')
      .where('member_id', memberId)
      .orderBy('measured_date', 'desc');
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }

  async getMeasurementById(id: string) {
    return await db('member_measurements')
      .where('id', id)
      .first();
  }

  async updateMeasurement(id: string, data: any) {
    const [updated] = await db('member_measurements')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date(),
      })
      .returning('*');
    return updated;
  }

  async deleteMeasurement(id: string) {
    // Get measurement to delete associated images
    const measurement = await this.getMeasurementById(id);
    
    if (measurement?.images) {
      for (const imageUrl of measurement.images) {
        try {
          const filename = imageUrl.split('/').pop();
          if (filename) {
            await deleteFile(getFilePath('attachments', filename));
          }
        } catch (error) {
          console.error('Failed to delete image:', error);
        }
      }
    }
    
    await db('member_measurements').where('id', id).delete();
  }

  // Member Goals
  async createGoal(data: any) {
    const [goal] = await db('member_goals')
      .insert({
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');
    return goal;
  }

  async getMemberGoals(memberId: string, status?: string) {
    let query = db('member_goals')
      .where('member_id', memberId)
      .orderBy('created_at', 'desc');
    
    if (status) {
      query = query.where('status', status);
    }
    
    return await query;
  }

  async getGoalById(id: string) {
    return await db('member_goals')
      .where('id', id)
      .first();
  }

  async updateGoal(id: string, data: any) {
    const [updated] = await db('member_goals')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date(),
      })
      .returning('*');
    return updated;
  }

  async updateGoalProgress(id: string, currentValue: number) {
    const goal = await this.getGoalById(id);
    
    if (!goal) {
      throw new Error('Goal not found');
    }
    
    // Check if goal is completed
    let status = goal.status;
    if (goal.target_value && currentValue >= goal.target_value) {
      status = 'completed';
    }
    
    const [updated] = await db('member_goals')
      .where('id', id)
      .update({
        current_value: currentValue,
        status,
        updated_at: new Date(),
      })
      .returning('*');
    return updated;
  }

  async deleteGoal(id: string) {
    await db('member_goals').where('id', id).delete();
  }

  // Progress Summary
  async getProgressSummary(memberId: string) {
    const latestMeasurement = await db('member_measurements')
      .where('member_id', memberId)
      .orderBy('measured_date', 'desc')
      .first();
    
    const firstMeasurement = await db('member_measurements')
      .where('member_id', memberId)
      .orderBy('measured_date', 'asc')
      .first();
    
    const activeGoals = await db('member_goals')
      .where('member_id', memberId)
      .where('status', 'active')
      .count('* as count')
      .first();
    
    const completedGoals = await db('member_goals')
      .where('member_id', memberId)
      .where('status', 'completed')
      .count('* as count')
      .first();
    
    const totalAttendance = await db('attendance_records')
      .where('member_id', memberId)
      .count('* as count')
      .first();
    
    const thisMonthAttendance = await db('attendance_records')
      .where('member_id', memberId)
      .where('check_in_time', '>=', new Date(new Date().getFullYear(), new Date().getMonth(), 1))
      .count('* as count')
      .first();
    
    const lastVisit = await db('attendance_records')
      .where('member_id', memberId)
      .orderBy('check_in_time', 'desc')
      .first();
    
    return {
      current_weight: latestMeasurement?.weight,
      weight_change: latestMeasurement && firstMeasurement 
        ? latestMeasurement.weight - firstMeasurement.weight 
        : null,
      current_body_fat: latestMeasurement?.body_fat_percentage,
      body_fat_change: latestMeasurement && firstMeasurement
        ? latestMeasurement.body_fat_percentage - firstMeasurement.body_fat_percentage
        : null,
      active_goals_count: activeGoals?.count || 0,
      completed_goals_count: completedGoals?.count || 0,
      total_visits: totalAttendance?.count || 0,
      visits_this_month: thisMonthAttendance?.count || 0,
      last_visit: lastVisit?.check_in_time,
    };
  }

  // Progress Photos
  async saveProgressPhoto(data: { member_id: string; photo_url: string; photo_type: string; notes?: string }) {
    const [photo] = await db('member_progress_photos')
      .insert({
        ...data,
        created_at: new Date(),
      })
      .returning('*');
    return photo;
  }

  async getMemberProgressPhotos(memberId: string) {
    return await db('member_progress_photos')
      .where('member_id', memberId)
      .orderBy('created_at', 'desc');
  }

  async deleteProgressPhoto(id: string) {
    const photo = await db('member_progress_photos')
      .where('id', id)
      .first();
    
    if (photo?.photo_url) {
      try {
        const filename = photo.photo_url.split('/').pop();
        if (filename) {
          await deleteFile(getFilePath('attachments', filename));
        }
      } catch (error) {
        console.error('Failed to delete photo file:', error);
      }
    }
    
    await db('member_progress_photos').where('id', id).delete();
  }
}

export const memberProgressService = new MemberProgressService();
