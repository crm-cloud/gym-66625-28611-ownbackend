-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'frozen', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE freeze_status AS ENUM ('pending', 'approved', 'rejected', 'active');
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded');
CREATE TYPE notification_type AS ENUM ('announcement', 'system', 'membership', 'referral');
CREATE TYPE bonus_type AS ENUM ('referral_signup', 'referral_membership', 'loyalty_points');
CREATE TYPE redemption_type AS ENUM ('pos_purchase', 'membership_extension', 'cash_equivalent');

-- Products table (enhanced from existing mock)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  member_price DECIMAL(10,2), -- Special member pricing
  category TEXT NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Member credits table
CREATE TABLE public.member_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Credit transactions table
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earn', 'redeem', 'refund'
  description TEXT,
  reference_id UUID, -- Links to orders, referrals, etc
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table for member purchases
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  credit_used DECIMAL(10,2) DEFAULT 0.00,
  cash_amount DECIMAL(10,2) DEFAULT 0.00,
  status order_status DEFAULT 'pending',
  payment_method TEXT,
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Membership plans table
CREATE TABLE public.membership_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  features TEXT[], -- Array of features
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Member memberships table
CREATE TABLE public.member_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.membership_plans(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status membership_status DEFAULT 'active',
  payment_amount DECIMAL(10,2) NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Referrals table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'expired'
  signup_bonus_amount DECIMAL(10,2) DEFAULT 0.00,
  membership_bonus_amount DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Referral bonuses table
CREATE TABLE public.referral_bonuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID REFERENCES public.referrals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bonus_type bonus_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_redeemed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  redeemed_at TIMESTAMPTZ
);

-- Membership freeze requests table
CREATE TABLE public.membership_freeze_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES public.member_memberships(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  requested_days INTEGER NOT NULL,
  freeze_fee DECIMAL(10,2) DEFAULT 0.00,
  status freeze_status DEFAULT 'pending',
  admin_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  freeze_start_date DATE,
  freeze_end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  notification_type notification_type DEFAULT 'announcement',
  priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high
  target_roles TEXT[], -- ['member', 'staff', 'admin'] or null for all
  branch_ids UUID[], -- Specific branches or null for all
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- User notifications table
CREATE TABLE public.user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Member goals table (enhanced)
CREATE TABLE public.member_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_value DECIMAL(10,2),
  target_unit TEXT, -- 'kg', 'lbs', 'cm', '%', etc
  current_value DECIMAL(10,2) DEFAULT 0,
  target_date DATE,
  category TEXT, -- 'weight_loss', 'muscle_gain', 'endurance', etc
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Progress entries table
CREATE TABLE public.progress_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.member_goals(id) ON DELETE CASCADE,
  measurement_value DECIMAL(10,2) NOT NULL,
  notes TEXT,
  photo_url TEXT,
  recorded_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_freeze_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Products (public readable, admin manageable)
CREATE POLICY "products_select" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_admin_all" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = auth.users.id)
);

-- RLS Policies for Member Credits (users can view own)
CREATE POLICY "member_credits_select_own" ON public.member_credits 
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "member_credits_update_system" ON public.member_credits 
FOR ALL USING (true); -- System updates

-- RLS Policies for Credit Transactions (users can view own)
CREATE POLICY "credit_transactions_select_own" ON public.credit_transactions 
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "credit_transactions_system" ON public.credit_transactions 
FOR INSERT WITH CHECK (true);

-- RLS Policies for Orders (users can view own, staff can view all)
CREATE POLICY "orders_select_own" ON public.orders 
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON public.orders 
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_own" ON public.orders 
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Order Items
CREATE POLICY "order_items_select" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "order_items_insert" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- RLS Policies for Membership Plans (public readable)
CREATE POLICY "membership_plans_select" ON public.membership_plans FOR SELECT USING (is_active = true);
CREATE POLICY "membership_plans_admin" ON public.membership_plans FOR ALL USING (true);

-- RLS Policies for Member Memberships (users can view own)
CREATE POLICY "member_memberships_select_own" ON public.member_memberships 
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "member_memberships_insert_own" ON public.member_memberships 
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "member_memberships_update_system" ON public.member_memberships 
FOR UPDATE USING (true);

-- RLS Policies for Referrals
CREATE POLICY "referrals_select_own" ON public.referrals 
FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "referrals_insert_own" ON public.referrals 
FOR INSERT WITH CHECK (auth.uid() = referrer_id);
CREATE POLICY "referrals_update_system" ON public.referrals FOR UPDATE USING (true);

