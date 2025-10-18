import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const equipmentService = {
  async getEquipment(filters: any) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;
    if (filters.branch_id) where.branch_id = filters.branch_id;
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    const [equipment, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.equipment.count({ where })
    ]);

    return { equipment, total, page, limit };
  },

  async getEquipmentById(id: string) {
    return await prisma.equipment.findUnique({ where: { id } });
  },

  async createEquipment(data: any) {
    return await prisma.equipment.create({ data });
  },

  async updateEquipment(id: string, data: any) {
    return await prisma.equipment.update({ where: { id }, data });
  },

  async deleteEquipment(id: string) {
    return await prisma.equipment.delete({ where: { id } });
  }
};
