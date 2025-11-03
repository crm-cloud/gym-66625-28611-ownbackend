-- Create system_settings table for hierarchical settings management
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique combination of category and scope
  UNIQUE(category, gym_id, branch_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_gym ON system_settings(gym_id);
CREATE INDEX IF NOT EXISTS idx_system_settings_branch ON system_settings(branch_id);

-- Add comment
COMMENT ON TABLE system_settings IS 'Hierarchical settings: global (gym_id=NULL, branch_id=NULL), gym-level (gym_id set), branch-level (both set)';

-- Create discount_usage table if not exists
CREATE TABLE IF NOT EXISTS discount_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id UUID NOT NULL,
  user_id UUID NOT NULL,
  order_id VARCHAR(100),
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_discount_usage_discount ON discount_usage(discount_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_user ON discount_usage(user_id);
