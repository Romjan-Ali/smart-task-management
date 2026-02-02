// backend/src/routes/workflow.routes.ts
import { Router } from 'express'
import { workflowController } from '../controllers/workflow.controller'
import { validate } from '../middleware/validate.middleware'
import { authenticate, authorize } from '../middleware/auth.middleware'
import {
  createWorkflowSchema,
  updateWorkflowSchema,
  getWorkflowByIdSchema,
  deleteWorkflowSchema,
  validateTransitionSchema,
} from '../schemas/workflow.schema'
import { asyncHandler } from '../utils/handler'

const router = Router()

// All workflow routes require authentication
router.use(authenticate)

// Get all workflows (accessible to all authenticated users)
router.get('/', asyncHandler(workflowController.getAllWorkflows))

// Get default workflows
router.get('/default', asyncHandler(workflowController.getDefaultWorkflows))

// Get workflow by ID
router.get(
  '/:id',
  validate(getWorkflowByIdSchema),
  asyncHandler(workflowController.getWorkflowById)
)

// Get workflow stages
router.get(
  '/:id/stages',
  validate(getWorkflowByIdSchema),
  asyncHandler(workflowController.getWorkflowStages)
)

// Validate stage transition
router.post(
  '/:id/validate-transition',
  validate(validateTransitionSchema),
  asyncHandler(workflowController.validateStageTransition)
)

// Create workflow (admin and manager only)
router.post(
  '/',
  authorize('admin', 'manager'),
  validate(createWorkflowSchema),
  asyncHandler(workflowController.createWorkflow)
)

// Update workflow (admin and manager who created it)
router.put(
  '/:id',
  authorize('admin', 'manager'),
  validate(updateWorkflowSchema),
  asyncHandler(workflowController.updateWorkflow)
)

// Delete workflow (admin and manager who created it)
router.delete(
  '/:id',
  authorize('admin', 'manager'),
  validate(deleteWorkflowSchema),
  asyncHandler(workflowController.deleteWorkflow)
)

export const workflowRoutes = router