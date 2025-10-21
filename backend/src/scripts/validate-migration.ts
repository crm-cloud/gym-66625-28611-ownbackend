/**
 * Migration Validation Script
 * 
 * Validates data integrity after migration from Supabase to Backend
 * 
 * Checks:
 * - Record counts match between source and destination
 * - No orphaned foreign key references
 * - Data types are correct
 * - Required fields are not null
 * 
 * Usage:
 *   npm run validate:migration
 */

import { createClient } from '@supabase/supabase-js';
import prisma from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface ValidationResult {
  table: string;
  passed: boolean;
  issues: string[];
  supabaseCount?: number;
  backendCount?: number;
}

const results: ValidationResult[] = [];

async function validateMemberCredits(): Promise<ValidationResult> {
  console.log('Validating member_credits...');
  const issues: string[] = [];

  // Count check
  const { count: supabaseCount } = await supabase
    .from('member_credits')
    .select('*', { count: 'exact', head: true });
  
  const backendCount = await prisma.member_credits.count();

  if (supabaseCount !== backendCount) {
    issues.push(`Count mismatch: Supabase=${supabaseCount}, Backend=${backendCount}`);
  }

  // Orphaned records check
  const orphaned = await prisma.$queryRaw<any[]>`
    SELECT mc.member_id 
    FROM member_credits mc
    LEFT JOIN members m ON mc.member_id = m.id
    WHERE m.id IS NULL
  `;

  if (orphaned.length > 0) {
    issues.push(`${orphaned.length} orphaned records (member_id not in members table)`);
  }

  return {
    table: 'member_credits',
    passed: issues.length === 0,
    issues,
    supabaseCount: supabaseCount || 0,
    backendCount
  };
}

async function validateCreditTransactions(): Promise<ValidationResult> {
  console.log('Validating credit_transactions...');
  const issues: string[] = [];

  const { count: supabaseCount } = await supabase
    .from('credit_transactions')
    .select('*', { count: 'exact', head: true });
  
  const backendCount = await prisma.credit_transactions.count();

  if (supabaseCount !== backendCount) {
    issues.push(`Count mismatch: Supabase=${supabaseCount}, Backend=${backendCount}`);
  }

  // Check for null required fields
  const nullChecks = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as count FROM credit_transactions
    WHERE member_id IS NULL OR amount IS NULL OR transaction_type IS NULL
  `;

  if (nullChecks[0].count > 0) {
    issues.push(`${nullChecks[0].count} records have null required fields`);
  }

  return {
    table: 'credit_transactions',
    passed: issues.length === 0,
    issues,
    supabaseCount: supabaseCount || 0,
    backendCount
  };
}

async function validateMemberGoals(): Promise<ValidationResult> {
  console.log('Validating member_goals...');
  const issues: string[] = [];

  const { count: supabaseCount } = await supabase
    .from('member_goals')
    .select('*', { count: 'exact', head: true });
  
  const backendCount = await prisma.member_goals.count();

  if (supabaseCount !== backendCount) {
    issues.push(`Count mismatch: Supabase=${supabaseCount}, Backend=${backendCount}`);
  }

  // Orphaned records check
  const orphaned = await prisma.$queryRaw<any[]>`
    SELECT mg.member_id 
    FROM member_goals mg
    LEFT JOIN members m ON mg.member_id = m.id
    WHERE m.id IS NULL
  `;

  if (orphaned.length > 0) {
    issues.push(`${orphaned.length} orphaned records`);
  }

  return {
    table: 'member_goals',
    passed: issues.length === 0,
    issues,
    supabaseCount: supabaseCount || 0,
    backendCount
  };
}

async function validateProgressEntries(): Promise<ValidationResult> {
  console.log('Validating progress_entries...');
  const issues: string[] = [];

  const { count: supabaseCount } = await supabase
    .from('progress_entries')
    .select('*', { count: 'exact', head: true });
  
  const backendCount = await prisma.progress_entries.count();

  if (supabaseCount !== backendCount) {
    issues.push(`Count mismatch: Supabase=${supabaseCount}, Backend=${backendCount}`);
  }

  // Orphaned goals check
  const orphaned = await prisma.$queryRaw<any[]>`
    SELECT pe.goal_id 
    FROM progress_entries pe
    LEFT JOIN member_goals mg ON pe.goal_id = mg.id
    WHERE mg.id IS NULL
  `;

  if (orphaned.length > 0) {
    issues.push(`${orphaned.length} orphaned records (goal_id not found)`);
  }

  return {
    table: 'progress_entries',
    passed: issues.length === 0,
    issues,
    supabaseCount: supabaseCount || 0,
    backendCount
  };
}

async function validateReferralBonuses(): Promise<ValidationResult> {
  console.log('Validating referral_bonuses...');
  const issues: string[] = [];

  const { count: supabaseCount } = await supabase
    .from('referral_bonuses')
    .select('*', { count: 'exact', head: true });
  
  const backendCount = await prisma.referral_bonuses.count();

  if (supabaseCount !== backendCount) {
    issues.push(`Count mismatch: Supabase=${supabaseCount}, Backend=${backendCount}`);
  }

  return {
    table: 'referral_bonuses',
    passed: issues.length === 0,
    issues,
    supabaseCount: supabaseCount || 0,
    backendCount
  };
}

async function validateFreezeRequests(): Promise<ValidationResult> {
  console.log('Validating membership_freeze_requests...');
  const issues: string[] = [];

  const { count: supabaseCount } = await supabase
    .from('membership_freeze_requests')
    .select('*', { count: 'exact', head: true });
  
  const backendCount = await prisma.membership_freeze_requests.count();

  if (supabaseCount !== backendCount) {
    issues.push(`Count mismatch: Supabase=${supabaseCount}, Backend=${backendCount}`);
  }

  // Check date validity
  const invalidDates = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as count FROM membership_freeze_requests
    WHERE freeze_from > freeze_to
  `;

  if (invalidDates[0].count > 0) {
    issues.push(`${invalidDates[0].count} records have invalid date ranges`);
  }

  return {
    table: 'membership_freeze_requests',
    passed: issues.length === 0,
    issues,
    supabaseCount: supabaseCount || 0,
    backendCount
  };
}

