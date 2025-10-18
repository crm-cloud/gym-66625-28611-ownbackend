import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const attendanceService = {
  async getAttendance(filters: any) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.member_id) where.member_id = filters.member_id;
    if (filters.branch_id) where.branch_id = filters.branch_id;
    if (filters.start_date || filters.end_date) {
      where.check_in_time = {};
      if (filters.start_date) where.check_in_time.gte = new Date(filters.start_date);
      if (filters.end_date) where.check_in_time.lte = new Date(filters.end_date);
    }

    const [attendance, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { check_in_time: 'desc' },
        include: { members: true }
      }),
      prisma.attendance.count({ where })
    ]);

    return { attendance, total, page, limit };
  },

  async createAttendance(data: any) {
    return await prisma.attendance.create({ data });
  },

  async updateAttendance(id: string, data: any) {
    return await prisma.attendance.update({ where: { id }, data });
  },

  async getDevices(branchId?: string) {
    const where: any = {};
    if (branchId) where.branch_id = branchId;
    return await prisma.attendance_devices.findMany({ where });
  },

  async createDevice(data: any) {
    return await prisma.attendance_devices.create({ data });
  },

  async updateDevice(id: string, data: any) {
    return await prisma.attendance_devices.update({ where: { id }, data });
  }
};
