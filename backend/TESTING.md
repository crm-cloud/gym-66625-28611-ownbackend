# Testing Guide

## Overview

This document outlines the testing strategy for the FitVerse backend API.

---

## Test Structure

```
backend/
├── tests/
│   ├── setup.ts                          # Global test setup
│   ├── member-credits.test.ts            # Unit tests for credits
│   ├── membership-freeze.test.ts         # Unit tests for freeze
│   ├── member-goals.test.ts              # Unit tests for goals
│   └── integration/
│       ├── credits-flow.test.ts          # Integration tests
│       ├── freeze-flow.test.ts
│       └── goals-flow.test.ts
```

---

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### With Coverage
```bash
npm run test:coverage
```

### Specific Test File
```bash
npm test -- member-credits.test.ts
```

---

## Test Types

### 1. Unit Tests
Test individual service methods in isolation.

**Example:**
```typescript
describe('MemberCreditsService', () => {
  it('should add credits successfully', async () => {
    const result = await memberCreditsService.addCredits(
      memberId,
      { amount: 100, transaction_type: 'purchase' },
      userId
    );
    expect(result.credits.balance).toBe(100);
  });
});
```

### 2. Integration Tests
Test complete API workflows.

**Example:**
```typescript
describe('Credits Flow Integration', () => {
  it('should complete full credit lifecycle', async () => {
    // Add credits
    await request(app)
      .post(`/api/member-credits/${memberId}/add`)
      .send({ amount: 100, transaction_type: 'purchase' });
    
    // Deduct credits
    await request(app)
      .post(`/api/member-credits/${memberId}/deduct`)
      .send({ amount: 30, transaction_type: 'redemption' });
    
    // Verify balance
    const res = await request(app)
      .get(`/api/member-credits/${memberId}`);
    expect(res.body.balance).toBe(70);
  });
});
```

### 3. Data Integrity Tests
Validate database constraints and relationships.

**Example:**
```typescript
it('should prevent orphaned transactions', async () => {
  // Try to create transaction for non-existent member
  await expect(
    memberCreditsService.addCredits('invalid-id', { amount: 100 }, userId)
  ).rejects.toThrow();
});
```

---

## Test Database Setup

### Option 1: Separate Test Database
```bash
# .env.test
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/fitverse_test
```

### Option 2: Docker Container
```bash
docker run --name fitverse-test-db \
  -e POSTGRES_PASSWORD=testpass \
  -e POSTGRES_DB=fitverse_test \
  -p 5433:5432 \
  -d postgres:15
```

### Schema Setup
```bash
# Run migrations on test database
DATABASE_URL=$TEST_DATABASE_URL npm run prisma:migrate:deploy
```

---

## Writing Tests

### Test Template
```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import prisma from '../src/config/database';
import { yourService } from '../src/services/your.service';

describe('Your Service', () => {
  let testData: any;

  beforeAll(async () => {
    // Setup: Create test data
    testData = await prisma.yourModel.create({ data: {...} });
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await prisma.yourModel.delete({ where: { id: testData.id } });
    await prisma.$disconnect();
  });

  it('should do something', async () => {
    const result = await yourService.doSomething(testData.id);
    expect(result).toBeDefined();
  });
});
```

---

## Coverage Goals

| Metric | Target | Current |
|--------|--------|---------|
| Statements | ≥70% | - |
| Branches | ≥70% | - |
| Functions | ≥70% | - |
| Lines | ≥70% | - |

---

## Best Practices

### ✅ DO
- Write tests for all new features
- Test both success and error cases
- Clean up test data after each test
- Use meaningful test descriptions
- Mock external services (email, SMS)
- Test edge cases and boundary conditions

### ❌ DON'T
- Don't test implementation details
- Don't share state between tests
- Don't use production database for tests
- Don't skip cleanup (causes test pollution)
- Don't test third-party libraries

---

## Mocking External Services

### Email Service Mock
```typescript
jest.mock('../src/config/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true })
}));
```

### Supabase Mock (for migration tests)
```typescript
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockResolvedValue({ data: [], error: null })
  })
}));
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: fitverse_test
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run prisma:migrate:deploy
      - run: npm test
      - run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Troubleshooting

### Issue: Tests timeout
**Solution:** Increase timeout in `jest.config.js`:
```javascript
testTimeout: 30000 // 30 seconds
```

### Issue: Database connection errors
**Solution:** Verify `TEST_DATABASE_URL` is set correctly and database is running.

### Issue: Tests fail on CI but pass locally
**Solution:** Ensure CI environment has same Node version and environment variables.

### Issue: Flaky tests (pass/fail randomly)
**Solution:** Check for shared state between tests. Use `beforeEach`/`afterEach` for isolation.

---

## Performance Testing (Future)

### Load Testing with k6
```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 100, // 100 virtual users
  duration: '30s',
};

export default function () {
  let res = http.get('http://localhost:3001/api/member-credits/summary');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
}
```

Run: `k6 run loadtest.js`

---

## Next Steps

1. ✅ Write unit tests for all 11 Phase 1 features
2. ✅ Write integration tests for critical flows
3. ⬜ Achieve 70%+ code coverage
4. ⬜ Add performance benchmarks
5. ⬜ Setup CI/CD pipeline
6. ⬜ Add E2E tests with Playwright

---

**Last updated:** 2025-10-21
**Version:** 1.0
