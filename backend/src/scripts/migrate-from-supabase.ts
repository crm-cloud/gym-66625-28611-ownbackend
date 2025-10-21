/**
 * Main Migration Script from Supabase to Backend
 * 
 * This script orchestrates the migration of data from Supabase to the backend PostgreSQL database.
 * 
 * CRITICAL: Before running this script:
 * 1. Take a full backup of both databases
 * 2. Create user ID mapping table (auth.users.id → profiles.user_id)
 * 3. Run in staging environment first
 * 4. Validate data integrity after each table migration
 * 
 * Usage:
 *   npm run migrate:from-supabase
 */

import { createClient } from '@supabase/supabase-js';
import prisma from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

// Supabase connection (source)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''; // Use service key for admin access
const supabase = createClient(supabaseUrl, supabaseKey);

// User ID mapping: Supabase auth.users.id → Backend profiles.user_id
const userIdMap = new Map<string, string>();

/**
 * Step 1: Build User ID Mapping
 * Maps Supabase auth.users.id to backend profiles.user_id
 */
async function buildUserIdMapping() {
  console.log('📋 Building user ID mapping...');
  
  // Get all Supabase users from auth.users
  const { data: supabaseUsers, error: supabaseError } = await supabase.auth.admin.listUsers();
  
  if (supabaseError) {
    throw new Error(`Failed to fetch Supabase users: ${supabaseError.message}`);
  }

  // Get all backend profiles
  const backendProfiles = await prisma.profiles.findMany({
    select: {
      user_id: true,
      email: true
    }
  });

  // Map by email (assuming email is the common identifier)
  for (const supabaseUser of supabaseUsers.users) {
    const backendProfile = backendProfiles.find(p => p.email === supabaseUser.email);
    if (backendProfile) {
      userIdMap.set(supabaseUser.id, backendProfile.user_id);
      console.log(`  ✓ Mapped ${supabaseUser.email}: ${supabaseUser.id} → ${backendProfile.user_id}`);
    } else {
      console.warn(`  ⚠ No backend profile found for: ${supabaseUser.email}`);
    }
  }

  console.log(`✅ User ID mapping complete: ${userIdMap.size} users mapped\n`);
  return userIdMap.size;
}

/**
 * Step 2: Migrate Member Credits
 */
async function migrateMemberCredits() {
  console.log('💰 Migrating member credits...');
  
  const { data: credits, error } = await supabase
    .from('member_credits')
    .select('*');

  if (error) {
    console.error(`❌ Error fetching member credits: ${error.message}`);
    return 0;
  }

  if (!credits || credits.length === 0) {
    console.log('  ℹ No member credits to migrate\n');
    return 0;
  }

  let migratedCount = 0;
  for (const credit of credits) {
    try {
      await prisma.member_credits.upsert({
        where: { member_id: credit.member_id },
        create: {
          member_id: credit.member_id,
          balance: credit.balance || 0,
          created_at: new Date(credit.created_at),
          updated_at: new Date(credit.updated_at)
        },
        update: {
          balance: credit.balance || 0,
          updated_at: new Date(credit.updated_at)
        }
      });
      migratedCount++;
    } catch (err: any) {
      console.error(`  ❌ Failed to migrate credit for member ${credit.member_id}: ${err.message}`);
    }
  }

  console.log(`✅ Migrated ${migratedCount}/${credits.length} member credits\n`);
  return migratedCount;
}

/**
 * Step 3: Migrate Credit Transactions
 */
async function migrateCreditTransactions() {
  console.log('💳 Migrating credit transactions...');
  
  const { data: transactions, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`❌ Error fetching transactions: ${error.message}`);
    return 0;
  }

  if (!transactions || transactions.length === 0) {
    console.log('  ℹ No transactions to migrate\n');
    return 0;
  }

  let migratedCount = 0;
  for (const txn of transactions) {
    try {
      const mappedUserId = userIdMap.get(txn.created_by);
      if (!mappedUserId) {
        console.warn(`  ⚠ No user mapping for created_by: ${txn.created_by}`);
        continue;
      }

      await prisma.credit_transactions.create({
        data: {
          id: txn.id,
          member_id: txn.member_id,
          amount: txn.amount,
          transaction_type: txn.transaction_type,
          balance_after: txn.balance_after,
          reference_id: txn.reference_id,
          notes: txn.notes,
          created_by: mappedUserId,
          created_at: new Date(txn.created_at)
        }
      });
      migratedCount++;
    } catch (err: any) {
      console.error(`  ❌ Failed to migrate transaction ${txn.id}: ${err.message}`);
    }
  }

  console.log(`✅ Migrated ${migratedCount}/${transactions.length} credit transactions\n`);
  return migratedCount;
}

