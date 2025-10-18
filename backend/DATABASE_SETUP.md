# 🗄️ PostgreSQL Database Setup Guide

## Overview
This guide will help you set up the PostgreSQL database for Fitverse backend.

## Prerequisites
- PostgreSQL 14+ installed
- Terminal/Command Line access
- Basic SQL knowledge (optional)

---

## Step 1: Install PostgreSQL

### Windows
1. Download from https://www.postgresql.org/download/windows/
2. Run the installer
3. Set a password for the `postgres` superuser (remember this!)
4. Default port: 5432

### macOS
```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## Step 2: Create Database and User

### Option A: Using psql (Command Line)

```bash
# Login as postgres superuser
sudo -u postgres psql

# Or on Windows/Mac (if not using sudo):
psql -U postgres
```

Once in the PostgreSQL prompt:

```sql
-- Create database
CREATE DATABASE fitverse;

-- Create user with password
CREATE USER fitverse_user WITH PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fitverse TO fitverse_user;

-- Grant schema privileges
\c fitverse
GRANT ALL ON SCHEMA public TO fitverse_user;

-- Exit
\q
```

### Option B: Using pgAdmin (GUI)
1. Open pgAdmin
2. Right-click "Databases" → "Create" → "Database"
3. Name: `fitverse`, Owner: `postgres`
4. Right-click "Login/Group Roles" → "Create" → "Login/Group Role"
5. Name: `fitverse_user`, Password: `your_secure_password_here`
6. Privileges tab: Check "Can login?"
7. Right-click `fitverse` database → "Properties" → "Security"
8. Add `fitverse_user` with all privileges

---

## Step 3: Load Database Schema

Navigate to your project root directory:

```bash
# Load the complete schema
psql -U fitverse_user -d fitverse -f backend/database-schema-complete.sql

# You should see:
# CREATE EXTENSION
# CREATE TYPE
# CREATE TABLE
# CREATE INDEX
# CREATE TRIGGER
# ... (many lines)
```

If you see errors, check:
- User has correct permissions
- Database name is correct
- File path is correct

---

## Step 4: Verify Tables Created

```bash
# Connect to database
psql -U fitverse_user -d fitverse

# List all tables
\dt

# You should see 50+ tables including:
# - profiles
# - user_roles
# - gyms
# - branches
# - members
# - trainers
# - classes
# - products
# - payments
# - and many more...

# Exit
\q
```

---

## Step 5: Configure Backend Environment

```bash
# Navigate to backend folder
cd backend

# Copy example environment file
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

**Update these critical values in `.env`:**

```bash
# Database Connection (UPDATE THIS!)
DATABASE_URL="postgresql://fitverse_user:your_secure_password_here@localhost:5432/fitverse?schema=public"

# JWT Secrets (CHANGE THESE!)
JWT_SECRET="generate-a-random-secure-key-here-min-32-chars"
JWT_REFRESH_SECRET="generate-another-random-secure-key-min-32-chars"

# Server
PORT=3001
NODE_ENV=development

# CORS
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"

# Frontend URL
FRONTEND_URL="http://localhost:5173"
```

**To generate secure JWT secrets:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Step 6: Install Backend Dependencies

```bash
cd backend
npm install
```

---

## Step 7: Generate Prisma Client

```bash
# Introspect database and generate schema.prisma
npm run prisma:pull

# Expected output:
# ✔ Introspected 50+ models and wrote them into prisma/schema.prisma

# Generate Prisma Client
npm run prisma:generate

# Expected output:
# ✔ Generated Prisma Client to ./node_modules/@prisma/client
```

**Check the generated schema:**
```bash
# Should exist now:
ls prisma/schema.prisma
```

---

## Step 8: Create Admin User

### Option A: SQL Script

```bash
psql -U fitverse_user -d fitverse
```

```sql
-- Create admin profile
INSERT INTO profiles (user_id, email, full_name, password_hash, email_verified, is_active)
VALUES (
  gen_random_uuid(),
  'admin@fitverse.com',
  'System Administrator',
  -- Password: "admin123" (CHANGE IN PRODUCTION!)
  '$2a$10$rQ3qKx5O7pGXQKX5YvJ5JOXKxH9fGX5X5X5X5X5X5X5X5X5X5X5X5',
  true,
  true
);

-- Get the user_id
SELECT user_id, email, full_name FROM profiles WHERE email = 'admin@fitverse.com';

-- Copy the user_id from above, then:
INSERT INTO user_roles (user_id, role)
VALUES ('[paste-user-id-here]', 'admin');

\q
```

### Option B: Node.js Script

Create `backend/src/scripts/create-admin.ts`:

