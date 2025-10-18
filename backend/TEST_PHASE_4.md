# Phase 4 Testing Guide

Complete testing workflow for all 30 API endpoints.

---

## Prerequisites

1. **Backend running**: `npm run dev` in `backend/` directory
2. **Database ready**: Phase 2 complete, migrations applied
3. **Tool**: Use curl, Postman, or Insomnia

---

## Test Flow

### Step 1: Create Admin User (Manual)

Since this is first-time setup, create an admin user directly in the database:

```bash
cd backend
npm run prisma:studio
```

In Prisma Studio:

1. Go to **profiles** table
2. Click "Add record"
3. Fill in:
   - `user_id`: Generate new UUID (use https://www.uuidgenerator.net/)
   - `email`: `admin@fitverse.com`
   - `full_name`: `Admin User`
   - `role`: `admin`
   - `is_active`: `true`
   - `email_verified`: `true`
4. Save

Now set the password manually (since bcrypt is needed):

```bash
# In backend directory
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin123!@#', 10).then(hash => console.log(hash));"
```

Copy the hash, go back to Prisma Studio, edit the admin user, and paste the hash into `password_hash` field.

---

### Step 2: Login & Get Token

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fitverse.com",
    "password": "Admin123!@#"
  }'
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15m",
  "user": {
    "id": "uuid",
    "email": "admin@fitverse.com",
    "name": "Admin User",
    "role": "admin",
    "emailVerified": true
  }
}
```

**💾 Save the `accessToken`** - you'll need it for all subsequent requests.

Set as environment variable:
```bash
export TOKEN="your-access-token-here"
```

---

### Step 3: Test Branches API

#### 3.1 Get All Branches (Should be empty)

```bash
curl -X GET http://localhost:3001/api/branches \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: `[]` (empty array)

#### 3.2 Create First Branch

```bash
curl -X POST http://localhost:3001/api/branches \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Branch",
    "code": "MB01",
    "address": "123 Fitness Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "phone": "9876543210",
    "email": "main@fitverse.com",
    "status": "active"
  }'
```

**Expected Response:**
```json
{
  "id": "branch-uuid",
  "name": "Main Branch",
  "code": "MB01",
  "city": "Mumbai",
  ...
}
```

**💾 Save the branch `id`** for next tests.

```bash
export BRANCH_ID="your-branch-id-here"
```

#### 3.3 Get Branch Details

```bash
curl -X GET http://localhost:3001/api/branches/$BRANCH_ID \
  -H "Authorization: Bearer $TOKEN"
```

#### 3.4 Update Branch

```bash
curl -X PUT http://localhost:3001/api/branches/$BRANCH_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "opening_time": "06:00:00",
    "closing_time": "22:00:00"
  }'
```

#### 3.5 Get Branch Stats

```bash
curl -X GET http://localhost:3001/api/branches/$BRANCH_ID/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
```json
{
  "members": 0,
  "trainers": 0,
  "classes": 0,
  "revenue": 0
}
```

---

### Step 4: Test Membership Plans API

#### 4.1 Create Basic Plan

```bash
curl -X POST http://localhost:3001/api/membership-plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Basic Monthly",
    "description": "Access to gym equipment only",
    "duration_days": 30,
    "price": 1500,
    "category": "basic",
    "is_active": true
  }'
```

**💾 Save the plan `id`**

```bash
export PLAN_ID="your-plan-id-here"
```

#### 4.2 Create Premium Plan

```bash
curl -X POST http://localhost:3001/api/membership-plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Annual",
    "description": "All facilities + personal training",
    "duration_days": 365,
    "price": 15000,
    "category": "premium",
    "includes_personal_training": true,
    "max_classes_per_month": 20,
    "is_active": true
  }'
```

#### 4.3 Get All Plans

```bash
curl -X GET http://localhost:3001/api/membership-plans \
  -H "Authorization: Bearer $TOKEN"
