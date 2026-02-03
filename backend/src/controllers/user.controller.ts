// backend/src/controllers/user.controller.ts
import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../types'
import { User } from '../models/User'

export const userController = {
  /**
   * Get all users (for assignment purposes)
   */
  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { search, role } = req.query

      // Build filter
      const filter: any = {}

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ]
      }

      if (role) {
        filter.role = role
      }

      const users = await User.find(filter)
        .select('_id name email role')
        .sort({ name: 1 })

      res.json({
        success: true,
        data: users,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { id } = req.params

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        })
      }

      const user = await User.findById(id).select('_id name email role createdAt updatedAt')

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        })
      }

      res.json({
        success: true,
        data: user,
      })
    } catch (error) {
      next(error)
    }
  },
}
