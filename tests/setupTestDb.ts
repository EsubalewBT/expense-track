import { prisma } from '../src/lib/prisma';

const setupTestDB = (): void => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.$transaction([
      prisma.token.deleteMany(),
      prisma.transaction.deleteMany(),
      prisma.fintrack.deleteMany(),
      prisma.user.deleteMany(),
      prisma.test.deleteMany(),
    ]);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
};

export default setupTestDB;