```

#### 4.4 Get Popular Plans

```bash
curl -X GET http://localhost:3001/api/membership-plans/popular \
  -H "Authorization: Bearer $TOKEN"
```

#### 4.5 Filter Plans by Price

```bash
curl -X GET "http://localhost:3001/api/membership-plans?min_price=1000&max_price=5000" \
  -H "Authorization: Bearer $TOKEN"
```

---

### Step 5: Test Trainers API

#### 5.1 Create Trainer

```bash
curl -X POST http://localhost:3001/api/trainers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Trainer",
    "email": "john.trainer@fitverse.com",
    "phone": "9876543211",
    "specialization": "Strength Training & Bodybuilding",
    "certification": "ACE Certified Personal Trainer",
    "experience_years": 5,
    "branch_id": "'$BRANCH_ID'",
    "hourly_rate": 1500,
    "is_active": true,
    "bio": "Experienced trainer specializing in muscle building"
  }'
```

**💾 Save the trainer `id`**

```bash
export TRAINER_ID="your-trainer-id-here"
```

#### 5.2 Get All Trainers

```bash
curl -X GET http://localhost:3001/api/trainers \
  -H "Authorization: Bearer $TOKEN"
```

#### 5.3 Search Trainers by Specialization

```bash
curl -X GET "http://localhost:3001/api/trainers?specialization=Strength" \
  -H "Authorization: Bearer $TOKEN"
```

#### 5.4 Filter by Branch

```bash
curl -X GET "http://localhost:3001/api/trainers?branch_id=$BRANCH_ID" \
  -H "Authorization: Bearer $TOKEN"
```

#### 5.5 Get Trainer Details

```bash
curl -X GET http://localhost:3001/api/trainers/$TRAINER_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

### Step 6: Test Members API

#### 6.1 Create Member

```bash
curl -X POST http://localhost:3001/api/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Member",
    "email": "sarah@example.com",
    "phone": "9876543212",
    "date_of_birth": "1995-05-15",
    "gender": "female",
    "address": "456 Fitness Avenue, Mumbai",
    "emergency_contact": "Jane Member",
    "emergency_phone": "9876543213",
    "branch_id": "'$BRANCH_ID'",
    "assigned_trainer_id": "'$TRAINER_ID'",
    "membership_plan_id": "'$PLAN_ID'",
    "notes": "Interested in weight loss program"
  }'
```

**💾 Save the member `id`**

```bash
export MEMBER_ID="your-member-id-here"
```

#### 6.2 Create Another Member

```bash
curl -X POST http://localhost:3001/api/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike Member",
    "email": "mike@example.com",
    "phone": "9876543214",
    "gender": "male",
    "branch_id": "'$BRANCH_ID'",
    "assigned_trainer_id": "'$TRAINER_ID'"
  }'
```

#### 6.3 Get All Members

```bash
curl -X GET http://localhost:3001/api/members \
  -H "Authorization: Bearer $TOKEN"
```

#### 6.4 Search Members

```bash
curl -X GET "http://localhost:3001/api/members?search=sarah" \
  -H "Authorization: Bearer $TOKEN"
```

#### 6.5 Get Member Details

```bash
curl -X GET http://localhost:3001/api/members/$MEMBER_ID \
  -H "Authorization: Bearer $TOKEN"
```

#### 6.6 Update Member

```bash
curl -X PUT http://localhost:3001/api/members/$MEMBER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "notes": "Completed orientation session"
  }'
```

#### 6.7 Get Member Stats

```bash
curl -X GET http://localhost:3001/api/members/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
```json
{
  "total": 2,
  "active": 2,
  "inactive": 0,
  "suspended": 0
}
```

#### 6.8 Filter by Trainer

```bash
curl -X GET "http://localhost:3001/api/members?trainer_id=$TRAINER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

#### 6.9 Pagination

