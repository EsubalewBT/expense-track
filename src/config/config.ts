import path from "path";
import dotenv from "dotenv";

import { envValidationSchema } from "../validation/env.validation";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { value: envVars, error } = envValidationSchema.validate(process.env);

if(error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    dbConnection: envVars.DB_CONNECTION
}