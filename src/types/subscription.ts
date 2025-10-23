export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';
export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly?: number;
  features: string[];
  maxBranches?: number;
  maxMembers?: number;
  maxStaff?: number;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  gymId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  lastPaymentDate?: string;
  nextBillingDate?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionInput {
  gymId: string;
  planId: string;
  billingCycle: BillingCycle;
  autoRenew?: boolean;
}

export interface UpdateSubscriptionInput {
  planId?: string;
  billingCycle?: BillingCycle;
  autoRenew?: boolean;
  status?: SubscriptionStatus;
}

export interface SubscriptionFilters {
  gymId?: string;
  status?: SubscriptionStatus;
  planId?: string;
  page?: number;
  limit?: number;
}