```bash
curl -X GET "http://localhost:3001/api/members?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

### Step 7: Test Classes API

#### 7.1 Create Class

```bash
curl -X POST http://localhost:3001/api/classes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning Yoga",
    "description": "Beginner-friendly yoga session",
    "trainer_id": "'$TRAINER_ID'",
    "branch_id": "'$BRANCH_ID'",
    "start_time": "2024-01-25T06:00:00Z",
    "end_time": "2024-01-25T07:00:00Z",
    "max_capacity": 20,
    "status": "scheduled",
    "class_type": "Yoga"
  }'
```

**💾 Save the class `id`**

```bash
export CLASS_ID="your-class-id-here"
```

#### 7.2 Create Another Class (Different Time)

```bash
curl -X POST http://localhost:3001/api/classes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Evening HIIT",
    "description": "High intensity interval training",
    "trainer_id": "'$TRAINER_ID'",
    "branch_id": "'$BRANCH_ID'",
    "start_time": "2024-01-25T18:00:00Z",
    "end_time": "2024-01-25T19:00:00Z",
    "max_capacity": 15,
    "status": "scheduled",
    "class_type": "HIIT"
  }'
```

#### 7.3 Get All Classes

```bash
curl -X GET http://localhost:3001/api/classes \
  -H "Authorization: Bearer $TOKEN"
```

#### 7.4 Get Upcoming Classes

```bash
curl -X GET http://localhost:3001/api/classes/upcoming \
  -H "Authorization: Bearer $TOKEN"
```

#### 7.5 Filter by Trainer

```bash
curl -X GET "http://localhost:3001/api/classes?trainer_id=$TRAINER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

#### 7.6 Filter by Date Range

```bash
curl -X GET "http://localhost:3001/api/classes?from_date=2024-01-25T00:00:00Z&to_date=2024-01-25T23:59:59Z" \
  -H "Authorization: Bearer $TOKEN"
```

#### 7.7 Get Class Details

```bash
curl -X GET http://localhost:3001/api/classes/$CLASS_ID \
  -H "Authorization: Bearer $TOKEN"
```

#### 7.8 Update Class

```bash
curl -X PUT http://localhost:3001/api/classes/$CLASS_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "max_capacity": 25,
    "status": "ongoing"
  }'
```

#### 7.9 Get Trainer Schedule

```bash
curl -X GET "http://localhost:3001/api/trainers/$TRAINER_ID/schedule?start_date=2024-01-25T00:00:00Z&end_date=2024-01-31T23:59:59Z" \
  -H "Authorization: Bearer $TOKEN"
```

---

### Step 8: Test Authorization (Error Cases)

#### 8.1 No Token (Should Fail)

```bash
curl -X GET http://localhost:3001/api/members
```

**Expected:**
```json
{
  "error": "No authorization header provided",
  "statusCode": 401
}
```

#### 8.2 Invalid Token (Should Fail)

```bash
curl -X GET http://localhost:3001/api/members \
  -H "Authorization: Bearer invalid-token"
```

**Expected:**
```json
{
  "error": "Invalid or expired token",
  "statusCode": 401
}
```

#### 8.3 Delete Without Admin Role

First, create a regular user and get their token, then try to delete a branch:

```bash
curl -X DELETE http://localhost:3001/api/branches/$BRANCH_ID \
  -H "Authorization: Bearer $REGULAR_USER_TOKEN"
```

**Expected:**
```json
{
  "error": "Access denied. Required roles: admin, super_admin",
  "statusCode": 403
}
```

---

### Step 9: Test Validation (Error Cases)

#### 9.1 Invalid Email Format

```bash
curl -X POST http://localhost:3001/api/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "phone": "9876543210",
    "branch_id": "'$BRANCH_ID'"
  }'
```

**Expected:**
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

#### 9.2 Invalid Phone Number

```bash
curl -X POST http://localhost:3001/api/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "123",
    "branch_id": "'$BRANCH_ID'"
  }'
```

