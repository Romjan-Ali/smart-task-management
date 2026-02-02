// backend/tests/workflow.service.test.ts
import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import mongoose from 'mongoose'
import { WorkflowService } from '../src/services/workflow.service'
import { Workflow } from '../src/models/Workflow'
import { User } from '../src/models/User'

describe('WorkflowService', () => {
  let testWorkflow: any
  let userId: mongoose.Types.ObjectId

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/taskflow_test')
    
    // Create test user
    const user = await User.create({
      email: 'test@workflow.com',
      password: 'password123',
      name: 'Test User',
      role: 'admin',
    })
    
    userId = user._id
    
    // Create test workflow
    testWorkflow = await Workflow.create({
      name: 'Test Workflow',
      description: 'Test workflow for unit tests',
      createdBy: userId,
      stages: [
        { name: 'Stage 1', order: 0, color: '#000000' },
        { name: 'Stage 2', order: 1, color: '#111111' },
        { name: 'Stage 3', order: 2, color: '#222222' },
        { name: 'Stage 4', order: 3, color: '#333333' },
        { name: 'Stage 5', order: 4, color: '#444444' },
      ],
    })
  })

  afterAll(async () => {
    await Workflow.deleteMany({})
    await User.deleteMany({})
    await mongoose.disconnect()
  })

  describe('validateTransition', () => {
    test('should allow adjacent stage transition', async () => {
      const fromStageId = testWorkflow.stages[0]._id.toString()
      const toStageId = testWorkflow.stages[1]._id.toString()
      
      const result = await WorkflowService.validateTransition(
        testWorkflow._id,
        fromStageId,
        toStageId
      )
      
      expect(result.valid).toBe(true)
    })

    test('should reject non-adjacent transition', async () => {
      const fromStageId = testWorkflow.stages[0]._id.toString()
      const toStageId = testWorkflow.stages[3]._id.toString()
      
      const result = await WorkflowService.validateTransition(
        testWorkflow._id,
        fromStageId,
        toStageId
      )
      
      expect(result.valid).toBe(false)
      expect(result.message).toContain('adjacent')
    })

    test('should allow transition to final stage from any stage', async () => {
      const fromStageId = testWorkflow.stages[0]._id.toString()
      const toStageId = testWorkflow.stages[4]._id.toString()
      
      const result = await WorkflowService.validateTransition(
        testWorkflow._id,
        fromStageId,
        toStageId
      )
      
      expect(result.valid).toBe(true)
    })
  })

  describe('getNextStage', () => {
    test('should return next stage', async () => {
      const currentStageId = testWorkflow.stages[1]._id.toString()
      
      const nextStage = await WorkflowService.getNextStage(
        testWorkflow._id,
        currentStageId
      )
      
      expect(nextStage).toBeTruthy()
      expect(nextStage?.order).toBe(2)
    })

    test('should return null for final stage', async () => {
      const currentStageId = testWorkflow.stages[4]._id.toString()
      
      const nextStage = await WorkflowService.getNextStage(
        testWorkflow._id,
        currentStageId
      )
      
      expect(nextStage).toBeNull()
    })
  })

  describe('canUserModifyWorkflow', () => {
    test('admin can modify any workflow', async () => {
      const canModify = await WorkflowService.canUserModifyWorkflow(
        testWorkflow._id,
        userId,
        'admin'
      )
      
      expect(canModify).toBe(true)
    })

    test('manager can modify workflows they created', async () => {
      const canModify = await WorkflowService.canUserModifyWorkflow(
        testWorkflow._id,
        userId,
        'manager'
      )
      
      expect(canModify).toBe(true)
    })

    test('member cannot modify workflows', async () => {
      const canModify = await WorkflowService.canUserModifyWorkflow(
        testWorkflow._id,
        new mongoose.Types.ObjectId(),
        'member'
      )
      
      expect(canModify).toBe(false)
    })
  })
})