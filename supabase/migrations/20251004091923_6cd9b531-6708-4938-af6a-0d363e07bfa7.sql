-- ================================
-- REFERRAL SYSTEM ENHANCEMENTS
-- ================================

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referred_email ON public.referrals(referred_email);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON public.referrals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_status ON public.referrals(referrer_id, status);

-- Add bonus history tracking table
CREATE TABLE IF NOT EXISTS public.referral_bonus_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  bonus_type TEXT NOT NULL CHECK (bonus_type IN ('signup', 'membership', 'manual')),
  amount NUMERIC(10,2) NOT NULL,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bonus_history_referral ON public.referral_bonus_history(referral_id);
CREATE INDEX idx_bonus_history_processed_at ON public.referral_bonus_history(processed_at DESC);

-- Add referral analytics table
CREATE TABLE IF NOT EXISTS public.referral_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  completed_referrals INTEGER NOT NULL DEFAULT 0,
  pending_referrals INTEGER NOT NULL DEFAULT 0,
  total_bonus_earned NUMERIC(10,2) NOT NULL DEFAULT 0,
  conversion_rate NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, period_start, period_end)
);

CREATE INDEX idx_analytics_user_period ON public.referral_analytics(user_id, period_start, period_end);

-- Function to automatically mark referral as completed when user signs up
CREATE OR REPLACE FUNCTION public.process_referral_signup()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral RECORD;
  v_settings RECORD;
