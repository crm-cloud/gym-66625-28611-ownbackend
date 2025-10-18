import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature, x-phonepe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const provider = url.searchParams.get('provider') as 'razorpay' | 'payu' | 'ccavenue' | 'phonepe';
    
    if (!provider) {
      throw new Error('Provider parameter required');
    }

    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || req.headers.get('x-phonepe-signature');

    console.log(`Webhook received for ${provider}`);

    let gatewayOrderId: string;
    let paymentId: string;
    let status: string;
    let webhookData: any;
    let paymentMethod: string = 'online';

    switch (provider) {
      case 'razorpay': {
        webhookData = JSON.parse(body);
        const entity = webhookData.payload?.payment?.entity || webhookData.payload?.order?.entity;
        gatewayOrderId = entity.order_id || entity.id;
        paymentId = entity.id;
        status = entity.status === 'captured' || entity.status === 'paid' ? 'completed' : 'failed';
        paymentMethod = entity.method || 'card';
        break;
      }
      case 'payu': {
        const params = new URLSearchParams(body);
        gatewayOrderId = params.get('txnid') || '';
        paymentId = params.get('mihpayid') || '';
        status = params.get('status') === 'success' ? 'completed' : 'failed';
        paymentMethod = params.get('mode') || 'card';
        webhookData = Object.fromEntries(params);
        break;
      }
      case 'ccavenue': {
        webhookData = { raw: body };
        const params = new URLSearchParams(body);
        gatewayOrderId = params.get('order_id') || '';
        paymentId = params.get('tracking_id') || '';
        status = params.get('order_status') === 'Success' ? 'completed' : 'failed';
        paymentMethod = params.get('payment_mode') || 'card';
        break;
      }
      case 'phonepe': {
        webhookData = JSON.parse(body);
        const data = webhookData.response?.data;
        gatewayOrderId = data?.merchantTransactionId || '';
        paymentId = data?.transactionId || '';
        status = webhookData.response?.code === 'PAYMENT_SUCCESS' ? 'completed' : 'failed';
        paymentMethod = data?.paymentInstrument?.type || 'upi';
        break;
      }
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    if (!gatewayOrderId) {
      throw new Error('Gateway order ID not found in webhook data');
    }

    // Update transaction
    const { data: transaction, error: txError } = await supabase
      .from('payment_gateway_transactions')
      .update({
        gateway_payment_id: paymentId,
        payment_method: paymentMethod,
        status,
        webhook_data: webhookData,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        failed_at: status === 'failed' ? new Date().toISOString() : null,
        error_message: status === 'failed' ? (webhookData.error?.description || 'Payment failed') : null,
      })
      .eq('gateway_order_id', gatewayOrderId)
      .select()
      .single();

    if (txError) {
      console.error('Transaction update error:', txError);
      throw txError;
    }

    if (!transaction) {
      throw new Error(`Transaction not found for gateway order ID: ${gatewayOrderId}`);
    }

    // If payment successful, update invoice and membership
    if (status === 'completed') {
      // Update invoice status
      if (transaction.invoice_id) {
        const { error: paymentError } = await supabase.rpc('record_invoice_payment', {
          p_invoice_id: transaction.invoice_id,
          p_amount: transaction.amount,
          p_payment_method: paymentMethod,
          p_reference: paymentId,
          p_notes: `Online payment via ${provider}`,
          p_payment_date: new Date().toISOString().split('T')[0],
        });

        if (paymentError) {
          console.error('Invoice payment recording error:', paymentError);
        }
      }

      // Update membership status
      if (transaction.membership_id) {
        const { error: membershipError } = await supabase
          .from('member_memberships')
          .update({
            payment_status: 'completed',
            status: 'active',
          })
          .eq('id', transaction.membership_id);

        if (membershipError) {
          console.error('Membership update error:', membershipError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, status, transactionId: transaction.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
