/**
 * Member Credits Service Tests
 * Phase 5: Testing & Validation
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import prisma from '../src/config/database';
import { memberCreditsService } from '../src/services/member-credits.service';

describe('Member Credits Service', () => {
  let testMemberId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create test member
    const member = await prisma.members.create({
      data: {
        full_name: 'Test Member',
        email: 'test@credits.com',
        phone: '1234567890',
        branch_id: 'test-branch-id',
        membership_status: 'active',
        joined_date: new Date()
      }
    });
    testMemberId = member.id;
    testUserId = 'test-user-id';
  });

  afterAll(async () => {
    // Cleanup
    await prisma.credit_transactions.deleteMany({ where: { member_id: testMemberId } });
    await prisma.member_credits.deleteMany({ where: { member_id: testMemberId } });
    await prisma.members.delete({ where: { id: testMemberId } });
    await prisma.$disconnect();
  });

  describe('getBalance', () => {
    it('should create credits record if not exists', async () => {
      const credits = await memberCreditsService.getBalance(testMemberId);
      
      expect(credits).toBeDefined();
      expect(credits.member_id).toBe(testMemberId);
      expect(credits.balance).toBe(0);
    });

    it('should return existing credits balance', async () => {
      const credits = await memberCreditsService.getBalance(testMemberId);
      
      expect(credits.balance).toBe(0);
      expect(credits.member).toBeDefined();
    });
  });

  describe('addCredits', () => {
    it('should add credits successfully', async () => {
      const result = await memberCreditsService.addCredits(
        testMemberId,
        {
          amount: 100,
          transaction_type: 'purchase',
          notes: 'Test purchase'
        },
        testUserId
      );

      expect(result.credits.balance).toBe(100);
      expect(result.transaction.amount).toBe(100);
      expect(result.transaction.balance_after).toBe(100);
    });

    it('should handle multiple credit additions', async () => {
      await memberCreditsService.addCredits(
        testMemberId,
        { amount: 50, transaction_type: 'bonus' },
        testUserId
      );

      const credits = await memberCreditsService.getBalance(testMemberId);
      expect(credits.balance).toBe(150);
    });
  });

  describe('deductCredits', () => {
    it('should deduct credits successfully', async () => {
      const result = await memberCreditsService.deductCredits(
        testMemberId,
        {
          amount: 30,
          transaction_type: 'redemption',
          notes: 'Test redemption'
        },
        testUserId
      );

      expect(result.credits.balance).toBe(120);
      expect(result.transaction.amount).toBe(-30);
    });

    it('should throw error for insufficient credits', async () => {
      await expect(
        memberCreditsService.deductCredits(
          testMemberId,
          { amount: 200, transaction_type: 'redemption' },
          testUserId
        )
      ).rejects.toThrow('Insufficient credits');
    });
  });

  describe('getTransactions', () => {
    it('should return transaction history', async () => {
      const result = await memberCreditsService.getTransactions({
        member_id: testMemberId,
        page: 1,
        limit: 10
      });

      expect(result.transactions).toBeDefined();
      expect(result.transactions.length).toBeGreaterThan(0);
      expect(result.pagination.total).toBeGreaterThan(0);
    });

    it('should filter by transaction type', async () => {
      const result = await memberCreditsService.getTransactions({
        member_id: testMemberId,
        transaction_type: 'purchase'
      });

      expect(result.transactions.every(t => t.transaction_type === 'purchase')).toBe(true);
    });
  });

  describe('getCreditsSummary', () => {
    it('should return summary statistics', async () => {
      const summary = await memberCreditsService.getCreditsSummary();

      expect(summary).toBeDefined();
      expect(summary.total_credits).toBeGreaterThanOrEqual(0);
      expect(summary.total_members).toBeGreaterThan(0);
    });
  });
});
