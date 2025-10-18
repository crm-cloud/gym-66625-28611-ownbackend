-- Create RLS policies for products table if they don't exist
DO $$ 
BEGIN
    -- Check if RLS is enabled on products table
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products') THEN
        -- Enable RLS on products table
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
        
        -- Allow everyone to view active products
        CREATE POLICY "Everyone can view active products" 
        ON public.products 
        FOR SELECT 
        USING (is_active = true);
        
        -- Allow staff to manage products
        CREATE POLICY "Staff can manage products" 
        ON public.products 
        FOR ALL 
        USING (is_staff_or_above(auth.uid()));
    END IF;
END $$;