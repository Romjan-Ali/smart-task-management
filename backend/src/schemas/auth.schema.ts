import { z } from 'zod'

// Reusable schemas
const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password must be less than 100 characters')

const emailSchema = z
  .email('Invalid email address')
  .max(100, 'Email must be less than 100 characters')

const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')

// Register schema
export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
    role: z.enum(['admin', 'manager', 'member']).optional(),
  }),
})

export type RegisterInput = z.infer<typeof registerSchema>['body']

// Login schema
export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
})

export type LoginInput = z.infer<typeof loginSchema>['body']

// Refresh token schema
export const refreshTokenSchema = z.object({
  cookies: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
})

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['cookies']

// Logout schema
export const logoutSchema = z.object({
  cookies: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
})

export type LogoutInput = z.infer<typeof logoutSchema>['cookies']