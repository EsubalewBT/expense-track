import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  DB_CONNECTION: Joi.string().required().description('Mongo DB url'),
  JWT_SECRET: Joi.string().required().description('JWT secret key'),
  JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30),
  JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30),
  CORS_ORIGIN: Joi.string().allow('').default(''),
}).unknown();

