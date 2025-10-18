import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBranchContext } from '@/hooks/useBranchContext';
import type { MemberFormData } from '@/types/member';
import type { MembershipFormData } from '@/types/membership';

interface MembershipWorkflowData {
  memberData: MemberFormData;
  membershipData: MembershipFormData;
  membershipPlanId: string;
}

interface WorkflowResult {
  memberId: string;
  membershipId: string;
  invoiceId: string;
  success: boolean;
}

export const useMembershipWorkflow = () => {
  const { authState } = useAuth();
  const { currentBranchId } = useBranchContext();
  const [currentStep, setCurrentStep] = useState<'member' | 'membership' | 'payment' | 'complete'>('member');

  const executeWorkflow = useMutation({
    mutationFn: async (data: MembershipWorkflowData): Promise<WorkflowResult> => {
      const { memberData, membershipData, membershipPlanId } = data;

      try {
        // Step 1: Create Member
        const memberPayload = {
          full_name: memberData.fullName,
          email: memberData.email,
          phone: memberData.phone,
          date_of_birth: memberData.dateOfBirth ? memberData.dateOfBirth.toISOString().split('T')[0] : undefined,
          gender: memberData.gender,
          address: memberData.address as any, // JSON field
          emergency_contact: memberData.emergencyContact as any, // JSON field
          profile_photo: memberData.profilePhoto,
          branch_id: currentBranchId || memberData.branchId,
          created_by: authState.user?.id,
        };

        const { data: member, error: memberError } = await supabase
          .from('members')
          .insert(memberPayload)
          .select('id')
          .single();

        if (memberError) throw memberError;

        // Step 2: Get Membership Plan Details
        const { data: membershipPlan, error: planError } = await supabase
          .from('membership_plans')
          .select('*')
          .eq('id', membershipPlanId)
          .single();

        if (planError) throw planError;

        // Step 3: Calculate Pricing
        const originalPrice = membershipPlan.price;
        const discountAmount = membershipData.discountAmount || (originalPrice * (membershipData.discountPercent || 0)) / 100;
        const subtotal = originalPrice - discountAmount;
        const gstAmount = membershipData.gstEnabled ? (subtotal * 0.18) : 0; // 18% GST
        const finalAmount = subtotal + gstAmount;

        // Step 4: Create Member Membership
        const membershipPayload = {
          user_id: member.id,
          membership_plan_id: membershipPlanId,
          start_date: membershipData.startDate.toISOString().split('T')[0],
          end_date: new Date(membershipData.startDate.getTime() + (membershipPlan.duration_months * 30 * 24 * 60 * 60 * 1000))
            .toISOString().split('T')[0],
          status: 'active' as 'active',
          payment_status: 'pending' as 'pending',
          payment_amount: finalAmount,
          assigned_by: authState.user?.id,
          branch_id: currentBranchId || memberData.branchId,
          notes: `Membership plan: ${membershipPlan.name}`,
          discount_percent: membershipData.discountPercent || 0,
          discount_amount: discountAmount,
          gst_enabled: membershipData.gstEnabled,
          gst_amount: gstAmount,
          final_amount: finalAmount,
        };

        const { data: membership, error: membershipError } = await supabase
          .from('member_memberships')
          .insert(membershipPayload)
          .select('id')
          .single();

        if (membershipError) throw membershipError;

        // Step 5: Generate Invoice
        const invoiceNumber = `INV-${Date.now()}-${member.id.slice(-4)}`;
        const invoicePayload = {
          invoice_number: invoiceNumber,
          membership_id: membership.id,
          customer_id: member.id,
          customer_name: memberData.fullName,
          customer_email: memberData.email,
          date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          subtotal: originalPrice,
          discount: discountAmount,
          tax: gstAmount,
          total: finalAmount,
          status: 'draft' as 'draft',
          branch_id: currentBranchId || memberData.branchId,
          created_by: authState.user?.id,
          notes: `Membership: ${membershipPlan.name} (${membershipPlan.duration_months} months)`,
        };

        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert(invoicePayload)
          .select('id')
          .single();

        if (invoiceError) throw invoiceError;

        return {
          memberId: member.id,
          membershipId: membership.id,
          invoiceId: invoice.id,
          success: true,
        };
      } catch (error) {
        console.error('Membership workflow error:', error);
        throw error;
      }
    },
  });

  const processPayment = useMutation({
    mutationFn: async ({ 
      membershipId, 
      invoiceId, 
      amount, 
      paymentMethod, 
      referenceNumber, 
      notes 
    }: {
      membershipId: string;
      invoiceId: string;
      amount: number;
      paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet' | 'other';
      referenceNumber?: string;
      notes?: string;
    }) => {
      try {
        // Step 1: Create Transaction Record
        const { data: paymentMethodRecord } = await supabase
          .from('payment_methods')
          .select('id')
          .eq('type', paymentMethod)
          .single();

        const { data: categoryRecord } = await supabase
          .from('transaction_categories')
          .select('id')
          .eq('name', 'Membership Payment')
          .eq('type', 'income')
          .single();

        const transactionData = {
          date: new Date().toISOString().split('T')[0],
          type: 'income' as const,
          category_id: categoryRecord?.id,
          amount: amount,
          description: `Membership payment - Reference: ${referenceNumber || 'N/A'}`,
          payment_method_id: paymentMethodRecord?.id,
          reference: referenceNumber,
          status: 'completed' as const
        };

        const { error: transactionError } = await supabase
          .from('transactions')
          .insert(transactionData);

        if (transactionError) {
          console.warn('Failed to create transaction record:', transactionError);
        }

        // Step 2: Update Invoice Status
        const { data: invoice } = await supabase
          .from('invoices')
          .select('total')
          .eq('id', invoiceId)
          .single();

        const newStatus = amount >= (invoice?.total || 0) ? 'paid' : 'sent';
        
        const { error: invoiceUpdateError } = await supabase
          .from('invoices')
          .update({ status: newStatus as 'paid' | 'sent' })
          .eq('id', invoiceId);

        if (invoiceUpdateError) throw invoiceUpdateError;

        // Step 3: Update Membership Status
        const { error: membershipUpdateError } = await supabase
          .from('member_memberships')
          .update({ 
            payment_status: amount >= (invoice?.total || 0) ? 'completed' as 'completed' : 'pending' as 'pending',
            status: 'active' as 'active'
          })
          .eq('id', membershipId);

        if (membershipUpdateError) throw membershipUpdateError;

        return { success: true };
      } catch (error) {
        console.error('Payment processing error:', error);
        throw error;
      }
    },
  });

  return {
    executeWorkflow,
    processPayment,
    currentStep,
    setCurrentStep,
    isLoading: executeWorkflow.isPending || processPayment.isPending,
  };
};