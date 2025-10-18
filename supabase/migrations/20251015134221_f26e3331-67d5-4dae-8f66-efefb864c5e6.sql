-- First, make phone column nullable in members table
ALTER TABLE members ALTER COLUMN phone DROP NOT NULL;

-- Fix upsert_member function to properly populate members table
CREATE OR REPLACE FUNCTION upsert_member(p_user_id uuid) 
RETURNS void AS $$
DECLARE
  v_profile profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE user_id = p_user_id;
  
  IF v_profile.role = 'member' THEN
    INSERT INTO members (
      user_id, 
      full_name, 
      email, 
      phone,
      branch_id,
      date_of_birth,
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      COALESCE(v_profile.full_name, split_part(v_profile.email, '@', 1)),
      v_profile.email,
      v_profile.phone,
      v_profile.branch_id,
      v_profile.date_of_birth,
      now(),
      now()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      branch_id = EXCLUDED.branch_id,
      date_of_birth = EXCLUDED.date_of_birth,
      updated_at = now();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing member records
INSERT INTO members (user_id, full_name, email, phone, branch_id, date_of_birth)
SELECT 
  p.user_id,
  COALESCE(p.full_name, split_part(p.email, '@', 1)),
  p.email,
  p.phone,
  p.branch_id,
  p.date_of_birth
FROM profiles p
WHERE p.role = 'member'
  AND NOT EXISTS (SELECT 1 FROM members m WHERE m.user_id = p.user_id)
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  branch_id = EXCLUDED.branch_id,
  updated_at = now();

-- Add RLS policy for members to view own record
DROP POLICY IF EXISTS "Members can view own record" ON members;
CREATE POLICY "Members can view own record"
ON members FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Add RLS policy for members to view targeted announcements
DROP POLICY IF EXISTS "Members can view targeted announcements" ON announcements;
CREATE POLICY "Members can view targeted announcements" 
ON announcements FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now())
  AND (target_roles IS NULL OR 'member' = ANY(target_roles))
);