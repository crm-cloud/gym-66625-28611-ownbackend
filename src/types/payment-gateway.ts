export type PaymentProvider = 'razorpay' | 'payu' | 'ccavenue' | 'phonepe';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

export interface PaymentGatewayConfig {
  id: string;
  gym_id?: string;
  branch_id?: string;
  provider: PaymentProvider;
  api_key?: string;
  api_secret?: string;
  merchant_id?: string;
  salt_key?: string;
  access_code?: string;
  is_active: boolean;
  is_test_mode: boolean;
  webhook_secret?: string;
  webhook_url?: string;
  allowed_payment_methods: string[];
  auto_capture: boolean;
  currency: string;
  payment_gateway_fee_percent: number;
  gst_on_gateway_fee: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface PaymentGatewayTransaction {
  id: string;
  gateway_config_id?: string;
  provider: PaymentProvider;
  order_id: string;
  gateway_order_id?: string;
  gateway_payment_id?: string;
  amount: number;
  currency: string;
  gateway_fee: number;
  gst_amount: number;
  net_amount?: number;
  status: PaymentStatus;
  payment_method?: string;
  customer_id?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_name?: string;
  invoice_id?: string;
  membership_id?: string;
  gateway_response?: any;
  webhook_data?: any;
  error_message?: string;
  initiated_at: string;
  completed_at?: string;
  failed_at?: string;
  branch_id?: string;
  gym_id?: string;
  created_by?: string;
}

export interface CreatePaymentOrderParams {
  provider: PaymentProvider;
  amount: number;
  currency: string;
  invoiceId?: string;
  membershipId?: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  notes?: string;
  branchId?: string;
  discountCode?: string;
  rewardsUsed?: number;
}

export interface CreatePaymentOrderResponse {
  success: boolean;
  orderId: string;
  gatewayOrderId: string;
  provider: PaymentProvider;
  paymentUrl?: string;
  transactionId: string;
  apiKey?: string;
  error?: string;
}
