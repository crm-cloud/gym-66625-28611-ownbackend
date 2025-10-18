# Phase 2: Database Setup & Prisma Configuration

## Prerequisites Checklist

- [ ] PostgreSQL installed locally
- [ ] Node.js 18+ installed
- [ ] Terminal/Command prompt access

---

## Step 1: Install PostgreSQL (If Not Already Installed)

### Windows
Download from: https://www.postgresql.org/download/windows/

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

## Step 2: Create Database

### Option A: Using psql (Command Line)

```bash
# Access PostgreSQL
psql -U postgres

# Inside psql:
CREATE DATABASE fitverse;
CREATE USER fitverse_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE fitverse TO fitverse_user;
\q
```

### Option B: Using pgAdmin (GUI)

1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name: `fitverse`
4. Owner: postgres (or create new user)
5. Click "Save"

---

## Step 3: Load Database Schema

Navigate to the **root** of your project (not the backend folder):

```bash
# From project root directory
psql -U fitverse_user -d fitverse -f database-schema.sql

# Or if using postgres user:
psql -U postgres -d fitverse -f database-schema.sql
```

**Expected Output:**
```
CREATE TABLE
CREATE TABLE
CREATE POLICY
...
(Many CREATE statements)
```

**⚠️ If you see errors:**
- Make sure you're in the project root (where `database-schema.sql` exists)
- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -U postgres -l | grep fitverse`

---

## Step 4: Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set:

```bash
# Database (REQUIRED)
DATABASE_URL="postgresql://fitverse_user:your_secure_password@localhost:5432/fitverse?schema=public"

# Or if using postgres user:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fitverse?schema=public"

# Server
PORT=3001
NODE_ENV=development

# JWT Secrets (CHANGE THESE!)
JWT_SECRET="change-this-to-random-string-in-production-min-32-chars"
JWT_REFRESH_SECRET="change-this-to-another-random-string-min-32-chars"

# Email (Configure later in Phase 3)
EMAIL_PROVIDER="sendgrid"
SENDGRID_API_KEY="SG.your-key-here"  # Get from SendGrid dashboard
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# Payment (Configure later)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
```

---

## Step 5: Install Backend Dependencies

```bash
cd backend
npm install
```

**Expected Output:**
```
added 150+ packages
```

---

## Step 6: Introspect Database with Prisma

This reads your PostgreSQL schema and generates `schema.prisma`:

```bash
npm run prisma:pull
```

**Expected Output:**
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "fitverse"
Introspecting based on datasource defined in prisma/schema.prisma

✔ Introspected 45 models and wrote them into prisma/schema.prisma
```

**⚠️ If you see "Error: P1001 Can't reach database":**
- Double-check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running: `pg_isready`
- Test connection: `psql $DATABASE_URL`

---

## Step 7: Generate Prisma Client

This creates the TypeScript client for database queries:

```bash
npm run prisma:generate
```

**Expected Output:**
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

---

## Step 8: Verify Setup

### Check Generated Schema

```bash
# View generated models
cat prisma/schema.prisma
```

You should see models like:
```prisma
model profiles {
  user_id    String   @id @db.Uuid
  email      String   @unique
  full_name  String?
  role       String?
  ...
}

model members {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id    String?  @db.Uuid
  name       String
  ...
}
```

### Test Database Connection

```bash
npm run dev
```

Visit: http://localhost:3001/health

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "uptime": 1.234,
  "environment": "development"
}
```

---

## Step 9: Initialize Storage Directories

The backend will auto-create these on first run, but you can verify:

```bash
# Should see these folders after starting server:
ls -la backend/uploads/
# avatars/
# documents/
# attachments/
# temp/
```

---

## Step 10: Verify Prisma Models

Open Prisma Studio (database GUI):

```bash
npm run prisma:studio
```

Opens: http://localhost:5555

You should see all 40+ tables from your schema:
- ✅ profiles
- ✅ members
- ✅ branches
- ✅ trainers
- ✅ gym_classes
- ✅ membership_plans
- ... and more

---

## Troubleshooting

### Issue: "relation does not exist"

**Solution**: You didn't load the schema SQL file.
```bash
# From project root:
psql -U postgres -d fitverse -f database-schema.sql
```

### Issue: "password authentication failed"

**Solution**: Check your DATABASE_URL credentials match PostgreSQL user.
```bash
# Reset password if needed:
psql -U postgres
ALTER USER fitverse_user WITH PASSWORD 'new_password';
```

### Issue: Prisma can't find schema

**Solution**: Make sure you're in the `backend` directory.
```bash
cd backend
npm run prisma:pull
```

### Issue: Port 3001 already in use

**Solution**: Change PORT in `.env`:
```bash
PORT=3002
```

---

## ✅ Phase 2 Completion Checklist

Before proceeding to Phase 3, verify:

- [ ] PostgreSQL is installed and running
- [ ] Database `fitverse` exists
- [ ] `database-schema.sql` loaded successfully (40+ tables)
- [ ] `backend/.env` configured with correct `DATABASE_URL`
- [ ] `npm install` completed in backend
- [ ] `npm run prisma:pull` succeeded
- [ ] `npm run prisma:generate` succeeded
- [ ] `npm run dev` starts server without errors
- [ ] http://localhost:3001/health returns healthy status
- [ ] Prisma Studio shows all tables

---

## Next Steps

Once all checkboxes above are complete, you're ready for:

**✅ Phase 3: Authentication System**
- JWT token generation
- Login/Register endpoints
- Email verification
- Password reset
- Protected routes

**Database Connection String Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

**Example for local development:**
```
postgresql://fitverse_user:mypassword@localhost:5432/fitverse?schema=public
```

---

## Quick Reference

```bash
# Common commands
npm run dev              # Start dev server
npm run prisma:studio    # Open database GUI
npm run prisma:pull      # Re-introspect if schema changes
npm run prisma:generate  # Regenerate client after pull
```

**Ready for Phase 3?** 🚀
