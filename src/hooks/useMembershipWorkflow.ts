import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
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
          address: memberData.address,
          emergency_contact: memberData.emergencyContact,
          profile_photo: memberData.profilePhoto,
          branch_id: currentBranchId || memberData.branchId,
        };

        const { data: member } = await api.post('/api/members', memberPayload);

        // Step 2: Get Membership Plan Details
        const { data: membershipPlan } = await api.get(`/api/membership-plans/${membershipPlanId}`);

        // Step 3: Calculate Pricing
        const originalPrice = membershipPlan.price;
        const discountAmount = membershipData.discountAmount || (originalPrice * (membershipData.discountPercent || 0)) / 100;
        const subtotal = originalPrice - discountAmount;
        const gstAmount = membershipData.gstEnabled ? (subtotal * 0.18) : 0;
        const finalAmount = subtotal + gstAmount;

        // Step 4: Create Member Membership
        const membershipPayload = {
          user_id: member.id,
          membership_plan_id: membershipPlanId,
          start_date: membershipData.startDate.toISOString().split('T')[0],
          end_date: new Date(membershipData.startDate.getTime() + (membershipPlan.duration_months * 30 * 24 * 60 * 60 * 1000))
            .toISOString().split('T')[0],
          status: 'active',
          payment_status: 'pending',
          payment_amount: finalAmount,
          branch_id: currentBranchId || memberData.branchId,
          notes: `Membership plan: ${membershipPlan.name}`,
          discount_percent: membershipData.discountPercent || 0,
          discount_amount: discountAmount,
          gst_enabled: membershipData.gstEnabled,
          gst_amount: gstAmount,
          final_amount: finalAmount,
        };

        const { data: membership } = await api.post('/api/subscriptions', membershipPayload);

        // Step 5: Generate Invoice
        const invoiceNumber = `INV-${Date.now()}-${member.id.slice(-4)}`;
        const invoicePayload = {
          invoice_number: invoiceNumber,
          membership_id: membership.id,
          customer_id: member.id,
          customer_name: memberData.fullName,
          customer_email: memberData.email,
          date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          subtotal: originalPrice,
          discount: discountAmount,
          tax: gstAmount,
          total: finalAmount,
          status: 'draft',
          branch_id: currentBranchId || memberData.branchId,
          notes: `Membership: ${membershipPlan.name} (${membershipPlan.duration_months} months)`,
        };

        const { data: invoice } = await api.post('/api/invoices', invoicePayload);

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
        // Create payment transaction
        const paymentData = {
          invoice_id: invoiceId,
          amount,
          payment_method: paymentMethod,
          reference_number: referenceNumber,
          notes,
        };

        await api.post('/api/payments', paymentData);

        // Get invoice total to determine if fully paid
        const { data: invoice } = await api.get(`/api/invoices/${invoiceId}`);
        const newStatus = amount >= invoice.total ? 'paid' : 'sent';

        // Update invoice status
        await api.patch(`/api/invoices/${invoiceId}`, { status: newStatus });

        // Update membership status
        await api.patch(`/api/subscriptions/${membershipId}`, {
          payment_status: amount >= invoice.total ? 'completed' : 'pending',
          status: 'active'
        });

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
