// backend/src/services/task.service.ts
import { Types } from 'mongoose'
import { Task } from '../models/Task'
import { Workflow } from '../models/Workflow'
import { User } from '../models/User'
import { WorkflowService } from './workflow.service'
import type { IActivityLog } from '../models/Task'

export class TaskService {
  /**
   * Validate if a stage belongs to a workflow
   */
  static async validateStageInWorkflow(
    workflowId: Types.ObjectId | string,
    stageId: string
  ): Promise<boolean> {
    const workflow = await Workflow.findById(workflowId)
    if (!workflow) return false

    return workflow.stages.some((stage) => stage._id.toString() === stageId)
  }

  /**
   * Get initial stage for a workflow
   */
  static async getInitialStage(workflowId: Types.ObjectId | string) {
    return await WorkflowService.getInitialStage(workflowId)
  }

  /**
   * Validate stage transition
   */
  static async validateStageTransition(
    workflowId: Types.ObjectId | string,
    fromStageId: string,
    toStageId: string
  ) {
    return await WorkflowService.validateTransition(workflowId, fromStageId, toStageId)
  }

  /**
   * Add activity log entry
   */
  static createActivityLog(
    action: IActivityLog['action'],
    performedBy: Types.ObjectId | string,
    details?: string,
    previousValue?: string,
    newValue?: string
  ): IActivityLog {
    return {
      _id: new Types.ObjectId(),
      action,
      performedBy: new Types.ObjectId(performedBy),
      timestamp: new Date(),
      details,
      previousValue,
      newValue,
    }
  }

  /**
   * Check if user can access task
   */
  static async canUserAccessTask(
    taskId: Types.ObjectId | string,
    userId: Types.ObjectId | string,
    userRole: string
  ): Promise<boolean> {
    // Admins and managers can access all tasks
    if (userRole === 'admin' || userRole === 'manager') {
      return true
    }

    // Members can only access tasks assigned to them
    const task = await Task.findById(taskId)
    if (!task) return false

    return task.assignedTo.some((id) => id.toString() === userId.toString())
  }

  /**
   * Check if user can modify task
   */
  static async canUserModifyTask(
    taskId: Types.ObjectId | string,
    userId: Types.ObjectId | string,
    userRole: string
  ): Promise<boolean> {
    // Only Admins and Managers can modify tasks
    // Members can only view their assigned tasks
    if (userRole === 'admin' || userRole === 'manager') return true

    return false
  }

  /**
   * Validate user IDs exist
   */
  static async validateUserIds(userIds: string[]): Promise<boolean> {
    const users = await User.find({ _id: { $in: userIds }, isActive: true })
    return users.length === userIds.length
  }

  /**
   * Check if task is in final stage
   */
  static async isTaskInFinalStage(taskId: Types.ObjectId | string): Promise<boolean> {
    const task = await Task.findById(taskId).populate('workflow')
    if (!task || !task.workflow) return false

    const workflow = task.workflow as any
    const currentStage = workflow.stages.find(
      (stage: any) => stage._id.toString() === task.currentStage.toString()
    )

    return currentStage?.isFinal || false
  }

  /**
   * Auto-complete task when moved to final stage
   */
  static async autoCompleteTask(
    taskId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<void> {
    const task = await Task.findById(taskId)
    if (!task || task.completedAt) return

    const isFinal = await this.isTaskInFinalStage(taskId)
    if (isFinal) {
      task.completedAt = new Date()
      task.activityLog.push(
        this.createActivityLog(
          'completed',
          userId,
          'Task automatically completed when moved to final stage'
        )
      )
      await task.save()
    }
  }

  /**
   * Get task statistics
   */
  static async getTaskStats(filters: {
    workflowId?: string
    assignedTo?: string
    createdBy?: string
  }) {
    const matchStage: any = {}

    if (filters.workflowId) {
      matchStage.workflow = new Types.ObjectId(filters.workflowId)
    }
    if (filters.assignedTo) {
      matchStage.assignedTo = new Types.ObjectId(filters.assignedTo)
    }
    if (filters.createdBy) {
      matchStage.createdBy = new Types.ObjectId(filters.createdBy)
    }

    const stats = await Task.aggregate([
      { $match: matchStage },
      {
        $facet: {
          byPriority: [
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 },
              },
            },
          ],
          byStage: [
            {
              $group: {
                _id: '$currentStage',
                count: { $sum: 1 },
              },
            },
          ],
          overdue: [
            {
              $match: {
                dueDate: { $lt: new Date() },
                completedAt: null,
              },
            },
            {
              $count: 'count',
            },
          ],
          completed: [
            {
              $match: {
                completedAt: { $ne: null },
              },
            },
            {
              $count: 'count',
            },
          ],
          total: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ])

    return stats[0]
  }
}
