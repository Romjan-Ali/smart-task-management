// backend/src/controllers/auth.controller.ts
import type { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'
import { CookieUtil } from '../utils/cookie.util'
import type { RegisterInput, LoginInput } from '../schemas/auth.schema'
import type { AuthRequest } from '../types'

export const authController = {
  async register(
    req: Request<object, object, RegisterInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await AuthService.register(req.body)

      // Set tokens in cookies
      CookieUtil.setCookie(res, 'accessToken', result.accessToken)
      CookieUtil.setCookie(res, 'refreshToken', result.refreshToken)

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
        },
      })
    } catch (error) {
      next(error)
    }
  },

  async login(
    req: Request<object, object, LoginInput>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await AuthService.login(req.body)

      // Set tokens in cookies
      CookieUtil.setCookie(res, 'accessToken', result.accessToken)
      CookieUtil.setCookie(res, 'refreshToken', result.refreshToken)

      res.json({
        success: true,
        data: {
          user: result.user,
        },
      })
    } catch (error) {
      next(error)
    }
  },

  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const refreshToken = req.cookies.refreshToken
      const result = await AuthService.refreshToken(refreshToken)

      // Set new tokens in cookies
      CookieUtil.setCookie(res, 'accessToken', result.accessToken)
      CookieUtil.setCookie(res, 'refreshToken', result.refreshToken)

      res.json({
        success: true,
        message: 'Tokens refreshed successfully',
      })
    } catch (error: any) {
      // Clear invalid tokens
      CookieUtil.clearCookie(res, 'accessToken')
      CookieUtil.clearCookie(res, 'refreshToken')

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Refresh token expired',
        })
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token',
        })
      }

      next(error)
    }
  },

  async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const refreshToken = req.cookies.refreshToken
      await AuthService.logout(refreshToken)

      // Clear cookies
      CookieUtil.clearCookie(res, 'accessToken')
      CookieUtil.clearCookie(res, 'refreshToken')

      res.json({
        success: true,
        message: 'Logged out successfully',
      })
    } catch (error) {
      next(error)
    }
  },

  async getProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated')
      }

      const user = await AuthService.getProfile(req.user.userId)

      res.json({
        success: true,
        data: user,
      })
    } catch (error) {
      next(error)
    }
  },

  async updateProfile(
    req: AuthRequest & { body: { name?: string } },
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated')
      }

      const user = await AuthService.updateProfile(req.user.userId, req.body)

      res.json({
        success: true,
        data: user,
      })
    } catch (error) {
      next(error)
    }
  },
}
