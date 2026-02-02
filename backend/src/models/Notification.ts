// backend/src/models/Notification.ts
import { Schema, model, Document, Types } from 'mongoose'

export type NotificationType = 
  | 'task_assigned'
  | 'task_completed'
  | 'task_stage_changed'
  | 'task_due_soon'
  | 'task_overdue'
  | 'mention'
  | 'comment'

export interface INotification extends Document {
  recipient: Types.ObjectId
  type: NotificationType
  title: string
  message: string
  task?: Types.ObjectId
  workflow?: Types.ObjectId
  triggeredBy?: Types.ObjectId
  isRead: boolean
  readAt?: Date
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'task_assigned',
        'task_completed',
        'task_stage_changed',
        'task_due_soon',
        'task_overdue',
        'mention',
        'comment',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
    workflow: {
      type: Schema.Types.ObjectId,
      ref: 'Workflow',
    },
    triggeredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Indexes for better query performance
notificationSchema.index({ recipient: 1, isRead: 1 })
notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ task: 1 })
notificationSchema.index({ createdAt: -1 })

// Auto-delete old read notifications (optional - can be implemented as a cron job)
// Keep notifications for 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })

export const Notification = model<INotification>('Notification', notificationSchema)
