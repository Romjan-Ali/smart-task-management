import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),

  FRONTEND_URL: z.url(),
  
  MONGODB_URI: z.url(),
  
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  
  COOKIE_SECRET: z.string().min(32),
  COOKIE_HTTP_ONLY: z.coerce.boolean().default(true),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  COOKIE_MAX_AGE: z.coerce.number().default(7 * 24 * 60 * 60 * 1000), // 7 days
})

export type EnvConfig = z.infer<typeof envSchema>

export const config = envSchema.parse(process.env)

export default config