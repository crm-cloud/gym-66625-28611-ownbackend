import { supabase } from '@/integrations/supabase/client';

export interface ReferralData {
  id?: string;
  referrer_id: string;
  referred_email: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'paid' | 'expired';
  signup_bonus_amount: number;
  membership_bonus_amount: number;
  created_at?: string;
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
 * Generate a unique referral code
 */
export const generateReferralCode = async (): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('generate_referral_code');
    
    if (error) throw error;
    return data as string;
  } catch (error) {
    console.error('Error generating referral code:', error);
    throw new Error('Failed to generate referral code');
  }
};

/**
 * Create a new referral
 */
export const createReferral = async (
  referrerId: string,
  referredEmail: string
): Promise<ReferralData> => {
  try {
    const code = await generateReferralCode();
    
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_email: referredEmail.toLowerCase().trim(),
        referral_code: code,
        status: 'pending',
        signup_bonus_amount: 0,
        membership_bonus_amount: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ReferralData;
  } catch (error: any) {
    console.error('Error creating referral:', error);
    if (error.code === '23505') {
      throw new Error('This email has already been referred');
    }
    throw new Error('Failed to create referral');
  }
};

/**
 * Fetch user's referrals with pagination
 */
export const fetchUserReferrals = async (
  userId: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('referrals')
      .select('*', { count: 'exact' })
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    
    return {
      referrals: (data || []) as ReferralData[],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('Error fetching referrals:', error);
    throw new Error('Failed to fetch referrals');
  }
};

/**
 * Fetch referral by code
 */
export const fetchReferralByCode = async (code: string) => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referral_code', code)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching referral by code:', error);
    return null;
  }
};

/**
 * Fetch referral analytics
 */
export const fetchReferralAnalytics = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<ReferralAnalytics> => {
  try {
    const { data, error } = await supabase.rpc('calculate_referral_analytics', {
      p_user_id: userId,
      p_start_date: startDate.toISOString().split('T')[0],
      p_end_date: endDate.toISOString().split('T')[0],
    });

    if (error) throw error;
    
    return data[0] || {
      total_referrals: 0,
      completed_referrals: 0,
      pending_referrals: 0,
      total_bonus: 0,
      conversion_rate: 0,
    };
  } catch (error) {
    console.error('Error fetching referral analytics:', error);
    throw new Error('Failed to fetch referral analytics');
  }
};

/**
 * Fetch bonus history
 */
export const fetchBonusHistory = async (
  referralId: string
): Promise<BonusHistory[]> => {
  try {
    const { data, error } = await supabase
      .from('referral_bonus_history')
      .select('*')
      .eq('referral_id', referralId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as BonusHistory[];
  } catch (error) {
    console.error('Error fetching bonus history:', error);
    throw new Error('Failed to fetch bonus history');
  }
};

/**
 * Fetch referral settings
 */
export const fetchReferralSettings = async (): Promise<ReferralSettings> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .like('key', 'referral_%');

    if (error) throw error;

    const settings: any = {};
    data?.forEach((setting) => {
      const key = setting.key.replace('referral_', '');
      const rawValue = setting.value;
      let value: string | number | boolean;
      
      // Parse values
      if (key === 'enabled') {
        value = String(rawValue) === 'true';
      } else {
        value = parseFloat(String(rawValue)) || 0;
      }
      
      settings[key] = value;
    });

    return {
      referral_enabled: settings.enabled ?? true,
      referral_signup_bonus: settings.signup_bonus ?? 50,
      referral_membership_bonus: settings.membership_bonus ?? 100,
      referral_min_redeem_amount: settings.min_redeem_amount ?? 25,
      referral_max_bonus_per_month: settings.max_bonus_per_month ?? 500,
    };
  } catch (error) {
    console.error('Error fetching referral settings:', error);
    throw new Error('Failed to fetch referral settings');
  }
};

/**
 * Update referral settings
 */
export const updateReferralSettings = async (
  settings: Partial<ReferralSettings>
): Promise<void> => {
  try {
    const updates = Object.entries(settings).map(([key, value]) => ({
      key: `referral_${key}`,
      value: value.toString(),
      category: 'referral',
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('system_settings')
      .upsert(updates, { onConflict: 'key' });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating referral settings:', error);
    throw new Error('Failed to update referral settings');
  }
};

/**
 * Process membership bonus (called when member purchases membership)
 */
export const processMembershipBonus = async (
  memberId: string,
  membershipId: string
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('process_membership_referral_bonus', {
      p_member_id: memberId,
      p_membership_id: membershipId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error processing membership bonus:', error);
    throw new Error('Failed to process membership bonus');
  }
};

/**
 * Manually process bonus (admin action)
 */
export const processManualBonus = async (
  referralId: string,
  amount: number,
  notes: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('referral_bonus_history')
      .insert({
        referral_id: referralId,
        bonus_type: 'manual',
        amount,
        notes,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error processing manual bonus:', error);
    throw new Error('Failed to process manual bonus');
  }
};

/**
 * Send referral email notification
 */
export const sendReferralNotification = async (
  referralId: string,
  type: 'signup' | 'membership' | 'bonus_earned'
): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('send-referral-notification', {
      body: { referralId, type },
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error sending referral notification:', error);
    // Don't throw - notifications are non-critical
  }
};

/**
 * Validate referral code during signup
 */
export const validateReferralCode = async (code: string): Promise<boolean> => {
  try {
    const referral = await fetchReferralByCode(code);
    return referral !== null && referral.status === 'pending';
  } catch (error) {
    return false;
  }
};
