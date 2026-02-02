// backend/src/controllers/workflow.controller.ts
import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../types'
import { Workflow } from '../models/Workflow'
import { WorkflowService } from '../services/workflow.service'
import type { CreateWorkflowInput, UpdateWorkflowInput, ValidateTransitionInput } from '../schemas/workflow.schema'

export const workflowController = {
  async createWorkflow(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { name, description, stages, isDefault } = req.body

      // Check if workflow with same name exists
      const existingWorkflow = await Workflow.findOne({ name })
      if (existingWorkflow) {
        return res.status(409).json({
          success: false,
          error: 'Workflow with this name already exists',
        })
      }

      const workflow = await Workflow.create({
        name,
        description,
        stages,
        isDefault: isDefault || false,
        createdBy: req.user.userId,
      })

      res.status(201).json({
        success: true,
        data: workflow,
      })
    } catch (error) {
      next(error)
    }
  },

  async getAllWorkflows(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search,
        isDefault 
      } = req.query

      const pageNum = parseInt(page as string, 10)
      const limitNum = parseInt(limit as string, 10)
      const skip = (pageNum - 1) * limitNum

      const filter: any = {}

      if (search) {
        filter.name = { $regex: search as string, $options: 'i' }
      }

      if (isDefault !== undefined) {
        filter.isDefault = isDefault === 'true'
      }

      // If not admin, only show workflows they created or default ones
      if (req.user?.role !== 'admin') {
        filter.$or = [
          { createdBy: req.user?.userId },
          { isDefault: true },
        ]
      }

      const [workflows, total] = await Promise.all([
        Workflow.find(filter)
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Workflow.countDocuments(filter),
      ])

      res.json({
        success: true,
        data: workflows,
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

  async getWorkflowById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Workflow ID is required',
        })
      }

      const workflow = await Workflow.findById(id)
        .populate('createdBy', 'name email')

      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found',
        })
      }

      // Check if user can access this workflow
      const canAccess = req.user?.role === 'admin' || 
        workflow.isDefault || 
        workflow.createdBy._id.toString() === req.user?.userId

      if (!canAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this workflow',
        })
      }

      res.json({
        success: true,
        data: workflow,
      })
    } catch (error) {
      next(error)
    }
  },

  async updateWorkflow(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        })
      }

      const { id } = req.params
      const updateData = req.body

      if (!id || Array.isArray(id)) {
        return res.status(400).json({
          success: false,
          error: 'Workflow ID is required',
        })
      }

      const workflow = await Workflow.findById(id)

      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found',
        })
      }

      // Check if user can modify this workflow
      const canModify = await WorkflowService.canUserModifyWorkflow(
        id,
        req.user.userId,
        req.user.role
      )

      if (!canModify) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to modify this workflow',
        })
      }

      // Check name uniqueness if name is being updated
      if (updateData.name && updateData.name !== workflow.name) {
        const existingWorkflow = await Workflow.findOne({ 
          name: updateData.name,
          _id: { $ne: workflow._id }
        })
        
        if (existingWorkflow) {
          return res.status(409).json({
            success: false,
            error: 'Workflow with this name already exists',
          })
        }
      }

      Object.assign(workflow, updateData)
      await workflow.save()

      res.json({
        success: true,
        data: workflow,
      })
    } catch (error) {
      next(error)
    }
  },

  async deleteWorkflow(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
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
          error: 'Workflow ID is required',
        })
      }

      const workflow = await Workflow.findById(id)

      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found',
        })
      }

      // Check if user can delete this workflow
      const canDelete = await WorkflowService.canUserModifyWorkflow(
        id,
        req.user.userId,
        req.user.role
      )

      if (!canDelete) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this workflow',
        })
      }

      // Check if workflow is in use (we'll implement this later with tasks)
      // For now, prevent deletion of default workflows
      if (workflow.isDefault) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete default workflow',
        })
      }

      await workflow.deleteOne()

      res.json({
        success: true,
        message: 'Workflow deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  },

  async validateStageTransition(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id: workflowId } = req.params
      const { fromStageId, toStageId } = req.body

      if (!workflowId || Array.isArray(workflowId)) {
        return res.status(400).json({
          success: false,
          error: 'Workflow ID is required',
        })
      }

      if (!fromStageId || !toStageId) {
        return res.status(400).json({
          success: false,
          error: 'Both fromStageId and toStageId are required',
        })
      }

      const validation = await WorkflowService.validateTransition(
        workflowId,
        fromStageId,
        toStageId
      )

      res.json({
        success: validation.valid,
        data: validation,
      })
    } catch (error) {
      next(error)
    }
  },

  async getWorkflowStages(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Workflow ID is required',
        })
      }

      const workflow = await Workflow.findById(id).select('stages')

      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found',
        })
      }

      res.json({
        success: true,
        data: workflow.stages,
      })
    } catch (error) {
      next(error)
    }
  },

  async getDefaultWorkflows(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const workflows = await Workflow.find({ isDefault: true })
        .populate('createdBy', 'name email')
        .sort({ name: 1 })

      res.json({
        success: true,
        data: workflows,
      })
    } catch (error) {
      next(error)
    }
  },
}