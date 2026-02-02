// backend/src/schemas/workflow.schema.ts
import { z } from 'zod'

// Stage schema
const stageSchema = z.object({
  name: z.string().min(1, 'Stage name is required').max(100),
  description: z.string().max(500).optional(),
  order: z.number().int().min(0, 'Order must be non-negative'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
})

// Create workflow schema
export const createWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Workflow name is required').max(100),
    description: z.string().max(500).optional(),
    stages: z.array(stageSchema).min(1, 'At least one stage is required'),
    isDefault: z.boolean().optional(),
  }),
})

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>['body']

// Update workflow schema
export const updateWorkflowSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Workflow ID is required'),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    stages: z.array(stageSchema).optional(),
    isDefault: z.boolean().optional(),
  }),
})

export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>

// Get workflow by ID schema
export const getWorkflowByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Workflow ID is required'),
  }),
})

// Delete workflow schema
export const deleteWorkflowSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Workflow ID is required'),
  }),
})

// Validate stage transition schema
export const validateTransitionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Workflow ID is required'),
  }),
  body: z.object({
    fromStageId: z.string().min(1, 'From stage ID is required'),
    toStageId: z.string().min(1, 'To stage ID is required'),
  }),
})

export type ValidateTransitionInput = z.infer<typeof validateTransitionSchema>