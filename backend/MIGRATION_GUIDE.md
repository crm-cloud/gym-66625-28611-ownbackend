# Supabase to Backend Migration Guide

## Overview

This guide provides step-by-step instructions for migrating data from Supabase to the FitVerse self-hosted backend.

**⚠️ CRITICAL**: This is a production data migration. Follow ALL steps carefully to avoid data loss.

---

## Pre-Migration Checklist

### 1. Backup Everything
```bash
# Backup Supabase database
pg_dump -h <supabase-host> -U postgres -d postgres --schema=public > supabase_backup_$(date +%Y%m%d).sql

# Backup Backend database
pg_dump -U fitverse_user -d fitverse > backend_backup_$(date +%Y%m%d).sql
```

### 2. Environment Setup
```bash
# Add to backend/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key  # NOT anon key!
DATABASE_URL=postgresql://fitverse_user:password@localhost:5432/fitverse
```

### 3. Verify Backend Schema
```bash
cd backend
npm run prisma:migrate deploy
npm run prisma:generate
```

---

## Migration Steps

### Phase 1: User ID Mapping (CRITICAL)

The biggest challenge is mapping Supabase `auth.users.id` to backend `profiles.user_id`.

**Option A: Email-Based Mapping (Recommended)**
```typescript
// Automatically done by migration script
// Maps users by email (common identifier)
```

**Option B: Manual Mapping**
```sql
-- Create mapping table
CREATE TABLE user_id_mapping (
  supabase_user_id UUID,
  backend_user_id UUID,
  email TEXT
);

-- Populate mapping
INSERT INTO user_id_mapping (supabase_user_id, backend_user_id, email)
SELECT s.id, b.user_id, s.email
FROM auth.users s
JOIN profiles b ON s.email = b.email;
```

### Phase 2: Run Migration Script

```bash
cd backend
npm run migrate:from-supabase
```

**What it does:**
1. Builds user ID mapping
2. Migrates member_credits (with balance)
3. Migrates credit_transactions (with user mapping)
4. Migrates member_goals
5. Migrates progress_entries
6. Migrates referral_bonuses (with user mapping)
7. Migrates membership_freeze_requests (with user mapping)
8. Migrates locker_sizes

**Expected output:**
```
🚀 Starting Supabase to Backend Migration
============================================================
📋 Building user ID mapping...
  ✓ Mapped user@example.com: abc123 → xyz789
✅ User ID mapping complete: 150 users mapped

💰 Migrating member credits...
✅ Migrated 145/145 member credits

💳 Migrating credit transactions...
✅ Migrated 523/523 credit transactions

... (more output)

✅ Migration Complete!
📊 Summary:
   Users Mapped: 150
   Member Credits: 145
   Credit Transactions: 523
   ...
```

### Phase 3: Validate Migration

```bash
npm run validate:migration
```

**What it checks:**
- ✅ Record counts match (Supabase vs Backend)
- ✅ No orphaned foreign keys
- ✅ No null required fields
- ✅ Date ranges are valid
- ✅ Data types are correct

**Expected output:**
```
🔍 Starting Migration Validation
============================================================
✅ member_credits
   Supabase: 145 | Backend: 145

✅ credit_transactions
   Supabase: 523 | Backend: 523

... (more output)

✅ Passed: 7/7
🎉 All validations passed! Migration is successful.
```

### Phase 4: Manual Validation

Even after automated validation, perform manual spot checks:

```sql
-- Check a specific member's credits
SELECT * FROM member_credits WHERE member_id = '<member_id>';
SELECT * FROM credit_transactions WHERE member_id = '<member_id>' ORDER BY created_at DESC LIMIT 5;

-- Check goal progress
SELECT mg.*, COUNT(pe.id) as progress_count
FROM member_goals mg
LEFT JOIN progress_entries pe ON mg.id = pe.goal_id
GROUP BY mg.id
HAVING COUNT(pe.id) = 0;  -- Goals with no progress (should be minimal)

-- Check freeze requests
SELECT * FROM membership_freeze_requests WHERE status = 'approved' ORDER BY created_at DESC LIMIT 10;

-- Check referral bonuses
SELECT * FROM referral_bonuses WHERE status = 'approved' ORDER BY earned_date DESC LIMIT 10;
```

### Phase 5: Test in Staging

1. **Deploy backend to staging**
   ```bash
   npm run build
   npm start
   ```

2. **Test critical flows:**
   - ✅ Add credits to member
   - ✅ Deduct credits from member
   - ✅ Create member goal
   - ✅ Log goal progress
   - ✅ Request membership freeze
   - ✅ Approve freeze request
   - ✅ Process referral bonus
   - ✅ Manage locker sizes

3. **Load test (optional)**
   ```bash
   # Use tools like k6 or Artillery
   artillery quick --count 100 --num 10 https://staging-api.fitverse.com/api/member-credits
   ```

