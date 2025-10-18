# Fitverse Migration Plan: Supabase → Self-Hosted Backend

## Overview
Complete migration from Supabase to a self-hosted Node.js/Express/Prisma backend with PostgreSQL.

## Architecture Changes

### Before (Current)
- **Frontend**: React + Vite + Supabase Client
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth (JWT)

### After (Target)
- **Frontend**: React + Vite + Fetch/Axios
- **Backend**: Node.js + Express + Prisma
- **Database**: Self-hosted PostgreSQL
- **Auth**: Custom JWT implementation with bcrypt
- **Storage**: AWS S3 (or compatible)

---

## Phase 1: Backend Foundation ✓

### Tasks
- [x] Create `/backend` directory structure
- [x] Initialize Node.js/TypeScript project
- [x] Install core dependencies
- [x] Create basic Express server
- [x] Setup environment configuration
- [x] Create health check endpoint

### Files Created
- `/backend/package.json`
- `/backend/tsconfig.json`
- `/backend/src/server.ts`
- `/backend/src/config/database.ts`
- `/backend/.env.example`

### Dependencies
```json
{
  "express": "^4.18.2",
  "prisma": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "helmet": "^7.0.0",
  "express-rate-limit": "^6.10.0"
}
```

---

## Phase 2: Database Setup & Prisma

### Prerequisites
1. Provision a PostgreSQL database (local or cloud)
2. Execute `database-schema.sql` to create all tables, views, triggers

### Tasks
- [ ] Set `DATABASE_URL` in `/backend/.env`
- [ ] Run `prisma db pull` to introspect schema
- [ ] Run `prisma generate` to create Prisma Client
- [ ] Verify Prisma models match database

### Commands
```bash
cd backend
npm install
npx prisma db pull
npx prisma generate
```

---

## Phase 3: Authentication System

### Tasks
- [ ] Create auth routes (`/api/auth/*`)
- [ ] Implement JWT generation & verification
- [ ] Create bcrypt password hashing utilities
- [ ] Build authentication middleware
- [ ] Create email verification system
- [ ] Create password reset flow

### Endpoints to Create
```
POST   /api/auth/register          - Create new user
POST   /api/auth/login             - Login with email/password
POST   /api/auth/logout            - Logout (blacklist token)
POST   /api/auth/refresh           - Refresh access token
GET    /api/auth/me                - Get current user profile
POST   /api/auth/verify-email      - Verify email with token
POST   /api/auth/request-reset     - Request password reset
POST   /api/auth/reset-password    - Reset password with token
```

### Database Tables to Use
- `profiles` - User profiles
- `email_verification_tokens` (new table needed)
- `password_reset_tokens` (new table needed)

---

## Phase 4: Core API Endpoints

### Replacing `src/hooks/useSupabaseQuery.ts`

#### Members API
- [ ] `GET /api/members` - List all members (with branch)
- [ ] `GET /api/members/:id` - Get single member
- [ ] `POST /api/members` - Create member
- [ ] `PUT /api/members/:id` - Update member
- [ ] `DELETE /api/members/:id` - Delete member

#### Membership Plans API
- [ ] `GET /api/membership-plans` - List active plans
- [ ] `POST /api/membership-plans` - Create plan
- [ ] `PUT /api/membership-plans/:id` - Update plan
- [ ] `DELETE /api/membership-plans/:id` - Delete plan

#### Branches API
- [ ] `GET /api/branches` - List active branches
- [ ] `POST /api/branches` - Create branch
- [ ] `PUT /api/branches/:id` - Update branch
- [ ] `DELETE /api/branches/:id` - Delete branch

#### Trainers API
- [ ] `GET /api/trainers` - List active trainers
- [ ] `GET /api/trainers/:id` - Get trainer details
- [ ] `POST /api/trainers` - Create trainer
- [ ] `PUT /api/trainers/:id` - Update trainer

#### Classes API
- [ ] `GET /api/classes` - List scheduled classes
- [ ] `POST /api/classes` - Create class
- [ ] `PUT /api/classes/:id` - Update class
- [ ] `DELETE /api/classes/:id` - Delete class

### Additional Entities (40+ more endpoints)
- Products, Orders, Invoices
- Attendance, Check-ins
- Lockers, Equipment
- Feedback, Announcements
- Diet Plans, Workout Plans
- Referrals, Rewards
- Financial Transactions
- System Settings

---

## Phase 5: Authorization Middleware (RLS Replacement)

### Current RLS Policies to Replace

From `database-schema.sql`, these policies need API-layer equivalents:

```sql
-- Example: Members can only see their own data
CREATE POLICY "Members can view own profile" ON members
  FOR SELECT USING (user_id = auth.uid());

-- Example: Admins can see all data
CREATE POLICY "Admins can view all members" ON members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
```

### Middleware Implementation

```typescript
// middleware/authorize.ts
export const authorize = (allowedRoles: string[]) => {
  return async (req, res, next) => {
    const userRole = req.user.role; // From JWT
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
};

// middleware/ownershipCheck.ts
export const checkOwnership = (resourceField: string) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    const resourceId = req.params.id;
    
    // Check if user owns the resource
    const resource = await prisma[resourceField].findUnique({
      where: { id: resourceId }
    });
    
    if (resource.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
};
```

### Tasks
- [ ] Create `authorize()` middleware for role checks
- [ ] Create `checkOwnership()` middleware for resource ownership
- [ ] Create `checkBranchAccess()` for branch-scoped data
- [ ] Map all RLS policies to middleware functions

---

## Phase 6: Edge Functions Migration

### Current Edge Functions → New Routes

