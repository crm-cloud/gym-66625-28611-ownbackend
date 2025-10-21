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
  },

  // Feedback Responses
  async createFeedbackResponse(feedbackId: string, response: string, respondedBy: string) {
    const feedbackExists = await prisma.feedback.findUnique({
      where: { id: feedbackId }
    });

    if (!feedbackExists) {
      throw new Error('Feedback not found');
    }

    const feedbackResponse = await prisma.feedback_responses.create({
      data: {
        feedback_id: feedbackId,
        response_text: response,
        responded_by: respondedBy
      }
    });

    // Update feedback status to responded
    await prisma.feedback.update({
      where: { id: feedbackId },
      data: { status: 'responded' }
    });

    return feedbackResponse;
  },

  async getFeedbackResponses(feedbackId: string) {
    return await prisma.feedback_responses.findMany({
      where: { feedback_id: feedbackId },
      orderBy: { created_at: 'desc' }
    });
  },

  async updateFeedbackResponse(responseId: string, responseText: string) {
    return await prisma.feedback_responses.update({
      where: { id: responseId },
      data: { 
        response_text: responseText,
        updated_at: new Date()
      }
    });
  },

  async deleteFeedbackResponse(responseId: string) {
    await prisma.feedback_responses.delete({
      where: { id: responseId }
    });
  }
};
