// backend/src/routes/task.routes.ts
import { Router } from 'express'
import { taskController } from '../controllers/task.controller'
import { validate } from '../middleware/validate.middleware'
import { authenticate, authorize } from '../middleware/auth.middleware'
import {
  createTaskSchema,
  updateTaskSchema,
  changeStageSchema,
  assignUsersSchema,
  unassignUserSchema,
  getTaskByIdSchema,
  deleteTaskSchema,
  getTasksQuerySchema,
} from '../schemas/task.schema'
import { asyncHandler } from '../utils/handler'

const router = Router()

// All task routes require authentication
router.use(authenticate)

// Get all tasks (with filters and pagination)
router.get('/', validate(getTasksQuerySchema), asyncHandler(taskController.getAllTasks))

// Get task statistics
router.get('/stats', asyncHandler(taskController.getTaskStats))

// Get task by ID
router.get('/:id', validate(getTaskByIdSchema), asyncHandler(taskController.getTaskById))

// Create task (admin and manager only)
router.post(
  '/',
  authorize('admin', 'manager'),
  validate(createTaskSchema),
  asyncHandler(taskController.createTask)
)

// Update task
router.put('/:id', validate(updateTaskSchema), asyncHandler(taskController.updateTask))

// Change task stage
router.patch('/:id/stage', validate(changeStageSchema), asyncHandler(taskController.changeStage))

// Assign users to task
router.post('/:id/assign', validate(assignUsersSchema), asyncHandler(taskController.assignUsers))

// Unassign user from task
router.delete(
  '/:id/assign/:userId',
  validate(unassignUserSchema),
  asyncHandler(taskController.unassignUser)
)

// Delete task (admin or creator only)
router.delete('/:id', validate(deleteTaskSchema), asyncHandler(taskController.deleteTask))

export const taskRoutes = router
