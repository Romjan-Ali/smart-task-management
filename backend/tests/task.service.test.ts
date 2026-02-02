// backend/tests/task.service.test.ts
import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import { connectDB, disconnectDB } from '../src/config/database'
import { TaskService } from '../src/services/task.service'
import { Task } from '../src/models/Task'
import { Workflow } from '../src/models/Workflow'
import { User } from '../src/models/User'
import { Types } from 'mongoose'

describe('TaskService', () => {
  let testWorkflow: any
  let testUser: any
  let testTask: any

  beforeAll(async () => {
    await connectDB()

    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test@123',
      role: 'member',
      isActive: true,
    })

    // Create test workflow
    testWorkflow = await Workflow.create({
      name: 'Test Workflow',
      stages: [
        { name: 'Stage 1', order: 0, color: '#000000', isInitial: true, isFinal: false },
        { name: 'Stage 2', order: 1, color: '#111111', isInitial: false, isFinal: false },
        { name: 'Stage 3', order: 2, color: '#222222', isInitial: false, isFinal: true },
      ],
      createdBy: testUser._id,
      isDefault: false,
    })

    // Create test task
    testTask = await Task.create({
      title: 'Test Task',
      description: 'Test Description',
      priority: 'medium',
      workflow: testWorkflow._id,
      currentStage: testWorkflow.stages[0]._id,
      assignedTo: [testUser._id],
      createdBy: testUser._id,
      activityLog: [],
    })
  })

  afterAll(async () => {
    // Cleanup
    await Task.deleteMany({ title: 'Test Task' })
    await Workflow.deleteMany({ name: 'Test Workflow' })
    await User.deleteMany({ email: 'test@example.com' })
    await disconnectDB()
  })

  test('validateStageInWorkflow - should return true for valid stage', async () => {
    const result = await TaskService.validateStageInWorkflow(
      testWorkflow._id,
      testWorkflow.stages[0]._id.toString()
    )
    expect(result).toBe(true)
  })

  test('validateStageInWorkflow - should return false for invalid stage', async () => {
    const result = await TaskService.validateStageInWorkflow(
      testWorkflow._id,
      new Types.ObjectId().toString()
    )
    expect(result).toBe(false)
  })

  test('getInitialStage - should return first stage', async () => {
    const stage = await TaskService.getInitialStage(testWorkflow._id)
    expect(stage).not.toBeNull()
    expect(stage?.name).toBe('Stage 1')
    expect(stage?.isInitial).toBe(true)
  })

  test('validateStageTransition - should allow adjacent stage transition', async () => {
    const result = await TaskService.validateStageTransition(
      testWorkflow._id,
      testWorkflow.stages[0]._id.toString(),
      testWorkflow.stages[1]._id.toString()
    )
    expect(result.valid).toBe(true)
  })

  test('validateStageTransition - should allow skip to final stage', async () => {
    const result = await TaskService.validateStageTransition(
      testWorkflow._id,
      testWorkflow.stages[0]._id.toString(),
      testWorkflow.stages[2]._id.toString()
    )
    expect(result.valid).toBe(true)
  })

  test('validateStageTransition - should reject non-adjacent transition', async () => {
    const result = await TaskService.validateStageTransition(
      testWorkflow._id,
      testWorkflow.stages[0]._id.toString(),
      testWorkflow.stages[1]._id.toString()
    )
    // This should be valid (adjacent), but let's test invalid
    const invalidResult = await TaskService.validateStageTransition(
      testWorkflow._id,
      testWorkflow.stages[2]._id.toString(), // Final stage
      testWorkflow.stages[0]._id.toString() // Back to first
    )
    expect(invalidResult.valid).toBe(false)
  })

  test('canUserAccessTask - admin should access all tasks', async () => {
    const result = await TaskService.canUserAccessTask(
      testTask._id,
      new Types.ObjectId(),
      'admin'
    )
    expect(result).toBe(true)
  })

  test('canUserAccessTask - member should access assigned tasks', async () => {
    const result = await TaskService.canUserAccessTask(testTask._id, testUser._id, 'member')
    expect(result).toBe(true)
  })

  test('canUserAccessTask - member should not access unassigned tasks', async () => {
    const result = await TaskService.canUserAccessTask(
      testTask._id,
      new Types.ObjectId(),
      'member'
    )
    expect(result).toBe(false)
  })

  test('createActivityLog - should create valid activity log', () => {
    const log = TaskService.createActivityLog('created', testUser._id, 'Test action')
    expect(log.action).toBe('created')
    expect(log.performedBy.toString()).toBe(testUser._id.toString())
    expect(log.details).toBe('Test action')
    expect(log.timestamp).toBeInstanceOf(Date)
  })

  test('validateUserIds - should return true for valid users', async () => {
    const result = await TaskService.validateUserIds([testUser._id.toString()])
    expect(result).toBe(true)
  })

  test('validateUserIds - should return false for invalid users', async () => {
    const result = await TaskService.validateUserIds([new Types.ObjectId().toString()])
    expect(result).toBe(false)
  })
})