/**
 * Step 4: Migrate Member Goals
 */
async function migrateMemberGoals() {
  console.log('🎯 Migrating member goals...');
  
  const { data: goals, error } = await supabase
    .from('member_goals')
    .select('*');

  if (error) {
    console.error(`❌ Error fetching goals: ${error.message}`);
    return 0;
  }

  if (!goals || goals.length === 0) {
    console.log('  ℹ No goals to migrate\n');
    return 0;
  }

  let migratedCount = 0;
  for (const goal of goals) {
    try {
      const mappedUserId = userIdMap.get(goal.created_by);
      
      await prisma.member_goals.create({
        data: {
          id: goal.id,
          member_id: goal.member_id,
          goal_type: goal.goal_type,
          title: goal.title,
          description: goal.description,
          target_value: goal.target_value,
          current_value: goal.current_value,
          unit: goal.unit,
          start_date: new Date(goal.start_date),
          target_date: new Date(goal.target_date),
          status: goal.status || 'active',
          created_by: mappedUserId || goal.created_by,
          created_at: new Date(goal.created_at),
          updated_at: new Date(goal.updated_at)
        }
      });
      migratedCount++;
    } catch (err: any) {
      console.error(`  ❌ Failed to migrate goal ${goal.id}: ${err.message}`);
    }
  }

  console.log(`✅ Migrated ${migratedCount}/${goals.length} member goals\n`);
  return migratedCount;
}

/**
 * Step 5: Migrate Progress Entries
 */
async function migrateProgressEntries() {
  console.log('📊 Migrating progress entries...');
  
  const { data: entries, error } = await supabase
    .from('progress_entries')
    .select('*')
    .order('recorded_at', { ascending: true });

  if (error) {
    console.error(`❌ Error fetching progress entries: ${error.message}`);
    return 0;
  }

  if (!entries || entries.length === 0) {
    console.log('  ℹ No progress entries to migrate\n');
    return 0;
  }

  let migratedCount = 0;
  for (const entry of entries) {
    try {
      await prisma.progress_entries.create({
        data: {
          id: entry.id,
          goal_id: entry.goal_id,
          value: entry.value,
          notes: entry.notes,
          recorded_at: new Date(entry.recorded_at),
          created_at: new Date(entry.created_at)
        }
      });
      migratedCount++;
    } catch (err: any) {
      console.error(`  ❌ Failed to migrate progress entry ${entry.id}: ${err.message}`);
    }
  }

  console.log(`✅ Migrated ${migratedCount}/${entries.length} progress entries\n`);
  return migratedCount;
}

/**
 * Step 6: Migrate Referral Bonuses
 */
async function migrateReferralBonuses() {
  console.log('🎁 Migrating referral bonuses...');
  
  const { data: bonuses, error } = await supabase
    .from('referral_bonuses')
    .select('*');

  if (error) {
    console.error(`❌ Error fetching referral bonuses: ${error.message}`);
    return 0;
  }

  if (!bonuses || bonuses.length === 0) {
    console.log('  ℹ No referral bonuses to migrate\n');
    return 0;
  }

  let migratedCount = 0;
  for (const bonus of bonuses) {
    try {
      const mappedUserId = userIdMap.get(bonus.user_id);
      if (!mappedUserId) {
        console.warn(`  ⚠ No user mapping for user_id: ${bonus.user_id}`);
        continue;
      }

      await prisma.referral_bonuses.create({
        data: {
          id: bonus.id,
          referral_id: bonus.referral_id,
          user_id: mappedUserId,
          bonus_type: bonus.bonus_type,
          amount: bonus.amount,
          status: bonus.status || 'pending',
          earned_date: new Date(bonus.earned_date),
          paid_date: bonus.paid_date ? new Date(bonus.paid_date) : null,
          notes: bonus.notes,
          created_at: new Date(bonus.created_at),
          updated_at: new Date(bonus.updated_at)
        }
      });
      migratedCount++;
    } catch (err: any) {
      console.error(`  ❌ Failed to migrate bonus ${bonus.id}: ${err.message}`);
    }
  }

  console.log(`✅ Migrated ${migratedCount}/${bonuses.length} referral bonuses\n`);
  return migratedCount;
}

/**
 * Step 7: Migrate Membership Freeze Requests
 */
