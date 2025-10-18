import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { CreateTrainerInput, UpdateTrainerInput, TrainerQueryInput } from '../validation/trainer.validation';

export class TrainerService {
  /**
   * Get all trainers with filters
   */
  async getTrainers(query: TrainerQueryInput, userRole: string, userBranchId?: string | null) {
    const { branch_id, is_active, specialization, search } = query;

    const where: any = {};

    // Branch filtering
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      where.branch_id = userBranchId;
    } else if (branch_id) {
      where.branch_id = branch_id;
    }

    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    if (specialization) {
      where.specialization = { contains: specialization, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } }
      ];
    }

    const trainers = await prisma.trainer_profiles.findMany({
      where,
      include: {
        branches: {
          select: { name: true, id: true }
        },
        _count: {
          select: {
            members: true,
            gym_classes: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return trainers;
  }

  /**
   * Get single trainer by ID
   */
  async getTrainerById(id: string) {
    const trainer = await prisma.trainer_profiles.findUnique({
      where: { id },
      include: {
        branches: true,
        profiles: {
          select: { email: true, full_name: true, phone: true }
        },
        _count: {
          select: {
            members: true,
            gym_classes: true
          }
        }
      }
    });

    if (!trainer) {
      throw new ApiError('Trainer not found', 404);
    }

    return trainer;
  }

  /**
   * Create new trainer
   */
  async createTrainer(data: CreateTrainerInput) {
    // Check if email already exists
    const existingTrainer = await prisma.trainer_profiles.findFirst({
      where: { email: data.email }
    });

    if (existingTrainer) {
      throw new ApiError('Trainer with this email already exists', 400);
    }

    // Verify branch exists
    const branch = await prisma.branches.findUnique({
      where: { id: data.branch_id }
    });

    if (!branch) {
      throw new ApiError('Branch not found', 404);
    }

    const trainer = await prisma.trainer_profiles.create({
      data: {
        ...data,
        joining_date: data.joining_date || new Date().toISOString()
      },
      include: {
        branches: {
          select: { name: true }
        }
      }
    });

    return trainer;
  }

  /**
   * Update trainer
   */
  async updateTrainer(id: string, data: UpdateTrainerInput) {
    await this.getTrainerById(id);

    const trainer = await prisma.trainer_profiles.update({
      where: { id },
      data,
      include: {
        branches: {
          select: { name: true }
        }
      }
    });

    return trainer;
  }

  /**
   * Delete trainer
   */
  async deleteTrainer(id: string) {
    const trainer = await this.getTrainerById(id);

    // Check if trainer has assigned members
    const memberCount = await prisma.members.count({
      where: { assigned_trainer_id: id }
    });

    if (memberCount > 0) {
      throw new ApiError('Cannot delete trainer with assigned members. Please reassign members first.', 400);
    }

    await prisma.trainer_profiles.delete({
      where: { id }
    });

    return { message: 'Trainer deleted successfully' };
  }

  /**
   * Get trainer schedule
   */
  async getTrainerSchedule(trainerId: string, startDate: string, endDate: string) {
    const classes = await prisma.gym_classes.findMany({
      where: {
        trainer_id: trainerId,
        start_time: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        branches: {
          select: { name: true }
        },
        _count: {
          select: {
            class_bookings: true
          }
        }
      },
      orderBy: { start_time: 'asc' }
    });

    return classes;
  }
}

export const trainerService = new TrainerService();
