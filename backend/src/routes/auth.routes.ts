// backend/src/routes/auth.routes.ts
import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { validate } from '../middleware/validate.middleware'
import { authenticate } from '../middleware/auth.middleware'
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from '../schemas/auth.schema'

const router = Router()

router.post('/register', validate(registerSchema), authController.register)
router.post('/login', validate(loginSchema), authController.login)
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken)
router.post('/logout', validate(logoutSchema), authController.logout)

// Protected routes
router.get('/profile', authenticate, authController.getProfile)
router.patch('/profile', authenticate, authController.updateProfile)

export const authRoutes = router