BEGIN
  -- Find pending referral for this email
  SELECT * INTO v_referral
  FROM public.referrals
  WHERE referred_email = NEW.email
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_referral IS NOT NULL THEN
    -- Get referral settings
    SELECT 
      COALESCE((SELECT value::numeric FROM system_settings WHERE key = 'referral_signup_bonus'), 50) as signup_bonus,
      COALESCE((SELECT value::boolean FROM system_settings WHERE key = 'referral_enabled'), true) as enabled
    INTO v_settings;

    IF v_settings.enabled THEN
      -- Update referral
      UPDATE public.referrals
      SET 
        referred_id = NEW.id,
        status = 'completed',
        converted_at = NOW(),
        signup_bonus_amount = v_settings.signup_bonus
      WHERE id = v_referral.id;

      -- Add signup bonus to history
      INSERT INTO public.referral_bonus_history (
        referral_id,
        bonus_type,
        amount,
        notes
      ) VALUES (
        v_referral.id,
        'signup',
        v_settings.signup_bonus,
        'Automatic signup bonus'
      );

      -- Update referrer's member credits
      INSERT INTO public.member_credits (user_id, balance)
      VALUES (v_referral.referrer_id, v_settings.signup_bonus)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        balance = member_credits.balance + v_settings.signup_bonus,
        updated_at = NOW();

      -- Log credit transaction
      INSERT INTO public.credit_transactions (
        user_id,
        amount,
        transaction_type,
        description,
        reference_id
      ) VALUES (
        v_referral.referrer_id,
        v_settings.signup_bonus,
        'referral_bonus',
        'Referral signup bonus for ' || NEW.email,
        v_referral.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic referral processing on user signup
DROP TRIGGER IF EXISTS trigger_process_referral_signup ON auth.users;
CREATE TRIGGER trigger_process_referral_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.process_referral_signup();

-- Function to process membership referral bonus
CREATE OR REPLACE FUNCTION public.process_membership_referral_bonus(
  p_member_id UUID,
  p_membership_id UUID
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral RECORD;
  v_settings RECORD;
BEGIN
  -- Get member's user_id
  SELECT user_id INTO v_referral
  FROM public.members
  WHERE id = p_member_id;

  IF v_referral.user_id IS NULL THEN
    RETURN;
  END IF;

  -- Find completed referral for this user
  SELECT * INTO v_referral
  FROM public.referrals
  WHERE referred_id = v_referral.user_id
    AND status = 'completed'
    AND membership_id IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_referral IS NOT NULL THEN
    -- Get referral settings
    SELECT 
      COALESCE((SELECT value::numeric FROM system_settings WHERE key = 'referral_membership_bonus'), 100) as membership_bonus,
      COALESCE((SELECT value::boolean FROM system_settings WHERE key = 'referral_enabled'), true) as enabled
    INTO v_settings;

    IF v_settings.enabled THEN
      -- Update referral with membership info
      UPDATE public.referrals
      SET 
        membership_id = p_membership_id,
        membership_bonus_amount = v_settings.membership_bonus,
        status = 'paid'
      WHERE id = v_referral.id;

      -- Add membership bonus to history
      INSERT INTO public.referral_bonus_history (
        referral_id,
        bonus_type,
        amount,
        notes
      ) VALUES (
        v_referral.id,
        'membership',
        v_settings.membership_bonus,
        'Membership purchase bonus'
      );

      -- Update referrer's member credits
      INSERT INTO public.member_credits (user_id, balance)
      VALUES (v_referral.referrer_id, v_settings.membership_bonus)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        balance = member_credits.balance + v_settings.membership_bonus,
        updated_at = NOW();

      -- Log credit transaction
      INSERT INTO public.credit_transactions (
        user_id,
        amount,
        transaction_type,
        description,
        reference_id
      ) VALUES (
        v_referral.referrer_id,
        v_settings.membership_bonus,
        'referral_bonus',
        'Referral membership bonus',
        v_referral.id
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate referral analytics
CREATE OR REPLACE FUNCTION public.calculate_referral_analytics(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  total_referrals BIGINT,
  completed_referrals BIGINT,
  pending_referrals BIGINT,
  total_bonus NUMERIC,
  conversion_rate NUMERIC
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_referrals,
    COUNT(*) FILTER (WHERE r.status IN ('completed', 'paid'))::BIGINT as completed_referrals,
    COUNT(*) FILTER (WHERE r.status = 'pending')::BIGINT as pending_referrals,
    COALESCE(SUM(
      CASE 
        WHEN r.status IN ('completed', 'paid') 
        THEN r.signup_bonus_amount + r.membership_bonus_amount 
        ELSE 0 
      END
    ), 0) as total_bonus,
    CASE 
      WHEN COUNT(*) > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE r.status IN ('completed', 'paid'))::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
      ELSE 0 
    END as conversion_rate
  FROM public.referrals r
  WHERE r.referrer_id = p_user_id
    AND r.created_at >= p_start_date
    AND r.created_at < p_end_date + INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Enhanced RLS policies for referrals
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Staff can view all referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can create referrals" ON public.referrals;
DROP POLICY IF EXISTS "Staff can manage referrals" ON public.referrals;

-- Referrals policies
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Staff can view all referrals"
  ON public.referrals FOR SELECT
  USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Users can create own referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Staff can manage all referrals"
  ON public.referrals FOR ALL
  USING (is_staff_or_above(auth.uid()));

-- Bonus history policies
ALTER TABLE public.referral_bonus_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bonus history"
  ON public.referral_bonus_history FOR SELECT
  USING (
    referral_id IN (
      SELECT id FROM public.referrals 
      WHERE referrer_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all bonus history"
  ON public.referral_bonus_history FOR SELECT
  USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Staff can manage bonus history"
  ON public.referral_bonus_history FOR ALL
  USING (is_staff_or_above(auth.uid()));

-- Analytics policies
ALTER TABLE public.referral_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON public.referral_analytics FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Staff can view all analytics"
  ON public.referral_analytics FOR SELECT
  USING (is_staff_or_above(auth.uid()));

CREATE POLICY "System can manage analytics"
  ON public.referral_analytics FOR ALL
  USING (true);

-- Add default referral settings
INSERT INTO public.system_settings (key, value, category, description)
VALUES 
  ('referral_enabled', 'true', 'referral', 'Enable/disable referral program'),
  ('referral_signup_bonus', '50', 'referral', 'Bonus amount for signup referrals'),
  ('referral_membership_bonus', '100', 'referral', 'Bonus amount for membership referrals'),
  ('referral_min_redeem_amount', '25', 'referral', 'Minimum amount to redeem referral bonus'),
  ('referral_max_bonus_per_month', '500', 'referral', 'Maximum bonus per user per month')
ON CONFLICT (key) DO NOTHING;