import { addMonths } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { MembershipFormData } from '@/types/membership';

export interface AssignMembershipInput {
  member: {
    id: string;
    fullName: string;
    email?: string | null;
    userId?: string | null;
  };
  data: MembershipFormData;
  assignedBy: string; // Made required as it's needed for created_by
  branchId?: string;
  notes?: string;
}

export interface AssignMembershipResult {
  membershipId?: string;
  invoiceId?: string;
  total: number;
}

export async function assignMembership({ 
  member, 
  data, 
  assignedBy,
  branchId,
  notes
}: AssignMembershipInput): Promise<AssignMembershipResult> {
  // 1) Fetch plan
  const { data: plan, error: planErr } = await supabase
    .from('membership_plans')
    .select('id, name, price, duration_months')
    .eq('id', data.planId)
    .single();
  
  if (planErr || !plan) {
    throw new Error(planErr?.message || 'Plan not found');
  }

  const price = Number(plan.price || 0);

  // 2) Calculate discounts
  const referralDisc = data.promoCode ? Math.round(price * 0.1) : 0; // 10% referral
  const pctDisc = Math.round(price * ((data.discountPercent || 0) / 100));
  const flatDisc = Math.round(data.discountAmount || 0);
  const base = Math.max(0, price - referralDisc - pctDisc - flatDisc);

  // 3) Calculate GST
  let gstAmount = 0;
  let finalAmount = base;
  
  if (data.gstEnabled) {
    const rate = (data.gstRate || 0) / 100;
    if (data.reverseGst && data.totalInclGst) {
      const incl = Math.round(data.totalInclGst);
      const baseFromIncl = Math.round(incl / (1 + rate));
      gstAmount = Math.max(0, incl - baseFromIncl);
      finalAmount = incl;
    } else {
      gstAmount = Math.round(base * rate);
      finalAmount = base + gstAmount;
    }
  }

  // 4) Insert membership
  const startDate = data.startDate;
  const endDate = addMonths(startDate, plan.duration_months || 0);
  const startDateISO = startDate.toISOString().slice(0, 10);
  const endDateISO = endDate.toISOString().slice(0, 10);

  const membershipData = {
    user_id: member.userId || null,
    membership_plan_id: data.planId,
    start_date: startDateISO,
    end_date: endDateISO,
    status: 'active' as 'active',
    payment_amount: finalAmount,
    payment_status: 'pending' as 'pending',
    final_amount: finalAmount,
    gst_enabled: data.gstEnabled,
    gst_amount: gstAmount,
    discount_amount: flatDisc + (data.promoCode ? referralDisc : 0),
    discount_percent: data.discountPercent || 0,
    assigned_by: assignedBy,
    branch_id: branchId,
    notes: notes
  };

  // 1. First, create the membership
  const { data: insertedMembership, error: mmErr } = await supabase
    .from('member_memberships')
    .insert(membershipData)
    .select('id')
    .single();

  if (mmErr) {
    console.error('Membership insert error:', {
      error: mmErr,
      membershipData
    });
    throw mmErr;
  }

  // 2. Update member's status
  const { error: memErr } = await supabase
    .from('members')
    .update({ 
      membership_status: 'active',
      membership_plan: plan.name
    })
    .eq('id', member.id);

  if (memErr) {
    console.error('Member update error:', memErr);
    throw memErr;
  }

  // 3. Create invoice
const invoiceNumber = `INV-${Date.now()}`;
const invoiceData = {
  invoice_number: invoiceNumber,
  customer_id: member.id,
  customer_name: member.fullName,
  customer_email: member.email,
  due_date: addMonths(new Date(), 1).toISOString().slice(0, 10),
  subtotal: base,
  tax: gstAmount,
  discount: flatDisc + (data.promoCode ? referralDisc : 0),
  total: finalAmount,
  status: 'draft' as 'draft',
  branch_id: branchId,
  membership_id: insertedMembership.id,
  created_by: assignedBy,
  // Add date field which might be required
  date: new Date().toISOString().slice(0, 10)
};

console.log('Attempting to create invoice with data:', invoiceData);

let invoice;
try {
  const { data: invoiceResult, error: invErr } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select('id')
    .single();

  if (invErr) {
    console.error('Invoice creation error details:', {
      error: invErr,
      requestData: invoiceData,
      errorDetails: {
        code: invErr.code,
        message: invErr.message,
        details: invErr.details,
        hint: invErr.hint
      }
    });
    throw invErr;
  }

  invoice = invoiceResult;
  console.log('Invoice created successfully:', invoice);
} catch (error) {
  console.error('Unexpected error during invoice creation:', {
    error,
    invoiceData
  });
  throw error; // Re-throw to be caught by the caller
}

  // 4. Handle referral bonuses if promo code exists
  if (data.promoCode) {
    try {
      const { data: referral } = await supabase
        .from('referrals')
        .select('id, referrer_id, referred_id, membership_bonus_amount')
        .eq('referral_code', data.promoCode)
        .single();

      if (referral) {
        const bonusAmount = referral.membership_bonus_amount || 2500; // Default bonus
        
        // Credit referrer
        if (referral.referrer_id) {
          await supabase.from('referral_bonuses').insert([{
            referral_id: referral.id,
            user_id: referral.referrer_id,
            bonus_type: 'referral_membership',
            amount: bonusAmount,
            description: `Referral bonus for ${member.fullName}'s membership`
          }]);
        }

        // Credit referred user (if different from the member)
        if (referral.referred_id && referral.referred_id !== member.userId) {
          await supabase.from('referral_bonuses').insert([{
            referral_id: referral.id,
            user_id: referral.referred_id,
            bonus_type: 'referral_membership',
            amount: bonusAmount,
            description: 'Referred member bonus'
          }]);
        }

        // Mark referral as completed
        await supabase
          .from('referrals')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', referral.id);
      }
    } catch (err) {
      console.error('Referral processing error:', err);
      // Don't fail the whole operation if referral bonus fails
    }
  }

  return {
    membershipId: insertedMembership?.id,
    invoiceId: invoice?.id,
    total: finalAmount
  };
}