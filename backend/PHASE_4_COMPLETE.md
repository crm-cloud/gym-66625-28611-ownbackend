# ✅ Phase 4: Core API Endpoints - COMPLETE

## What's Been Built

I've created REST APIs that replace all the Supabase queries from your React app. These are production-ready endpoints with:

- ✅ **Validation** (Zod schemas)
- ✅ **Authorization** (Role-based access control)
- ✅ **Branch Filtering** (Users see only their branch data)
- ✅ **Error Handling** (Consistent API responses)
- ✅ **Pagination** (For large datasets)
- ✅ **Relationships** (Prisma includes for related data)

---

## 🎯 Available API Endpoints

### Members API (`/api/members`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/members` | ✅ | admin, manager, staff, trainer | List all members (with filters) |
| GET | `/api/members/:id` | ✅ | admin, manager, staff, trainer | Get single member |
| GET | `/api/members/stats` | ✅ | admin, manager, staff | Get member statistics |
| POST | `/api/members` | ✅ | admin, manager, staff | Create new member |
| PUT | `/api/members/:id` | ✅ | admin, manager, staff | Update member |
| DELETE | `/api/members/:id` | ✅ | admin, manager | Delete member |

**Query Parameters:**
- `branch_id` - Filter by branch
- `trainer_id` - Filter by trainer
- `status` - Filter by status (active/inactive/suspended)
- `search` - Search by name/email/phone
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

---

### Branches API (`/api/branches`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/branches` | ✅ | All authenticated | List all branches |
| GET | `/api/branches/:id` | ✅ | All authenticated | Get single branch |
| GET | `/api/branches/:id/stats` | ✅ | admin, manager | Get branch statistics |
| POST | `/api/branches` | ✅ | admin, super_admin | Create new branch |
| PUT | `/api/branches/:id` | ✅ | admin, super_admin | Update branch |
| DELETE | `/api/branches/:id` | ✅ | admin, super_admin | Delete branch |

**Query Parameters:**
- `status` - Filter by status (active/inactive)
- `gym_id` - Filter by gym
- `search` - Search by name/code/city

---

### Trainers API (`/api/trainers`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/trainers` | ✅ | All authenticated | List all trainers |
| GET | `/api/trainers/:id` | ✅ | All authenticated | Get single trainer |
| GET | `/api/trainers/:id/schedule` | ✅ | All authenticated | Get trainer schedule |
| POST | `/api/trainers` | ✅ | admin, manager | Create new trainer |
| PUT | `/api/trainers/:id` | ✅ | admin, manager | Update trainer |
| DELETE | `/api/trainers/:id` | ✅ | admin, manager | Delete trainer |

**Query Parameters:**
- `branch_id` - Filter by branch
- `is_active` - Filter by active status
- `specialization` - Filter by specialization
- `search` - Search by name/email/specialization

---

### Membership Plans API (`/api/membership-plans`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/membership-plans` | ✅ | All authenticated | List all plans |
| GET | `/api/membership-plans/:id` | ✅ | All authenticated | Get single plan |
| GET | `/api/membership-plans/popular` | ✅ | All authenticated | Get popular plans |
| POST | `/api/membership-plans` | ✅ | admin, manager | Create new plan |
| PUT | `/api/membership-plans/:id` | ✅ | admin, manager | Update plan |
| DELETE | `/api/membership-plans/:id` | ✅ | admin, manager | Delete plan |

**Query Parameters:**
- `branch_id` - Filter by branch
- `is_active` - Filter by active status
- `category` - Filter by category (basic/standard/premium/vip)
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter

---

### Classes API (`/api/classes`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/classes` | ✅ | All authenticated | List all classes |
| GET | `/api/classes/:id` | ✅ | All authenticated | Get single class |
| GET | `/api/classes/upcoming` | ✅ | All authenticated | Get upcoming classes |
| POST | `/api/classes` | ✅ | admin, manager, trainer | Create new class |
| PUT | `/api/classes/:id` | ✅ | admin, manager, trainer | Update class |
| DELETE | `/api/classes/:id` | ✅ | admin, manager | Delete class |

**Query Parameters:**
- `branch_id` - Filter by branch
- `trainer_id` - Filter by trainer
- `status` - Filter by status (scheduled/ongoing/completed/cancelled)
- `class_type` - Filter by class type
- `from_date` - Start date filter
- `to_date` - End date filter

---

## 🧪 Testing the APIs

### Step 1: Get Access Token

```bash
# Login to get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fitverse.com",
    "password": "Admin123!@#"
  }'

# Copy the accessToken from response
```

### Step 2: Test Branches API

```bash
# Get all branches
curl -X GET http://localhost:3001/api/branches \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create branch
curl -X POST http://localhost:3001/api/branches \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Branch",
    "code": "DT01",
    "city": "Mumbai",
    "phone": "9876543210",
    "status": "active"
  }'
```

### Step 3: Test Members API

```bash
# Get all members
curl -X GET http://localhost:3001/api/members \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Search members
curl -X GET "http://localhost:3001/api/members?search=john&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create member
curl -X POST http://localhost:3001/api/members \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "branch_id": "branch-uuid-here",
    "gender": "male"
  }'
```

### Step 4: Test Trainers API

