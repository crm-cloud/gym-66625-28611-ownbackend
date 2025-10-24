-- Add password_hash and email_verified columns to profiles table
ALTER TABLE "public"."profiles"
ADD COLUMN IF NOT EXISTS "password_hash" TEXT,
ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN DEFAULT false;
