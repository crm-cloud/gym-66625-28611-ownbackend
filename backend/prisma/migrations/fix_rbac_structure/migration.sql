-- Fix RBAC Structure Migration
-- This migration implements proper role-based access control and fixes the admin/gym hierarchy

-- Step 1: Create admin_subscriptions table to track subscription plans assigned to admins
CREATE TABLE IF NOT EXISTS "public"."admin_subscriptions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "admin_id" UUID NOT NULL REFERENCES "public"."profiles"("user_id") ON DELETE CASCADE,
  "subscription_plan_id" UUID NOT NULL REFERENCES "public"."subscription_plans"("id"),
  "assigned_by" UUID REFERENCES "public"."profiles"("user_id"),
  "assigned_at" TIMESTAMPTZ DEFAULT NOW(),
  "status" TEXT DEFAULT 'active',
  "notes" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_admin_subscriptions_admin" ON "public"."admin_subscriptions"("admin_id");
CREATE INDEX IF NOT EXISTS "idx_admin_subscriptions_plan" ON "public"."admin_subscriptions"("subscription_plan_id");

-- Step 2: Remove unused rolesId field from user_roles
ALTER TABLE "public"."user_roles" DROP COLUMN IF EXISTS "rolesId";

-- Step 3: Remove role/gym/branch from profiles (these belong in user_roles only)
-- First, migrate existing data to user_roles if not already there
INSERT INTO "public"."user_roles" (id, user_id, role, gym_id, branch_id, team_role, created_at)
SELECT 
  gen_random_uuid(),
  p.user_id,
  p.role,
  p.gym_id,
  p.branch_id,
  p.team_role,
  NOW()
FROM "public"."profiles" p
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."user_roles" ur 
  WHERE ur.user_id = p.user_id AND ur.role = p.role
)
ON CONFLICT DO NOTHING;

-- Now remove these columns from profiles
ALTER TABLE "public"."profiles" DROP COLUMN IF EXISTS "role";
ALTER TABLE "public"."profiles" DROP COLUMN IF EXISTS "team_role";
ALTER TABLE "public"."profiles" DROP COLUMN IF EXISTS "gym_id";
ALTER TABLE "public"."profiles" DROP COLUMN IF EXISTS "branch_id";

-- Step 4: Ensure super_admins have no gym/branch in user_roles
UPDATE "public"."user_roles" 
SET gym_id = NULL, branch_id = NULL 
WHERE role = 'super_admin';

-- Step 5: Ensure admins (not super_admin) have no gym initially (they create their own)
-- Keep existing gyms for admins who already have them
-- Future admins created by super_admin will start with NULL gym_id

-- Step 6: Add comment to clarify gym ownership
COMMENT ON COLUMN "public"."gyms"."owner_id" IS 'Admin user who owns this gym';
