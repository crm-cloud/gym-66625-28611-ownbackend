import { supabase } from '@/integrations/supabase/client';
import { QueryClient } from '@tanstack/react-query';

interface ReferralData {
  id?: string;
  referrer_id: string;
  referred_email: string;
  referral_code: string;
  status: string;
  signup_bonus_amount: number;
  membership_bonus_amount: number;
  created_at?: string;
  converted_at?: string | null;
  membership_id?: string | null;
  referred_id?: string | null;
}

interface ReferralSettings {
  referral_enabled: boolean;
  referral_signup_bonus: number;
  referral_membership_bonus: number;
  referral_min_redeem_amount: number;
  referral_max_bonus_per_month: number;
}

export const fetchReferralByCode = async (code: string) => {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referral_code', code)
    .single();

  if (error) throw error;
  return data;
};

export const fetchUserReferrals = async (userId: string) => {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createReferral = async (referralData: Omit<ReferralData, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('referrals')
    .insert(referralData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchReferralSettings = async () => {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .like('key', 'referral_%');

  if (error) throw error;
  
  // Convert to object with default values
  return data.reduce((acc, setting) => {
    const key = setting.key.replace('referral_', '');
    acc[key] = setting.value;
    return acc;
  }, {} as Record<string, any>) as ReferralSettings;
};

export const updateReferralSettings = async (settings: Partial<ReferralSettings>) => {
  const updates = Object.entries(settings).map(([key, value]) => ({
    key: `referral_${key}`,
    value,
    category: 'referral',
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('system_settings')
    .upsert(updates, { onConflict: 'key' });

  if (error) throw error;
  return true;
};

export const generateReferralCode = async (userId: string) => {
  const { data, error } = await supabase
    .rpc('generate_referral_code')
    .single();

  if (error) throw error;
  return data as string;
};

export const invalidateReferralQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['referrals'] });
  queryClient.invalidateQueries({ queryKey: ['referral-settings'] });
};
