import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'
import config from '../config/env'

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err }
  error.message = err.message

  // Log error in development
  if (config.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    })
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(', ')
    error = new AppError(400, message)
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0]
    const message = `${field} already exists`
    error = new AppError(400, message)
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError(401, 'Invalid token')
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError(401, 'Token expired')
  }

  const statusCode = (error as AppError).statusCode || 500
  const message = error.message || 'Internal Server Error'

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new AppError(404, `Route ${req.originalUrl} not found`)
  next(error)
}