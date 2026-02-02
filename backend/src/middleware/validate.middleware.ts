import type { Request, Response, NextFunction } from 'express'
import type { ZodType } from 'zod'
import { ZodError } from 'zod'

export const validate =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: formattedErrors,
        })
      }

      next(error)
    }
  }