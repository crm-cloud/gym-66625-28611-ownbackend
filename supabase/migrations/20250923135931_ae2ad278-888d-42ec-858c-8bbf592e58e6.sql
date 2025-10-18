-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  bonus_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  branch_id UUID
);

-- Create referral_settings table
CREATE TABLE public.referral_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bonus_amount NUMERIC(10,2) NOT NULL DEFAULT 50,
  expiry_days INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for referrals
CREATE POLICY "Staff can manage referrals" 
ON public.referrals 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Users can view own referrals" 
ON public.referrals 
FOR SELECT 
USING (referrer_id = auth.uid() OR referred_id = auth.uid());

-- Create policies for referral_settings
CREATE POLICY "Staff can manage referral settings" 
ON public.referral_settings 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Everyone can view referral settings" 
ON public.referral_settings 
FOR SELECT 
USING (true);

-- Insert default referral settings
INSERT INTO public.referral_settings (bonus_amount, expiry_days, is_active) 
VALUES (50, 30, true);