```bash
# Get all trainers
curl -X GET http://localhost:3001/api/trainers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create trainer
curl -X POST http://localhost:3001/api/trainers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike Trainer",
    "email": "mike@fitverse.com",
    "phone": "9876543210",
    "specialization": "Strength Training",
    "branch_id": "branch-uuid-here",
    "hourly_rate": 1500
  }'
```

### Step 5: Test Membership Plans API

```bash
# Get all plans
curl -X GET http://localhost:3001/api/membership-plans \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create plan
curl -X POST http://localhost:3001/api/membership-plans \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gold Membership",
    "duration_days": 365,
    "price": 15000,
    "category": "premium",
    "is_active": true
  }'
```

### Step 6: Test Classes API

```bash
# Get upcoming classes
curl -X GET http://localhost:3001/api/classes/upcoming \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create class
curl -X POST http://localhost:3001/api/classes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning Yoga",
    "trainer_id": "trainer-uuid-here",
    "branch_id": "branch-uuid-here",
    "start_time": "2024-01-20T06:00:00Z",
    "end_time": "2024-01-20T07:00:00Z",
    "max_capacity": 20,
    "class_type": "Yoga"
  }'
```

---

## 🔐 Authorization Logic

### Branch-Level Access Control

Non-admin users can only access data from their assigned branch:

```typescript
// Example: Manager can only see members from their branch
if (userRole !== 'admin' && userRole !== 'super_admin') {
  where.branch_id = userBranchId;
}
```

### Role-Based Permissions

| Role | Permissions |
|------|-------------|
| **super_admin** | Full access to everything |
| **admin** | Manage all branches, members, trainers |
| **manager** | Manage own branch, create members/trainers |
| **staff** | View and manage members |
| **trainer** | View own schedule and assigned members |
| **member** | View own data only |

---

## 📊 Response Formats

### Success Response

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "branches": {
    "name": "Downtown Branch",
    "id": "branch-uuid"
  }
}
```

### Paginated Response

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

### Error Response

```json
{
  "error": "Member not found",
  "statusCode": 404
}
```

### Validation Error

```json
{
  "error": "Validation failed",
  "statusCode": 400,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

---

## 🔄 Mapping from Supabase to New API

### Before (Supabase Client)

```typescript
// src/hooks/useSupabaseQuery.ts
const { data } = await supabase
  .from('members')
  .select(`
    *,
    branches!branch_id (name)
  `)
  .eq('branch_id', branchId)
  .order('created_at', { ascending: false });
```

### After (REST API)

```typescript
// New API call
const response = await fetch(`/api/members?branch_id=${branchId}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
const { data, pagination } = await response.json();
```

---

## 📁 Files Created

```
backend/src/
├── validation/
│   ├── member.validation.ts           ✅ Zod schemas for members
│   ├── branch.validation.ts           ✅ Zod schemas for branches
│   ├── trainer.validation.ts          ✅ Zod schemas for trainers
│   ├── membership.validation.ts       ✅ Zod schemas for plans
│   └── class.validation.ts            ✅ Zod schemas for classes
├── services/
│   ├── member.service.ts              ✅ Business logic & Prisma queries
│   ├── branch.service.ts              ✅
│   ├── trainer.service.ts             ✅
│   ├── membership.service.ts          ✅
│   └── class.service.ts               ✅
├── controllers/
│   ├── member.controller.ts           ✅ Request handlers
│   ├── branch.controller.ts           ✅
│   ├── trainer.controller.ts          ✅
│   ├── membership.controller.ts       ✅
│   └── class.controller.ts            ✅
└── routes/
    ├── member.routes.ts               ✅ API route definitions
    ├── branch.routes.ts               ✅
    ├── trainer.routes.ts              ✅
    ├── membership.routes.ts           ✅
    └── class.routes.ts                ✅
```

---

## ⏭️ Next: Phase 5-8

### Phase 5: Additional Entities (Optional)

Would you like me to create APIs for:
- [ ] Products & Orders
- [ ] Attendance & Check-ins
- [ ] Financial Transactions & Invoices
- [ ] Lockers & Equipment
- [ ] Diet Plans & Workouts
- [ ] Feedback & Announcements
- [ ] Referrals & Rewards

### Phase 6: Edge Functions → API Routes

Convert Supabase edge functions to Express routes:
- Payment webhooks (Razorpay)
- Email sending
- Admin user creation
- Demo account seeding

### Phase 7: File Upload System

Create upload endpoints for:
- Member avatars
- Trainer photos
- Documents/attachments

### Phase 8: Frontend Migration

Replace Supabase client with new API calls:
- Update `useAuth.tsx`
- Replace `useSupabaseQuery.ts`
- Create new API client
- Update all components

---

## 🎉 Phase 4 Status

```
✅ Phase 1: Backend Foundation
✅ Phase 2: Database & Prisma
✅ Phase 3: Authentication
✅ Phase 4: Core API Endpoints ← YOU ARE HERE
⏳ Phase 5: Additional APIs (optional)
⏳ Phase 6: Edge Functions Migration
⏳ Phase 7: File Upload System
⏳ Phase 8: Frontend Migration
```

---

## 🚀 Ready to Test?

1. **Start the server**: `npm run dev`
2. **Create test data** using the API endpoints above
3. **Verify** with Prisma Studio: `npm run prisma:studio`

**Want to proceed with Phase 5 (more APIs) or jump to Phase 8 (Frontend Migration)?** 🎯
