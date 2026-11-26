import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().default(''),
  SUPABASE_ANON_KEY: z.string().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(''),
  RECOMMENDATION_SERVICE_URL: z.string().default('http://localhost:8000'),
  ALLOWED_ORIGINS: z
    .string()
    .default(
      'http://localhost:8081,http://localhost:19006,exp://localhost:8081,http://localhost:3000,https://margdarshak-webapp.vercel.app'
    ),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = {
  ...parsed.data,
  ALLOWED_ORIGINS_ARRAY: parsed.data.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
};
