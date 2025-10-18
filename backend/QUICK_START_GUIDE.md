# Quick Start Guide - Fitverse Backend Migration

## 🚀 Getting Started in 30 Minutes

Follow these steps to get your backend API up and running.

---

## Step 1: Database Setup (10 minutes)

### 1.1 Create PostgreSQL Database
```bash
# Using PostgreSQL CLI
createdb fitverse

# OR using psql
psql -U postgres
CREATE DATABASE fitverse;
\q
```

### 1.2 Run Database Schema
```bash
# From project root
psql -U postgres -d fitverse -f database-schema.sql
```

### 1.3 Run Migration Files
```bash
cd backend/src/migrations
psql -U postgres -d fitverse -f 001_create_token_tables.sql
psql -U postgres -d fitverse -f 002_create_progress_and_task_tables.sql
```

---

## Step 2: Backend Configuration (5 minutes)

### 2.1 Create Environment File
```bash
cd backend
cp .env.example .env
```

### 2.2 Edit `.env` File
```bash
# Required configurations
DATABASE_URL="postgresql://postgres:password@localhost:5432/fitverse"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-characters"
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS="http://localhost:5173"
```

### 2.3 Generate Prisma Client
```bash
npm install
npm run prisma:pull
npm run prisma:generate
```

---

## Step 3: Start Backend Server (1 minute)

```bash
npm run dev
```

**Expected Output**:
```
🚀 Fitverse Backend API running on port 3001
📝 Environment: development
🔐 CORS enabled for: http://localhost:5173
💾 Database: Connected
✅ Server ready at http://localhost:3001
✅ Health check: http://localhost:3001/health
```

**Test Health Endpoint**:
```bash
curl http://localhost:3001/health
```

---

## Step 4: Frontend Configuration (5 minutes)

### 4.1 Update Axios Client
Edit `src/lib/axios.ts`:
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  timeout: 10000,
});

// Request interceptor for auth tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - try to refresh
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`, {
            refresh_token: refreshToken
          });
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          // Retry original request
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return axios.request(error.config);
        } catch (refreshError) {
          // Refresh failed - logout user
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 4.2 Add Environment Variable
Create/edit `.env` in frontend root:
```bash
VITE_BACKEND_URL=http://localhost:3001
```

### 4.3 Update Authentication Hook
Edit `src/hooks/useAuth.tsx`:
```typescript
import api from '@/lib/axios';

// Replace Supabase auth calls with backend API
const login = async (email: string, password: string) => {
  const response = await api.post('/api/auth/login', { email, password });
  const { access_token, refresh_token, user } = response.data;
  
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
  
  setUser(user);
  setSession({ access_token, refresh_token });
  
  return { user, error: null };
};

const logout = async () => {
  try {
    await api.post('/api/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setSession(null);
  }
};
```

---

## Step 5: Create First Admin User (5 minutes)

### Option A: Direct Database Insert
```sql
-- Connect to database
psql -U postgres -d fitverse

-- Create admin profile
INSERT INTO profiles (user_id, email, role, full_name, is_active)
VALUES (
  gen_random_uuid(),
  'admin@fitverse.com',
  'admin',
  'System Administrator',
  true
);

-- Get the user_id you just created
SELECT user_id, email FROM profiles WHERE email = 'admin@fitverse.com';

-- Create password hash (bcrypt hash of 'Admin@123')
-- You'll need to generate this using bcrypt with 10 rounds
-- For now, use Node.js:
```

### Option B: Using Node.js Script
Create `backend/scripts/create-admin.ts`:
```typescript
import prisma from '../src/config/database';
import { hashPassword } from '../src/utils/password';

async function createAdmin() {
  const email = 'admin@fitverse.com';
  const password = 'Admin@123';
  const hashedPassword = await hashPassword(password);
  
  const admin = await prisma.profiles.create({
    data: {
      email,
      password_hash: hashedPassword,
      role: 'admin',
      full_name: 'System Administrator',
      is_active: true,
    }
  });
  
  console.log('✅ Admin user created:', admin.email);
  console.log('📧 Email:', email);
  console.log('🔑 Password:', password);
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:
```bash
cd backend
npx tsx scripts/create-admin.ts
```

---

## Step 6: Test the System (5 minutes)

### 6.1 Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fitverse.com","password":"Admin@123"}'
```

**Expected Response**:
```json
{
  "user": {
    "userId": "...",
    "email": "admin@fitverse.com",
    "role": "admin",
    "fullName": "System Administrator"
  },
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "expires_in": "15m"
}
```

### 6.2 Test Protected Endpoint
```bash
# Copy the access_token from login response
TOKEN="your-access-token-here"

curl http://localhost:3001/api/members \
  -H "Authorization: Bearer $TOKEN"
```

### 6.3 Test Frontend Login
1. Start frontend: `npm run dev`
2. Navigate to `http://localhost:5173/login`
3. Login with: `admin@fitverse.com` / `Admin@123`
4. You should be redirected to dashboard

---

## Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution**:
1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in `.env`
3. Test connection: `psql $DATABASE_URL`

### Issue: "Prisma Client not generated"
**Solution**:
```bash
cd backend
npm run prisma:generate
```

### Issue: "CORS error in browser"
**Solution**:
1. Check `ALLOWED_ORIGINS` in backend `.env`
2. Verify frontend URL is included
3. Restart backend server

### Issue: "JWT secret not configured"
**Solution**:
1. Generate strong secret: `openssl rand -base64 32`
2. Add to backend `.env` as `JWT_SECRET`
3. Restart server

### Issue: "401 Unauthorized on all requests"
**Solution**:
1. Check token is stored: `localStorage.getItem('access_token')`
2. Verify token format: Should start with "Bearer "
3. Check token hasn't expired (15 min default)
4. Try login again to get fresh token

---

## Next Steps

Now that your backend is running:

1. **Update Remaining Hooks**: See `FRONTEND_MIGRATION_GUIDE.md`
2. **Test All Features**: Ensure each module works end-to-end
3. **Add Error Handling**: Improve user experience with proper error messages
4. **Production Setup**: See `DEPLOYMENT_GUIDE.md`

---

## Quick Reference

### Backend Commands
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run prisma:studio    # Open database GUI
npm run prisma:pull      # Update schema from database
```

### API Endpoints
- Health: `GET /health`
- Login: `POST /api/auth/login`
- Members: `GET /api/members`
- Trainers: `GET /api/trainers`
- Full list: See `backend/FINAL_MIGRATION_AUDIT.md`

### Environment Variables
- Backend: `backend/.env`
- Frontend: `.env`
- See `.env.example` for all options

---

**Ready to migrate?** Start with Step 1! 🚀
