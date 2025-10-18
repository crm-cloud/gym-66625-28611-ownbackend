import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import crypto from 'crypto';
import { 
  PaymentGatewayConfigInput, 
  CreatePaymentOrderInput, 
  VerifyPaymentInput,
  CreatePaymentLinkInput,
  CreateRefundInput,
  PaymentQueryInput
} from '../validation/payment.validation';

export class PaymentService {
  /**
   * Get payment gateway configurations
   */
  async getGatewayConfigs() {
    const configs = await prisma.$queryRaw`
      SELECT id, name, type, is_active, environment, created_at, updated_at
      FROM payment_gateways
      ORDER BY created_at DESC
    `;

    return configs;
  }

  /**
   * Get active gateway by type
   */
  async getActiveGateway(gatewayType: string) {
    const gateway = await prisma.$queryRaw<any[]>`
      SELECT * FROM payment_gateways
      WHERE type = ${gatewayType} AND is_active = true
      LIMIT 1
    `;

    if (!gateway || gateway.length === 0) {
      throw new ApiError(`No active ${gatewayType} gateway found`, 404);
    }

    return gateway[0];
  }

  /**
   * Update gateway configuration
   */
  async updateGatewayConfig(id: string, data: Partial<PaymentGatewayConfigInput>) {
    await prisma.$executeRaw`
      UPDATE payment_gateways
      SET 
        name = COALESCE(${data.name}, name),
        is_active = COALESCE(${data.is_active}, is_active),
        environment = COALESCE(${data.environment}, environment),
        api_key = COALESCE(${data.api_key}, api_key),
        api_secret = COALESCE(${data.api_secret}, api_secret),
        merchant_id = COALESCE(${data.merchant_id}, merchant_id),
        webhook_secret = COALESCE(${data.webhook_secret}, webhook_secret),
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return { message: 'Gateway configuration updated' };
  }

  /**
   * Create payment order
   */
  async createPaymentOrder(data: CreatePaymentOrderInput, initiatedBy: string) {
    const { member_id, amount, currency, payment_type, gateway_type, description } = data;

    // Get active gateway
    const gateway = await this.getActiveGateway(gateway_type);

    // Generate order ID and transaction ID
    const orderId = `ORD_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const txnId = `TXN_${Date.now()}_${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    // Create payment record
    await prisma.$executeRaw`
      INSERT INTO payments (
        id, txn_id, order_id, member_id, amount, currency, 
        payment_type, gateway_type, payment_method, status, 
        initiated_by
      )
      VALUES (
        ${crypto.randomUUID()}, ${txnId}, ${orderId}, ${member_id}, ${amount}, ${currency},
        ${payment_type}, ${gateway_type}, 'card', 'pending', ${initiatedBy}
      )
    `;

    // Generate gateway-specific order
    let gatewayOrderId = orderId;
    let paymentDetails: any = {
      orderId,
      txnId,
      amount,
      currency
    };

    if (gateway_type === 'razorpay') {
      // In production, you would call Razorpay API here
      gatewayOrderId = `razorpay_order_${crypto.randomBytes(8).toString('hex')}`;
      paymentDetails.key = gateway.api_key;
      paymentDetails.gatewayOrderId = gatewayOrderId;
    }

    return {
      success: true,
      orderId,
      txnId,
      gatewayOrderId,
      gateway_type,
      ...paymentDetails
    };
  }

  /**
   * Verify payment
   */
  async verifyPayment(data: VerifyPaymentInput) {
    const { payment_id, gateway_response, signature } = data;

    // Get payment
    const payment = await prisma.$queryRaw<any[]>`
      SELECT * FROM payments WHERE txn_id = ${payment_id} OR order_id = ${payment_id} LIMIT 1
    `;

    if (!payment || payment.length === 0) {
      throw new ApiError('Payment not found', 404);
    }

    const paymentRecord = payment[0];

    // Verify signature (implement gateway-specific logic)
    const isValid = this.verifyPaymentSignature(
      paymentRecord.gateway_type,
      gateway_response,
      signature
    );

    if (!isValid) {
      await prisma.$executeRaw`
        UPDATE payments 
        SET status = 'failed', failure_reason = 'Invalid signature', updated_at = NOW()
        WHERE id = ${paymentRecord.id}
      `;
      throw new ApiError('Payment verification failed', 400);
    }

    // Update payment status
    await prisma.$executeRaw`
      UPDATE payments 
      SET 
        status = 'success',
        payment_reference = ${gateway_response.paymentId || gateway_response.transaction_id},
        gateway_response = ${JSON.stringify(gateway_response)}::jsonb,
        completed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${paymentRecord.id}
    `;

    // Update related records (membership, invoice, etc.)
    await this.processSuccessfulPayment(paymentRecord);

    return {
      success: true,
      message: 'Payment verified successfully',
      payment: {
        txnId: paymentRecord.txn_id,
        amount: paymentRecord.amount,
        status: 'success'
      }
    };
  }

  /**
   * Create payment link
   */
  async createPaymentLink(data: CreatePaymentLinkInput, createdBy: string) {
    const { member_id, amount, payment_type, description, expires_in_hours } = data;

    const linkToken = crypto.randomBytes(32).toString('hex');
    const linkId = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expires_in_hours);

    await prisma.$executeRaw`
      INSERT INTO payment_links (
        id, payment_id, link_token, member_id, amount, 
        payment_type, description, expires_at, created_by
      )
      VALUES (
        ${linkId}, ${linkId}, ${linkToken}, ${member_id}, ${amount},
        ${payment_type}, ${description || null}, ${expiresAt}, ${createdBy}
      )
    `;

    return {
      linkId,
      linkToken,
      paymentUrl: `${process.env.FRONTEND_URL}/pay/${linkToken}`,
      expiresAt
    };
  }

  /**
   * Process refund
   */
  async processRefund(data: CreateRefundInput, processedBy: string) {
    const { payment_id, amount, reason } = data;

    // Get payment
    const payment = await prisma.$queryRaw<any[]>`
      SELECT * FROM payments WHERE txn_id = ${payment_id} OR id = ${payment_id} LIMIT 1
    `;

    if (!payment || payment.length === 0) {
      throw new ApiError('Payment not found', 404);
    }

    const paymentRecord = payment[0];

    if (paymentRecord.status !== 'success') {
      throw new ApiError('Can only refund successful payments', 400);
    }

    const refundAmount = amount || paymentRecord.amount;

    // In production, call gateway API for refund
    // For now, just update status

    await prisma.$executeRaw`
      UPDATE payments 
      SET 
        status = 'refunded',
        failure_reason = ${reason || 'Refund processed'},
        updated_at = NOW()
      WHERE id = ${paymentRecord.id}
    `;

    return {
      success: true,
      message: 'Refund processed successfully',
      refundAmount
    };
  }

  /**
   * Get payments with filters
   */
  async getPayments(query: PaymentQueryInput) {
    const { member_id, payment_type, status, gateway_type, from_date, to_date, page = 1, limit = 50 } = query;

    let whereConditions: string[] = [];
    if (member_id) whereConditions.push(`member_id = '${member_id}'`);
    if (payment_type) whereConditions.push(`payment_type = '${payment_type}'`);
    if (status) whereConditions.push(`status = '${status}'`);
    if (gateway_type) whereConditions.push(`gateway_type = '${gateway_type}'`);
    if (from_date) whereConditions.push(`created_at >= '${from_date}'`);
    if (to_date) whereConditions.push(`created_at <= '${to_date}'`);

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const [payments, totalResult] = await Promise.all([
      prisma.$queryRawUnsafe(`
        SELECT * FROM payments
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `),
      prisma.$queryRawUnsafe<any[]>(`
        SELECT COUNT(*)::int as total FROM payments ${whereClause}
      `)
    ]);

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    };
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(fromDate: string, toDate: string) {
    const analytics = await prisma.$queryRaw`
      SELECT 
        gateway_type,
        payment_type,
        COUNT(*)::int as total_transactions,
        COUNT(*) FILTER (WHERE status = 'success')::int as successful_transactions,
        COUNT(*) FILTER (WHERE status = 'failed')::int as failed_transactions,
        SUM(amount) FILTER (WHERE status = 'success') as successful_amount,
        AVG(amount) FILTER (WHERE status = 'success') as average_transaction_value,
        (COUNT(*) FILTER (WHERE status = 'success')::decimal / NULLIF(COUNT(*), 0) * 100) as success_rate
      FROM payments
      WHERE created_at >= ${fromDate}::timestamp AND created_at <= ${toDate}::timestamp
      GROUP BY gateway_type, payment_type
    `;

    return analytics;
  }

  /**
   * Helper: Verify payment signature
   */
  private verifyPaymentSignature(gatewayType: string, response: any, signature?: string): boolean {
    // Implement gateway-specific signature verification
    // For now, return true (in production, implement proper verification)
    return true;
  }

  /**
   * Helper: Process successful payment
   */
  private async processSuccessfulPayment(payment: any) {
    // Update related records based on payment_type
    if (payment.membership_id) {
      await prisma.$executeRaw`
        UPDATE members 
        SET status = 'active', updated_at = NOW()
        WHERE id = ${payment.member_id}
      `;
    }
    
    // Add more payment type processing as needed
  }
}

export const paymentService = new PaymentService();
