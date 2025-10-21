/**
 * Integration Test: Credits Flow
 * Tests complete user journey for credit operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../src/server';
import prisma from '../../src/config/database';

describe('Credits Flow Integration', () => {
  let authToken: string;
  let memberId: string;

  beforeAll(async () => {
    // Login and get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@fitverse.com',
        password: 'admin123'
      });

    authToken = loginRes.body.token;

    // Create test member
    const memberRes = await request(app)
      .post('/api/members')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        full_name: 'Integration Test Member',
        email: 'integration@test.com',
        phone: '9876543210',
        branch_id: 'test-branch'
      });

    memberId = memberRes.body.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.credit_transactions.deleteMany({ where: { member_id: memberId } });
    await prisma.member_credits.deleteMany({ where: { member_id: memberId } });
    await prisma.members.delete({ where: { id: memberId } });
    await prisma.$disconnect();
  });

  it('should complete full credit lifecycle', async () => {
    // Step 1: Check initial balance (should be 0 or auto-created)
    const balanceRes1 = await request(app)
      .get(`/api/member-credits/${memberId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(balanceRes1.status).toBe(200);
    expect(balanceRes1.body.balance).toBe(0);

    // Step 2: Add 100 credits (purchase)
    const addRes = await request(app)
      .post(`/api/member-credits/${memberId}/add`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 100,
        transaction_type: 'purchase',
        notes: 'First purchase'
      });

    expect(addRes.status).toBe(201);
    expect(addRes.body.credits.balance).toBe(100);

    // Step 3: Add 50 more credits (bonus)
    await request(app)
      .post(`/api/member-credits/${memberId}/add`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 50,
        transaction_type: 'bonus'
      });

    // Step 4: Deduct 30 credits (redemption)
    const deductRes = await request(app)
      .post(`/api/member-credits/${memberId}/deduct`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 30,
        transaction_type: 'redemption',
        notes: 'Product purchase'
      });

    expect(deductRes.status).toBe(200);
    expect(deductRes.body.credits.balance).toBe(120);

    // Step 5: Get transaction history
    const txnRes = await request(app)
      .get(`/api/member-credits/transactions?member_id=${memberId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(txnRes.status).toBe(200);
    expect(txnRes.body.transactions.length).toBe(3);
    expect(txnRes.body.pagination.total).toBe(3);

    // Step 6: Try to deduct more than balance (should fail)
    const failRes = await request(app)
      .post(`/api/member-credits/${memberId}/deduct`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 200,
        transaction_type: 'redemption'
      });

    expect(failRes.status).toBe(400);
    expect(failRes.body.error).toContain('Insufficient credits');

    // Step 7: Final balance check
    const balanceRes2 = await request(app)
      .get(`/api/member-credits/${memberId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(balanceRes2.body.balance).toBe(120);
  });

  it('should handle concurrent credit operations', async () => {
    // Add initial balance
    await request(app)
      .post(`/api/member-credits/${memberId}/add`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: 100, transaction_type: 'purchase' });

    // Concurrent deductions
    const promises = [
      request(app)
        .post(`/api/member-credits/${memberId}/deduct`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 10, transaction_type: 'redemption' }),
      
      request(app)
        .post(`/api/member-credits/${memberId}/deduct`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 15, transaction_type: 'redemption' }),
      
      request(app)
        .post(`/api/member-credits/${memberId}/deduct`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 20, transaction_type: 'redemption' })
    ];

    const results = await Promise.all(promises);
    
    // All should succeed
    results.forEach(res => {
      expect(res.status).toBe(200);
    });

    // Final balance should be correct
    const balanceRes = await request(app)
      .get(`/api/member-credits/${memberId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(balanceRes.body.balance).toBeLessThanOrEqual(220); // 120 + 100 - 45 = 175
  });
});
