import { prisma } from '../lib/prisma.js';
import { getFileUrl, deleteFile, getFilePath } from '../config/storage.js';

export class MemberProgressService {
  // Measurement History
  async createMeasurement(data: any) {
    return await prisma.memberMeasurements.create({
      data: {
        ...data,
        measuredDate: new Date(),
      },
    });
  }

  async getMemberMeasurements(memberId: string, limit?: number) {
    return await prisma.memberMeasurements.findMany({
      where: { memberId },
      orderBy: { measuredDate: 'desc' },
      take: limit,
    });
  }

  async getMeasurementById(id: string) {
    return await prisma.memberMeasurements.findUnique({
      where: { id },
    });
  }

  async updateMeasurement(id: string, data: any) {
    return await prisma.memberMeasurements.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async deleteMeasurement(id: string) {
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
    
    await prisma.memberMeasurements.delete({
      where: { id },
    });
  }

  // Member Goals
  async createGoal(data: any) {
    return await prisma.memberGoals.create({
      data: {
        ...data,
      },
    });
  }

  async getMemberGoals(memberId: string, status?: string) {
    return await prisma.memberGoals.findMany({
      where: {
        memberId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getGoalById(id: string) {
    return await prisma.memberGoals.findUnique({
      where: { id },
    });
  }

  async updateGoal(id: string, data: any) {
    return await prisma.memberGoals.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async updateGoalProgress(id: string, currentValue: number) {
    const goal = await this.getGoalById(id);
    
    if (!goal) {
      throw new Error('Goal not found');
    }
    
    // Check if goal is completed
    const status = (goal.targetValue && currentValue >= goal.targetValue)
      ? 'completed'
      : goal.status;
    
    return await prisma.memberGoals.update({
      where: { id },
      data: {
        currentValue,
        status,
        updatedAt: new Date(),
      },
    });
  }

  async deleteGoal(id: string) {
    await prisma.memberGoals.delete({
      where: { id },
    });
  }

  // Progress Summary
  async getProgressSummary(memberId: string) {
    const [latestMeasurement, firstMeasurement, activeGoals, completedGoals, totalAttendance, thisMonthAttendance, lastVisit] = await Promise.all([
      prisma.memberMeasurements.findFirst({
        where: { memberId },
        orderBy: { measuredDate: 'desc' },
      }),
      prisma.memberMeasurements.findFirst({
        where: { memberId },
        orderBy: { measuredDate: 'asc' },
      }),
      prisma.memberGoals.count({
        where: { 
          memberId,
          status: 'active',
        },
      }),
      prisma.memberGoals.count({
        where: { 
          memberId,
          status: 'completed',
        },
      }),
      prisma.attendanceRecords.count({
        where: { memberId },
      }),
      prisma.attendanceRecords.count({
        where: { 
          memberId,
          checkInTime: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.attendanceRecords.findFirst({
        where: { memberId },
        orderBy: { checkInTime: 'desc' },
      }),
    ]);

    return {
      current_weight: latestMeasurement?.weight,
      weight_change: latestMeasurement && firstMeasurement 
        ? latestMeasurement.weight - firstMeasurement.weight 
        : null,
      current_body_fat: latestMeasurement?.bodyFatPercentage,
      body_fat_change: latestMeasurement && firstMeasurement
        ? latestMeasurement.bodyFatPercentage - firstMeasurement.bodyFatPercentage
        : null,
      active_goals_count: activeGoals || 0,
      completed_goals_count: completedGoals || 0,
      total_visits: totalAttendance || 0,
      visits_this_month: thisMonthAttendance || 0,
      last_visit: lastVisit?.checkInTime,
    };
  }

  // Progress Photos
  async saveProgressPhoto(data: { member_id: string; photo_url: string; photo_type: string; notes?: string }) {
    return await prisma.memberProgressPhotos.create({
      data: {
        memberId: data.member_id,
        photoUrl: data.photo_url,
        photoType: data.photo_type,
        notes: data.notes,
      },
    });
  }

  async getMemberProgressPhotos(memberId: string) {
    return await prisma.memberProgressPhotos.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteProgressPhoto(id: string) {
    const photo = await prisma.memberProgressPhotos.findUnique({
      where: { id },
    });
    
    if (photo?.photoUrl) {
      try {
        const filename = photo.photoUrl.split('/').pop();
        if (filename) {
          await deleteFile(getFilePath('attachments', filename));
        }
      } catch (error) {
        console.error('Failed to delete photo file:', error);
      }
    }
    
    await prisma.memberProgressPhotos.delete({
      where: { id },
    });
  }
}

export const memberProgressService = new MemberProgressService();
