// backend/src/services/notification.service.ts
import { Notification } from '../models/Notification'
import type { Types } from 'mongoose'

export class NotificationService {
  /**
   * Get notifications for a user with pagination
   */
  static async getUserNotifications(
    userId: string,
    options: {
      page: number
      limit: number
      unreadOnly?: boolean
    }
  ) {
    const { page, limit, unreadOnly } = options
    const skip = (page - 1) * limit

    const filter: any = { recipient: userId }
    if (unreadOnly) {
      filter.isRead = false
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate('task', 'title')
        .populate('workflow', 'name')
        .populate('triggeredBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ])

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    }
  }

  /**
   * Mark a notification as read
   */
  static async markNotificationAsRead(notificationId: string, userId: string) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    })

    if (!notification) {
      return null
    }

    if (!notification.isRead) {
      notification.isRead = true
      notification.readAt = new Date()
      await notification.save()
    }

    return notification
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    )

    return {
      modifiedCount: result.modifiedCount,
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string, userId: string) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    })

    return notification
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string) {
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    })

    return count
  }

  /**
   * Create a notification
   */
  static async createNotification(data: {
    recipient: string | Types.ObjectId
    type: string
    title: string
    message: string
    task?: string | Types.ObjectId
    workflow?: string | Types.ObjectId
    triggeredBy?: string | Types.ObjectId
  }) {
    const notification = await Notification.create(data)
    return notification
  }

  /**
   * Create notifications for multiple recipients
   */
  static async createBulkNotifications(
    recipients: (string | Types.ObjectId)[],
    data: {
      type: string
      title: string
      message: string
      task?: string | Types.ObjectId
      workflow?: string | Types.ObjectId
      triggeredBy?: string | Types.ObjectId
    }
  ) {
    const notifications = recipients.map((recipient) => ({
      ...data,
      recipient,
    }))

    const result = await Notification.insertMany(notifications)
    return result
  }

  /**
   * Delete old read notifications (cleanup)
   */
  static async deleteOldReadNotifications(daysOld: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await Notification.deleteMany({
      isRead: true,
      readAt: { $lt: cutoffDate },
    })

    return {
      deletedCount: result.deletedCount,
    }
  }
}
