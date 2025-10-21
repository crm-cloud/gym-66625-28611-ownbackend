import { api } from '@/lib/axios';

export interface Referral {
  id: string;
  referrer_id: string;
  referred_email: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'paid' | 'expired';
  signup_bonus_amount: number;
  membership_bonus_amount: number;
  created_at: string;
  converted_at?: string | null;
  membership_id?: string | null;
  referred_id?: string | null;
}

export interface ReferralSettings {
  referral_enabled: boolean;
  referral_signup_bonus: number;
  referral_membership_bonus: number;
  referral_min_redeem_amount: number;
  referral_max_bonus_per_month: number;
}

export interface ReferralAnalytics {
  total_referrals: number;
  completed_referrals: number;
  pending_referrals: number;
  total_bonus: number;
  conversion_rate: number;
}

export interface BonusHistory {
  id: string;
  referral_id: string;
  bonus_type: 'signup' | 'membership' | 'manual';
  amount: number;
  processed_by: string | null;
  processed_at: string;
  notes: string | null;
  created_at: string;
}

/**
 * Referral Service
 * Handles all referral program operations
 */
class ReferralServiceClass {
  /**
   * Generate a unique referral code
   */
  async generateReferralCode(): Promise<string> {
    const { data } = await api.post('/api/referrals/generate-code');
    return data.code;
  }

  /**
   * Create a new referral
   */
  async createReferral(referrerId: string, referredEmail: string): Promise<Referral> {
    const { data } = await api.post('/api/referrals', {
      referrer_id: referrerId,
      referred_email: referredEmail.toLowerCase().trim(),
    });
    return data;
  }

  /**
   * Get user's referrals
   */
  async getUserReferrals(userId: string, page: number = 1, limit: number = 10): Promise<{ referrals: Referral[]; total: number }> {
    const { data } = await api.get('/api/referrals', {
      params: { user_id: userId, page, limit }
    });
    return data;
  }

  /**
   * Get referral by code
   */
  async getReferralByCode(code: string): Promise<Referral> {
    const { data } = await api.get(`/api/referrals/by-code/${code}`);
    return data;
  }

  /**
   * Update referral status
   */
  async updateReferralStatus(referralId: string, status: Referral['status']): Promise<Referral> {
    const { data } = await api.patch(`/api/referrals/${referralId}`, { status });
    return data;
  }

  /**
   * Get referral settings
   */
  async getSettings(): Promise<ReferralSettings> {
    const { data } = await api.get('/api/referrals/settings');
    return data;
  }

  /**
   * Update referral settings
   */
  async updateSettings(settings: Partial<ReferralSettings>): Promise<void> {
    await api.put('/api/referrals/settings', settings);
  }

  /**
   * Get referral analytics
   */
  async getAnalytics(userId?: string): Promise<ReferralAnalytics> {
    const { data } = await api.get('/api/referrals/analytics', {
      params: { user_id: userId }
    });
    return data;
  }

  /**
   * Get bonus history
   */
  async getBonusHistory(userId: string): Promise<BonusHistory[]> {
    const { data } = await api.get(`/api/referrals/${userId}/bonus-history`);
    return data;
  }

  /**
   * Process referral bonus
   */
  async processBonus(referralId: string, bonusType: BonusHistory['bonus_type'], amount: number, notes?: string): Promise<void> {
    await api.post(`/api/referrals/${referralId}/process-bonus`, {
      bonus_type: bonusType,
      amount,
      notes
    });
  }

  /**
   * Validate referral code
   */
  async validateCode(code: string): Promise<{ valid: boolean; referral?: Referral }> {
    const { data } = await api.post('/api/referrals/validate-code', { code });
    return data;
  }

  /**
   * Send referral notification
   */
  async sendNotification(referralId: string, type: 'signup' | 'membership' | 'bonus_earned'): Promise<void> {
    try {
      await api.post('/api/referrals/send-notification', {
        referral_id: referralId,
        type
      });
    } catch (error) {
      console.error('Error sending referral notification:', error);
      // Don't throw - notifications are non-critical
    }
  }
}

export const ReferralService = new ReferralServiceClass();
