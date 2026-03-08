import path from "path";
import dotenv from "dotenv";

import { envValidationSchema } from "../validation/env.validation";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { value: envVars, error } = envValidationSchema.validate(process.env);

if(error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const corsOrigins = String(envVars.CORS_ORIGIN || "")
    .split(",")
    .map((origin: string) => origin.trim())
    .filter(Boolean);

export const config = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    dbConnection: envVars.DB_CONNECTION,
    corsOrigins,
    jwt: {
        secret: envVars.JWT_SECRET,
        accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
        refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    },

}