/**
 * @deprecated Use ReferralService from '@/services/api/ReferralService' instead
 * This file is kept for backward compatibility only
 */

import { ReferralService, type ReferralSettings } from './api/ReferralService';

export type {
  Referral as ReferralData,
  ReferralSettings,
  ReferralAnalytics,
  BonusHistory
} from './api/ReferralService';

// Re-export methods for backward compatibility
export const generateReferralCode = () => ReferralService.generateReferralCode();

export const createReferral = (referrerId: string, referredEmail: string) => 
  ReferralService.createReferral(referrerId, referredEmail);

export const fetchUserReferrals = (userId: string, page?: number, limit?: number) => 
  ReferralService.getUserReferrals(userId, page, limit);

export const fetchReferralByCode = (code: string) =>
  ReferralService.getReferralByCode(code);

export const fetchReferralAnalytics = async (userId: string) => {
  return await ReferralService.getAnalytics(userId);
};

export const fetchBonusHistory = (userId: string) =>
  ReferralService.getBonusHistory(userId);

export const fetchReferralSettings = () =>
  ReferralService.getSettings();

export const updateReferralSettings = (settings: Partial<ReferralSettings>) =>
  ReferralService.updateSettings(settings);

export const sendReferralNotification = (referralId: string, type: 'signup' | 'membership' | 'bonus_earned') =>
  ReferralService.sendNotification(referralId, type);

export const validateReferralCode = async (code: string): Promise<boolean> => {
  try {
    const result = await ReferralService.validateCode(code);
    return result.valid;
  } catch (error) {
    return false;
  }
};

export const processManualBonus = (referralId: string, amount: number, notes?: string) =>
  ReferralService.processBonus(referralId, 'manual', amount, notes);

export const processMembershipBonus = (referralId: string, amount: number) =>
  ReferralService.processBonus(referralId, 'membership', amount);
