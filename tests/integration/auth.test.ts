import request from 'supertest';
import httpStatus from 'http-status';
import app from '../../src/app';
import setupTestDB from '../setupTestDb';
import { prisma } from '../../src/lib/prisma';

setupTestDB();

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    let newUser: {
      name: string;
      email: string;
      password: string;
    };

    beforeEach(() => {
      newUser = {
        name: 'Fake User',
        email: 'fake@example.com',
        password: 'password1',
      };
    });

    test('should return 201 and successfully create new user if data is ok', async () => {
      const res = await request(app).post('/api/auth/register').send(newUser);

      expect(res.status).toBe(httpStatus.CREATED);
      expect(res.body.user).toEqual(expect.objectContaining({
        id: expect.anything(),
        name: newUser.name,
        email: newUser.email,
      }));
      expect(res.body.tokens).toHaveProperty('access');
      expect(res.body.tokens).toHaveProperty('refresh');

      const dbUser = await prisma.user.findUnique({
        where: { id: res.body.user.id },
      });
      expect(dbUser).toBeDefined();
      expect(dbUser?.password).not.toBe(newUser.password);
    });

    test('should return 400 if password is too short', async () => {
      newUser.password = '123';

      await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
