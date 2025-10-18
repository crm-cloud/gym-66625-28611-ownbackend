-- STEP 1: Fix missing team_role in profiles by inferring from email patterns
UPDATE profiles
SET team_role = CASE
  WHEN email LIKE 'manager%@demo.gym' THEN 'manager'
  WHEN email LIKE 'trainer%@demo.gym' THEN 'trainer'
  WHEN email LIKE 'staff%@demo.gym' THEN 'staff'
  ELSE team_role
END
WHERE role = 'team' AND team_role IS NULL AND email LIKE '%@demo.gym';

-- STEP 2: Backfill user_roles from profiles for team roles with managers
INSERT INTO user_roles (user_id, role, team_role, branch_id)
SELECT 
  p.user_id,
  'team'::user_role,
  'manager'::team_role,
  p.branch_id
FROM profiles p
WHERE p.user_id IS NOT NULL
  AND p.role = 'team'
  AND p.team_role = 'manager'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = p.user_id AND ur.role = 'team' AND ur.team_role = 'manager'
  );

-- STEP 3: Backfill user_roles from profiles for team roles with trainers
INSERT INTO user_roles (user_id, role, team_role, branch_id)
SELECT 
  p.user_id,
  'team'::user_role,
  'trainer'::team_role,
  p.branch_id
FROM profiles p
WHERE p.user_id IS NOT NULL
  AND p.role = 'team'
  AND p.team_role = 'trainer'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = p.user_id AND ur.role = 'team' AND ur.team_role = 'trainer'
  );

-- STEP 4: Backfill user_roles from profiles for team roles with staff
INSERT INTO user_roles (user_id, role, team_role, branch_id)
SELECT 
  p.user_id,
  'team'::user_role,
  'staff'::team_role,
  p.branch_id
FROM profiles p
WHERE p.user_id IS NOT NULL
  AND p.role = 'team'
  AND p.team_role = 'staff'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = p.user_id AND ur.role = 'team' AND ur.team_role = 'staff'
  );

-- STEP 5: Backfill for member roles
INSERT INTO user_roles (user_id, role, branch_id)
SELECT 
  p.user_id,
  'member'::user_role,
  p.branch_id
FROM profiles p
WHERE p.user_id IS NOT NULL
  AND p.role = 'member'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = p.user_id AND ur.role = 'member'
  );

-- STEP 6: Backfill for admin roles
INSERT INTO user_roles (user_id, role, branch_id)
SELECT 
  p.user_id,
  p.role,
  p.branch_id
FROM profiles p
WHERE p.user_id IS NOT NULL
  AND p.role IN ('admin', 'super-admin')
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = p.user_id AND ur.role = p.role
  );

-- STEP 7: Log results for validation
DO $$
DECLARE
  v_demo_profiles INTEGER;
  v_demo_user_roles INTEGER;
  v_team_roles INTEGER;
  v_missing_roles INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_demo_profiles
  FROM profiles
  WHERE role = 'team' AND team_role IS NOT NULL AND email LIKE '%@demo.gym';
  
  SELECT COUNT(*) INTO v_demo_user_roles
  FROM user_roles ur
  JOIN profiles p ON ur.user_id = p.user_id
  WHERE p.email LIKE '%@demo.gym';
  
  SELECT COUNT(*) INTO v_team_roles
  FROM user_roles
  WHERE role = 'team';
  
  SELECT COUNT(*) INTO v_missing_roles
  FROM profiles p
  WHERE p.user_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.user_id);
  
  RAISE NOTICE '=== BACKFILL RESULTS ===';
  RAISE NOTICE 'Demo profiles with team_role: %', v_demo_profiles;
  RAISE NOTICE 'Demo user_roles entries: %', v_demo_user_roles;
  RAISE NOTICE 'Total team user_roles: %', v_team_roles;
  RAISE NOTICE 'Profiles without user_roles: %', v_missing_roles;
  RAISE NOTICE '========================';
END $$;