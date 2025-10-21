import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const lockerService = {
  async getLockers(filters: any) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.branch_id) where.branch_id = filters.branch_id;

    const [lockers, total] = await Promise.all([
      prisma.lockers.findMany({
        where,
        skip,
        take: limit,
        orderBy: { locker_number: 'asc' },
        include: { locker_assignments: { where: { is_active: true }, include: { members: true } } }
      }),
      prisma.lockers.count({ where })
    ]);

    return { lockers, total, page, limit };
  },

  async getLockerById(id: string) {
    return await prisma.lockers.findUnique({
      where: { id },
      include: { locker_assignments: { include: { members: true } } }
    });
  },

  async createLocker(data: any) {
    return await prisma.lockers.create({ data });
  },

  async updateLocker(id: string, data: any) {
    return await prisma.lockers.update({ where: { id }, data });
  },

  async deleteLocker(id: string) {
    return await prisma.lockers.delete({ where: { id } });
  },

  async assignLocker(lockerId: string, data: any) {
    return await prisma.$transaction(async (tx) => {
      await tx.lockers.update({
        where: { id: lockerId },
        data: { status: 'occupied' }
      });

      return await tx.locker_assignments.create({
        data: {
          locker_id: lockerId,
          member_id: data.member_id,
          start_date: new Date(data.start_date),
          end_date: new Date(data.end_date),
          rental_amount: data.rental_amount,
          is_active: true
        }
      });
    });
  },

  async releaseLocker(lockerId: string, assignmentId: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.locker_assignments.update({
        where: { id: assignmentId },
        data: { is_active: false }
      });

      await tx.lockers.update({
        where: { id: lockerId },
        data: { status: 'available' }
      });
    });
  },

  // Locker Sizes Management
  async getLockerSizes(branchId?: string) {
    const where: any = {};
    if (branchId) where.branch_id = branchId;

    return await prisma.locker_sizes.findMany({
      where,
      orderBy: { name: 'asc' }
    });
  },

  async getLockerSizeById(id: string) {
    return await prisma.locker_sizes.findUnique({
      where: { id }
    });
  },

  async createLockerSize(data: any) {
    return await prisma.locker_sizes.create({ 
      data: {
        name: data.name,
        dimensions: data.dimensions,
        monthly_rate: data.monthly_rate,
        branch_id: data.branch_id,
        description: data.description
      }
    });
  },

  async updateLockerSize(id: string, data: any) {
    return await prisma.locker_sizes.update({ 
      where: { id }, 
      data 
    });
  },

  async deleteLockerSize(id: string) {
    return await prisma.locker_sizes.delete({ 
      where: { id } 
    });
  }
};
