// backend/src/controllers/notification.controller.ts
import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../types'
import { NotificationService } from '../services/notification.service'

export const notificationController = {
  /**
   * Get user's notifications
   */
  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { page = '1', limit = '20', unreadOnly } = req.query

      const pageNum = parseInt(page as string, 10)
      const limitNum = parseInt(limit as string, 10)

      const result = await NotificationService.getUserNotifications(req.user.userId, {
        page: pageNum,
        limit: limitNum,
        unreadOnly: unreadOnly === 'true',
      })

      res.json({
        success: true,
        data: result.notifications,
        pagination: result.pagination,
        unreadCount: result.unreadCount,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
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
          error: 'Notification ID is required',
        })
      }

      const notification = await NotificationService.markNotificationAsRead(id, req.user.userId)

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found',
        })
      }

      res.json({
        success: true,
        data: notification,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const result = await NotificationService.markAllAsRead(req.user.userId)

      res.json({
        success: true,
        message: `Marked ${result.modifiedCount} notifications as read`,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Delete notification
   */
  async deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
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
          error: 'Notification ID is required',
        })
      }

      const notification = await NotificationService.deleteNotification(id, req.user.userId)

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found',
        })
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get unread count
   */
  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const count = await NotificationService.getUnreadCount(req.user.userId)

      res.json({
        success: true,
        data: { unreadCount: count },
      })
    } catch (error) {
      next(error)
    }
  },
}
