import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const feedbackService = {
  async getFeedback(filters: any) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.member_id) where.member_id = filters.member_id;
    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;
    if (filters.rating) where.rating = parseInt(filters.rating);
    if (filters.branch_id) where.branch_id = filters.branch_id;

    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { members: true }
      }),
      prisma.feedback.count({ where })
    ]);

    return { feedback, total, page, limit };
  },

  async getFeedbackById(id: string) {
    return await prisma.feedback.findUnique({
      where: { id },
      include: { members: true }
    });
  },

  async createFeedback(data: any) {
    return await prisma.feedback.create({ data });
  },

  async updateFeedback(id: string, data: any) {
    return await prisma.feedback.update({ where: { id }, data });
  }
};