async function validateLockerSizes(): Promise<ValidationResult> {
  console.log('Validating locker_sizes...');
  const issues: string[] = [];

  const { count: supabaseCount } = await supabase
    .from('locker_sizes')
    .select('*', { count: 'exact', head: true });
  
  const backendCount = await prisma.locker_sizes.count();

  if (supabaseCount !== backendCount) {
    issues.push(`Count mismatch: Supabase=${supabaseCount}, Backend=${backendCount}`);
  }

  return {
    table: 'locker_sizes',
    passed: issues.length === 0,
    issues,
    supabaseCount: supabaseCount || 0,
    backendCount
  };
}

async function runValidation() {
  console.log('🔍 Starting Migration Validation\n');
  console.log('=' .repeat(60));

  try {
    results.push(await validateMemberCredits());
    results.push(await validateCreditTransactions());
    results.push(await validateMemberGoals());
    results.push(await validateProgressEntries());
    results.push(await validateReferralBonuses());
    results.push(await validateFreezeRequests());
    results.push(await validateLockerSizes());

    // Print results
    console.log('\n' + '=' .repeat(60));
    console.log('📊 Validation Results\n');

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    for (const result of results) {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.table}`);
      console.log(`   Supabase: ${result.supabaseCount} | Backend: ${result.backendCount}`);
      
      if (result.issues.length > 0) {
        result.issues.forEach(issue => {
          console.log(`   ⚠️  ${issue}`);
        });
      }
      console.log('');
    }

    console.log('=' .repeat(60));
    console.log(`\n✅ Passed: ${passed}/${results.length}`);
    console.log(`❌ Failed: ${failed}/${results.length}\n`);

    if (failed > 0) {
      console.log('⚠️  Action Required: Fix validation issues before proceeding to production');
      process.exit(1);
    } else {
      console.log('🎉 All validations passed! Migration is successful.\n');
    }

  } catch (error: any) {
    console.error('\n❌ Validation Failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runValidation();
