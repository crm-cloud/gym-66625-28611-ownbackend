# Prisma Migration Guide

## Prerequisites

Before running migrations, ensure you have:
1. PostgreSQL database running
2. Database connection string in `backend/.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/gymflow"
   ```

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Generate Prisma Client

```bash
npx prisma generate
```

This will generate the Prisma Client based on your schema.

## Step 3: Create Initial Migration

```bash
npx prisma migrate dev --name init
```

This will:
- Create a new migration file in `backend/prisma/migrations`
- Apply the migration to your database
- Generate/update Prisma Client

## Step 4: Verify Migration

Check that the migration was successful:

```bash
npx prisma studio
```

This opens Prisma Studio where you can browse your database tables.

## Common Migration Commands

### Create a new migration after schema changes
```bash
npx prisma migrate dev --name description_of_change
```

### Apply pending migrations (production)
```bash
npx prisma migrate deploy
```

### Reset database (DESTRUCTIVE - deletes all data)
```bash
npx prisma migrate reset
```

### Check migration status
```bash
npx prisma migrate status
```

### Generate Prisma Client only (no migration)
```bash
npx prisma generate
```

## Migration Workflow

1. **Development**:
   - Modify `schema.prisma`
   - Run `npx prisma migrate dev --name your_change`
   - Test changes

2. **Staging/Production**:
   - Commit migration files to version control
   - Deploy code
   - Run `npx prisma migrate deploy` on server

## Troubleshooting

### Migration fails due to existing data

If you have existing data that conflicts with schema changes:

```bash
# Option 1: Reset database (LOSES ALL DATA)
npx prisma migrate reset

# Option 2: Write custom migration SQL
# Edit the migration file manually before applying
```

### Database out of sync

```bash
npx prisma db push
```

This syncs schema without creating migration files (useful for prototyping).

### Generate Prisma Client after pull

```bash
npx prisma db pull
npx prisma generate
```

## Important Notes

⚠️ **NEVER** run `prisma migrate reset` in production - it deletes all data!

✅ **ALWAYS** commit migration files to version control

✅ **ALWAYS** backup database before running migrations in production

✅ **TEST** migrations in development/staging first

## Current Schema Status

- ✅ Schema file complete: `backend/prisma/schema.prisma`
- ✅ 100+ models defined
- ✅ All relations configured
- ✅ All enums defined
- ⚠️ **Action Required**: Run initial migration

## Next Steps

1. Run: `cd backend && npx prisma migrate dev --name init`
2. Verify tables created in database
3. Start backend server: `npm run dev`
4. Test API endpoints

---

**Questions?** Refer to [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
