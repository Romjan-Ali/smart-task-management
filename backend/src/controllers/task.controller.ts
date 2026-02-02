// backend/src/controllers/task.controller.ts
import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../types'
import { Task } from '../models/Task'
import { Workflow } from '../models/Workflow'
import { TaskService } from '../services/task.service'
import { AutomationService } from '../services/automation.service'
import { Types } from 'mongoose'

export const taskController = {
  /**
   * Create a new task
   */
  async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { title, description, priority, workflowId, assignedTo, dueDate } = req.body

      // Validate workflowId format
      if (!Types.ObjectId.isValid(workflowId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid workflow ID format',
        })
      }

      // Validate workflow exists
      const workflow = await Workflow.findById(workflowId)
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found',
        })
      }

      // Get initial stage
      const initialStage = await TaskService.getInitialStage(workflowId)
      if (!initialStage) {
        return res.status(400).json({
          success: false,
          error: 'Workflow has no stages',
        })
      }

      // Validate assigned users if provided
      if (assignedTo && assignedTo.length > 0) {
        const validUsers = await TaskService.validateUserIds(assignedTo)
        if (!validUsers) {
          return res.status(400).json({
            success: false,
            error: 'One or more assigned users not found',
          })
        }
      }

      // Create task
      const task = await Task.create({
        title,
        description,
        priority: priority || 'medium',
        workflow: workflowId,
        currentStage: initialStage._id,
        assignedTo: assignedTo || [],
        createdBy: req.user.userId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        activityLog: [
          TaskService.createActivityLog(
            'created',
            req.user.userId,
            `Task created in stage: ${initialStage.name}`
          ),
        ],
      })

      // Populate references
      await task.populate([
        { path: 'workflow', select: 'name stages' },
        { path: 'assignedTo', select: 'name email' },
        { path: 'createdBy', select: 'name email' },
      ])

      res.status(201).json({
        success: true,
        data: task,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get all tasks with filters and pagination
   */
  async getAllTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const {
        page = '1',
        limit = '20',
        workflowId,
        stageId,
        assignedTo,
        priority,
        overdue,
        search,
      } = req.query

      const pageNum = parseInt(page as string, 10)
      const limitNum = parseInt(limit as string, 10)
      const skip = (pageNum - 1) * limitNum

      // Build filter
      const filter: any = {}

      // Role-based filtering
      if (req.user.role === 'member') {
        // Members only see tasks assigned to them
        filter.assignedTo = req.user.userId
      }

      if (workflowId) {
        filter.workflow = workflowId
      }

      if (stageId) {
        filter.currentStage = stageId
      }

      if (assignedTo) {
        filter.assignedTo = assignedTo
      }

      if (priority) {
        filter.priority = priority
      }

      if (overdue === 'true') {
        filter.dueDate = { $lt: new Date() }
        filter.completedAt = null
      }

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ]
      }

      const [tasks, total] = await Promise.all([
        Task.find(filter)
          .populate('workflow', 'name stages')
          .populate('assignedTo', 'name email')
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Task.countDocuments(filter),
      ])

      res.json({
        success: true,
        data: tasks,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get task by ID
   */
  async getTaskById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { id } = req.params

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          error: 'Task ID is required',
        })
      }

      const task = await Task.findById(id)
        .populate('workflow', 'name stages')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .populate('activityLog.performedBy', 'name email')

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
        })
      }

      // Check access permission
      const canAccess = await TaskService.canUserAccessTask(id, req.user.userId, req.user.role)
      if (!canAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this task',
        })
      }

      res.json({
        success: true,
        data: task,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Update task
   */
  async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { id } = req.params
      const { title, description, priority, assignedTo, dueDate } = req.body

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          error: 'Task ID is required',
        })
      }

      const task = await Task.findById(id)
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
        })
      }

      // Check modify permission
      const canModify = await TaskService.canUserModifyTask(id, req.user.userId, req.user.role)
      if (!canModify) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to modify this task',
        })
      }

      // Track changes for activity log
      const changes: string[] = []

      if (title && title !== task.title) {
        task.activityLog.push(
          TaskService.createActivityLog(
            'updated',
            req.user.userId,
            'Title updated',
            task.title,
            title
          )
        )
        task.title = title
        changes.push('title')
      }

      if (description !== undefined && description !== task.description) {
        task.activityLog.push(
          TaskService.createActivityLog('updated', req.user.userId, 'Description updated')
        )
        task.description = description
        changes.push('description')
      }

      if (priority && priority !== task.priority) {
        task.activityLog.push(
          TaskService.createActivityLog(
            'priority_changed',
            req.user.userId,
            'Priority changed',
            task.priority,
            priority
          )
        )
        task.priority = priority
        changes.push('priority')
      }

      if (assignedTo) {
        // Validate users
        const validUsers = await TaskService.validateUserIds(assignedTo)
        if (!validUsers) {
          return res.status(400).json({
            success: false,
            error: 'One or more assigned users not found',
          })
        }

        task.activityLog.push(
          TaskService.createActivityLog('assigned', req.user.userId, 'Users assigned to task')
        )
        task.assignedTo = assignedTo.map((id: string) => new Types.ObjectId(id))
        changes.push('assignedTo')
      }

      if (dueDate !== undefined) {
        const newDueDate = dueDate ? new Date(dueDate) : null
        task.activityLog.push(
          TaskService.createActivityLog(
            'due_date_changed',
            req.user.userId,
            'Due date changed',
            task.dueDate?.toISOString(),
            newDueDate?.toISOString()
          )
        )
        task.dueDate = newDueDate || undefined
        changes.push('dueDate')
      }

      if (changes.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No changes provided',
        })
      }

      await task.save()

      // Populate references
      await task.populate([
        { path: 'workflow', select: 'name stages' },
        { path: 'assignedTo', select: 'name email' },
        { path: 'createdBy', select: 'name email' },
      ])

      res.json({
        success: true,
        data: task,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Change task stage
   */
  async changeStage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { id } = req.params
      const { stageId } = req.body

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          error: 'Task ID is required',
        })
      }

      const task = await Task.findById(id).populate('workflow')
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
        })
      }

      // Check modify permission
      const canModify = await TaskService.canUserModifyTask(id, req.user.userId, req.user.role)
      if (!canModify) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to modify this task',
        })
      }

      // Validate stage belongs to workflow
      const validStage = await TaskService.validateStageInWorkflow(task.workflow._id, stageId)
      if (!validStage) {
        return res.status(400).json({
          success: false,
          error: 'Invalid stage for this workflow',
        })
      }

      // Validate transition
      const currentStageId = task.currentStage.toString()
      if (currentStageId !== stageId) {
        const validation = await TaskService.validateStageTransition(
          task.workflow._id,
          currentStageId,
          stageId
        )

        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            error: validation.message || 'Invalid stage transition',
          })
        }

        // Get stage names for activity log
        const workflow = task.workflow as any
        const oldStage = workflow.stages.find((s: any) => s._id.toString() === currentStageId)
        const newStage = workflow.stages.find((s: any) => s._id.toString() === stageId)

        // Update stage
        task.currentStage = new Types.ObjectId(stageId)
        task.activityLog.push(
          TaskService.createActivityLog(
            'stage_changed',
            req.user.userId,
            `Stage changed from "${oldStage?.name}" to "${newStage?.name}"`,
            oldStage?.name,
            newStage?.name
          )
        )

        await task.save()

        // Trigger automation: auto-complete and notify
        await AutomationService.handleTaskCompletion(id, req.user.userId)
        
        // Notify users about stage change
        await AutomationService.notifyStageChange(
          id,
          oldStage?.name || 'Unknown',
          newStage?.name || 'Unknown',
          req.user.userId
        )
      }

      // Reload task with populated fields
      const updatedTask = await Task.findById(id)
        .populate('workflow', 'name stages')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')

      res.json({
        success: true,
        data: updatedTask,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Assign users to task
   */
  async assignUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { id } = req.params
      const { userIds } = req.body

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          error: 'Task ID is required',
        })
      }

      const task = await Task.findById(id)
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
        })
      }

      // Check modify permission
      const canModify = await TaskService.canUserModifyTask(id, req.user.userId, req.user.role)
      if (!canModify) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to modify this task',
        })
      }

      // Validate users
      const validUsers = await TaskService.validateUserIds(userIds)
      if (!validUsers) {
        return res.status(400).json({
          success: false,
          error: 'One or more users not found',
        })
      }

      // Add new users (avoid duplicates)
      const newUsers = userIds.filter(
        (userId: string) => !task.assignedTo.some((id) => id.toString() === userId)
      )

      if (newUsers.length > 0) {
        task.assignedTo.push(...newUsers.map((id: string) => new Types.ObjectId(id)))
        task.activityLog.push(
          TaskService.createActivityLog(
            'assigned',
            req.user.userId,
            `${newUsers.length} user(s) assigned to task`
          )
        )
        await task.save()

        // Notify newly assigned users
        await AutomationService.notifyTaskAssignment(id, newUsers, req.user.userId)
      }

      // Populate and return
      await task.populate([
        { path: 'workflow', select: 'name stages' },
        { path: 'assignedTo', select: 'name email' },
        { path: 'createdBy', select: 'name email' },
      ])

      res.json({
        success: true,
        data: task,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Unassign user from task
   */
  async unassignUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { id, userId } = req.params

      if (!id || Array.isArray(id) || !userId || Array.isArray(userId)) {
        return res.status(400).json({
          success: false,
          error: 'Task ID and User ID are required',
        })
      }

      const task = await Task.findById(id)
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
        })
      }

      // Check modify permission
      const canModify = await TaskService.canUserModifyTask(id, req.user.userId, req.user.role)
      if (!canModify) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to modify this task',
        })
      }

      // Remove user
      const initialLength = task.assignedTo.length
      task.assignedTo = task.assignedTo.filter((id) => id.toString() !== userId)

      if (task.assignedTo.length === initialLength) {
        return res.status(400).json({
          success: false,
          error: 'User not assigned to this task',
        })
      }

      task.activityLog.push(
        TaskService.createActivityLog('unassigned', req.user.userId, 'User unassigned from task')
      )

      await task.save()

      // Populate and return
      await task.populate([
        { path: 'workflow', select: 'name stages' },
        { path: 'assignedTo', select: 'name email' },
        { path: 'createdBy', select: 'name email' },
      ])

      res.json({
        success: true,
        data: task,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Delete task
   */
  async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { id } = req.params

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          error: 'Task ID is required',
        })
      }

      const task = await Task.findById(id)
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found',
        })
      }

      // Only admin or task creator can delete
      if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this task',
        })
      }

      await task.deleteOne()

      res.json({
        success: true,
        message: 'Task deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get task statistics
   */
  async getTaskStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { workflowId, assignedTo } = req.query

      const filters: any = {}
      if (workflowId) filters.workflowId = workflowId as string
      if (assignedTo) filters.assignedTo = assignedTo as string

      // Members can only see their own stats
      if (req.user.role === 'member') {
        filters.assignedTo = req.user.userId
      }

      const stats = await TaskService.getTaskStats(filters)

      res.json({
        success: true,
        data: stats,
      })
    } catch (error) {
      next(error)
    }
  },
}
