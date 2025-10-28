# Authentication Testing Guide

## Quick Start Testing

### 1. Setup Database

```bash
cd backend

# Run migration
npx prisma db push

# Generate Prisma client
npx prisma generate

# Delete old super admin if exists
psql -d gymflow -c "
DELETE FROM user_roles WHERE user_id IN (SELECT user_id FROM profiles WHERE email = 'superadmin@example.com');
DELETE FROM profiles WHERE email = 'superadmin@example.com';
"

# Create new super admin
npm run create-admin

# Verify
npm run verify-admin
```

### 2. Test Super Admin Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "SuperAdmin@123"
  }' | jq
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": {
    "user_id": "uuid",
    "email": "superadmin@example.com",
    "full_name": "Super Admin",
    "role": "super_admin",
    "gym_id": null,
    "branch_id": null
  },
  "access_token": "eyJhbG...",
  "refresh_token": "eyJhbG..."
}
```

### 3. Test /me Endpoint

```bash
# Save token from previous step
TOKEN="your_access_token_here"

curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**
```json
{
  "user_id": "uuid",
  "email": "superadmin@example.com",
  "full_name": "Super Admin",
  "role": "super_admin",
  "is_active": true,
  "email_verified": true,
  "gym_id": null,
  "branch_id": null
}
```

### 4. Create Subscription Plan (One-time setup)

```bash
# First, create a subscription plan for admins
psql -d gymflow -c "
INSERT INTO subscription_plans (id, name, price_monthly, price_yearly, max_branches, max_members, max_staff, is_active)
VALUES (
  gen_random_uuid(),
  'Pro Plan',
  99.99,
  999.99,
  5,
  1000,
  50,
  true
)
RETURNING id, name;
"
```

**Save the returned UUID for next step!**

### 5. Super Admin Creates Admin

```bash
# Use your super admin token
SUPER_ADMIN_TOKEN="your_super_admin_token"
SUBSCRIPTION_PLAN_ID="uuid_from_step_4"

curl -X POST http://localhost:3001/api/v1/admin-management/create-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -d "{
    \"email\": \"admin@fitzone.com\",
    \"full_name\": \"John Smith\",
    \"phone\": \"+1234567890\",
    \"subscription_plan_id\": \"$SUBSCRIPTION_PLAN_ID\"
  }" | jq
```

**Expected Response:**
```json
{
  "message": "Admin account created successfully",
  "admin": {
    "user_id": "uuid",
    "email": "admin@fitzone.com",
    "full_name": "John Smith",
    "phone": "+1234567890"
  },
  "tempPassword": "Abc123@xyz",
  "subscription": {
    "id": "uuid",
    "name": "Pro Plan",
    "max_branches": 5,
    "max_members": 1000
  },
  "important": "Send this temporary password to the admin securely..."
}
```

**⚠️ Save the tempPassword!**

### 6. Admin Login

```bash
TEMP_PASSWORD="password_from_step_5"

curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@fitzone.com\",
    \"password\": \"$TEMP_PASSWORD\"
  }" | jq
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": {
    "user_id": "uuid",
    "email": "admin@fitzone.com",
    "full_name": "John Smith",
    "role": "admin",
    "gym_id": null,
    "gym_name": null
  },
  "access_token": "eyJhbG...",
  "refresh_token": "eyJhbG..."
}
```

**Note:** gym_id is null because admin hasn't created their gym yet!

### 7. Admin Creates Gym

```bash
ADMIN_TOKEN="admin_access_token_from_step_6"

curl -X POST http://localhost:3001/api/v1/admin-management/create-gym \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "gym_name": "FitZone Gym"
  }' | jq
```

**Expected Response:**
```json
{
  "message": "Gym created successfully",
  "gym": {
    "id": "uuid",
    "name": "FitZone Gym",
    "owner_id": "uuid",
    "status": "active"
  },
  "subscription": {
    "plan_name": "Pro Plan",
    "max_branches": 5,
    "max_members": 1000
  }
}
```

