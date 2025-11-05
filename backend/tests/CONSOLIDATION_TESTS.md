# Consolidation Tests

## Prerequisites

```bash
# 1. Run database migrations
cd backend
npx prisma migrate dev --name consolidate_settings_schema
npx prisma generate

# 2. Start backend server
npm run dev

# 3. Create test users (if not exists)
npm run create-admin
```

---

## Test 1: Authentication System ✅

### 1.1 Login Test (Bcrypt)
```bash
# Expected: 200 OK with access_token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "SuperAdmin@123"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "user_id": "xxx",
    "email": "superadmin@example.com",
    "role": "super_admin",
    "full_name": "Super Admin"
  },
  "access_token": "eyJhbGciOi...",
  "refresh_token": "eyJhbGciOi..."
}
```

### 1.2 Get Current User (Uses authenticate middleware)
```bash
# Expected: 200 OK with user profile
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "user_id": "xxx",
  "email": "superadmin@example.com",
  "full_name": "Super Admin",
  "role": "super_admin",
  "gym_id": null,
  "branch_id": null,
  "email_verified": true,
  "is_active": true
}
```

### 1.3 Verify Role Reading (From user_roles table)
```bash
# Check logs - should show:
# "Authenticated user: superadmin@example.com with role: super_admin"
```

**Verification:**
```sql
-- Check that role is read from user_roles, not profiles
SELECT 
  p.email,
  ur.role,
  r.name as role_name
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
LEFT JOIN roles r ON ur.role = r.name
WHERE p.email = 'superadmin@example.com';
```

---

## Test 2: Settings System (Hierarchical) ✅

### 2.1 Create Global Email Settings (Super Admin)
```bash
# Expected: 200 OK
curl -X POST http://localhost:5000/api/v1/settings/email \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_user": "noreply@globalfitness.com",
    "smtp_password": "global_password_123",
    "from_email": "noreply@globalfitness.com",
    "from_name": "Global Fitness Network"
  }'
```

**Expected DB State:**
```sql
SELECT * FROM system_settings WHERE category = 'email';
-- gym_id: NULL
-- branch_id: NULL
-- config: { "smtp_host": "smtp.gmail.com", ... }
```

### 2.2 Create Gym-Level Email Settings (Admin)
```bash
# First, create admin user and gym
# Then login as admin to get token

curl -X POST http://localhost:5000/api/v1/settings/email \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "smtp_host": "smtp.sendgrid.net",
    "smtp_port": 587,
    "smtp_user": "apikey",
    "smtp_password": "SG.gym_specific_key",
    "from_email": "noreply@mygym.com"
  }'
```

**Expected DB State:**
```sql
SELECT * FROM system_settings WHERE category = 'email';
-- Row 1: gym_id: NULL, branch_id: NULL (Global)
-- Row 2: gym_id: <gym_id>, branch_id: NULL (Gym override)
```

### 2.3 Create Branch-Level SMS Settings (Manager)
```bash
curl -X POST http://localhost:5000/api/v1/settings/sms \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "twilio",
    "account_sid": "ACxxx_branch_specific",
    "auth_token": "branch_token_123",
    "from_number": "+1234567890"
  }'
```

**Expected DB State:**
```sql
SELECT * FROM system_settings WHERE category = 'sms';
-- Row 1: gym_id: <gym_id>, branch_id: <branch_id> (Branch-specific)
```

### 2.4 Test Settings Inheritance (GET)

#### Scenario A: Admin Gets Email Settings
```bash
# Admin has gym_id but no branch_id
# Should get gym-level settings (overrides global)
curl -X GET http://localhost:5000/api/v1/settings/email \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "category": "email",
  "config": {
    "smtp_host": "smtp.sendgrid.net",  // <-- Gym override
    "smtp_port": 587,
    "smtp_user": "apikey",
    "smtp_password": "SG.gym_specific_key",
    "from_email": "noreply@mygym.com"
  },
  "source": "gym"  // Indicates it came from gym-level
}
```

#### Scenario B: Manager Gets Email Settings
```bash
# Manager has gym_id AND branch_id
# Should get branch-level if exists, else gym-level, else global
curl -X GET http://localhost:5000/api/v1/settings/email \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

**Expected Response:**
```json
{
  "category": "email",
  "config": {
    "smtp_host": "smtp.sendgrid.net",  // <-- Gym level (no branch override)
    "smtp_port": 587,
    "from_email": "noreply@mygym.com"
  },
  "source": "gym"
}
```

#### Scenario C: Manager Gets SMS Settings
```bash
# Manager created branch-level SMS settings
# Should get branch-level override
curl -X GET http://localhost:5000/api/v1/settings/sms \
  -H "Authorization: Bearer $MANAGER_TOKEN"
```

**Expected Response:**
```json
{
  "category": "sms",
  "config": {
    "provider": "twilio",
    "account_sid": "ACxxx_branch_specific",  // <-- Branch override
    "auth_token": "branch_token_123",
    "from_number": "+1234567890"
  },
  "source": "branch"
}
```

### 2.5 Test Settings Cascade (Update)

```bash
# Create global payment settings
curl -X POST http://localhost:5000/api/v1/settings/payment \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stripe_publishable_key": "pk_test_global",
    "stripe_secret_key": "sk_test_global"
  }'

# Admin overrides with gym-specific Stripe keys
curl -X POST http://localhost:5000/api/v1/settings/payment \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stripe_publishable_key": "pk_live_mygym",
    "stripe_secret_key": "sk_live_mygym"
  }'

