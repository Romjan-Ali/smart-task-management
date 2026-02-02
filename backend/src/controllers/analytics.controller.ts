// backend/src/controllers/analytics.controller.ts
import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../types'
import { AnalyticsService } from '../services/analytics.service'

export const analyticsController = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { workflowId, userId, startDate, endDate } = req.query

      const filters: any = {}
      if (workflowId) filters.workflowId = workflowId as string
      if (userId) filters.userId = userId as string
      if (startDate) filters.startDate = new Date(startDate as string)
      if (endDate) filters.endDate = new Date(endDate as string)

      // Members can only see their own stats
      if (req.user.role === 'member') {
        filters.userId = req.user.userId
      }

      const stats = await AnalyticsService.getDashboardStats(filters)

      res.json({
        success: true,
        data: stats,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get workflow efficiency metrics
   */
  async getWorkflowEfficiency(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { workflowId } = req.query

      const efficiency = await AnalyticsService.getWorkflowEfficiency(
        workflowId as string | undefined
      )

      res.json({
        success: true,
        data: efficiency,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get user performance metrics
   */
  async getUserPerformance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { userId } = req.query

      // Members can only see their own performance
      let targetUserId = userId as string | undefined
      if (req.user.role === 'member') {
        targetUserId = req.user.userId
      }

      const performance = await AnalyticsService.getUserPerformance(targetUserId)

      res.json({
        success: true,
        data: performance,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get tasks per stage for a workflow
   */
  async getTasksPerStage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { workflowId } = req.params

      if (!workflowId || Array.isArray(workflowId)) {
        return res.status(400).json({
          success: false,
          error: 'Workflow ID is required',
        })
      }

      const data = await AnalyticsService.getTasksPerStage(workflowId)

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found',
        })
      }

      res.json({
        success: true,
        data,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get completion time trends
   */
  async getCompletionTimeTrends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { days = '30' } = req.query
      const daysNum = parseInt(days as string, 10)

      const trends = await AnalyticsService.getCompletionTimeTrends(daysNum)

      res.json({
        success: true,
        data: trends,
      })
    } catch (error) {
      next(error)
    }
  },
}
