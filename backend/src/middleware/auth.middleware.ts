// backend/src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express'
import { TokenService } from '../services/token.service'
import { User } from '../models/User'
import type { AuthRequest, TokenPayload } from '../types'

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookies
    const token = req.cookies.accessToken
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      })
    }

    // Verify token
    const decoded = TokenService.verifyAccessToken(token)
    
    // Check if user exists and is active
    const user = await User.findById(decoded.userId).select('isActive role')
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive',
      })
    }

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role as TokenPayload['role'],
    }

    next()
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
      })
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
      })
    }

    next(error)
  }
}

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      })
    }

    next()
  }
}