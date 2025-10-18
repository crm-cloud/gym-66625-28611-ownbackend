import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { CreateClassInput, UpdateClassInput, ClassQueryInput } from '../validation/class.validation';

export class ClassService {
  /**
   * Get all classes with filters
   */
  async getClasses(query: ClassQueryInput, userRole: string, userBranchId?: string | null) {
    const { branch_id, trainer_id, status, class_type, from_date, to_date } = query;

    const where: any = {};

    // Branch filtering
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      where.branch_id = userBranchId;
    } else if (branch_id) {
      where.branch_id = branch_id;
    }

    if (trainer_id) {
      where.trainer_id = trainer_id;
    }

    if (status) {
      where.status = status;
    }

    if (class_type) {
      where.class_type = class_type;
    }

    if (from_date || to_date) {
      where.start_time = {};
      if (from_date) {
        where.start_time.gte = from_date;
      }
      if (to_date) {
        where.start_time.lte = to_date;
      }
    }

    const classes = await prisma.gym_classes.findMany({
      where,
      include: {
        branches: {
          select: { name: true, id: true }
        },
        trainer_profiles: {
          select: { name: true, id: true, specialization: true }
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

  /**
   * Get single class by ID
   */
  async getClassById(id: string) {
    const gymClass = await prisma.gym_classes.findUnique({
      where: { id },
      include: {
        branches: true,
        trainer_profiles: true,
        _count: {
          select: {
            class_bookings: true
          }
        }
      }
    });

    if (!gymClass) {
      throw new ApiError('Class not found', 404);
    }

    return gymClass;
  }

  /**
   * Create new class
   */
  async createClass(data: CreateClassInput) {
    // Verify branch exists
    const branch = await prisma.branches.findUnique({
      where: { id: data.branch_id }
    });

    if (!branch) {
      throw new ApiError('Branch not found', 404);
    }

    // Verify trainer exists
    const trainer = await prisma.trainer_profiles.findUnique({
      where: { id: data.trainer_id }
    });

    if (!trainer) {
      throw new ApiError('Trainer not found', 404);
    }

    // Check if trainer is available at this time
    const conflictingClass = await prisma.gym_classes.findFirst({
      where: {
        trainer_id: data.trainer_id,
        status: { in: ['scheduled', 'ongoing'] },
        OR: [
          {
            AND: [
              { start_time: { lte: data.start_time } },
              { end_time: { gt: data.start_time } }
            ]
          },
          {
            AND: [
              { start_time: { lt: data.end_time } },
              { end_time: { gte: data.end_time } }
            ]
          }
        ]
      }
    });

    if (conflictingClass) {
      throw new ApiError('Trainer is not available at this time', 400);
    }

    const gymClass = await prisma.gym_classes.create({
      data,
      include: {
        branches: {
          select: { name: true }
        },
        trainer_profiles: {
          select: { name: true }
        }
      }
    });

    return gymClass;
  }

  /**
   * Update class
   */
  async updateClass(id: string, data: UpdateClassInput) {
    await this.getClassById(id);

    const gymClass = await prisma.gym_classes.update({
      where: { id },
      data,
      include: {
        branches: {
          select: { name: true }
        },
        trainer_profiles: {
          select: { name: true }
        }
      }
    });

    return gymClass;
  }

  /**
   * Delete class
   */
  async deleteClass(id: string) {
    const gymClass = await this.getClassById(id);

    // Check if class has bookings
    const bookingCount = await prisma.class_bookings.count({
      where: { class_id: id }
    });

    if (bookingCount > 0) {
      throw new ApiError('Cannot delete class with existing bookings. Please cancel bookings first.', 400);
    }

    await prisma.gym_classes.delete({
      where: { id }
    });

    return { message: 'Class deleted successfully' };
  }

  /**
   * Get upcoming classes
   */
  async getUpcomingClasses(branchId?: string, limit: number = 10) {
    const where: any = {
      status: 'scheduled',
      start_time: {
        gte: new Date().toISOString()
      }
    };

    if (branchId) {
      where.branch_id = branchId;
    }

    const classes = await prisma.gym_classes.findMany({
      where,
      include: {
        branches: {
          select: { name: true }
        },
        trainer_profiles: {
          select: { name: true, specialization: true }
        },
        _count: {
          select: {
            class_bookings: true
          }
        }
      },
      orderBy: { start_time: 'asc' },
      take: limit
    });

    return classes;
  }
}

export const classService = new ClassService();
