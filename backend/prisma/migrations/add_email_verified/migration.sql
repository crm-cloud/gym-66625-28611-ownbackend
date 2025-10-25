-- Add email_verified column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Update existing super admin to have email verified
UPDATE profiles 
SET email_verified = true 
WHERE email = 'superadmin@example.com';

-- Add comment for documentation
COMMENT ON COLUMN profiles.email_verified IS 'Indicates whether the user has verified their email address';
