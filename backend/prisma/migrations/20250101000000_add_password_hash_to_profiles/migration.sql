-- Add password_hash column to profiles table
ALTER TABLE "public"."profiles" 
ADD COLUMN IF NOT EXISTS "password_hash" TEXT;

-- Update existing users with a default password hash (should be updated by users on first login)
-- Using a bcrypt hash of 'password123' as a temporary default
UPDATE "public"."profiles" 
SET "password_hash" = '$2a$12$YOUR_HASHED_PASSWORD_HERE' 
WHERE "password_hash" IS NULL;

-- Make the password_hash column required if needed
-- ALTER TABLE "public"."profiles" ALTER COLUMN "password_hash" SET NOT NULL;
