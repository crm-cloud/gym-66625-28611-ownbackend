# RLS to API Authorization Migration Guide

## Overview
When migrating from Supabase to a self-hosted backend, Row Level Security (RLS) policies must be converted to API-level authorization logic. The `auth.uid()` function and other Supabase-specific features won't work with Prisma.

## How We've Implemented This

### 1. Authentication Middleware (`src/middleware/authenticate.ts`)
**Replaces**: `auth.uid()` in RLS policies

```typescript
// Old RLS: USING (user_id = auth.uid())
// New API: req.user.userId contains the authenticated user's ID

// The middleware verifies JWT and attaches user data to request:
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = verifyAccessToken(token);
  
  req.user = {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
    branchId: decoded.branchId
  };
  
  next();
};
```

### 2. Authorization Middleware (`src/middleware/authorize.ts`)
**Replaces**: Complex RLS policies with role checks and ownership validation

```typescript
// Old RLS: USING (role IN ('admin', 'manager'))
// New API: authorize({ roles: ['admin', 'manager'] })

// Old RLS: USING (created_by = auth.uid() OR role = 'admin')
// New API: authorize({ allowOwnership: true, ownershipField: 'created_by' })

// Old RLS: USING (branch_id = (SELECT branch_id FROM profiles WHERE id = auth.uid()))
// New API: authorize({ requireBranchAccess: true })
```

## RLS Policy Conversion Examples

### Example 1: Simple Ownership Check

**Old RLS Policy:**
```sql
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (id = auth.uid());
```

**New API Implementation:**
```typescript
// In profile.service.ts
async getUserProfile(userId: string, requestedUserId: string) {
  // Enforce ownership at service layer
  if (userId !== requestedUserId) {
    throw new Error('Unauthorized: Can only view own profile');
  }
  
  return await prisma.profiles.findUnique({
    where: { id: requestedUserId }
  });
}

// In profile.controller.ts
async getProfile(req: Request, res: Response) {
  const profile = await profileService.getUserProfile(
    req.user!.userId,
    req.params.id
  );
  res.json(profile);
}
```

### Example 2: Role-Based Access

**Old RLS Policy:**
```sql
CREATE POLICY "Admins can view all members" ON members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'manager')
  )
);
```

**New API Implementation:**
```typescript
// In member.routes.ts
router.get(
  '/',
  authenticate,
  authorize({ roles: ['super_admin', 'admin', 'manager'] }),
  memberController.getMembers
);

// The authorize middleware automatically checks req.user.role
```

### Example 3: Branch-Level Access

**Old RLS Policy:**
```sql
CREATE POLICY "Users can only access own branch data" ON attendance
FOR SELECT USING (
  branch_id = (
    SELECT branch_id FROM profiles WHERE id = auth.uid()
  )
);
```

**New API Implementation:**
```typescript
// In attendance.routes.ts
router.get(
  '/',
  authenticate,
  authorize({ requireBranchAccess: true }),
  attendanceController.getAttendance
);

// In attendance.service.ts
async getAttendance(filters: any, userBranchId: string) {
  const where: any = {
    branch_id: userBranchId // Enforce branch isolation
  };
  
  if (filters.start_date) where.check_in_time = { gte: filters.start_date };
  
  return await prisma.attendance.findMany({ where });
}
```

### Example 4: Ownership OR Admin Access

**Old RLS Policy:**
```sql
CREATE POLICY "Members or admins can view feedback" ON feedback
FOR SELECT USING (
  member_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'manager')
  )
);
```

**New API Implementation:**
```typescript
// In feedback.service.ts
async getFeedback(filters: any, user: any) {
  const where: any = {};
  
  // If not admin, can only see own feedback
  if (!['super_admin', 'admin', 'manager'].includes(user.role)) {
    where.member_id = user.userId;
  }
  
  // Admins can filter by any member_id
  if (filters.member_id && ['super_admin', 'admin', 'manager'].includes(user.role)) {
    where.member_id = filters.member_id;
  }
  
  return await prisma.feedback.findMany({ where });
}

// In feedback.controller.ts
async getFeedback(req: Request, res: Response) {
  const result = await feedbackService.getFeedback(
    req.query,
    req.user! // Contains userId and role
  );
  res.json(result);
}
```

### Example 5: Complex Multi-Table Check

**Old RLS Policy:**
```sql
CREATE POLICY "Trainers can view assigned members" ON members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM trainer_assignments 
    WHERE trainer_id = auth.uid() 
    AND member_id = members.id
  )
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'manager')
  )
);
```

