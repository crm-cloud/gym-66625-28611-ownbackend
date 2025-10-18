import { api } from '@/lib/axios';
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
      const { data } = await api.post('/api/membership-plans', {
        name: input.name,
        description: input.description,
        price: input.price,
        duration_months: input.duration_months,
        features: input.features,
        is_active: input.is_active,
        branch_id: input.branch_id,
        session_allotments: input.session_allotments ?? {},
      });

      return data;
    } catch (error) {
      console.error('Failed to create membership plan:', error);
      throw error;
    }
  },
  async getAvailablePlans(): Promise<MembershipPlan[]> {
    try {
      const { data } = await api.get('/api/membership-plans?is_active=true');
      return data.plans || [];
    } catch (error) {
      console.error('Failed to fetch membership plans:', error);
      throw error;
    }
  },

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<{ sessionId: string; url: string }> {
    try {
      const { data } = await api.post('/api/payments/checkout-session', params);
      return data;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw error;
    }
  },

  async getPlanDetails(planId: string): Promise<MembershipPlan> {
    try {
      const { data } = await api.get(`/api/membership-plans/${planId}`);
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
      const { data } = await api.get('/api/subscriptions/active');
      
      if (!data) return null;

      return {
        plan: data.membership_plan,
        status: data.status,
        nextBillingDate: data.end_date
      };
    } catch (error) {
      console.error('Failed to fetch active membership:', error);
      throw error;
    }
  },

  async cancelMembership(membershipId: string): Promise<void> {
    try {
      await api.patch(`/api/subscriptions/${membershipId}`, { 
        status: 'cancelled' 
      });
    } catch (error) {
      console.error('Failed to cancel membership:', error);
      throw error;
    }
  },

  async updatePaymentMethod(membershipId: string, paymentMethodId: string): Promise<void> {
    try {
      await api.patch(`/api/subscriptions/${membershipId}/payment-method`, {
        payment_method_id: paymentMethodId
      });
    } catch (error) {
      console.error('Failed to update payment method:', error);
      throw error;
    }
  },
};

export default membershipService;
