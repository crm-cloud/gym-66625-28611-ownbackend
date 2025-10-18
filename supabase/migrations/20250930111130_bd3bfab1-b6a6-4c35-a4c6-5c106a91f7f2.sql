-- Add unique constraints properly (PostgreSQL doesn't support IF NOT EXISTS for ALTER TABLE ADD CONSTRAINT)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_methods_name_key') THEN
        ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_name_key UNIQUE (name);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transaction_categories_name_type_key') THEN
        ALTER TABLE transaction_categories ADD CONSTRAINT transaction_categories_name_type_key UNIQUE (name, type);
    END IF;
END $$;

-- Insert default payment methods
INSERT INTO payment_methods (name, type, is_active) 
VALUES 
  ('Cash', 'cash', true),
  ('Credit/Debit Card', 'card', true),
  ('UPI Payment', 'digital_wallet', true),
  ('Bank Transfer', 'bank_transfer', true),
  ('Other', 'other', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default transaction categories
INSERT INTO transaction_categories (name, type, color, icon, description, is_active)
VALUES 
  ('Membership Payment', 'income', '#10B981', 'CreditCard', 'Payments received for gym memberships', true),
  ('Personal Training', 'income', '#3B82F6', 'Users', 'Income from personal training sessions', true),
  ('Equipment Sales', 'income', '#8B5CF6', 'ShoppingCart', 'Sales of gym equipment and merchandise', true),
  ('Rent', 'expense', '#EF4444', 'Home', 'Monthly rent payments', true),
  ('Utilities', 'expense', '#F59E0B', 'Zap', 'Electricity, water, internet bills', true),
  ('Equipment Maintenance', 'expense', '#6B7280', 'Wrench', 'Equipment repair and maintenance costs', true),
  ('Staff Salaries', 'expense', '#EC4899', 'Users', 'Employee salary payments', true),
  ('Marketing', 'expense', '#14B8A6', 'Megaphone', 'Marketing and advertising expenses', true)
ON CONFLICT (name, type) DO NOTHING;