# Frontend Migration Priority List

## Overview
This document outlines the order in which to migrate frontend hooks from Supabase to backend API.

**Total Hooks to Migrate**: ~50 hooks  
**Estimated Time**: 2-3 weeks  
**Strategy**: Start with authentication, then most-used features

---

## Phase 1: Critical - Authentication & Core (Week 1)

### Priority 1: Authentication (Day 1) 🔥
**Impact**: Blocks everything else  
**Files**:
- `src/hooks/useAuth.tsx` ⚠️ CRITICAL

**Changes**:
```typescript
// Before (Supabase)
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// After (Backend API)
const response = await api.post('/api/auth/login', { email, password });
const { access_token, refresh_token, user } = response.data;
localStorage.setItem('access_token', access_token);
localStorage.setItem('refresh_token', refresh_token);
```

---

### Priority 2: Members (Day 2-3) 🔥
**Impact**: Core feature used everywhere  
**Files**:
- `src/hooks/useMembers.ts`
- `src/hooks/useMemberProfile.ts`

**API Endpoints**:
- `GET /api/members` - List members
- `GET /api/members/:id` - Get member details
- `POST /api/members` - Create member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

---

### Priority 3: Branches (Day 3-4) 🔥
**Impact**: Multi-branch filtering  
**Files**:
- `src/hooks/useBranches.ts`
- `src/hooks/useBranchContext.tsx`

**API Endpoints**:
- `GET /api/branches` - List branches
- `GET /api/branches/:id` - Get branch details

---

### Priority 4: Profiles (Day 4-5) 🔥
**Impact**: User profile data  
**Files**:
- `src/hooks/useProfiles.ts`

**API Endpoints**:
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile

---

## Phase 2: Important - Core Operations (Week 1-2)

### Priority 5: Trainers (Day 5-6) ⭐
**Impact**: High - trainer management  
**Files**:
- `src/hooks/useTrainers.ts`
- `src/hooks/useTrainerClients.ts`
- `src/hooks/useTrainerUtilization.tsx`

**API Endpoints**:
- `GET /api/trainers`
- `GET /api/trainers/:id`
- `POST /api/trainers`
- `PUT /api/trainers/:id`
- `GET /api/trainers/:id/stats`
- `GET /api/assignments/trainer/:trainerId`

---

### Priority 6: Memberships (Day 7-8) ⭐
**Impact**: High - membership management  
**Files**:
- `src/hooks/useMembershipWorkflow.ts`

**API Endpoints**:
- `GET /api/membership-plans`
- `POST /api/membership-plans/:id/assign`
- `GET /api/members/:memberId/subscriptions`
- `PATCH /api/subscriptions/:id/renew`

---

### Priority 7: Classes (Day 9) ⭐
**Impact**: Medium-High - class bookings  
**Files**:
- `src/hooks/useClasses.ts`

**API Endpoints**:
- `GET /api/classes`
- `POST /api/classes/:id/enroll`
- `GET /api/classes/:id/roster`

---

### Priority 8: Products & Orders (Day 10) ⭐
**Impact**: Medium - POS system  
**Files**:
- `src/hooks/useProducts.ts`
- `src/hooks/useOrders.ts`
- `src/hooks/useCart.tsx`

**API Endpoints**:
- `GET /api/products`
- `POST /api/orders`
- `GET /api/orders/member/:memberId`

---

## Phase 3: Medium Priority - Enhanced Features (Week 2)

### Priority 9: Lockers (Day 11) 🔷
**Impact**: Medium  
**Files**:
- `src/hooks/useLockers.ts`

**API Endpoints**:
- `GET /api/lockers`
- `POST /api/lockers/:id/assign`

---

### Priority 10: Invoices (Day 12) 🔷
**Impact**: Medium  
**Files**:
- `src/hooks/useInvoices.ts`

**API Endpoints**:
- `GET /api/invoices`
- `POST /api/invoices`
- `GET /api/invoices/:id/pdf`

---

### Priority 11: Payments (Day 13) 🔷
**Impact**: Medium  
**Files**:
- `src/hooks/usePaymentGateway.ts`

**API Endpoints**:
- `POST /api/payments/initiate`
- `POST /api/payments/verify`
- `GET /api/payments/analytics`

---

### Priority 12: Workout Plans (Day 14) 🔷
**Impact**: Medium  
**Files**:
- `src/hooks/useWorkoutPlans.ts`
- `src/hooks/useAIPlanGenerator.ts`

**API Endpoints**:
- `GET /api/plans/workout`
- `POST /api/plans/workout`
- `POST /api/plans/workout/:id/assign`

---

## Phase 4: Lower Priority - Admin & Reports (Week 3)

### Priority 13: Roles & Permissions 📊
**Files**:
- `src/hooks/useRolesManagement.ts`
- `src/hooks/useRBAC.tsx`

**API Endpoints**:
- `GET /api/roles`
- `POST /api/roles`
- `POST /api/roles/:id/assign`

---

### Priority 14: Team Management 📊
**Files**:
- `src/hooks/useTeamMembers.ts`

**API Endpoints**:
- `GET /api/users`
- `POST /api/users`

---

### Priority 15: Analytics & Reports 📊
**Files**:
- `src/hooks/usePlatformAnalytics.ts`
- `src/hooks/useSystemMetrics.ts`

