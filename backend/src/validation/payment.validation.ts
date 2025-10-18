import { z } from 'zod';

// Payment gateway configuration schema
export const paymentGatewayConfigSchema = z.object({
  name: z.string().min(1, 'Gateway name is required'),
  type: z.enum(['razorpay', 'payu', 'phonepe', 'ccavenue']),
  is_active: z.boolean().optional().default(false),
  environment: z.enum(['sandbox', 'live']).optional().default('sandbox'),
  api_key: z.string().optional(),
  api_secret: z.string().optional(),
  merchant_id: z.string().optional(),
  webhook_secret: z.string().optional(),
  additional_config: z.record(z.any()).optional()
});

// Create payment order schema
export const createPaymentOrderSchema = z.object({
  member_id: z.string().min(1, 'Member ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('INR'),
  payment_type: z.enum(['membership', 'pos', 'invoice', 'training_fee']),
  gateway_type: z.enum(['razorpay', 'payu', 'phonepe', 'ccavenue']),
  invoice_id: z.string().optional(),
  membership_id: z.string().optional(),
  pos_order_id: z.string().optional(),
  training_package_id: z.string().optional(),
  description: z.string().optional()
});

// Verify payment schema
export const verifyPaymentSchema = z.object({
  payment_id: z.string().min(1, 'Payment ID is required'),
  gateway_response: z.record(z.any()),
  signature: z.string().optional()
});

// Payment link creation schema
export const createPaymentLinkSchema = z.object({
  member_id: z.string().min(1, 'Member ID is required'),
  amount: z.number().positive('Amount must be positive'),
  payment_type: z.enum(['membership', 'pos', 'invoice', 'training_fee']),
  description: z.string().optional(),
  expires_in_hours: z.number().int().positive().default(24)
});

// Refund request schema
export const createRefundSchema = z.object({
  payment_id: z.string().min(1, 'Payment ID is required'),
  amount: z.number().positive().optional(), // Partial refund if specified
  reason: z.string().optional()
});

// Payment query schema
export const paymentQuerySchema = z.object({
  member_id: z.string().optional(),
  payment_type: z.enum(['membership', 'pos', 'invoice', 'training_fee']).optional(),
  status: z.enum(['pending', 'processing', 'success', 'failed', 'cancelled']).optional(),
  gateway_type: z.enum(['razorpay', 'payu', 'phonepe', 'ccavenue']).optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50)
});

// Export types
export type PaymentGatewayConfigInput = z.infer<typeof paymentGatewayConfigSchema>;
export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type CreatePaymentLinkInput = z.infer<typeof createPaymentLinkSchema>;
export type CreateRefundInput = z.infer<typeof createRefundSchema>;
export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;
