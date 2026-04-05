import request from 'supertest';
import httpStatus from 'http-status';
import app from '../../src/app';
import setupTestDB from '../setupTestDb';
import { prisma } from '../../src/lib/prisma';
import { generateAuthTokens } from '../../src/services/token.service';

setupTestDB();

describe('Expense Routes', () => {
  describe('GET /expense?fintrackId', () => {
    test('should include runningBalance for vault transactions', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Vault User',
          email: 'vault.user@example.com',
          password: 'password123',
        },
      });

      const tokens = await generateAuthTokens({ id: user.id });

      const fintrack = await prisma.fintrack.create({
        data: {
          title: 'Primary Vault',
          description: 'Balance test vault',
          userId: user.id,
        },
      });

      await prisma.transaction.createMany({
        data: [
          {
            title: 'Salary',
            type: 'INCOME',
            amount: 1000,
            category: 'Salary',
            date: new Date('2024-01-01T10:00:00.000Z'),
            userId: user.id,
            fintrackId: fintrack.id,
          },
          {
            title: 'Groceries',
            type: 'EXPENSE',
            amount: 250,
            category: 'Food',
            date: new Date('2024-01-05T10:00:00.000Z'),
            userId: user.id,
            fintrackId: fintrack.id,
          },
          {
            title: 'Bonus',
            type: 'INCOME',
            amount: 400,
            category: 'Salary',
            date: new Date('2024-01-10T10:00:00.000Z'),
            userId: user.id,
            fintrackId: fintrack.id,
          },
        ],
      });

      const res = await request(app)
        .get('/expense')
        .query({
          fintrackId: fintrack.id,
          sortBy: 'date:desc',
          limit: 10,
          page: 1,
        })
        .set('Authorization', `Bearer ${tokens.access.token}`)
        .expect(httpStatus.OK);

      const balances = res.body.results.map((item: { runningBalance: number }) =>
        Number(item.runningBalance)
      );

      expect(balances).toHaveLength(3);
      expect(balances[0]).toBeCloseTo(1150, 5);
      expect(balances[1]).toBeCloseTo(750, 5);
      expect(balances[2]).toBeCloseTo(1000, 5);
    });
  });
});
