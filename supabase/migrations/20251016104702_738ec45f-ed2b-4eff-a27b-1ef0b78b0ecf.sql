-- Phase 1: Database Schema Enhancements

-- Create payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference TEXT,
  notes TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed', 'refunded')),
  discount_code VARCHAR(50),
  rewards_used DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage payments"
  ON payments FOR ALL
  USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Members can view own payments"
  ON payments FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE customer_id = auth.uid()
    )
  );

-- Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_purchase_amount NUMERIC(10,2) DEFAULT 0,
  max_discount_amount NUMERIC(10,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  applicable_to TEXT[] DEFAULT '{}',
  branch_id UUID REFERENCES branches(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active discount codes"
  ON discount_codes FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until >= CURRENT_DATE));

CREATE POLICY "Admins can manage discount codes"
  ON discount_codes FOR ALL
  USING (is_admin_user(auth.uid()));

-- Create member_discount_usage table
CREATE TABLE IF NOT EXISTS member_discount_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  discount_code_id UUID NOT NULL REFERENCES discount_codes(id),
  order_id TEXT,
  invoice_id UUID REFERENCES invoices(id),
  discount_amount NUMERIC(10,2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, discount_code_id, invoice_id)
);

ALTER TABLE member_discount_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own discount usage"
  ON member_discount_usage FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create discount usage"
  ON member_discount_usage FOR INSERT
  WITH CHECK (true);

-- Ensure trainer_package_rates exists
CREATE TABLE IF NOT EXISTS trainer_package_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES profiles(user_id),
  branch_id UUID REFERENCES branches(id),
  package_name TEXT NOT NULL,
  session_count INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  duration_days INTEGER,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trainer_package_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active trainer packages"
  ON trainer_package_rates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Trainers can manage own packages"
  ON trainer_package_rates FOR ALL
  USING (trainer_id = auth.uid());

CREATE POLICY "Admins can manage all trainer packages"
  ON trainer_package_rates FOR ALL
  USING (is_admin_user(auth.uid()));

-- Add discount and rewards columns to payment_gateway_transactions
ALTER TABLE payment_gateway_transactions
ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rewards_used NUMERIC(10,2) DEFAULT 0;