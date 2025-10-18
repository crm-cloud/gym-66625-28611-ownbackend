import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { code, userId, purchaseType, amount } = await req.json();

    console.log('[validate-discount-code] Validating:', { code, userId, purchaseType, amount });

    // Fetch discount code
    const { data: discount, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !discount) {
      console.log('[validate-discount-code] Code not found or inactive');
      return new Response(JSON.stringify({ valid: false, error: 'Invalid discount code' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate date range
    const now = new Date();
    if (discount.valid_from && new Date(discount.valid_from) > now) {
      return new Response(JSON.stringify({ valid: false, error: 'Discount not yet valid' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (discount.valid_until && new Date(discount.valid_until) < now) {
      return new Response(JSON.stringify({ valid: false, error: 'Discount expired' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate usage limit
    if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
      return new Response(JSON.stringify({ valid: false, error: 'Discount code usage limit reached' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate minimum purchase
    if (discount.min_purchase_amount && amount < discount.min_purchase_amount) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: `Minimum purchase amount is ₹${discount.min_purchase_amount}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate applicable to
    if (discount.applicable_to && discount.applicable_to.length > 0) {
      if (!discount.applicable_to.includes(purchaseType)) {
        return new Response(JSON.stringify({ 
          valid: false, 
          error: `Discount not applicable to ${purchaseType}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.discount_type === 'percent') {
      discountAmount = Math.round((amount * discount.discount_value) / 100 * 100) / 100;
      if (discount.max_discount_amount) {
        discountAmount = Math.min(discountAmount, discount.max_discount_amount);
      }
    } else {
      discountAmount = discount.discount_value;
    }

    console.log('[validate-discount-code] Valid discount:', { discountAmount });

    return new Response(JSON.stringify({
      valid: true,
      discountId: discount.id,
      discountAmount,
      discountType: discount.discount_type,
      discountValue: discount.discount_value,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[validate-discount-code] Error:', error);
    return new Response(JSON.stringify({ valid: false, error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
