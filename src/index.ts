import mongoose from "mongoose";
import { config } from "./config/config";

export const connectDB = async () => {
    try {
        await mongoose.connect(config.dbConnection);
        console.log("Database connection successful");
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};