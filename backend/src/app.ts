// backend/src/app.ts
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { connectDB } from './config/database'
import config from './config/env'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'
import { authRoutes } from './routes/auth.routes'
import { userRoutes } from './routes/user.routes'
import { workflowRoutes } from './routes/workflow.routes'
import { taskRoutes } from './routes/task.routes'
import { notificationRoutes } from './routes/notification.routes'
import { analyticsRoutes } from './routes/analytics.routes'

const app = express()

// Database connection
connectDB()

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: config.NODE_ENV === 'production' 
      ? config.FRONTEND_URL
      : 'http://localhost:3001',
    credentials: true,
  })
)
app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(config.COOKIE_SECRET))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    service: 'TaskFlow API',
    environment: config.NODE_ENV,
    uptime: process.uptime(),
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/workflows', workflowRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/analytics', analyticsRoutes)

// 404 Handler
app.use(notFoundHandler)

// Error Handler
app.use(errorHandler)

// Start server
const PORT = config.PORT

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📁 Environment: ${config.NODE_ENV}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  console.log(`📊 Workflow API: http://localhost:${PORT}/api/workflows`)
  console.log(`📝 Task API: http://localhost:${PORT}/api/tasks`)
  console.log(`🔔 Notification API: http://localhost:${PORT}/api/notifications`)
  console.log(`📈 Analytics API: http://localhost:${PORT}/api/analytics`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...')
  process.exit(0)
})

export default app