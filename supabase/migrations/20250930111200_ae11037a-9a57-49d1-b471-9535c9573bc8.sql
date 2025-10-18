-- Add RLS policies for transaction_categories table
CREATE POLICY "Staff can manage transaction categories" 
ON transaction_categories 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Everyone can view active transaction categories" 
ON transaction_categories 
FOR SELECT 
USING (is_active = true);

-- Add RLS policies for payment_methods table
CREATE POLICY "Staff can manage payment methods" 
ON payment_methods 
FOR ALL 
USING (is_staff_or_above(auth.uid()));

CREATE POLICY "Everyone can view active payment methods" 
ON payment_methods 
FOR SELECT 
USING (is_active = true);