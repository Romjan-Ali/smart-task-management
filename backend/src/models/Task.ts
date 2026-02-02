// backend/src/models/Task.ts
import { Schema, model, Document, Types } from 'mongoose'

export type TaskPriority = 'low' | 'medium' | 'high'

export interface IActivityLog {
  _id: Types.ObjectId
  action: string
  performedBy: Types.ObjectId
  timestamp: Date
  details?: string
  previousValue?: string
  newValue?: string
}

export interface ITask extends Document {
  title: string
  description?: string
  priority: TaskPriority
  workflow: Types.ObjectId
  currentStage: Types.ObjectId
  assignedTo: Types.ObjectId[]
  createdBy: Types.ObjectId
  dueDate?: Date
  completedAt?: Date
  activityLog: IActivityLog[]
  createdAt: Date
  updatedAt: Date
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'created',
        'updated',
        'stage_changed',
        'assigned',
        'unassigned',
        'priority_changed',
        'due_date_changed',
        'completed',
        'reopened',
      ],
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: String,
      maxlength: 500,
    },
    previousValue: {
      type: String,
    },
    newValue: {
      type: String,
    },
  },
  {
    _id: true,
    timestamps: false,
  }
)

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    workflow: {
      type: Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
    },
    currentStage: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    assignedTo: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    activityLog: [activityLogSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Indexes for better query performance
taskSchema.index({ workflow: 1, currentStage: 1 })
taskSchema.index({ assignedTo: 1 })
taskSchema.index({ createdBy: 1 })
taskSchema.index({ priority: 1 })
taskSchema.index({ dueDate: 1 })
taskSchema.index({ completedAt: 1 })
taskSchema.index({ createdAt: -1 })

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.completedAt) return false
  return new Date() > this.dueDate
})

// Ensure virtuals are included in JSON
taskSchema.set('toJSON', { virtuals: true })
taskSchema.set('toObject', { virtuals: true })

export const Task = model<ITask>('Task', taskSchema)