**API Endpoints**:
- `GET /api/gyms/:id/analytics`
- `GET /api/payments/analytics`
- `GET /api/subscriptions/analytics`

---

### Priority 16: System Settings 📊
**Files**:
- `src/hooks/useSystemSettings.ts`
- `src/hooks/useSystemHealth.ts`

**API Endpoints**:
- Various system endpoints

---

## Migration Template

For each hook, follow this pattern:

### 1. Identify Supabase Queries
```typescript
// Find all instances of:
supabase.from('table_name').select()
supabase.from('table_name').insert()
supabase.from('table_name').update()
supabase.from('table_name').delete()
```

### 2. Map to Backend Endpoints
```typescript
// Replace with:
api.get('/api/endpoint')
api.post('/api/endpoint', data)
api.put('/api/endpoint/:id', data)
api.delete('/api/endpoint/:id')
```

### 3. Update Response Handling
```typescript
// Before
const { data, error } = await supabase.from('members').select();
if (error) throw error;
return data;

// After
const response = await api.get('/api/members');
return response.data;
```

### 4. Update Error Handling
```typescript
// Use try-catch with axios
try {
  const response = await api.get('/api/members');
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    throw new Error(error.response?.data?.error || error.message);
  }
  throw error;
}
```

### 5. Test Thoroughly
- [ ] List/GET operations work
- [ ] Create/POST operations work
- [ ] Update/PUT operations work
- [ ] Delete operations work
- [ ] Filters and pagination work
- [ ] Error messages are user-friendly
- [ ] Loading states work correctly

---

## Testing Checklist

After migrating each hook:

### Unit Testing
- [ ] Mock API calls work
- [ ] Error states handled
- [ ] Loading states correct
- [ ] Data transformations correct

### Integration Testing
- [ ] UI reflects API data correctly
- [ ] CRUD operations complete successfully
- [ ] Filters and search work
- [ ] Pagination works
- [ ] Error messages display properly

### End-to-End Testing
- [ ] User flow works start to finish
- [ ] No console errors
- [ ] No network errors
- [ ] Performance acceptable

---

## Progress Tracking

Use this checklist to track migration progress:

### Week 1 - Critical Features
- [ ] Authentication (useAuth)
- [ ] Members (useMembers, useMemberProfile)
- [ ] Branches (useBranches, useBranchContext)
- [ ] Profiles (useProfiles)
- [ ] Trainers (useTrainers, useTrainerClients)
- [ ] Memberships (useMembershipWorkflow)
- [ ] Classes (useClasses)
- [ ] Products & Orders (useProducts, useOrders, useCart)

### Week 2 - Important Features
- [ ] Lockers (useLockers)
- [ ] Invoices (useInvoices)
- [ ] Payments (usePaymentGateway)
- [ ] Workout Plans (useWorkoutPlans, useAIPlanGenerator)
- [ ] Team Management (useTeamMembers)

### Week 3 - Admin & Reports
- [ ] Roles & Permissions (useRolesManagement, useRBAC)
- [ ] Analytics (usePlatformAnalytics, useSystemMetrics)
- [ ] System Settings (useSystemSettings, useSystemHealth)
- [ ] Remaining hooks

---

## Common Patterns

### Pattern 1: Simple List Query
```typescript
// Before
const { data } = await supabase.from('members').select('*');

// After
const response = await api.get('/api/members');
const data = response.data;
```

### Pattern 2: Query with Filters
```typescript
// Before
const { data } = await supabase
  .from('members')
  .select('*')
  .eq('branch_id', branchId);

// After
const response = await api.get('/api/members', {
  params: { branch_id: branchId }
});
```

### Pattern 3: Create Operation
```typescript
// Before
const { data, error } = await supabase
  .from('members')
  .insert([memberData])
  .select()
  .single();

// After
const response = await api.post('/api/members', memberData);
```

### Pattern 4: Update Operation
```typescript
// Before
const { data, error } = await supabase
  .from('members')
  .update(updates)
  .eq('id', memberId)
  .select()
  .single();

// After
const response = await api.put(`/api/members/${memberId}`, updates);
```

### Pattern 5: Delete Operation
```typescript
// Before
const { error } = await supabase
  .from('members')
  .delete()
  .eq('id', memberId);

// After
await api.delete(`/api/members/${memberId}`);
```

---

## Estimated Timeline

| Phase | Duration | Features | Priority |
|-------|----------|----------|----------|
| Phase 1 | 5 days | Auth, Members, Branches, Profiles | 🔥 Critical |
| Phase 2 | 5 days | Trainers, Memberships, Classes, Products | ⭐ Important |
| Phase 3 | 4 days | Lockers, Invoices, Payments, Plans | 🔷 Medium |
| Phase 4 | 4 days | Roles, Team, Analytics, Settings | 📊 Low |
| Testing | 2 days | End-to-end testing, bug fixes | 🧪 Essential |

**Total**: 20 working days (~4 weeks with buffer)

---

## Success Criteria

Before marking migration complete:

- [ ] All hooks use backend API (no Supabase calls)
- [ ] Authentication flow works end-to-end
- [ ] All CRUD operations tested
- [ ] Error handling works properly
- [ ] Loading states work correctly
- [ ] No console errors
- [ ] No network errors (except expected 401s)
- [ ] Performance acceptable (< 1s for most operations)
- [ ] User feedback is positive

---

**Start with Phase 1 Priority 1 (Authentication)!** 🚀