-- RLS Policies for Referral Bonuses
CREATE POLICY "referral_bonuses_select_own" ON public.referral_bonuses 
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "referral_bonuses_system" ON public.referral_bonuses FOR ALL USING (true);

-- RLS Policies for Membership Freeze Requests
CREATE POLICY "freeze_requests_select_own" ON public.membership_freeze_requests 
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "freeze_requests_insert_own" ON public.membership_freeze_requests 
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "freeze_requests_admin" ON public.membership_freeze_requests 
FOR UPDATE USING (true);

-- RLS Policies for Announcements (admins create, all read active)
CREATE POLICY "announcements_select_active" ON public.announcements 
FOR SELECT USING (is_active = true);
CREATE POLICY "announcements_admin" ON public.announcements FOR ALL USING (true);

-- RLS Policies for User Notifications
CREATE POLICY "user_notifications_select_own" ON public.user_notifications 
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_notifications_update_own" ON public.user_notifications 
FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_notifications_system" ON public.user_notifications 
FOR INSERT WITH CHECK (true);

-- RLS Policies for Member Goals
CREATE POLICY "member_goals_select_own" ON public.member_goals 
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "member_goals_insert_own" ON public.member_goals 
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "member_goals_update_own" ON public.member_goals 
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Progress Entries
CREATE POLICY "progress_entries_select_own" ON public.progress_entries 
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progress_entries_insert_own" ON public.progress_entries 
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_entries_update_own" ON public.progress_entries 
FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_member_memberships_user_id ON public.member_memberships(user_id);
CREATE INDEX idx_member_memberships_status ON public.member_memberships(status);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX idx_user_notifications_unread ON public.user_notifications(user_id, is_read);
CREATE INDEX idx_member_goals_user_id ON public.member_goals(user_id);
CREATE INDEX idx_progress_entries_user_id ON public.progress_entries(user_id);
CREATE INDEX idx_progress_entries_goal_id ON public.progress_entries(goal_id);

-- Insert sample data for membership plans
INSERT INTO public.membership_plans (name, description, price, duration_months, features) VALUES 
('Basic Monthly', 'Access to gym facilities and basic equipment', 49.99, 1, ARRAY['Gym Access', '24/7 Access', 'Locker Usage']),
('Premium Monthly', 'Full gym access plus group classes', 79.99, 1, ARRAY['Gym Access', '24/7 Access', 'Locker Usage', 'Group Classes', 'Pool Access']),
('Elite Monthly', 'Everything included plus personal training sessions', 129.99, 1, ARRAY['Gym Access', '24/7 Access', 'Locker Usage', 'Group Classes', 'Pool Access', '2 PT Sessions', 'Nutrition Consultation']),
('Basic Annual', 'Basic membership with annual discount', 499.99, 12, ARRAY['Gym Access', '24/7 Access', 'Locker Usage', '2 Free Months']),
('Premium Annual', 'Premium membership with annual discount', 799.99, 12, ARRAY['Gym Access', '24/7 Access', 'Locker Usage', 'Group Classes', 'Pool Access', '2 Free Months']),
('Elite Annual', 'Elite membership with maximum benefits', 1299.99, 12, ARRAY['Gym Access', '24/7 Access', 'Locker Usage', 'Group Classes', 'Pool Access', '24 PT Sessions', 'Nutrition Consultation', '2 Free Months']);

-- Insert sample products
INSERT INTO public.products (name, description, price, member_price, category, stock_quantity) VALUES 
('Protein Powder - Whey', 'Premium whey protein powder 2kg', 59.99, 49.99, 'Supplements', 50),
('Energy Drink', 'Pre-workout energy drink', 3.99, 3.49, 'Beverages', 100),
('Gym Towel', 'Premium microfiber gym towel', 19.99, 17.99, 'Accessories', 75),
('Water Bottle', 'Insulated stainless steel bottle', 24.99, 22.99, 'Accessories', 60),
('Protein Bar', 'High-protein snack bar', 4.99, 4.49, 'Snacks', 200),
('Creatine Monohydrate', 'Pure creatine supplement 500g', 39.99, 34.99, 'Supplements', 30),
('Gym Gloves', 'Weightlifting gloves with wrist support', 29.99, 26.99, 'Accessories', 40),
('Resistance Bands Set', 'Complete resistance training set', 34.99, 31.99, 'Equipment', 25);

-- Create function to automatically create member credits on signup
CREATE OR REPLACE FUNCTION public.create_member_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.member_credits (user_id, balance)
  VALUES (NEW.id, 0.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create member credits
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_member_credits();

-- Create function to generate referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  code := 'GYM' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6));
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.referrals WHERE referral_code = code) LOOP
    code := 'GYM' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6));
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;