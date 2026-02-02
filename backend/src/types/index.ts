// backend/src/types/index.ts
import type { Request } from 'express'

export type UserRole = 'admin' | 'manager' | 'member'

export interface TokenPayload {
  userId: string
  role: UserRole
}

export interface AuthRequest extends Request {
  user?: TokenPayload
}

export interface ServiceResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface UpdateProfileRequest extends Request<any, any, { name: string }> {
  user?: TokenPayload
}