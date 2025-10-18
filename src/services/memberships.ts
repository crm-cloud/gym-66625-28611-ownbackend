import { addMonths } from 'date-fns';
import { api } from '@/lib/axios';
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
  try {
    // 1) Fetch plan
    const { data: plan } = await api.get(`/api/membership-plans/${data.planId}`);
    
    if (!plan) {
      throw new Error('Plan not found');
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

    // 4) Create membership
    const { data: insertedMembership } = await api.post('/api/subscriptions', membershipData);

    // 5) Update member's status
    await api.patch(`/api/members/${member.id}`, {
      membership_status: 'active',
      membership_plan: plan.name
    });

    // 6) Create invoice
    const invoiceData = {
      invoice_number: `INV-${Date.now()}`,
      customer_id: member.id,
      customer_name: member.fullName,
      customer_email: member.email,
      due_date: addMonths(new Date(), 1).toISOString().slice(0, 10),
      subtotal: base,
      tax: gstAmount,
      discount: flatDisc + (data.promoCode ? referralDisc : 0),
      total: finalAmount,
      status: 'draft',
      branch_id: branchId,
      membership_id: insertedMembership.id,
      date: new Date().toISOString().slice(0, 10)
    };

    const { data: invoice } = await api.post('/api/invoices', invoiceData);

    // 7) Handle referral bonuses if promo code exists
    if (data.promoCode) {
      try {
        await api.post('/api/referrals/process-bonus', {
          referral_code: data.promoCode,
          member_id: member.id,
          member_name: member.fullName
        });
      } catch (err) {
        console.error('Referral processing error:', err);
        // Don't fail the whole operation
      }
    }

    return {
      membershipId: insertedMembership?.id,
      invoiceId: invoice?.id,
      total: finalAmount
    };
  } catch (error) {
    console.error('Failed to assign membership:', error);
    throw error;
  }
}