| Supabase Function | New Backend Route |
|------------------|-------------------|
| `create-admin-user` | `POST /api/admin/users` |
| `create-trainer-account` | `POST /api/trainers` |
| `seed-demo-accounts` | `POST /api/admin/seed` |
| `create-payment-order` | `POST /api/payments/orders` |
| `payment-webhook` | `POST /api/webhooks/payment` |
| `send-admin-welcome-email` | `POST /api/emails/welcome` |
| `send-referral-notification` | `POST /api/emails/referral` |
| `validate-discount-code` | `POST /api/discounts/validate` |

### Email Service Integration
- [ ] Choose email provider (AWS SES, SendGrid, Resend)
- [ ] Create email templates
- [ ] Implement email sending service
- [ ] Add email to registration flow
- [ ] Add email to password reset flow

### Payment Webhooks
- [ ] Setup Stripe/Razorpay webhook verification
- [ ] Handle payment success events
- [ ] Handle payment failure events
- [ ] Update database on payment status changes

---

## Phase 7: File Storage (S3)

### Setup
- [ ] Create S3 bucket (or use MinIO for self-hosted)
- [ ] Configure CORS for bucket
- [ ] Setup access keys

### Endpoints
- [ ] `POST /api/uploads/presign` - Generate presigned URL
- [ ] `POST /api/uploads/confirm` - Confirm upload complete
- [ ] `DELETE /api/uploads/:key` - Delete file

### Frontend Changes
- [ ] Update all file upload components
- [ ] Use presigned URLs for uploads
- [ ] Update avatar/image display URLs

---

## Phase 8: Frontend Migration

### Remove Supabase Dependencies
- [ ] Uninstall `@supabase/supabase-js`
- [ ] Delete `/src/integrations/supabase/`
- [ ] Delete `supabase/` directory

### Create API Client
- [ ] Create `/src/lib/api.ts` - Axios instance with interceptors
- [ ] Add JWT token management
- [ ] Add automatic token refresh
- [ ] Add error handling

### Replace All Data Hooks

#### Pattern
```typescript
// Before (Supabase)
const { data, error } = await supabase
  .from('members')
  .select('*')
  .eq('branch_id', branchId);

// After (Prisma API)
const { data, error } = await api.get('/api/members', {
  params: { branch_id: branchId }
});
```

#### Files to Update (50+ files)
- All hooks in `/src/hooks/use*.ts` or `/src/hooks/use*.tsx`
- All components making direct Supabase calls
- All service files in `/src/services/`

### Update Auth Flow
- [ ] Replace `useAuth.tsx` with API-based auth
- [ ] Update login page
- [ ] Update registration flow
- [ ] Add email verification UI
- [ ] Add password reset UI

### Update Real-time Features
- [ ] Add polling to react-query hooks
- [ ] Configure `refetchInterval` for live data
- [ ] (Optional) Add WebSocket support later

---

## Phase 9: Testing & Validation

### Backend Tests
- [ ] Test all API endpoints with Postman/Insomnia
- [ ] Verify authentication flow
- [ ] Test authorization middleware
- [ ] Load test critical endpoints

### Frontend Tests
- [ ] Test login/logout flow
- [ ] Test data fetching for all pages
- [ ] Test file uploads
- [ ] Test payment flows
- [ ] Cross-browser testing

### Security Audit
- [ ] Review all authorization checks
- [ ] Verify no SQL injection vulnerabilities
- [ ] Check JWT secret strength
- [ ] Verify CORS configuration
- [ ] Review rate limiting

---

## Phase 10: Deployment

### Backend Deployment (Render/Railway/AWS)
1. Create production PostgreSQL database
2. Run `database-schema.sql` on production
3. Set environment variables
4. Deploy backend application
5. Setup SSL certificate
6. Configure domain (e.g., `api.fitverse.com`)

### Frontend Deployment (Vercel/Netlify)
1. Update `VITE_API_BASE_URL` to production backend
2. Deploy frontend
3. Configure custom domain

### Environment Variables

#### Backend (Production)
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<strong-secret>
EMAIL_API_KEY=<ses-or-sendgrid-key>
AWS_ACCESS_KEY_ID=<s3-key>
AWS_SECRET_ACCESS_KEY=<s3-secret>
AWS_S3_BUCKET=fitverse-uploads
STRIPE_SECRET_KEY=<stripe-key>
STRIPE_WEBHOOK_SECRET=<webhook-secret>
```

#### Frontend (Production)
```bash
VITE_API_BASE_URL=https://api.fitverse.com
```

---

## Rollback Plan

If migration fails:
1. Revert frontend to commit before Supabase removal
2. Keep `database-schema.sql` - it's database-agnostic
3. Re-enable Supabase integration
4. Backend code is isolated in `/backend`, so no frontend contamination

---

## Estimated Timeline

- **Phase 1-2**: Backend setup & Prisma - **2-3 days**
- **Phase 3**: Authentication - **3-4 days**
- **Phase 4**: Core APIs - **5-7 days**
- **Phase 5**: Authorization - **2-3 days**
- **Phase 6**: Edge functions - **2-3 days**
- **Phase 7**: File storage - **1-2 days**
- **Phase 8**: Frontend migration - **7-10 days**
- **Phase 9**: Testing - **3-4 days**
- **Phase 10**: Deployment - **2-3 days**

**Total**: 27-39 days (5-8 weeks)

---

## Next Steps

1. Review this plan and approve
2. I'll create the `/backend` directory structure
3. I'll generate all boilerplate code
4. You'll provision the database and run the schema
5. We'll proceed phase by phase

**Ready to begin Phase 1?**