# Verify admin gets gym-level keys
curl -X GET http://localhost:5000/api/v1/settings/payment \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Expected: "stripe_publishable_key": "pk_live_mygym"
```

### 2.6 Test All Settings (Super Admin View)
```bash
# Super Admin should see all categories
curl -X GET http://localhost:5000/api/v1/settings \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "email": {
    "config": { "smtp_host": "smtp.gmail.com", ... },
    "source": "global"
  },
  "sms": {
    "config": { ... },
    "source": "default"  // No settings created yet
  },
  "payment": {
    "config": { "stripe_publishable_key": "pk_test_global", ... },
    "source": "global"
  },
  "whatsapp": {
    "config": { ... },
    "source": "default"
  },
  "notification": {
    "config": { ... },
    "source": "default"
  },
  "general": {
    "config": { ... },
    "source": "default"
  }
}
```

---

## Test 3: Settings Security (RBAC)

### 3.1 Staff Cannot Update Settings
```bash
# Expected: 403 Forbidden
curl -X POST http://localhost:5000/api/v1/settings/email \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "smtp_host": "hack.com" }'
```

**Expected Response:**
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 3.2 Admin Cannot Create Global Settings
```bash
# Admin tries to create global settings (gym_id = null)
# Expected: Settings created with admin's gym_id (not global)
curl -X POST http://localhost:5000/api/v1/settings/email \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "smtp_host": "admin-attempt-global.com" }'
```

**Verification:**
```sql
-- Check that settings were created with gym_id, not as global
SELECT gym_id, branch_id FROM system_settings 
WHERE category = 'email' AND config->>'smtp_host' = 'admin-attempt-global.com';
-- Expected: gym_id IS NOT NULL
```

### 3.3 Manager Cannot Update Gym-Level Settings
```bash
# Manager tries to update gym-level settings
# Expected: Creates branch-level settings instead (doesn't override gym)
curl -X POST http://localhost:5000/api/v1/settings/payment \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "stripe_publishable_key": "pk_test_branch_override" }'
```

**Verification:**
```sql
SELECT gym_id, branch_id FROM system_settings 
WHERE category = 'payment' AND config->>'stripe_publishable_key' = 'pk_test_branch_override';
-- Expected: Both gym_id AND branch_id are NOT NULL
```

---

## Test 4: Settings Test Endpoints

### 4.1 Test Email Settings
```bash
curl -X POST http://localhost:5000/api/v1/settings/email/test \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_user": "test@example.com",
    "smtp_password": "test_password",
    "from_email": "test@example.com",
    "to_email": "recipient@example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully"
}
```

### 4.2 Test SMS Settings
```bash
curl -X POST http://localhost:5000/api/v1/settings/sms/test \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "twilio",
    "account_sid": "ACxxx",
    "auth_token": "xxx",
    "from_number": "+1234567890",
    "to_number": "+0987654321"
  }'
```

---

## Verification Checklist

### Authentication ✅
- [ ] Login returns JWT tokens (bcrypt verification)
- [ ] `/auth/me` returns user profile
- [ ] Role is read from `user_roles` table (check logs)
- [ ] Invalid token returns 401
- [ ] Inactive user cannot authenticate

### Settings Hierarchy ✅
- [ ] Global settings (super_admin) have NULL gym_id AND branch_id
- [ ] Gym settings (admin) have gym_id set, branch_id NULL
- [ ] Branch settings (manager) have both gym_id AND branch_id set
- [ ] Settings cascade correctly (branch → gym → global)
- [ ] Encrypted fields (passwords, keys) are encrypted in DB

### Settings RBAC ✅
- [ ] Only admin/super_admin can update settings
- [ ] Staff/Trainer cannot access settings endpoints
- [ ] Admin cannot create global settings
- [ ] Manager cannot modify gym-level settings directly

### Database Schema ✅
- [ ] `system_settings` table has all columns (category, gym_id, branch_id, config, is_active)
- [ ] Unique constraint on (category, gym_id, branch_id)
- [ ] Foreign keys to gyms and branches with CASCADE delete
- [ ] Indexes on category, gym_id, branch_id

---

## Rollback Plan (If Needed)

If consolidation causes issues:

### 1. Rollback Settings Migration
```bash
# Revert to previous migration
npx prisma migrate resolve --rolled-back consolidate_settings_schema
```

### 2. Restore auth.service.ts
```bash
git checkout HEAD -- backend/src/services/auth.service.ts
```

### 3. Update Routes
```typescript
// backend/src/routes/auth.routes.ts
import { authService } from '../services/auth.service';
// ... restore old imports
```

---

## Success Criteria

✅ **Authentication**
- All login requests use bcrypt (auth.controller.ts)
- No 401 errors for valid credentials
- Roles are correctly read from user_roles table

✅ **Settings**
- Hierarchical settings work (global → gym → branch)
- Encryption works for sensitive fields
- RBAC prevents unauthorized updates
- Test endpoints successfully send emails/SMS

✅ **Database**
- `npx prisma generate` succeeds
- No schema validation errors
- All relations are correct

---

## Next Steps

After successful testing:

1. ✅ Remove test data from system_settings
2. ✅ Document settings categories in API docs
3. ✅ Update frontend to use new settings structure
4. ✅ Add settings UI for each role
5. ✅ Implement settings import/export for backups
