-- Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    max_branches INTEGER NOT NULL DEFAULT 1,
    max_trainers INTEGER NOT NULL DEFAULT 5,
    max_members INTEGER NOT NULL DEFAULT 100,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for subscription_plans
CREATE POLICY "Super admins can manage subscription plans" 
ON public.subscription_plans 
FOR ALL 
USING (get_user_role(auth.uid()) = 'super-admin');

CREATE POLICY "Everyone can view active subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price, billing_cycle, max_branches, max_trainers, max_members, features) VALUES
('Basic', 'Perfect for small gyms getting started', 49.99, 'monthly', 1, 5, 100, '["Basic Analytics", "Email Support", "Member Management"]'),
('Pro', 'Great for growing gym businesses', 99.99, 'monthly', 3, 15, 500, '["Advanced Analytics", "Priority Support", "Custom Branding", "Multiple Branches"]'),
('Enterprise', 'For large gym chains and franchises', 199.99, 'monthly', 10, 50, 2000, '["Full Analytics Suite", "24/7 Phone Support", "White Label", "API Access", "Custom Integrations"]')
ON CONFLICT (name) DO NOTHING;

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();