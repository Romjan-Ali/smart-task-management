// backend/src/routes/user.routes.ts
import { Router } from 'express'
import { userController } from '../controllers/user.controller'
import { authenticate } from '../middleware/auth.middleware'
import { asyncHandler } from '../utils/handler'

const router = Router()

// All user routes require authentication
router.use(authenticate)

// Get all users
router.get('/', asyncHandler(userController.getAllUsers))

// Get user by ID
router.get('/:id', asyncHandler(userController.getUserById))

export const userRoutes = router
