-- Fix user_roles table to store role directly as enum instead of FK
-- This resolves the 403 Forbidden error and aligns the schema with the codebase

-- Step 1: Drop existing constraints and foreign key
ALTER TABLE "public"."user_roles" 
  DROP CONSTRAINT IF EXISTS "user_roles_role_id_fkey";

ALTER TABLE "public"."user_roles" 
  DROP CONSTRAINT IF EXISTS "user_roles_user_id_role_id_branch_id_key";

-- Step 2: Add role column with enum type
ALTER TABLE "public"."user_roles" 
  ADD COLUMN IF NOT EXISTS "role" user_role NOT NULL DEFAULT 'member';

-- Step 3: Migrate existing data if role_id exists
-- Map role_id to role enum values based on roles table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' 
    AND column_name = 'role_id'
  ) THEN
    UPDATE "public"."user_roles" ur
    SET role = CASE 
      WHEN r.name = 'super_admin' THEN 'super_admin'::user_role
      WHEN r.name = 'admin' THEN 'admin'::user_role
      WHEN r.name = 'manager' THEN 'manager'::user_role
      WHEN r.name = 'trainer' THEN 'trainer'::user_role
      WHEN r.name = 'staff' THEN 'staff'::user_role
      ELSE 'member'::user_role
    END
    FROM "public"."roles" r
    WHERE ur.role_id = r.id;
  END IF;
END $$;

-- Step 4: Drop role_id column
ALTER TABLE "public"."user_roles" 
  DROP COLUMN IF EXISTS "role_id";

-- Step 5: Add new unique constraint
ALTER TABLE "public"."user_roles" 
  ADD CONSTRAINT "user_roles_user_id_role_branch_id_key" 
  UNIQUE (user_id, role, branch_id);

-- Step 6: Update indexes
DROP INDEX IF EXISTS "public"."idx_user_roles_role";
CREATE INDEX IF NOT EXISTS "idx_user_roles_role" ON "public"."user_roles" (role);

-- Step 7: Add team_role and gym_id if they don't exist
ALTER TABLE "public"."user_roles" 
  ADD COLUMN IF NOT EXISTS "team_role" TEXT,
  ADD COLUMN IF NOT EXISTS "gym_id" UUID,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ DEFAULT NOW();

-- Step 8: Add gym foreign key if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' 
    AND column_name = 'gym_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'gyms'
  ) THEN
    ALTER TABLE "public"."user_roles" 
      ADD CONSTRAINT "user_roles_gym_id_fkey" 
      FOREIGN KEY (gym_id) REFERENCES "public"."gyms"(id)
      ON DELETE SET NULL;
  END IF;
END $$;
