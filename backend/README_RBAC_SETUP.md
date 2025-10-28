# RBAC & Admin Management Setup Guide

## Overview
This system implements proper Role-Based Access Control (RBAC) with a clear admin/gym hierarchy:

- **Super Admin** creates **Admin** accounts
- **Admin** creates their own **Gym**
- **Admin** manages their **Branches**, **Staff**, and **Members**

## Database Schema Changes

### ✅ Completed Changes

1. **Removed redundant fields from `profiles` table:**
   - ❌ `role` (now only in `user_roles`)
   - ❌ `team_role` (now only in `user_roles`)
   - ❌ `gym_id` (now only in `user_roles`)
   - ❌ `branch_id` (now only in `user_roles`)

2. **Added `admin_subscriptions` table:**
   - Tracks subscription plans assigned to admin accounts
   - Links admins to their subscription limits

3. **Cleaned up `user_roles` table:**
   - Removed unused `rolesId` field
   - Roles are now properly stored using the `user_role` enum

## Setup Instructions

### Step 1: Run Database Migration

```bash
cd backend
npx prisma db push
npx prisma generate
```

### Step 2: Create Super Admin

**Delete existing super admin first (if exists):**

```bash
psql -d your_database -c "
DELETE FROM user_roles WHERE user_id = (SELECT user_id FROM profiles WHERE email = 'superadmin@example.com');
DELETE FROM profiles WHERE email = 'superadmin@example.com';
"
```

**Create new super admin:**

```bash
npm run create-admin
```

**Verify super admin:**

```bash
npm run verify-admin
```

Expected output:
```
✅ Super admin found:
  Email: superadmin@example.com
  Has password hash: true
  Is active: true
  Email verified: true
  User roles:
    - { role: 'super_admin', gym_id: null, branch_id: null }
  Password verification: ✅ VALID
```

## API Endpoints

### 1. Super Admin Creates Admin Account

**Endpoint:** `POST /api/v1/admin-management/create-admin`

**Authorization:** Super Admin only

**Request Body:**
```json
{
  "email": "admin@example.com",
  "full_name": "John Admin",
  "phone": "+1234567890",
  "subscription_plan_id": "uuid-of-plan"
}
```

**Response:**
```json
{
  "message": "Admin account created successfully",
  "admin": {
    "user_id": "uuid",
    "email": "admin@example.com",
    "full_name": "John Admin",
    "phone": "+1234567890"
  },
  "tempPassword": "Abc123@xyz",
  "subscription": {
    "id": "uuid",
    "name": "Pro Plan",
    "max_branches": 5,
    "max_members": 1000
  },
  "important": "Send this temporary password to the admin securely. They must change it on first login."
}
```

### 2. Admin Creates Gym

**Endpoint:** `POST /api/v1/admin-management/create-gym`

**Authorization:** Admin only

**Request Body:**
```json
{
  "gym_name": "FitZone Gym"
}
```

**Response:**
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

### 3. Admin Views Subscription

**Endpoint:** `GET /api/v1/admin-management/subscription`

**Authorization:** Admin only

**Response:**
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

## Testing Workflow

### Test 1: Super Admin Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "SuperAdmin@123"
  }'
```

**Expected:** 200 OK with access_token and user.role = "super_admin"

### Test 2: Super Admin Creates Admin

```bash
curl -X POST http://localhost:3001/api/v1/admin-management/create-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "email": "admin@fitzone.com",
    "full_name": "John Smith",
    "phone": "+1234567890",
    "subscription_plan_id": "SUBSCRIPTION_PLAN_UUID"
  }'
```

**Expected:** 201 Created with admin details and temporary password

### Test 3: Admin Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fitzone.com",
    "password": "TEMP_PASSWORD_FROM_STEP_2"
  }'
```

**Expected:** 200 OK with user.role = "admin", gym_id = null (no gym yet)

### Test 4: Admin Creates Gym

```bash
curl -X POST http://localhost:3001/api/v1/admin-management/create-gym \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "gym_name": "FitZone Gym"
  }'
```

**Expected:** 201 Created with gym details

### Test 5: Admin Login Again (Should Have Gym)

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fitzone.com",
    "password": "TEMP_PASSWORD"
  }'
```

**Expected:** 200 OK with gym_id and gym_name populated

## Business Logic Rules

### ✅ Super Admin
- **CAN:** Create admin accounts, assign subscription plans
- **CANNOT:** Have gym_id or branch_id
- **SCOPE:** Global (manages all gyms)

### ✅ Admin
- **CAN:** Create ONE gym, manage their gym's branches/staff/members
- **CANNOT:** Create other admin accounts, access other gyms
- **SCOPE:** Gym-level (their gym only)
- **MUST:** Have active subscription plan assigned by super admin

### ✅ Manager
- **CAN:** Manage assigned branch, staff, members
- **SCOPE:** Branch-level

### ✅ Trainer/Staff
- **CAN:** View and manage their assigned members
- **SCOPE:** Self + assigned members

### ✅ Member
- **CAN:** View and edit own profile
- **SCOPE:** Self only

## Security Features

1. **Role Storage:** Roles stored ONLY in `user_roles` table (not on profiles)
2. **Subscription Enforcement:** Admins must have active subscription to create gym
3. **One Gym Per Admin:** Each admin can create only one gym
4. **Temporary Passwords:** Auto-generated secure passwords for new admins
5. **No Hardcoded Credentials:** All role checks use database values

## Troubleshooting

### Issue: 401 Unauthorized on Login

**Check:**
1. User exists in `profiles` table
2. User has entry in `user_roles` table
3. Password hash exists and is valid
4. Account is active (`is_active = true`)

**Fix:**
```bash
npm run verify-admin
```

### Issue: Admin Cannot Create Gym

**Check:**
1. Admin has active subscription in `admin_subscriptions`
2. Admin doesn't already have a gym
3. Subscription plan is valid and active

**Query:**
```sql
SELECT 
  p.email,
  ur.role,
  g.name as gym_name,
  asub.status as subscription_status,
  sp.name as plan_name
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
LEFT JOIN gyms g ON g.owner_id = p.user_id
LEFT JOIN admin_subscriptions asub ON p.user_id = asub.admin_id
LEFT JOIN subscription_plans sp ON asub.subscription_plan_id = sp.id
WHERE p.email = 'admin@example.com';
```

### Issue: Super Admin Has gym_id

**This is incorrect!** Super admins should NOT have gym_id or branch_id.

**Fix:**
```sql
UPDATE user_roles 
SET gym_id = NULL, branch_id = NULL 
WHERE role = 'super_admin';
```

## Migration Checklist

- [x] Create migration SQL file
- [x] Update Prisma schema
- [x] Add admin_subscriptions table
- [x] Remove role/gym/branch from profiles
- [x] Fix user_roles structure
- [x] Create admin management service
- [x] Create admin management controller
- [x] Create admin management routes
- [x] Update auth controller login logic
- [x] Update create-super-admin script
- [x] Update verify-super-admin script
- [x] Register routes in server.ts
- [ ] Run migration on database
- [ ] Test super admin login
- [ ] Test admin creation
- [ ] Test admin gym creation
- [ ] Test role-based access

## Next Steps

1. Run the migration: `npx prisma db push`
2. Recreate super admin: `npm run create-admin`
3. Verify setup: `npm run verify-admin`
4. Test the workflow using the curl commands above
5. Update frontend to support new flow
