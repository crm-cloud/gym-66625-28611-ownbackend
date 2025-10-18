import { supabase } from '@/integrations/supabase/client';
import type { MembershipPlan } from '@/types/membership';

export interface CreateCheckoutSessionParams {
  planId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export const membershipService = {
  async createPlan(input: {
    name: string;
    description: string;
    price: number;
    duration_months: number;
    features: string[];
    is_active: boolean;
    branch_id: string;
    session_allotments?: Record<string, number>;
  }): Promise<MembershipPlan> {
    try {
      const payload = {
        name: input.name,
        description: input.description,
        price: input.price,
        duration_months: input.duration_months,
        features: input.features,
        is_active: input.is_active,
        branch_id: input.branch_id,
        session_allotments: input.session_allotments ?? {},
      };

      const { data, error } = await supabase
        .from('membership_plans')
        .insert(payload)
        .select('*')
        .single();

      if (error) throw error;
      return data as MembershipPlan;
    } catch (error) {
      console.error('Failed to create membership plan:', error);
      throw error;
    }
  },
  async getAvailablePlans(): Promise<MembershipPlan[]> {
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch membership plans:', error);
      throw error;
    }
  },

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<{ sessionId: string; url: string }> {
    try {
      // This would typically call a Supabase edge function for payment processing
      throw new Error('Payment processing not implemented yet');
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw error;
    }
  },

  async getPlanDetails(planId: string): Promise<MembershipPlan> {
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Failed to fetch plan ${planId}:`, error);
      throw error;
    }
  },

  async getActiveMembership(): Promise<{
    plan: MembershipPlan;
    status: 'active' | 'cancelled' | 'paused' | 'expired';
    nextBillingDate: string;
  } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('member_memberships')
        .select(`
          *,
          membership_plans(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No active membership
        throw error;
      }

      return {
        plan: data.membership_plans as MembershipPlan,
        status: data.status as any,
        nextBillingDate: data.end_date
      };
    } catch (error) {
      console.error('Failed to fetch active membership:', error);
      throw error;
    }
  },

  async cancelMembership(membershipId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('member_memberships')
        .update({ status: 'cancelled' })
        .eq('id', membershipId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to cancel membership:', error);
      throw error;
    }
  },

  async updatePaymentMethod(membershipId: string, paymentMethodId: string): Promise<void> {
    try {
      // This would typically update payment method via a Supabase edge function
      throw new Error('Payment method update not implemented yet');
    } catch (error) {
      console.error('Failed to update payment method:', error);
      throw error;
    }
  },
};

export default membershipService;
