// backend/src/models/Workflow.ts
import { Schema, model, Document, Types } from 'mongoose'

export interface IWorkflowStage {
  _id: Types.ObjectId
  name: string
  description?: string
  order: number
  color: string
  isInitial: boolean
  isFinal: boolean
}

export interface IWorkflow extends Document {
  name: string
  description?: string
  stages: IWorkflowStage[]
  isDefault: boolean
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const workflowStageSchema = new Schema<IWorkflowStage>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    color: {
      type: String,
      default: '#6B7280',
      validate: {
        validator: (v: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v),
        message: 'Invalid hex color code',
      },
    },
    isInitial: {
      type: Boolean,
      default: false,
    },
    isFinal: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
    timestamps: false,
  }
)

const workflowSchema = new Schema<IWorkflow>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    stages: [workflowStageSchema],
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Auto-set first stage as initial, last as final
workflowSchema.pre('save', function () {
  if (this.stages.length > 0) {
    // Order stages by order field
    this.stages.sort((a, b) => a.order - b.order)
    
    // Set initial and final flags
    this.stages.forEach((stage, index) => {
      stage.isInitial = index === 0
      stage.isFinal = index === this.stages.length - 1
    })
  }
})

// Ensure unique order values within workflow
workflowSchema.pre('save', function () {
  if (this.isModified('stages')) {
    const orderSet = new Set<number>()
    
    for (const stage of this.stages) {
      if (orderSet.has(stage.order)) {
        throw new Error(`Duplicate order value: ${stage.order}`)
      }
      orderSet.add(stage.order)
    }
  }
})

// Indexes
workflowSchema.index({ createdBy: 1 })
workflowSchema.index({ isDefault: 1 })
workflowSchema.index({ 'stages._id': 1 })

export const Workflow = model<IWorkflow>('Workflow', workflowSchema)