```typescript
import bcrypt from 'bcrypt';
import prisma from '../config/database';

async function createAdmin() {
  const email = 'admin@fitverse.com';
  const password = 'admin123'; // CHANGE THIS!
  const passwordHash = await bcrypt.hash(password, 10);

  // Create profile
  const profile = await prisma.profiles.create({
    data: {
      email,
      full_name: 'System Administrator',
      password_hash: passwordHash,
      email_verified: true,
      is_active: true,
    }
  });

  // Add admin role
  await prisma.user_roles.create({
    data: {
      user_id: profile.user_id,
      role: 'admin',
    }
  });

  console.log('✅ Admin user created:');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('User ID:', profile.user_id);
}

createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
```

Run it:
```bash
npx ts-node src/scripts/create-admin.ts
```

---

## Step 9: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ Database connected
🚀 Server running on http://localhost:3001
```

---

## Step 10: Test the Setup

### Test 1: Health Check
```bash
curl http://localhost:3001/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-18T...",
  "database": "connected"
}
```

### Test 2: Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fitverse.com",
    "password": "admin123"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "user_id": "...",
      "email": "admin@fitverse.com",
      "full_name": "System Administrator",
      "role": "admin"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Test 3: Protected Endpoint
```bash
# Use the accessToken from login response
curl http://localhost:3001/api/members \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## Step 11: Open Prisma Studio (Optional)

Prisma Studio is a visual database browser:

```bash
cd backend
npm run prisma:studio
```

Opens at http://localhost:5555

You can:
- View all tables
- Browse data
- Edit records
- Test queries

---

## Troubleshooting

### Error: "password authentication failed"
**Solution:**
- Check password in DATABASE_URL matches the one you set
- Ensure user has correct permissions
- Try resetting user password:
  ```sql
  ALTER USER fitverse_user WITH PASSWORD 'new_password';
  ```

### Error: "relation does not exist"
**Solution:**
- Schema not loaded properly
- Re-run: `psql -U fitverse_user -d fitverse -f backend/database-schema-complete.sql`
- Check for errors in output

### Error: "Prisma schema not found"
**Solution:**
- Run `npm run prisma:pull` to generate it
- Check `backend/prisma/schema.prisma` exists

### Error: "Port 3001 already in use"
**Solution:**
- Change PORT in `.env` to something else (e.g., 3002)
- Or kill process using port 3001:
  ```bash
  # Linux/Mac
  lsof -ti:3001 | xargs kill -9
  
  # Windows
  netstat -ano | findstr :3001
  taskkill /PID [PID_NUMBER] /F
  ```

### Error: "Cannot find module '@prisma/client'"
**Solution:**
```bash
cd backend
npm install
npm run prisma:generate
```

### Error: Backend starts but queries fail
**Solution:**
- Check Prisma Client is generated: `npm run prisma:generate`
- Restart backend server
- Check database connection in Prisma Studio

---

## Security Checklist

Before deploying to production:

- [ ] Changed default admin password
- [ ] Generated secure JWT secrets (min 32 characters)
- [ ] Updated DATABASE_URL password
- [ ] Set NODE_ENV=production
- [ ] Enabled SSL for database connection
- [ ] Configured proper CORS origins
- [ ] Set up database backups
- [ ] Enabled database connection pooling
- [ ] Reviewed user permissions
- [ ] Set up monitoring and logging

---

## Next Steps

1. ✅ Database is set up
2. ✅ Backend is running
3. ✅ Admin user created
4. ⏳ Configure frontend to use backend API
5. ⏳ Test all features end-to-end
6. ⏳ Deploy to production

---

## Quick Reference

### Common Commands

```bash
# Backend Development
cd backend
npm run dev              # Start dev server
npm run prisma:studio    # Open database GUI
npm run prisma:pull      # Re-introspect database
npm run prisma:generate  # Regenerate Prisma Client

# Database Operations
psql -U fitverse_user -d fitverse              # Connect to database
psql -U fitverse_user -d fitverse -f file.sql  # Run SQL file

# Inside psql
\dt                      # List all tables
\d table_name            # Describe table structure
\du                      # List users
\l                       # List databases
\q                       # Quit
```

### Connection String Format
```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

Example:
```
postgresql://fitverse_user:mypassword@localhost:5432/fitverse?schema=public
```

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review backend logs in terminal
3. Check PostgreSQL logs
4. Verify all steps were completed in order
5. Ensure PostgreSQL service is running

**PostgreSQL Service Status:**
```bash
# Linux
sudo systemctl status postgresql

# Mac
brew services list

# Windows
# Check Services app → PostgreSQL service
```
