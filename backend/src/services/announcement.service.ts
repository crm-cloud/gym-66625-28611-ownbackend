import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const announcementService = {
  async getAnnouncements(filters: any) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.target_audience) where.target_audience = filters.target_audience;
    if (filters.priority) where.priority = filters.priority;
    if (filters.is_published !== undefined) where.is_published = filters.is_published;
    if (filters.branch_id) {
      where.OR = [{ branch_id: filters.branch_id }, { branch_id: null }];
    }

    const [announcements, total] = await Promise.all([
      prisma.announcements.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.announcements.count({ where })
    ]);

    return { announcements, total, page, limit };
  },

  async getAnnouncementById(id: string) {
    return await prisma.announcements.findUnique({ where: { id } });
  },

  async createAnnouncement(data: any) {
    return await prisma.announcements.create({ data });
  },

  async updateAnnouncement(id: string, data: any) {
    return await prisma.announcements.update({ where: { id }, data });
  },

  async deleteAnnouncement(id: string) {
    return await prisma.announcements.delete({ where: { id } });
  }
};
