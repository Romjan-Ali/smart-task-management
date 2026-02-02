// backend/src/controllers/notification.controller.ts
import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../types'
import { Notification } from '../models/Notification'

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
      const skip = (pageNum - 1) * limitNum

      const filter: any = { recipient: req.user.userId }
      if (unreadOnly === 'true') {
        filter.isRead = false
      }

      const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(filter)
          .populate('task', 'title')
          .populate('workflow', 'name')
          .populate('triggeredBy', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Notification.countDocuments(filter),
        Notification.countDocuments({ recipient: req.user.userId, isRead: false }),
      ])

      res.json({
        success: true,
        data: notifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
        unreadCount,
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

      const notification = await Notification.findOne({
        _id: id,
        recipient: req.user.userId,
      })

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found',
        })
      }

      if (!notification.isRead) {
        notification.isRead = true
        notification.readAt = new Date()
        await notification.save()
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

      const result = await Notification.updateMany(
        { recipient: req.user.userId, isRead: false },
        { isRead: true, readAt: new Date() }
      )

      res.json({
        success: true,
        message: `Marked ${result.modifiedCount} notifications as read`,
        data: {
          modifiedCount: result.modifiedCount,
        },
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

      const notification = await Notification.findOneAndDelete({
        _id: id,
        recipient: req.user.userId,
      })

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

      const count = await Notification.countDocuments({
        recipient: req.user.userId,
        isRead: false,
      })

      res.json({
        success: true,
        data: { unreadCount: count },
      })
    } catch (error) {
      next(error)
    }
  },
}
