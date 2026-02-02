// backend/src/routes/notification.routes.ts
import { Router } from 'express'
import { notificationController } from '../controllers/notification.controller'
import { authenticate } from '../middleware/auth.middleware'
import { asyncHandler } from '../utils/handler'

const router = Router()

// All notification routes require authentication
router.use(authenticate)

// Get user's notifications
router.get('/', asyncHandler(notificationController.getNotifications))

// Get unread count
router.get('/unread-count', asyncHandler(notificationController.getUnreadCount))

// Mark notification as read
router.patch('/:id/read', asyncHandler(notificationController.markAsRead))

// Mark all as read
router.patch('/read-all', asyncHandler(notificationController.markAllAsRead))

// Delete notification
router.delete('/:id', asyncHandler(notificationController.deleteNotification))

export const notificationRoutes = router
