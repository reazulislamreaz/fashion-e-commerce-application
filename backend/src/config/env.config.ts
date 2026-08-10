import * as Joi from 'joi';

/**
 * Centralized environment validation.
 * The application fails fast when required configuration is missing or invalid.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('/api/v1'),
  APP_NAME: Joi.string().default('Easy Fashion API'),

  DATABASE_URL: Joi.string()
    .pattern(/^postgres(ql)?:\/\//)
    .required()
    .messages({
      'string.pattern.base':
        'DATABASE_URL must be a valid PostgreSQL connection string',
    }),

  CORS_ORIGIN: Joi.string().default('http://localhost:3001'),

  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),

  GOOGLE_CLIENT_ID: Joi.string().optional().allow(''),
  GOOGLE_CLIENT_SECRET: Joi.string().optional().allow(''),
  FACEBOOK_CLIENT_ID: Joi.string().optional().allow(''),
  FACEBOOK_CLIENT_SECRET: Joi.string().optional().allow(''),

  // Seed-only credentials (validated by prisma/seed.ts when seeding)
  SUPER_ADMIN_EMAIL: Joi.string().email().optional(),
  SUPER_ADMIN_PASSWORD: Joi.string().min(8).optional(),
  SUPER_ADMIN_FULL_NAME: Joi.string().optional().allow(''),

  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(100),

  BODY_LIMIT: Joi.string().default('1mb'),
});
