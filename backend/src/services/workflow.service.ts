// backend/src/services/workflow.service.ts
import type { Types } from 'mongoose'
import { Workflow } from '../models/Workflow'
import type { IWorkflowStage } from '../models/Workflow'

export interface StageTransition {
  fromStageId: string
  toStageId: string
  workflowId: string
}

export class WorkflowService {
  static async validateTransition(
    workflowId: Types.ObjectId | string,
    fromStageId: string,
    toStageId: string
  ): Promise<{ valid: boolean; message?: string }> {
    const workflow = await Workflow.findById(workflowId)
    
    if (!workflow) {
      return { valid: false, message: 'Workflow not found' }
    }
    
    const fromStage = workflow.stages.find(
      (stage) => stage._id.toString() === fromStageId
    )
    
    const toStage = workflow.stages.find(
      (stage) => stage._id.toString() === toStageId
    )
    
    if (!fromStage || !toStage) {
      return { valid: false, message: 'Invalid stage' }
    }
    
    // Allow moving to adjacent stages (order difference of 1)
    const orderDiff = Math.abs(fromStage.order - toStage.order)
    
    if (orderDiff > 1 && !toStage.isFinal) {
      return { 
        valid: false, 
        message: 'Can only move to adjacent stages (or final stage)' 
      }
    }
    
    // Cannot move backwards from final stage
    if (fromStage.isFinal && toStage.order < fromStage.order) {
      return { 
        valid: false, 
        message: 'Cannot move backwards from final stage' 
      }
    }
    
    return { valid: true }
  }

  static async getNextStage(
    workflowId: Types.ObjectId | string,
    currentStageId: string
  ): Promise<IWorkflowStage | null> {
    const workflow = await Workflow.findById(workflowId)
    
    if (!workflow) return null
    
    const currentStage = workflow.stages.find(
      (stage) => stage._id.toString() === currentStageId
    )
    
    if (!currentStage || currentStage.isFinal) return null
    
    const nextStage = workflow.stages.find(
      (stage) => stage.order === currentStage.order + 1
    )
    
    return nextStage || null
  }

  static async getPreviousStage(
    workflowId: Types.ObjectId | string,
    currentStageId: string
  ): Promise<IWorkflowStage | null> {
    const workflow = await Workflow.findById(workflowId)
    
    if (!workflow) return null
    
    const currentStage = workflow.stages.find(
      (stage) => stage._id.toString() === currentStageId
    )
    
    if (!currentStage || currentStage.isInitial) return null
    
    const previousStage = workflow.stages.find(
      (stage) => stage.order === currentStage.order - 1
    )
    
    return previousStage || null
  }

  static async getInitialStage(
    workflowId: Types.ObjectId | string
  ): Promise<IWorkflowStage | null> {
    const workflow = await Workflow.findById(workflowId)
    
    if (!workflow || workflow.stages.length === 0) return null
    
    const initialStage = workflow.stages.find((stage) => stage.isInitial)
    return initialStage || workflow.stages[0] || null
  }

  static async getFinalStage(
    workflowId: Types.ObjectId | string
  ): Promise<IWorkflowStage | null> {
    const workflow = await Workflow.findById(workflowId)
    
    if (!workflow || workflow.stages.length === 0) return null
    
    const finalStage = workflow.stages.find((stage) => stage.isFinal)
    return finalStage || workflow.stages[workflow.stages.length - 1] || null
  }

  static async canUserModifyWorkflow(
    workflowId: Types.ObjectId | string,
    userId: Types.ObjectId | string,
    userRole: string
  ): Promise<boolean> {
    if (userRole === 'admin') return true
    
    const workflow = await Workflow.findById(workflowId)
    
    if (!workflow) return false
    
    // Managers can modify workflows they created
    if (userRole === 'manager' && workflow.createdBy.toString() === userId.toString()) {
      return true
    }
    
    return false
  }
}