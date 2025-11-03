import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';

export class DiscountService {
  /**
   * Validate discount code
   */
  async validateCode(
    code: string,
    userId: string,
    purchaseType: string,
    amount: number
  ) {
    // Get discount code
    const discount = await prisma.$queryRaw<any[]>`
      SELECT * FROM discount_codes
      WHERE code = ${code.toUpperCase()}
      AND is_active = true
      LIMIT 1
    `;

    if (!discount || discount.length === 0) {
      return {
        valid: false,
        message: 'Invalid discount code'
      };
    }

    const discountRecord = discount[0];

    // Check expiry
    const now = new Date();
    if (discountRecord.valid_from && new Date(discountRecord.valid_from) > now) {
      return {
        valid: false,
        message: 'Discount code is not yet valid'
      };
    }

    if (discountRecord.valid_until && new Date(discountRecord.valid_until) < now) {
      return {
        valid: false,
        message: 'Discount code has expired'
      };
    }

    // Check usage limit
    if (discountRecord.max_uses && discountRecord.current_uses >= discountRecord.max_uses) {
      return {
        valid: false,
        message: 'Discount code usage limit reached'
      };
    }

    // Check per-user usage limit
    const userUsageResult = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int as usage_count
      FROM discount_usage
      WHERE discount_id = ${discountRecord.id}
      AND user_id = ${userId}
    `;

    const userUsage = userUsageResult[0]?.usage_count || 0;
    if (discountRecord.max_uses_per_user && userUsage >= discountRecord.max_uses_per_user) {
      return {
        valid: false,
        message: 'You have already used this discount code the maximum number of times'
      };
    }

    // Check applicable purchase types
    if (discountRecord.applicable_types && !discountRecord.applicable_types.includes(purchaseType)) {
      return {
        valid: false,
        message: `This discount is not applicable for ${purchaseType}`
      };
    }

    // Check minimum amount
    if (discountRecord.min_purchase_amount && amount < discountRecord.min_purchase_amount) {
      return {
        valid: false,
        message: `Minimum purchase amount of ₹${discountRecord.min_purchase_amount} required`
      };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discountRecord.discount_type === 'percentage') {
      discountAmount = (amount * discountRecord.discount_value) / 100;
      if (discountRecord.max_discount_amount) {
        discountAmount = Math.min(discountAmount, discountRecord.max_discount_amount);
      }
    } else if (discountRecord.discount_type === 'fixed_amount') {
      discountAmount = discountRecord.discount_value;
    }

    return {
      valid: true,
      discountAmount: Math.round(discountAmount),
      discountType: discountRecord.discount_type,
      discountValue: discountRecord.discount_value,
      code: discountRecord.code,
      description: discountRecord.description
    };
  }

  /**
   * Get active discounts
   */
  async getActiveDiscounts() {
    const discounts = await prisma.$queryRaw`
      SELECT 
        id, code, description, discount_type, discount_value,
        min_purchase_amount, max_discount_amount, max_uses,
        current_uses, valid_from, valid_until, applicable_types
      FROM discount_codes
      WHERE is_active = true
      AND (valid_until IS NULL OR valid_until > NOW())
      ORDER BY created_at DESC
    `;

    return discounts;
  }

  /**
   * Record discount usage
   */
  async recordUsage(discountId: string, userId: string, orderId: string, discountAmount: number) {
    await prisma.$executeRaw`
      INSERT INTO discount_usage (id, discount_id, user_id, order_id, discount_amount, used_at)
      VALUES (gen_random_uuid(), ${discountId}, ${userId}, ${orderId}, ${discountAmount}, NOW())
    `;

    // Increment current uses
    await prisma.$executeRaw`
      UPDATE discount_codes
      SET current_uses = current_uses + 1
      WHERE id = ${discountId}
    `;
  }
}

export const discountService = new DiscountService();