async function migrateFreezeRequests() {
  console.log('❄️  Migrating freeze requests...');
  
  const { data: requests, error } = await supabase
    .from('membership_freeze_requests')
    .select('*');

  if (error) {
    console.error(`❌ Error fetching freeze requests: ${error.message}`);
    return 0;
  }

  if (!requests || requests.length === 0) {
    console.log('  ℹ No freeze requests to migrate\n');
    return 0;
  }

  let migratedCount = 0;
  for (const request of requests) {
    try {
      const mappedCreatedBy = userIdMap.get(request.created_by);
      const mappedProcessedBy = request.processed_by ? userIdMap.get(request.processed_by) : null;

      await prisma.membership_freeze_requests.create({
        data: {
          id: request.id,
          member_id: request.member_id,
          freeze_from: new Date(request.freeze_from),
          freeze_to: new Date(request.freeze_to),
          reason: request.reason,
          notes: request.notes,
          status: request.status || 'pending',
          fee_amount: request.fee_amount,
          admin_notes: request.admin_notes,
          created_by: mappedCreatedBy || request.created_by,
          processed_by: mappedProcessedBy,
          processed_at: request.processed_at ? new Date(request.processed_at) : null,
          created_at: new Date(request.created_at),
          updated_at: new Date(request.updated_at)
        }
      });
      migratedCount++;
    } catch (err: any) {
      console.error(`  ❌ Failed to migrate freeze request ${request.id}: ${err.message}`);
    }
  }

  console.log(`✅ Migrated ${migratedCount}/${requests.length} freeze requests\n`);
  return migratedCount;
}

/**
 * Step 8: Migrate Locker Sizes
 */
async function migrateLockerSizes() {
  console.log('🔐 Migrating locker sizes...');
  
  const { data: sizes, error } = await supabase
    .from('locker_sizes')
    .select('*');

  if (error) {
    console.error(`❌ Error fetching locker sizes: ${error.message}`);
    return 0;
  }

  if (!sizes || sizes.length === 0) {
    console.log('  ℹ No locker sizes to migrate\n');
    return 0;
  }

  let migratedCount = 0;
  for (const size of sizes) {
    try {
      await prisma.locker_sizes.create({
        data: {
          id: size.id,
          name: size.name,
          dimensions: size.dimensions,
          monthly_rate: size.monthly_rate,
          branch_id: size.branch_id,
          description: size.description,
          created_at: new Date(size.created_at),
          updated_at: new Date(size.updated_at)
        }
      });
      migratedCount++;
    } catch (err: any) {
      console.error(`  ❌ Failed to migrate locker size ${size.id}: ${err.message}`);
    }
  }

  console.log(`✅ Migrated ${migratedCount}/${sizes.length} locker sizes\n`);
  return migratedCount;
}

/**
 * Main Migration Runner
 */
async function runMigration() {
  console.log('🚀 Starting Supabase to Backend Migration\n');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  const stats: Record<string, number> = {};

  try {
    // Step 1: Build user mapping
    stats.usersMapped = await buildUserIdMapping();

    // Step 2-8: Migrate tables
    stats.memberCredits = await migrateMemberCredits();
    stats.creditTransactions = await migrateCreditTransactions();
    stats.memberGoals = await migrateMemberGoals();
    stats.progressEntries = await migrateProgressEntries();
    stats.referralBonuses = await migrateReferralBonuses();
    stats.freezeRequests = await migrateFreezeRequests();
    stats.lockerSizes = await migrateLockerSizes();

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('=' .repeat(60));
    console.log('✅ Migration Complete!\n');
    console.log('📊 Summary:');
    console.log(`   Users Mapped: ${stats.usersMapped}`);
    console.log(`   Member Credits: ${stats.memberCredits}`);
    console.log(`   Credit Transactions: ${stats.creditTransactions}`);
    console.log(`   Member Goals: ${stats.memberGoals}`);
    console.log(`   Progress Entries: ${stats.progressEntries}`);
    console.log(`   Referral Bonuses: ${stats.referralBonuses}`);
    console.log(`   Freeze Requests: ${stats.freezeRequests}`);
    console.log(`   Locker Sizes: ${stats.lockerSizes}`);
    console.log(`\n⏱️  Duration: ${duration}s\n`);
    console.log('🔍 Next Steps:');
    console.log('   1. Run data integrity validation');
    console.log('   2. Test all features in staging');
    console.log('   3. Migrate remaining tables (meals, exercises, analytics, etc.)');
    console.log('   4. Schedule production cutover\n');

  } catch (error: any) {
    console.error('\n❌ Migration Failed:', error.message);
    console.error('💡 Rollback instructions:');
    console.error('   1. Restore database from backup');
    console.error('   2. Review error logs');
    console.error('   3. Fix issues and retry\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
runMigration();