**Expected:**
```json
{
  "error": "Validation failed",
  "statusCode": 400,
  "errors": [
    {
      "field": "phone",
      "message": "Phone must be 10 digits"
    }
  ]
}
```

#### 9.3 Missing Required Field

```bash
curl -X POST http://localhost:3001/api/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com"
  }'
```

**Expected:**
```json
{
  "error": "Validation failed",
  "statusCode": 400,
  "errors": [
    {
      "field": "phone",
      "message": "Required"
    },
    {
      "field": "branch_id",
      "message": "Required"
    }
  ]
}
```

---

### Step 10: Test Business Logic

#### 10.1 Duplicate Email (Should Fail)

Try to create member with existing email:

```bash
curl -X POST http://localhost:3001/api/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another User",
    "email": "sarah@example.com",
    "phone": "9999999999",
    "branch_id": "'$BRANCH_ID'"
  }'
```

**Expected:**
```json
{
  "error": "Member with this email already exists",
  "statusCode": 400
}
```

#### 10.2 Trainer Time Conflict (Should Fail)

Try to create class at same time as existing class:

```bash
curl -X POST http://localhost:3001/api/classes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Conflicting Class",
    "trainer_id": "'$TRAINER_ID'",
    "branch_id": "'$BRANCH_ID'",
    "start_time": "2024-01-25T06:00:00Z",
    "end_time": "2024-01-25T07:00:00Z",
    "max_capacity": 10
  }'
```

**Expected:**
```json
{
  "error": "Trainer is not available at this time",
  "statusCode": 400
}
```

#### 10.3 Delete Branch with Members (Should Fail)

```bash
curl -X DELETE http://localhost:3001/api/branches/$BRANCH_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
```json
{
  "error": "Cannot delete branch with active members",
  "statusCode": 400
}
```

---

## ✅ Testing Checklist

- [ ] Admin login successful
- [ ] Create branch successful
- [ ] Create 2+ membership plans
- [ ] Create trainer successful
- [ ] Create 2+ members with different data
- [ ] Create 2+ classes at different times
- [ ] Get all endpoints return data correctly
- [ ] Search/filter works correctly
- [ ] Pagination works
- [ ] Authorization blocks unauthorized access (401)
- [ ] Role-based access works (403 for wrong roles)
- [ ] Validation catches invalid data
- [ ] Business logic prevents bad data (duplicates, conflicts)
- [ ] Stats endpoints return correct counts
- [ ] Update operations work
- [ ] Related data (includes) returned correctly

---

## 🐛 Common Issues

### Issue: "Cannot connect to database"
**Solution**: Check DATABASE_URL in `.env`, ensure PostgreSQL is running

### Issue: "Invalid or expired token"
**Solution**: Token expires after 15 minutes. Login again to get new token

### Issue: "Validation failed"
**Solution**: Check request body matches the schema. Phone must be exactly 10 digits, email must be valid format

### Issue: "Branch not found" when creating members
**Solution**: Make sure you saved the BRANCH_ID from step 3 and it's in the request

### Issue: "Prisma error: relation does not exist"
**Solution**: Run the database migration from Phase 2 again

---

## 📊 Verify in Prisma Studio

After testing, open Prisma Studio to visually verify data:

```bash
npm run prisma:studio
```

You should see:
- 1 admin user in `profiles`
- 1+ branches in `branches`
- 2+ plans in `membership_plans`
- 1+ trainers in `trainer_profiles`
- 2+ members in `members`
- 2+ classes in `gym_classes`

---

## 🎉 Phase 4 Testing Complete!

Once all tests pass, you're ready for:
- **Phase 5**: Additional APIs (Products, Attendance, Finance, etc.)
- **Phase 8**: Frontend Migration (Replace Supabase with REST API)

**All tests passing?** ✅ Ready to proceed!