### Phase 6: Production Cutover

**Recommended: Saturday night or Sunday (low traffic)**

#### Cutover Checklist

**T-24 hours:**
- [ ] Notify all users of maintenance window
- [ ] Final backup of both databases
- [ ] Deploy backend to production (but don't switch traffic yet)
- [ ] Test backend API directly (bypass frontend)

**T-1 hour:**
- [ ] Enable Supabase read-only mode (prevent new writes)
- [ ] Run final data sync
- [ ] Validate final sync

**T-0 (Cutover):**
1. Switch frontend to point to backend API
   ```javascript
   // Update src/config/api.ts
   export const API_BASE_URL = 'https://api.fitverse.com';
   ```

2. Deploy frontend
   ```bash
   npm run build
   npm run deploy
   ```

3. Monitor for 30 minutes
   - Watch API error rates
   - Check response times
   - Monitor database connections

4. Test critical user flows
   - Login/logout
   - Create member
   - Add subscription
   - Process payment
   - Credits operations
   - Goal tracking

**T+1 hour:**
- [ ] All systems green?
- [ ] Error rate < 0.1%?
- [ ] Response time < 200ms?

**If YES:** Success! 🎉
**If NO:** Rollback immediately

#### Rollback Procedure

**5-minute rollback:**
```bash
# 1. Switch frontend back to Supabase
# Update API_BASE_URL to Supabase functions

# 2. Re-enable Supabase writes
# Remove read-only restrictions

# 3. Deploy frontend
npm run deploy

# 4. Verify Supabase working
# Test critical flows

# 5. Post-mortem
# Identify issues, fix, retry migration
```

### Phase 7: Post-Migration

**Day 1-7:**
- Monitor closely for anomalies
- Keep Supabase as read-only backup
- Fix any data inconsistencies immediately

**Day 7-30:**
- Continue monitoring (less frequently)
- User feedback collection
- Performance optimization

**Day 30:**
- Archive Supabase data
- Cancel Supabase subscription
- Remove Supabase client from frontend
- Update documentation

---

## Remaining Tables to Migrate

The following tables still need migration (Phase 2):

### Group 1: Diet & Fitness
- `meals` (diet plan meals)
- `exercises` (workout exercises)
- `workout_sets` (exercise sets)

### Group 2: Analytics
- `analytics_events` (event tracking)
- `member_analytics` (member metrics)
- `branch_analytics` (branch metrics)
- `trainer_analytics` (trainer metrics)

### Group 3: CRM
- `lead_notes` (lead notes)
- `lead_tasks` (lead tasks)

### Group 4: Team Management
- `team_members` (staff)
- `work_shifts` (shift scheduling)

### Group 5: Communication
- `email_templates` (email templates)
- `sms_templates` (SMS templates)

### Group 6: Feedback
- `feedback_responses` (admin responses)

**Next migration script:** `migrate-from-supabase-phase2.ts` (to be created)

---

## Troubleshooting

### Issue: User ID mapping fails
**Solution:** Check email consistency between Supabase and backend. Some users might have different emails.

### Issue: Foreign key violations
**Solution:** Migrate parent tables before child tables. Order matters!

### Issue: Duplicate key errors
**Solution:** Use `upsert` instead of `create`. The migration script already handles this for most tables.

### Issue: Performance is slow
**Solution:** 
- Use transactions to batch inserts
- Disable indexes during migration, rebuild after
- Increase database connection pool size

### Issue: Migration crashes mid-way
**Solution:** Migration script should be idempotent. Re-run it - it will skip already migrated records.

---

## Success Criteria

✅ All validation checks pass
✅ Record counts match (Supabase == Backend)
✅ No orphaned records
✅ Critical user flows work
✅ API response times < 200ms
✅ Error rate < 0.1%
✅ Zero data loss
✅ Zero user complaints

---

## Support

**Issues during migration?**
- Check logs: `backend/logs/migration.log`
- Review error messages carefully
- Validate foreign key relationships
- Check user ID mappings

**Need help?**
- Open GitHub issue with error logs
- Include migration step where it failed
- Provide sample data (anonymized)

---

## Timeline Summary

| Day | Activity | Duration |
|-----|----------|----------|
| Day 1 | Pre-migration checks | 2 hours |
| Day 2 | Run migration in staging | 3 hours |
| Day 3 | Validate + test | 4 hours |
| Day 4-6 | Fix issues, re-test | 2 days |
| Day 7 | Production cutover | 4 hours |
| Day 8-14 | Close monitoring | 1 week |
| Day 30 | Decommission Supabase | 1 hour |

**Total effort:** ~20-25 hours spread over 30 days

---

**Last updated:** 2025-10-21
**Version:** 1.0
