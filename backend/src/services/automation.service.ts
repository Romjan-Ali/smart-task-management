// backend/src/services/automation.service.ts
import { Types } from 'mongoose'
import { Task } from '../models/Task'
import { Workflow } from '../models/Workflow'
import { NotificationService } from './notification.service'

export class AutomationService {
  /**
   * Handle task completion automation
   * Triggered when task moves to final stage
   */
  static async handleTaskCompletion(
    taskId: Types.ObjectId | string,
    userId: Types.ObjectId | string
  ): Promise<void> {
    try {
      const task = await Task.findById(taskId).populate('workflow')
      if (!task) return

      const workflow = task.workflow as any
      const currentStage = workflow.stages.find(
        (stage: any) => stage._id.toString() === task.currentStage.toString()
      )

      // Check if task is in final stage
      if (currentStage?.isFinal && !task.completedAt) {
        // Set completion timestamp
        task.completedAt = new Date()
        
        // Add completion log
        task.activityLog.push({
          _id: new Types.ObjectId(),
          action: 'completed',
          performedBy: new Types.ObjectId(userId),
          timestamp: new Date(),
          details: 'Task automatically completed when moved to final stage',
        })

        await task.save()

        // Notify assigned users
        await this.notifyTaskCompletion(task)
      }
    } catch (error) {
      console.error('Error in task completion automation:', error)
    }
  }

  /**
   * Notify assigned users when task is completed
   */
  static async notifyTaskCompletion(task: any): Promise<void> {
    try {
      if (task.assignedTo.length > 0) {
        await NotificationService.createBulkNotifications(task.assignedTo, {
          type: 'task_completed',
          title: 'Task Completed',
          message: `Task "${task.title}" has been completed`,
          task: task._id,
          workflow: task.workflow._id || task.workflow,
          triggeredBy: task.createdBy,
        })
      }
    } catch (error) {
      console.error('Error creating completion notifications:', error)
    }
  }

  /**
   * Notify users when assigned to a task
   */
  static async notifyTaskAssignment(
    taskId: Types.ObjectId | string,
    userIds: (Types.ObjectId | string)[],
    assignedBy: Types.ObjectId | string
  ): Promise<void> {
    try {
      const task = await Task.findById(taskId).populate('workflow')
      if (!task) return

      await NotificationService.createBulkNotifications(userIds, {
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned to task: "${task.title}"`,
        task: task._id,
        workflow: task.workflow._id || task.workflow,
        triggeredBy: new Types.ObjectId(assignedBy),
      })
    } catch (error) {
      console.error('Error creating assignment notifications:', error)
    }
  }

  /**
   * Notify users when task stage changes
   */
  static async notifyStageChange(
    taskId: Types.ObjectId | string,
    oldStageName: string,
    newStageName: string,
    changedBy: Types.ObjectId | string
  ): Promise<void> {
    try {
      const task = await Task.findById(taskId).populate('workflow')
      if (!task) return

      if (task.assignedTo.length > 0) {
        await NotificationService.createBulkNotifications(task.assignedTo, {
          type: 'task_stage_changed',
          title: 'Task Stage Changed',
          message: `Task "${task.title}" moved from "${oldStageName}" to "${newStageName}"`,
          task: task._id,
          workflow: task.workflow._id || task.workflow,
          triggeredBy: new Types.ObjectId(changedBy),
        })
      }
    } catch (error) {
      console.error('Error creating stage change notifications:', error)
    }
  }

  /**
   * Check for overdue tasks and create notifications
   * This should be run as a scheduled job (cron)
   */
  static async checkOverdueTasks(): Promise<void> {
    try {
      const now = new Date()
      
      // Find tasks that are overdue and not completed
      const overdueTasks = await Task.find({
        dueDate: { $lt: now },
        completedAt: null,
      }).populate('assignedTo')

      for (const task of overdueTasks) {
        // Check if notification already sent today
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Use NotificationService to check for existing notifications
        // For now, we'll create notifications directly
        // TODO: Add method to NotificationService to check for existing notifications
        
        if (task.assignedTo.length > 0) {
          const userIds = task.assignedTo.map((user: any) => user._id)
          await NotificationService.createBulkNotifications(userIds, {
            type: 'task_overdue',
            title: 'Task Overdue',
            message: `Task "${task.title}" is overdue`,
            task: task._id,
            workflow: task.workflow,
          })
        }
      }

      console.log(`✅ Checked ${overdueTasks.length} overdue tasks`)
    } catch (error) {
      console.error('Error checking overdue tasks:', error)
    }
  }

  /**
   * Check for tasks due soon (within 24 hours)
   * This should be run as a scheduled job (cron)
   */
  static async checkTasksDueSoon(): Promise<void> {
    try {
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      // Find tasks due within 24 hours
      const tasksDueSoon = await Task.find({
        dueDate: { $gte: now, $lte: tomorrow },
        completedAt: null,
      }).populate('assignedTo')

      for (const task of tasksDueSoon) {
        if (task.assignedTo.length > 0) {
          const userIds = task.assignedTo.map((user: any) => user._id)
          await NotificationService.createBulkNotifications(userIds, {
            type: 'task_due_soon',
            title: 'Task Due Soon',
            message: `Task "${task.title}" is due within 24 hours`,
            task: task._id,
            workflow: task.workflow,
          })
        }
      }

      console.log(`✅ Checked ${tasksDueSoon.length} tasks due soon`)
    } catch (error) {
      console.error('Error checking tasks due soon:', error)
    }
  }
}
