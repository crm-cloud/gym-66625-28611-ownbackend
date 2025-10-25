# Authentication Fix Testing Guide

## What Was Fixed

### Critical Issues Resolved:
1. ✅ **Missing Password Hash** - Super admin was created without a password hash
2. ✅ **Wrong Role Assignment** - Super admin had 'staff' role instead of 'super_admin'
3. ✅ **Email Case Sensitivity** - Added email normalization (lowercase + trim)
4. ✅ **Verification Script** - Created tool to debug authentication issues

## Quick Start Testing

### Step 1: Recreate Super Admin

```bash
cd backend

# Delete existing super admin (if exists)
npx prisma studio
# In Prisma Studio: Delete the superadmin@example.com profile and its user_roles

# OR use SQL:
# psql -d your_database -c "DELETE FROM user_roles WHERE user_id = (SELECT user_id FROM profiles WHERE email = 'superadmin@example.com'); DELETE FROM profiles WHERE email = 'superadmin@example.com';"

# Create new super admin with proper password hash
npm run create-admin
```

**Expected Output:**
```
🔐 Hashing password...
✅ Password hashed successfully
✅ Profile created: [UUID]
✅ Super admin created successfully!
==================================
Email: superadmin@example.com
Password: SuperAdmin@123
==================================
⚠️  IMPORTANT: Change password after first login!
📧 Email verified: true
✅ Account active: true
```

### Step 2: Verify Super Admin

```bash
npm run verify-admin
```

**Expected Output:**
```
✅ Super admin found:
==================================
  Email: superadmin@example.com
  User ID: [UUID]
  Full Name: Super Admin
  Has password hash: true
  Password hash length: ~165
  Is active: true
  Email verified: true
  Profile role: super_admin
  User roles:
    - { id: '[UUID]', role: 'super_admin', ... }
  Password verification: ✅ VALID
==================================
```

### Step 3: Test Login via Frontend

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend:
```bash
cd ..
npm run dev
```

3. Open browser and navigate to login page
4. Enter credentials:
   - Email: `superadmin@example.com`
   - Password: `SuperAdmin@123`
5. Click "Sign In"

**Expected Result:**
- ✅ Login successful
- ✅ Redirected to dashboard
- ✅ User data loaded in header/sidebar
- ✅ No 401 or 403 errors

### Step 4: Test Login via API

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "SuperAdmin@123"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "superadmin@example.com",
    "name": "Super Admin",
    "role": "super_admin",
    "emailVerified": true
  }
}
```

### Step 5: Test /me Endpoint

```bash
# Use the access_token from previous response
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "id": "...",
  "email": "superadmin@example.com",
  "name": "Super Admin",
  "role": "super_admin",
  "emailVerified": true,
  "isActive": true
}
```

## Troubleshooting

### Issue: "Super admin already exists" but password doesn't work

**Solution:**
```bash
# Run verify script first
npm run verify-admin

# If password verification shows ❌ INVALID:
# 1. Delete the existing user
# 2. Run create-admin again
```

### Issue: 401 Unauthorized still occurs

**Check:**
1. Password hash exists: `npm run verify-admin`
2. Password verification passes: Should show "✅ VALID"
3. Account is active: `is_active: true`
4. Email is verified: `email_verified: true`
5. Role is correct: `role: super_admin`

### Issue: Frontend shows "Session expired"

**Check:**
1. Backend server is running on port 3000
2. Frontend axios base URL is correct: `/api/v1`
3. Token is stored in localStorage: `access_token`
4. Browser console for any CORS errors

## File Changes Summary

### Backend:
- ✅ `backend/scripts/create-super-admin.ts` - Fixed password hashing, role assignment
- ✅ `backend/scripts/verify-super-admin.ts` - NEW: Verification script
- ✅ `backend/src/services/auth.service.ts` - Added email normalization

### No Changes Required:
- ✅ `backend/src/utils/crypto-utils.ts` - Already correct
- ✅ `backend/src/controllers/auth.controller.ts` - Already correct
- ✅ `src/hooks/useAuth.tsx` - Already migrated from Supabase
- ✅ `src/lib/axios.ts` - Already has correct interceptor

## Security Notes

### Password Hashing:
- Method: PBKDF2-SHA512
- Salt: 16 bytes random (per password)
- Iterations: 10,000
- Key length: 64 bytes
- Format: `salt:iterations:keylen:digest:hash`

### Email Normalization:
- All emails converted to lowercase
- Whitespace trimmed
- Applied to: login, register, password reset

### Super Admin Bypass:
- Super admin role bypasses ALL authorization checks
- Implemented in `authorize.ts` middleware
- Can access any endpoint regardless of required roles

## Next Steps

1. ✅ **Change Default Password** - After first login, change from `SuperAdmin@123`
2. 🔐 **Create Additional Users** - Use registration endpoint or admin panel
3. 📧 **Configure Email Service** - Set up SMTP for email verification
4. 🔒 **Enable 2FA** - Consider adding two-factor authentication
5. 📊 **Add Logging** - Track authentication events for security monitoring

## Support

If you encounter any issues:
1. Run `npm run verify-admin` to check user state
2. Check backend logs for detailed error messages
3. Verify database schema matches Prisma schema
4. Ensure all migrations have been applied
