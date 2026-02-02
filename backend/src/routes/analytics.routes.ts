// backend/src/routes/analytics.routes.ts
import { Router } from 'express'
import { analyticsController } from '../controllers/analytics.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { asyncHandler } from '../utils/handler'

const router = Router()

// All analytics routes require authentication
router.use(authenticate)

// Get dashboard statistics
router.get('/dashboard', asyncHandler(analyticsController.getDashboardStats))

// Get workflow efficiency metrics
router.get('/workflow-efficiency', asyncHandler(analyticsController.getWorkflowEfficiency))

// Get user performance metrics
router.get('/user-performance', asyncHandler(analyticsController.getUserPerformance))

// Get tasks per stage for a workflow
router.get('/workflow/:workflowId/stages', asyncHandler(analyticsController.getTasksPerStage))

// Get completion time trends
router.get('/completion-trends', asyncHandler(analyticsController.getCompletionTimeTrends))

export const analyticsRoutes = router