**New API Implementation:**
```typescript
// In member.service.ts
async getMembers(filters: any, user: any) {
  const where: any = {};
  
  // Admins see all members
  if (['super_admin', 'admin', 'manager'].includes(user.role)) {
    if (filters.branch_id) where.branch_id = filters.branch_id;
  }
  // Trainers only see assigned members
  else if (user.role === 'trainer') {
    const assignments = await prisma.trainer_assignments.findMany({
      where: { trainer_id: user.userId },
      select: { member_id: true }
    });
    where.id = { in: assignments.map(a => a.member_id) };
  }
  // Members only see themselves
  else if (user.role === 'member') {
    where.id = user.userId;
  }
  
  return await prisma.members.findMany({ where });
}
```

## Migration Checklist

### Phase 1: Identify All RLS Policies
- [ ] Review `database-schema.sql` for all RLS policies
- [ ] Document which tables have RLS enabled
- [ ] List all policy conditions

### Phase 2: Map to API Authorization
- [ ] Simple ownership checks → Service-layer validation
- [ ] Role checks → `authorize({ roles: [...] })` middleware
- [ ] Branch checks → `authorize({ requireBranchAccess: true })`
- [ ] Complex logic → Custom service-layer logic

### Phase 3: Implement in Services
- [ ] Add user context to service methods
- [ ] Implement ownership checks in Prisma queries
- [ ] Add branch_id filters where needed
- [ ] Test authorization logic

### Phase 4: Add Route Protection
- [ ] Add `authenticate` middleware to all routes
- [ ] Add `authorize` middleware with appropriate options
- [ ] Document authorization requirements

### Phase 5: Test Thoroughly
- [ ] Test as different user roles
- [ ] Test ownership boundaries
- [ ] Test branch isolation
- [ ] Test unauthorized access attempts

## Key Principles

1. **Defense in Depth**: Implement checks at multiple layers
   - Route middleware (coarse-grained)
   - Service logic (fine-grained)
   - Input validation (Zod schemas)

2. **Fail Secure**: Default to denying access
   ```typescript
   // Good: Explicit allow
   if (allowedRoles.includes(user.role)) {
     // Allow access
   } else {
     throw new UnauthorizedException();
   }
   
   // Bad: Implicit allow
   if (deniedRoles.includes(user.role)) {
     throw new UnauthorizedException();
   }
   // Falls through - dangerous!
   ```

3. **Consistent Authorization**: Use the same patterns everywhere
   - Always use `req.user` from authenticate middleware
   - Always validate ownership at service layer
   - Always check roles at route layer

4. **Audit Trail**: Log authorization decisions
   ```typescript
   logger.info('Authorization check', {
     userId: req.user.userId,
     role: req.user.role,
     resource: 'members',
     action: 'read',
     allowed: true
   });
   ```

## Common RLS Patterns → API Patterns

| RLS Pattern | API Pattern |
|-------------|-------------|
| `auth.uid()` | `req.user.userId` |
| `role = 'admin'` | `authorize({ roles: ['admin'] })` |
| `created_by = auth.uid()` | Service-layer check |
| `branch_id = user.branch_id` | `authorize({ requireBranchAccess: true })` |
| `EXISTS (SELECT ...)` | Service-layer JOIN query |
| `user_id = auth.uid() OR role = 'admin'` | Combined middleware + service logic |

## Testing Authorization

```typescript
// Example test cases
describe('Member Authorization', () => {
  it('should allow admin to view all members', async () => {
    const adminToken = generateToken({ role: 'admin' });
    const response = await request(app)
      .get('/api/members')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
  
  it('should prevent member from viewing other members', async () => {
    const memberToken = generateToken({ role: 'member', userId: 'user-1' });
    await request(app)
      .get('/api/members/user-2')
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(403);
  });
  
  it('should allow trainer to view assigned members only', async () => {
    const trainerToken = generateToken({ role: 'trainer', userId: 'trainer-1' });
    const response = await request(app)
      .get('/api/members')
      .set('Authorization', `Bearer ${trainerToken}`)
      .expect(200);
    
    // Verify only assigned members are returned
    const memberIds = response.body.members.map(m => m.id);
    expect(memberIds).toEqual(['assigned-member-1', 'assigned-member-2']);
  });
});
```

## Next Steps

1. **Review Existing RLS**: Go through `database-schema.sql` and document all policies
2. **Verify Implementation**: Ensure all policies are converted to API logic
3. **Add Tests**: Create comprehensive authorization tests
4. **Document Access Control**: Update API documentation with authorization requirements
5. **Security Audit**: Review all endpoints for proper authorization
