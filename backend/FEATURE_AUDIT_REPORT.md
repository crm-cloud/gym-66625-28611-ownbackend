# Feature Audit Report - Post Migration

## Executive Summary
Comprehensive audit conducted after migration from Supabase to Express/Prisma/PostgreSQL stack. Several critical issues identified related to schema inconsistencies after the RBAC structure migration.

## 🔴 CRITICAL ISSUES IDENTIFIED

### 1. Schema Field Access After Migration
**Status:** 🔴 CRITICAL - Will cause runtime errors

The RBAC migration removed `role`, `team_role`, `gym_id`, and `branch_id` from the `profiles` table, but several services are still trying to access these fields.

**Affected Files:**
- `backend/src/services/user.service.ts` (lines 42-54, 210)
- `backend/src/services/auth.service.ts` (lines 132-148, 358-361) ⚠️ BLOCKING LOGIN
- `backend/src/services/token-rotation.service.ts` (lines 54-65)

**Impact:**
- Login will fail when trying to generate JWT tokens
- User listing will fail
- Token refresh will fail

**Fix Required:**
These services must be updated to:
1. Query `user_roles` table to get role/branch/gym information
2. Use LEFT JOIN to include role data in user queries
3. Update JWT token generation to include role from `user_roles`

### 2. Prisma Schema Relations (FIXED ✅)
**Status:** ✅ RESOLVED

Three relation errors were identified and fixed:
1. Removed unused `profiles_profiles` relation from `branches` model
2. Removed unused `profiles_gym` relation from `gyms` model  
3. Removed incorrect `user_roles` relation from `roles` model

**Note:** The `roles` table is for custom role definitions with permissions. The `user_roles` table uses the `user_role` enum, not foreign keys to `roles`.

---

## 🟡 MODERATE ISSUES

### 3. Member Service Schema Assumptions
**Status:** 🟡 NEEDS REVIEW

**File:** `backend/src/services/member.service.ts` (lines 44-48)

The service includes relations that may not exist:
```typescript
trainer_profiles: { select: { name: true, id: true } },
membership_plans: { select: { name: true, id: true, price: true } }
```

**Review Needed:**
- Verify `members.trainer_profiles` relation exists (should be via `preferred_trainer_id`)
- Verify `members.membership_plans` relation exists (members don't directly have plans, `member_memberships` do)

### 4. User Service Role-Based Filtering
**Status:** 🟡 NEEDS UPDATE

**File:** `backend/src/services/user.service.ts` (lines 10-72)

The `getUsers` method tries to filter by `branch_id` and `gym_id` on `profiles` table, but these fields no longer exist there.

**Required Changes:**
- Add JOIN with `user_roles` table
- Filter by `user_roles.branch_id` and `user_roles.gym_id`
- Select role from `user_roles` instead of `profiles`

---

## 🟢 GOOD PRACTICES FOUND

### 5. Payment Service Architecture ✅
**Status:** ✅ GOOD

**File:** `backend/src/services/payment.service.ts`

- Uses raw SQL queries for flexibility
- Properly uses `payment_transaction_status` enum
- Clean separation of concerns
- Good error handling

### 6. No Supabase Remnants ✅
**Status:** ✅ CLEAN

- No `useSupabaseQuery` hooks found in frontend
- Successfully migrated away from Supabase client usage

---

## 📋 DETAILED FIX RECOMMENDATIONS

### Priority 1: Fix Authentication (BLOCKING)

**auth.service.ts** needs immediate update:

```typescript
// Current (BROKEN):
const user = await prisma.profiles.findUnique({
  where: { email: body.email },
  select: {
    user_id: true,
    email: true,
    password_hash: true,
    full_name: true,
    phone: true,
    role: true,  // ❌ DOESN'T EXIST
    branch_id: true,  // ❌ DOESN'T EXIST
    gym_id: true,  // ❌ DOESN'T EXIST
    avatar_url: true,
    is_active: true,
  }
});

// Fixed:
const user = await prisma.profiles.findUnique({
  where: { email: body.email },
  select: {
    user_id: true,
    email: true,
    password_hash: true,
    full_name: true,
    phone: true,
    avatar_url: true,
    is_active: true,
    user_roles: {
      select: {
        role: true,
        branch_id: true,
        gym_id: true,
        team_role: true,
      }
    },
    owned_gyms: {
      select: {
        id: true,
        name: true,
      }
    }
  }
});

// Then extract role info:
const primaryRole = user.user_roles[0] || { role: 'member', branch_id: null, gym_id: null };
```

### Priority 2: Fix User Service

**user.service.ts** needs to:
1. Include `user_roles` in all queries
2. Remove direct references to `profiles.role`, `profiles.branch_id`, `profiles.gym_id`
3. Filter using `user_roles` table

### Priority 3: Fix Token Rotation

**token-rotation.service.ts** needs to:
1. Store role information in a way that's compatible with the new structure
2. Include `user_roles` data when storing token user data

---

## 🔍 TESTING CHECKLIST

After implementing fixes, test:

- [ ] Super Admin Login (401 error should be resolved)
- [ ] Admin Login
- [ ] Staff/Manager Login
- [ ] Token Refresh
- [ ] User Listing (with role-based filtering)
- [ ] Member Creation (ensure `user_roles` entry is created)
- [ ] Admin Creation by Super Admin
- [ ] Gym Creation by Admin

---

## 📊 SCHEMA ALIGNMENT STATUS

### ✅ Correctly Aligned:
- `payments` table using `payment_transaction_status` enum
- `admin_subscriptions` table structure
- `user_roles` table structure
- Prisma schema relations

### ⚠️ Needs Alignment:
- Services querying removed fields from `profiles`
- JWT token payload structure (includes removed fields)
- Middleware assuming `req.user.role` from token

---

## 🎯 NEXT STEPS

1. **IMMEDIATE:** Fix `auth.service.ts` to resolve login 401 errors
2. **HIGH:** Update `user.service.ts` role querying
3. **HIGH:** Update `token-rotation.service.ts` 
4. **MEDIUM:** Review `member.service.ts` relations
5. **LOW:** Add integration tests for new RBAC structure

---

## 📝 NOTES

### RBAC Structure Understanding
- `profiles` table: Core user authentication data only
- `user_roles` table: User role assignments with enum values (not FK to `roles`)
- `roles` table: Custom role definitions with permissions (RBAC system)
- `role_permissions` table: Links custom roles to permissions
- `admin_subscriptions` table: Tracks subscription plans for admin users

### Business Logic Flow
1. Super Admin creates Admin accounts → assigns subscription plan
2. Admin creates their own Gym (owner_id in gyms table)
3. Admin creates Branches under their Gym
4. Admin/Manager creates Staff/Trainers/Members

---

**Audit Completed:** 2024-01-XX  
**Audited By:** AI Assistant  
**Status:** Fixes Required - Authentication Currently Blocked
