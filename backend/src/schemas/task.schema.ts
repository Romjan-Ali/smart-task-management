// backend/src/schemas/task.schema.ts
import { z } from 'zod'

// Create task schema
export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(5000).optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    workflowId: z.string().min(1, 'Workflow ID is required'),
    assignedTo: z.array(z.string()).optional(),
    dueDate: z.string().datetime().optional(),
  }),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body']

// Update task schema
export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    assignedTo: z.array(z.string()).optional(),
    dueDate: z.string().datetime().optional().nullable(),
  }),
})

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

// Change stage schema
export const changeStageSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
  }),
  body: z.object({
    stageId: z.string().min(1, 'Stage ID is required'),
  }),
})

export type ChangeStageInput = z.infer<typeof changeStageSchema>

// Assign users schema
export const assignUsersSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
  }),
  body: z.object({
    userIds: z.array(z.string().min(1)).min(1, 'At least one user ID is required'),
  }),
})

export type AssignUsersInput = z.infer<typeof assignUsersSchema>

// Unassign user schema
export const unassignUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
    userId: z.string().min(1, 'User ID is required'),
  }),
})

export type UnassignUserInput = z.infer<typeof unassignUserSchema>

// Get task by ID schema
export const getTaskByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
  }),
})

// Delete task schema
export const deleteTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
  }),
})

// Get tasks query schema
export const getTasksQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    workflowId: z.string().optional(),
    stageId: z.string().optional(),
    assignedTo: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    overdue: z.enum(['true', 'false']).optional(),
    search: z.string().optional(),
  }),
})

export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>['query']
