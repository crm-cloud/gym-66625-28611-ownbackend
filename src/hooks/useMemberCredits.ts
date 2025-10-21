import { useApiQuery, useApiMutation } from './useApiQuery';
import { MemberCreditsService } from '@/services/api/MemberCreditsService';
import { AddCreditsInput, DeductCreditsInput, CreditsQueryParams } from '@/types/credits';

export const useMemberCredits = (memberId: string) => {
  return useApiQuery(
    ['member-credits', memberId],
    `/api/member-credits/${memberId}`,
    { enabled: !!memberId }
  );
};

export const useCreditTransactions = (params?: CreditsQueryParams) => {
  return useApiQuery(
    ['credit-transactions', JSON.stringify(params)],
    `/api/member-credits/transactions${params ? '?' + new URLSearchParams(params as any).toString() : ''}`
  );
};

export const useCreditsSummary = (branchId?: string) => {
  return useApiQuery(
    ['credits-summary', branchId || 'all'],
    `/api/member-credits/summary${branchId ? `?branch_id=${branchId}` : ''}`
  );
};

export const useAddCredits = (memberId: string) => {
  return useApiMutation<any, AddCreditsInput>(
    `/api/member-credits/${memberId}/add`,
    'post',
    {
      invalidateQueries: [['member-credits', memberId], ['credit-transactions']],
      successMessage: 'Credits added successfully'
    }
  );
};

export const useDeductCredits = (memberId: string) => {
  return useApiMutation<any, DeductCreditsInput>(
    `/api/member-credits/${memberId}/deduct`,
    'post',
    {
      invalidateQueries: [['member-credits', memberId], ['credit-transactions']],
      successMessage: 'Credits deducted successfully'
    }
  );
};
