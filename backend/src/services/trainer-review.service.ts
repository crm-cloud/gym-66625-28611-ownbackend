import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { 
  CreateTrainerReviewInput, 
  UpdateTrainerReviewInput,
  ReviewQueryInput 
} from '../validation/trainer-review.validation';

export class TrainerReviewService {
  /**
   * Create trainer review
   */
  async createReview(data: CreateTrainerReviewInput) {
    const { trainer_id, member_id, assignment_id, rating, review_text, professionalism_rating, knowledge_rating, communication_rating } = data;

    // Verify trainer exists
    const trainer = await prisma.$queryRaw<any[]>`
      SELECT id FROM trainers WHERE id = ${trainer_id}::uuid LIMIT 1
    `;

    if (!trainer || trainer.length === 0) {
      throw new ApiError('Trainer not found', 404);
    }

    // Verify member exists
    const member = await prisma.members.findUnique({
      where: { id: member_id }
    });

    if (!member) {
      throw new ApiError('Member not found', 404);
    }

    // Check if review already exists for this assignment
    if (assignment_id) {
      const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM trainer_reviews
        WHERE trainer_id = ${trainer_id}::uuid 
          AND member_id = ${member_id}::uuid
          AND assignment_id = ${assignment_id}::uuid
        LIMIT 1
      `;

      if (existing && existing.length > 0) {
        throw new ApiError('Review already exists for this assignment', 400);
      }
    }

    // Create review
    const reviewId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO trainer_reviews (
        id, trainer_id, member_id, assignment_id, rating, review_text,
        professionalism_rating, knowledge_rating, communication_rating
      )
      VALUES (
        ${reviewId}::uuid, ${trainer_id}::uuid, ${member_id}::uuid, ${assignment_id || null}::uuid,
        ${rating}, ${review_text || null}, ${professionalism_rating || null}::int,
        ${knowledge_rating || null}::int, ${communication_rating || null}::int
      )
    `;

    // Update trainer's average rating
    await this.updateTrainerRating(trainer_id);

    return await this.getReviewById(reviewId);
  }

  /**
   * Get reviews with filters
   */
  async getReviews(query: ReviewQueryInput) {
    const { trainer_id, member_id, min_rating, is_verified, is_featured, page = 1, limit = 50 } = query;

    let whereConditions: string[] = [];
    if (trainer_id) whereConditions.push(`tr.trainer_id = '${trainer_id}'::uuid`);
    if (member_id) whereConditions.push(`tr.member_id = '${member_id}'::uuid`);
    if (min_rating) whereConditions.push(`tr.rating >= ${min_rating}`);
    if (is_verified !== undefined) whereConditions.push(`tr.is_verified = ${is_verified}`);
    if (is_featured !== undefined) whereConditions.push(`tr.is_featured = ${is_featured}`);

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const [reviews, totalResult] = await Promise.all([
      prisma.$queryRawUnsafe(`
        SELECT 
          tr.*,
          t.full_name as trainer_name,
          m.name as member_name
        FROM trainer_reviews tr
        LEFT JOIN trainers t ON tr.trainer_id = t.id
        LEFT JOIN members m ON tr.member_id = m.id
        ${whereClause}
        ORDER BY tr.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `),
      prisma.$queryRawUnsafe<any[]>(`
        SELECT COUNT(*)::int as total FROM trainer_reviews tr ${whereClause}
      `)
    ]);

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    };
  }

  /**
   * Get review by ID
   */
  async getReviewById(id: string) {
    const review = await prisma.$queryRaw<any[]>`
      SELECT 
        tr.*,
        t.full_name as trainer_name,
        m.name as member_name
      FROM trainer_reviews tr
      LEFT JOIN trainers t ON tr.trainer_id = t.id
      LEFT JOIN members m ON tr.member_id = m.id
      WHERE tr.id = ${id}::uuid
      LIMIT 1
    `;

    if (!review || review.length === 0) {
      throw new ApiError('Review not found', 404);
    }

    return review[0];
  }

  /**
   * Update review
   */
  async updateReview(id: string, data: UpdateTrainerReviewInput) {
    const review = await this.getReviewById(id);

    const updates: string[] = [];
    if (data.rating) updates.push(`rating = ${data.rating}`);
    if (data.review_text !== undefined) updates.push(`review_text = ${data.review_text ? `'${data.review_text}'` : 'NULL'}`);
    if (data.professionalism_rating) updates.push(`professionalism_rating = ${data.professionalism_rating}`);
    if (data.knowledge_rating) updates.push(`knowledge_rating = ${data.knowledge_rating}`);
    if (data.communication_rating) updates.push(`communication_rating = ${data.communication_rating}`);
    if (data.is_verified !== undefined) updates.push(`is_verified = ${data.is_verified}`);
    if (data.is_featured !== undefined) updates.push(`is_featured = ${data.is_featured}`);
    updates.push(`updated_at = NOW()`);

    if (updates.length > 0) {
      await prisma.$executeRawUnsafe(`
        UPDATE trainer_reviews 
        SET ${updates.join(', ')}
        WHERE id = '${id}'::uuid
      `);
    }

    // Update trainer's average rating if rating changed
    if (data.rating) {
      await this.updateTrainerRating(review.trainer_id);
    }

    return await this.getReviewById(id);
  }

  /**
   * Delete review
   */
  async deleteReview(id: string) {
    const review = await this.getReviewById(id);

    await prisma.$executeRaw`
      DELETE FROM trainer_reviews WHERE id = ${id}::uuid
    `;

    // Update trainer's average rating
    await this.updateTrainerRating(review.trainer_id);

    return { message: 'Review deleted successfully' };
  }

  /**
   * Get trainer review summary
   */
  async getTrainerReviewSummary(trainerId: string) {
    const summary = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*)::int as total_reviews,
        AVG(rating)::decimal(3,2) as average_rating,
        AVG(professionalism_rating)::decimal(3,2) as avg_professionalism,
        AVG(knowledge_rating)::decimal(3,2) as avg_knowledge,
        AVG(communication_rating)::decimal(3,2) as avg_communication,
        COUNT(*) FILTER (WHERE rating = 5)::int as five_star,
        COUNT(*) FILTER (WHERE rating = 4)::int as four_star,
        COUNT(*) FILTER (WHERE rating = 3)::int as three_star,
        COUNT(*) FILTER (WHERE rating = 2)::int as two_star,
        COUNT(*) FILTER (WHERE rating = 1)::int as one_star
      FROM trainer_reviews
      WHERE trainer_id = ${trainerId}::uuid
    `;

    return summary[0] || {
      total_reviews: 0,
      average_rating: 0,
      avg_professionalism: 0,
      avg_knowledge: 0,
      avg_communication: 0,
      five_star: 0,
      four_star: 0,
      three_star: 0,
      two_star: 0,
      one_star: 0
    };
  }

  /**
   * Helper: Update trainer's average rating
   */
  private async updateTrainerRating(trainerId: string) {
    await prisma.$executeRaw`
      UPDATE trainers
      SET rating = (
        SELECT COALESCE(AVG(rating), 0)::decimal(3,2)
        FROM trainer_reviews
        WHERE trainer_id = ${trainerId}::uuid
      )
      WHERE id = ${trainerId}::uuid
    `;
  }
}

export const trainerReviewService = new TrainerReviewService();
