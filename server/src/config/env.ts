import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number),
  // Add other environment variables here
});

const envVars = envSchema.parse(process.env);

export const config = {
  ENV: envVars.NODE_ENV,
  PORT: envVars.PORT || 3001,
  RATE_LIMIT: {
    WINDOW_MS: envVars.RATE_LIMIT_WINDOW_MS,
    MAX: envVars.RATE_LIMIT_MAX_REQUESTS,
  },
  // Add other configuration options here
} as const;