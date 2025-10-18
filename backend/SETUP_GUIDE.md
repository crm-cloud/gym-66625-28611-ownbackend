# 🚀 Backend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup PostgreSQL Database
```bash
# Create database and user
psql -U postgres
CREATE DATABASE fitverse;
CREATE USER fitverse_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE fitverse TO fitverse_user;
\q
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Generate Prisma Client & Run Migrations
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Seed Test Data
```bash
npm run seed
```

### 6. Start Server
```bash
npm run dev
```

Server runs on http://localhost:3001

## Test Credentials (After Seed)

- **Super Admin**: superadmin@fitverse.com / SuperAdmin@123
- **Admin**: admin@fitverse.com / Admin@123
- **Trainers**: trainer01-05@fitverse.com / Trainer@123
- **Members**: member01-10@fitverse.com / Member@123
- **Staff**: staff01-02@fitverse.com / Staff@123

## API Endpoints

Base URL: `http://localhost:3001/api`

### Auth
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/refresh`
- GET `/auth/me`

### Users
- GET `/users`
- GET `/users/:id`
- PUT `/users/:id`

## Next Steps

1. Complete remaining route implementations (see MIGRATION_AUDIT.md)
2. Test all endpoints
3. Migrate frontend components to use backend API
