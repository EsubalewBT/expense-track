import { config } from "./config/config";
import { prisma } from "./lib/prisma";
import app from "./app";

export const connectDB = async () => {
    try {
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;
        console.log("Database connection successful");
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};

connectDB().then(() => {
    app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`);
    });
});