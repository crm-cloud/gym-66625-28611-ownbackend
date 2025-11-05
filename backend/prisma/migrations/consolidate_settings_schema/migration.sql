-- Migration: Consolidate system_settings to hierarchical schema
-- This replaces the old branch-only schema with a global/gym/branch hierarchical schema

-- Drop old system_settings table if it exists (branch-only schema)
DROP TABLE IF EXISTS system_settings CASCADE;

-- Create new hierarchical system_settings table
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
  -- NULL gym_id + NULL branch_id = Global settings
  -- gym_id set + NULL branch_id = Gym-level settings
  -- gym_id set + branch_id set = Branch-level settings
  UNIQUE(category, gym_id, branch_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_gym ON system_settings(gym_id);
CREATE INDEX IF NOT EXISTS idx_system_settings_branch ON system_settings(branch_id);

-- Add comment explaining hierarchy
COMMENT ON TABLE system_settings IS 'Hierarchical settings: global (gym_id=NULL, branch_id=NULL), gym-level (gym_id set, branch_id=NULL), branch-level (both set). Settings cascade: branch overrides gym, gym overrides global.';

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();
