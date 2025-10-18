-- Add missing role values to user_role enum in separate transaction
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff'; 
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'trainer';