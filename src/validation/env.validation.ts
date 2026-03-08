import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  DB_CONNECTION: Joi.string().required().description('Mongo DB url'),
  JWT_SECRET: Joi.string().required().description('JWT secret key'),
  JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30),
  JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30),
  SMTP_HOST: Joi.string().required().description('SMTP host for sending emails'),
  SMTP_PORT: Joi.number().required().description('SMTP server port'),
  SMTP_USERNAME: Joi.string().required().description('SMTP username'),
  SMTP_PASSWORD: Joi.string().required().description('SMTP password'),
  SMTP_SECURE: Joi.boolean().default(false).description('Use TLS for SMTP connection'),
  EMAIL_FROM: Joi.string().email().required().description('Sender email address'),
  CORS_ORIGIN: Joi.string().allow('').default(''),
}).unknown();

