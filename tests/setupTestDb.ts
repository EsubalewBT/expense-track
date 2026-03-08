import mongoose from 'mongoose';
import { config } from '../src/config/config';

const getTestDatabaseUrl = (connectionUrl: string): string => {
  const [baseUrl, query = ''] = connectionUrl.split('?');
  const lastSlashIndex = baseUrl.lastIndexOf('/');

  if (lastSlashIndex === -1) {
    throw new Error('Invalid MongoDB connection URL');
  }

  const dbName = baseUrl.slice(lastSlashIndex + 1);
  const dbBase = baseUrl.slice(0, lastSlashIndex + 1);
  const testDbName = dbName ? `${dbName}-test` : 'test';

  return query ? `${dbBase}${testDbName}?${query}` : `${dbBase}${testDbName}`;
};

const setupTestDB = (): void => {
  beforeAll(async () => {
    const testDbUrl = getTestDatabaseUrl(config.dbConnection);
    await mongoose.connect(testDbUrl);
  });

  beforeEach(async () => {
    const { collections } = mongoose.connection;
    await Promise.all(
      Object.values(collections).map(async (collection) => collection.deleteMany({}))
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
};

export default setupTestDB;
