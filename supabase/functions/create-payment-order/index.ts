import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentOrderRequest {
  provider: 'razorpay' | 'payu' | 'ccavenue' | 'phonepe';
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: PaymentOrderRequest = await req.json();
    const { provider, amount, currency, invoiceId, membershipId, customerId, customerEmail, customerPhone, customerName, notes, branchId, discountCode, rewardsUsed } = body;

    let finalAmount = amount;
    let discountAmount = 0;
    let discountCodeId = null;

    // 1. Validate and apply discount code
    if (discountCode) {
      console.log('[create-payment-order] Validating discount code:', discountCode);
      const { data: discountData } = await supabase.functions.invoke('validate-discount-code', {
        body: { code: discountCode, userId: customerId, purchaseType: membershipId ? 'membership' : 'product', amount }
      });

      if (discountData?.valid) {
        discountAmount = discountData.discountAmount;
        discountCodeId = discountData.discountId;
        finalAmount -= discountAmount;
        console.log('[create-payment-order] Discount applied:', { discountAmount, finalAmount });
      } else {
        console.log('[create-payment-order] Discount validation failed:', discountData?.error);
      }
    }

    // 2. Validate and deduct rewards
    if (rewardsUsed && rewardsUsed > 0) {
      console.log('[create-payment-order] Processing rewards:', rewardsUsed);
      const { data: credits } = await supabase
        .from('member_credits')
        .select('balance')
        .eq('user_id', customerId)
        .single();

      if (!credits || credits.balance < rewardsUsed) {
        throw new Error('Insufficient rewards balance');
      }

      // Deduct rewards
      await supabase
        .from('member_credits')
        .update({ balance: credits.balance - rewardsUsed })
        .eq('user_id', customerId);

      // Log transaction
      await supabase.from('credit_transactions').insert({
        user_id: customerId,
        amount: -rewardsUsed,
        transaction_type: 'redemption',
        description: `Redeemed for payment`,
      });

      finalAmount -= rewardsUsed;
      console.log('[create-payment-order] Rewards applied:', { rewardsUsed, finalAmount });
    }

    // Fetch gateway config
    let query = supabase
      .from('payment_gateway_configs')
      .select('*')
      .eq('provider', provider)
      .eq('is_active', true);

    if (branchId) {
      query = query.or(`branch_id.eq.${branchId},gym_id.is.not.null`);
    }

    const { data: configs, error: configError } = await query.order('branch_id', { ascending: false, nullsFirst: false });

    if (configError || !configs || configs.length === 0) {
      throw new Error(`Payment gateway ${provider} not configured or inactive`);
    }

    const config = configs[0];

    let gatewayOrderId: string;
    let gatewayResponse: any;

    // Generate internal order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    switch (provider) {
      case 'razorpay':
        gatewayResponse = await createRazorpayOrder(config, finalAmount, currency, orderId);
        gatewayOrderId = gatewayResponse.id;
        break;
      case 'payu':
        gatewayResponse = await createPayUOrder(config, finalAmount, currency, orderId, customerEmail, customerPhone, customerName);
        gatewayOrderId = gatewayResponse.txnid;
        break;
      case 'ccavenue':
        gatewayResponse = await createCCAvenueOrder(config, finalAmount, currency, orderId, customerEmail, customerPhone, customerName);
        gatewayOrderId = gatewayResponse.order_id;
        break;
      case 'phonepe':
        gatewayResponse = await createPhonePeOrder(config, finalAmount, currency, orderId, customerPhone);
        gatewayOrderId = gatewayResponse.merchantTransactionId;
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    // Calculate gateway fees on final amount
    const gatewayFee = (finalAmount * (config.payment_gateway_fee_percent || 0)) / 100;
    const gstAmount = config.gst_on_gateway_fee ? (gatewayFee * 0.18) : 0;
    const netAmount = finalAmount - gatewayFee - gstAmount;

    // Store transaction with discount and rewards info
    const { data: transaction, error: txError } = await supabase
      .from('payment_gateway_transactions')
      .insert({
        gateway_config_id: config.id,
        provider,
        order_id: orderId,
        gateway_order_id: gatewayOrderId,
        amount: finalAmount,
        currency,
        gateway_fee: gatewayFee,
        gst_amount: gstAmount,
        net_amount: netAmount,
        status: 'pending',
        customer_id: customerId,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_name: customerName,
        invoice_id: invoiceId,
        membership_id: membershipId,
        gateway_response: gatewayResponse,
        branch_id: branchId,
        gym_id: config.gym_id,
        discount_code: discountCode,
        discount_amount: discountAmount,
        rewards_used: rewardsUsed || 0,
      })
      .select()
      .single();

    if (txError) throw txError;

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        gatewayOrderId,
        provider,
        paymentUrl: gatewayResponse.payment_url || null,
        transactionId: transaction.id,
        apiKey: config.api_key,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating payment order:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createRazorpayOrder(config: any, amount: number, currency: string, orderId: string) {
  const auth = btoa(`${config.api_key}:${config.api_secret}`);
  const baseUrl = config.is_test_mode ? 'https://api.razorpay.com' : 'https://api.razorpay.com';
  
  const response = await fetch(`${baseUrl}/v1/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: currency,
      receipt: orderId,
      notes: { order_id: orderId },
    }),
  });
  
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.description || 'Razorpay order creation failed');
  return result;
}

async function createPayUOrder(config: any, amount: number, currency: string, orderId: string, email: string, phone: string, name: string) {
  const hashString = `${config.api_key}|${orderId}|${amount}|GymFit|${name}|${email}|||||||||||${config.salt_key}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(hashString);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    txnid: orderId,
    hash: hashHex,
    payment_url: config.is_test_mode 
      ? 'https://test.payu.in/_payment' 
      : 'https://secure.payu.in/_payment',
    key: config.api_key,
  };
}

async function createCCAvenueOrder(config: any, amount: number, currency: string, orderId: string, email: string, phone: string, name: string) {
  return {
    order_id: orderId,
    payment_url: config.is_test_mode 
      ? 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction' 
      : 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
    access_code: config.access_code,
  };
}

async function createPhonePeOrder(config: any, amount: number, currency: string, orderId: string, phone: string) {
  const payload = {
    merchantId: config.merchant_id,
    merchantTransactionId: orderId,
    amount: Math.round(amount * 100),
    mobileNumber: phone,
  };
  
  const base64Payload = btoa(JSON.stringify(payload));
  const checksum = `${base64Payload}/pg/v1/pay${config.salt_key}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(checksum);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') + '###1';

  const apiUrl = config.is_test_mode 
    ? 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay' 
    : 'https://api.phonepe.com/apis/hermes/pg/v1/pay';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': hashHex,
    },
    body: JSON.stringify({ request: base64Payload }),
  });
  
  const result = await response.json();
  if (!result.success) throw new Error(result.message || 'PhonePe order creation failed');
  
  return {
    merchantTransactionId: orderId,
    payment_url: result.data?.instrumentResponse?.redirectInfo?.url,
  };
}
