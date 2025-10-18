-- Table to store payment gateway configurations per branch/gym
CREATE TABLE IF NOT EXISTS payment_gateway_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'payu', 'ccavenue', 'phonepe')),
  
  -- Credentials (encrypted in practice)
  api_key TEXT,
  api_secret TEXT,
  merchant_id TEXT,
  salt_key TEXT,
  access_code TEXT,
  
  -- Configuration
  is_active BOOLEAN DEFAULT false,
  is_test_mode BOOLEAN DEFAULT true,
  webhook_secret TEXT,
  webhook_url TEXT,
  
  -- Payment options
  allowed_payment_methods JSONB DEFAULT '["card", "upi", "netbanking", "wallet"]'::jsonb,
  auto_capture BOOLEAN DEFAULT true,
  
  -- Currency & fees
  currency TEXT DEFAULT 'INR',
  payment_gateway_fee_percent NUMERIC(5,2) DEFAULT 2.0,
  gst_on_gateway_fee BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(gym_id, branch_id, provider)
);

-- Table to store payment transactions with gateway details
CREATE TABLE IF NOT EXISTS payment_gateway_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to gateway config
  gateway_config_id UUID REFERENCES payment_gateway_configs(id),
  provider TEXT NOT NULL,
  
  -- Transaction details
  order_id TEXT NOT NULL,
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  
  -- Amount details
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  gateway_fee NUMERIC(12,2) DEFAULT 0,
  gst_amount NUMERIC(12,2) DEFAULT 0,
  net_amount NUMERIC(12,2),
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  payment_method TEXT,
  
  -- Customer details
  customer_id UUID REFERENCES auth.users(id),
  customer_email TEXT,
  customer_phone TEXT,
  customer_name TEXT,
  
  -- References
  invoice_id UUID REFERENCES invoices(id),
  membership_id UUID REFERENCES member_memberships(id),
  
  -- Gateway response
  gateway_response JSONB,
  webhook_data JSONB,
  error_message TEXT,
  
  -- Timestamps
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  
  -- Metadata
  branch_id UUID REFERENCES branches(id),
  gym_id UUID REFERENCES gyms(id),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(gateway_order_id, provider)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_gateway_transactions_order_id ON payment_gateway_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_gateway_transactions_gateway_order_id ON payment_gateway_transactions(gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_gateway_transactions_status ON payment_gateway_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_gateway_transactions_customer_id ON payment_gateway_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_gateway_configs_provider ON payment_gateway_configs(provider);
CREATE INDEX IF NOT EXISTS idx_payment_gateway_configs_branch_id ON payment_gateway_configs(branch_id);

-- RLS Policies for payment_gateway_configs
ALTER TABLE payment_gateway_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment gateway configs"
  ON payment_gateway_configs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super-admin', 'admin')
    )
  );

CREATE POLICY "Staff can view payment gateway configs"
  ON payment_gateway_configs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super-admin', 'admin', 'manager', 'staff')
    )
  );

-- RLS Policies for payment_gateway_transactions
ALTER TABLE payment_gateway_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all payment transactions"
  ON payment_gateway_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('super-admin', 'admin', 'manager', 'staff')
    )
  );

CREATE POLICY "Members can view own payment transactions"
  ON payment_gateway_transactions FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "System can create payment transactions"
  ON payment_gateway_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update payment transactions"
  ON payment_gateway_transactions FOR UPDATE
  TO authenticated
  USING (true);