"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../src/config/config");
const getTestDatabaseUrl = (connectionUrl) => {
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
const setupTestDB = () => {
    beforeAll(async () => {
        const testDbUrl = getTestDatabaseUrl(config_1.config.dbConnection);
        await mongoose_1.default.connect(testDbUrl);
    });
    beforeEach(async () => {
        const { collections } = mongoose_1.default.connection;
        await Promise.all(Object.values(collections).map(async (collection) => collection.deleteMany({})));
    });
    afterAll(async () => {
        await mongoose_1.default.disconnect();
    });
};
exports.default = setupTestDB;
//# sourceMappingURL=setupTestDb.js.map