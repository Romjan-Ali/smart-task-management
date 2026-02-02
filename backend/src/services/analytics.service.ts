// backend/src/services/analytics.service.ts
import { Types } from 'mongoose'
import { Task } from '../models/Task'
import { Workflow } from '../models/Workflow'
import { User } from '../models/User'

export interface DashboardStats {
  tasksByStage: Array<{ stageName: string; count: number; stageId: string }>
  tasksByPriority: Array<{ priority: string; count: number }>
  overdueCount: number
  completedCount: number
  totalTasks: number
  avgCompletionTime: number | null
  tasksDueToday: number
  tasksDueThisWeek: number
}

export interface WorkflowEfficiency {
  workflowId: string
  workflowName: string
  totalTasks: number
  completedTasks: number
  avgCompletionTime: number | null
  stageDistribution: Array<{ stageName: string; count: number }>
  completionRate: number
}

export interface UserPerformance {
  userId: string
  userName: string
  tasksAssigned: number
  tasksCompleted: number
  avgCompletionTime: number | null
  overdueCount: number
  completionRate: number
  tasksByPriority: Array<{ priority: string; count: number }>
}

export class AnalyticsService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(filters?: {
    workflowId?: string
    userId?: string
    startDate?: Date
    endDate?: Date
  }): Promise<DashboardStats> {
    const matchStage: any = {}

    if (filters?.workflowId) {
      matchStage.workflow = new Types.ObjectId(filters.workflowId)
    }

    if (filters?.userId) {
      matchStage.assignedTo = new Types.ObjectId(filters.userId)
    }

    if (filters?.startDate || filters?.endDate) {
      matchStage.createdAt = {}
      if (filters.startDate) matchStage.createdAt.$gte = filters.startDate
      if (filters.endDate) matchStage.createdAt.$lte = filters.endDate
    }

    // Get tasks by stage
    const tasksByStage = await Task.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'workflows',
          localField: 'workflow',
          foreignField: '_id',
          as: 'workflowData',
        },
      },
      { $unwind: '$workflowData' },
      { $unwind: '$workflowData.stages' },
      {
        $match: {
          $expr: { $eq: ['$currentStage', '$workflowData.stages._id'] },
        },
      },
      {
        $group: {
          _id: {
            stageId: '$currentStage',
            stageName: '$workflowData.stages.name',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          stageId: { $toString: '$_id.stageId' },
          stageName: '$_id.stageName',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ])

    // Get tasks by priority
    const tasksByPriority = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          priority: '$_id',
          count: 1,
        },
      },
    ])

    // Get overdue count
    const overdueResult = await Task.aggregate([
      {
        $match: {
          ...matchStage,
          dueDate: { $lt: new Date() },
          completedAt: null,
        },
      },
      { $count: 'count' },
    ])

    // Get completed count
    const completedResult = await Task.aggregate([
      {
        $match: {
          ...matchStage,
          completedAt: { $ne: null },
        },
      },
      { $count: 'count' },
    ])

    // Get total tasks
    const totalResult = await Task.aggregate([
      { $match: matchStage },
      { $count: 'count' },
    ])

    // Calculate average completion time
    const avgCompletionResult = await Task.aggregate([
      {
        $match: {
          ...matchStage,
          completedAt: { $ne: null },
        },
      },
      {
        $project: {
          completionTime: {
            $subtract: ['$completedAt', '$createdAt'],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$completionTime' },
        },
      },
    ])

    // Tasks due today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const tasksDueTodayResult = await Task.aggregate([
      {
        $match: {
          ...matchStage,
          dueDate: { $gte: today, $lt: tomorrow },
          completedAt: null,
        },
      },
      { $count: 'count' },
    ])

    // Tasks due this week
    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const tasksDueThisWeekResult = await Task.aggregate([
      {
        $match: {
          ...matchStage,
          dueDate: { $gte: today, $lt: weekEnd },
          completedAt: null,
        },
      },
      { $count: 'count' },
    ])

    return {
      tasksByStage,
      tasksByPriority,
      overdueCount: overdueResult[0]?.count || 0,
      completedCount: completedResult[0]?.count || 0,
      totalTasks: totalResult[0]?.count || 0,
      avgCompletionTime: avgCompletionResult[0]?.avgTime || null,
      tasksDueToday: tasksDueTodayResult[0]?.count || 0,
      tasksDueThisWeek: tasksDueThisWeekResult[0]?.count || 0,
    }
  }

  /**
   * Get workflow efficiency metrics
   */
  static async getWorkflowEfficiency(workflowId?: string): Promise<WorkflowEfficiency[]> {
    const matchStage: any = {}
    if (workflowId) {
      matchStage._id = new Types.ObjectId(workflowId)
    }

    const workflows = await Workflow.find(matchStage)
    const efficiencyData: WorkflowEfficiency[] = []

    for (const workflow of workflows) {
      // Get tasks for this workflow
      const tasks = await Task.find({ workflow: workflow._id })
      const completedTasks = tasks.filter((t) => t.completedAt)

      // Calculate average completion time
      let avgCompletionTime: number | null = null
      if (completedTasks.length > 0) {
        const totalTime = completedTasks.reduce((sum, task) => {
          const time = task.completedAt!.getTime() - task.createdAt.getTime()
          return sum + time
        }, 0)
        avgCompletionTime = totalTime / completedTasks.length
      }

      // Get stage distribution
      const stageDistribution = await Task.aggregate([
        { $match: { workflow: workflow._id } },
        {
          $group: {
            _id: '$currentStage',
            count: { $sum: 1 },
          },
        },
      ])

      const stageDistributionWithNames = stageDistribution.map((item) => {
        const stage = workflow.stages.find((s) => s._id.toString() === item._id.toString())
        return {
          stageName: stage?.name || 'Unknown',
          count: item.count,
        }
      })

      efficiencyData.push({
        workflowId: workflow._id.toString(),
        workflowName: workflow.name,
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        avgCompletionTime,
        stageDistribution: stageDistributionWithNames,
        completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
      })
    }

    return efficiencyData
  }

  /**
   * Get user performance metrics
   */
  static async getUserPerformance(userId?: string): Promise<UserPerformance[]> {
    const matchStage: any = {}
    if (userId) {
      matchStage._id = new Types.ObjectId(userId)
    }

    const users = await User.find(matchStage)
    const performanceData: UserPerformance[] = []

    for (const user of users) {
      // Get tasks assigned to user
      const tasks = await Task.find({ assignedTo: user._id })
      const completedTasks = tasks.filter((t) => t.completedAt)
      const overdueTasks = tasks.filter(
        (t) => t.dueDate && t.dueDate < new Date() && !t.completedAt
      )

      // Calculate average completion time
      let avgCompletionTime: number | null = null
      if (completedTasks.length > 0) {
        const totalTime = completedTasks.reduce((sum, task) => {
          const time = task.completedAt!.getTime() - task.createdAt.getTime()
          return sum + time
        }, 0)
        avgCompletionTime = totalTime / completedTasks.length
      }

      // Get tasks by priority
      const tasksByPriority = await Task.aggregate([
        { $match: { assignedTo: user._id } },
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            priority: '$_id',
            count: 1,
          },
        },
      ])

      performanceData.push({
        userId: user._id.toString(),
        userName: user.name,
        tasksAssigned: tasks.length,
        tasksCompleted: completedTasks.length,
        avgCompletionTime,
        overdueCount: overdueTasks.length,
        completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
        tasksByPriority,
      })
    }

    return performanceData
  }

  /**
   * Get tasks per stage for a specific workflow
   */
  static async getTasksPerStage(workflowId: string): Promise<any> {
    const workflow = await Workflow.findById(workflowId)
    if (!workflow) return null

    const tasksPerStage = await Task.aggregate([
      { $match: { workflow: new Types.ObjectId(workflowId) } },
      {
        $group: {
          _id: '$currentStage',
          count: { $sum: 1 },
          tasks: { $push: '$$ROOT' },
        },
      },
    ])

    return {
      workflowId: workflow._id,
      workflowName: workflow.name,
      stages: workflow.stages.map((stage) => {
        const stageData = tasksPerStage.find(
          (item) => item._id.toString() === stage._id.toString()
        )
        return {
          stageId: stage._id,
          stageName: stage.name,
          order: stage.order,
          taskCount: stageData?.count || 0,
        }
      }),
    }
  }

  /**
   * Get completion time trends
   */
  static async getCompletionTimeTrends(days: number = 30): Promise<any> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const trends = await Task.aggregate([
      {
        $match: {
          completedAt: { $ne: null, $gte: startDate },
        },
      },
      {
        $project: {
          completionTime: {
            $subtract: ['$completedAt', '$createdAt'],
          },
          completedDate: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
          },
        },
      },
      {
        $group: {
          _id: '$completedDate',
          avgCompletionTime: { $avg: '$completionTime' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          avgCompletionTime: 1,
          count: 1,
        },
      },
    ])

    return trends
  }
}