### 8. Admin Login Again (Should Have Gym)

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@fitzone.com\",
    \"password\": \"$TEMP_PASSWORD\"
  }" | jq
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": {
    "user_id": "uuid",
    "email": "admin@fitzone.com",
    "full_name": "John Smith",
    "role": "admin",
    "gym_id": "uuid",
    "gym_name": "FitZone Gym"
  },
  "access_token": "eyJhbG...",
  "refresh_token": "eyJhbG..."
}
```

**✅ Now admin has their gym!**

### 9. Admin Views Subscription

```bash
curl -X GET http://localhost:3001/api/v1/admin-management/subscription \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```

**Expected Response:**
```json
{
  "subscription": {
    "plan_name": "Pro Plan",
    "max_branches": 5,
    "max_members": 1000,
    "max_staff": 50,
    "features": {...},
    "assigned_at": "2024-01-01T00:00:00Z",
    "assigned_by": "Super Admin",
    "status": "active"
  }
}
```

## Verification Queries

### Check User Roles

```sql
SELECT 
  p.email,
  p.full_name,
  ur.role,
  ur.gym_id,
  ur.branch_id,
  g.name as gym_name
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
LEFT JOIN gyms g ON ur.gym_id = g.id
WHERE p.email IN ('superadmin@example.com', 'admin@fitzone.com')
ORDER BY p.email;
```

### Check Admin Subscriptions

```sql
SELECT 
  p.email,
  asub.status,
  sp.name as plan_name,
  sp.max_branches,
  sp.max_members,
  asub.assigned_at
FROM profiles p
JOIN admin_subscriptions asub ON p.user_id = asub.admin_id
JOIN subscription_plans sp ON asub.subscription_plan_id = sp.id
WHERE p.email = 'admin@fitzone.com';
```

### Check Gym Ownership

```sql
SELECT 
  g.name as gym_name,
  g.status,
  p.email as owner_email,
  p.full_name as owner_name,
  sp.name as subscription_plan
FROM gyms g
JOIN profiles p ON g.owner_id = p.user_id
LEFT JOIN subscription_plans sp ON g.subscription_plan_id = sp.id;
```

## Common Issues & Solutions

### Issue: 401 Unauthorized

**Cause:** Missing or invalid user_roles entry

**Fix:**
```bash
npm run verify-admin
```

If verification fails, recreate super admin:
```bash
npm run create-admin
```

### Issue: Admin Already Has Gym

**Cause:** Admin tried to create multiple gyms

**Solution:** Each admin can only create ONE gym. If they need multiple locations, create branches instead.

### Issue: No Active Subscription

**Cause:** Admin has no subscription assigned

**Fix:**
```bash
# Super admin must assign subscription first
curl -X POST http://localhost:3001/api/v1/admin-management/create-admin \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -d '{...}'
```

### Issue: Password Hash Invalid

**Symptom:** Login returns 401 but user exists

**Fix:**
1. Check password hash format:
```sql
SELECT email, length(password_hash) as hash_length 
FROM profiles 
WHERE email = 'superadmin@example.com';
```

2. If hash_length is 0 or wrong, recreate user:
```bash
npm run create-admin
```

## Security Checklist

- [x] Roles stored ONLY in user_roles (not profiles)
- [x] Super admins have NO gym_id or branch_id
- [x] Admins start with NO gym (create their own)
- [x] Password hashes use PBKDF2 with salt
- [x] Temp passwords are cryptographically secure
- [x] JWT tokens include role information
- [x] Authorization checks use database roles
- [x] Subscription limits enforced

## Next Steps

After successful testing:

1. ✅ Test frontend login flow
2. ✅ Test role-based UI rendering
3. ✅ Test permission checks on protected endpoints
4. ✅ Implement admin dashboard
5. ✅ Implement gym/branch creation UI
6. ✅ Add subscription management UI
