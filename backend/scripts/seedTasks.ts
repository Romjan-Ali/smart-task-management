// backend/scripts/seedTasks.ts
import { connectDB, disconnectDB } from '../src/config/database'
import { Task } from '../src/models/Task'
import { User } from '../src/models/User'
import { Workflow } from '../src/models/Workflow'
import { Types } from 'mongoose'

const seedTasks = async () => {
  try {
    await connectDB()

    // Get users
    const admin = await User.findOne({ email: 'admin@taskflow.com' })
    const manager = await User.findOne({ email: 'manager@taskflow.com' })
    const member = await User.findOne({ email: 'member@taskflow.com' })

    if (!admin || !manager || !member) {
      console.log('❌ Users not found. Run seed:admin and seed:user first.')
      process.exit(1)
    }

    // Get workflows
    const devWorkflow = await Workflow.findOne({ name: 'Software Development' })
    const bugWorkflow = await Workflow.findOne({ name: 'Bug Fixing' })
    const simpleWorkflow = await Workflow.findOne({ name: 'Simple Task' })

    if (!devWorkflow || !bugWorkflow || !simpleWorkflow) {
      console.log('❌ Workflows not found. Run seed:workflows first.')
      process.exit(1)
    }

    // Clear existing tasks
    await Task.deleteMany({})
    console.log('🗑️  Cleared existing tasks')

    // Helper to create activity log
    const createLog = (action: string, userId: Types.ObjectId, details?: string) => ({
      _id: new Types.ObjectId(),
      action,
      performedBy: userId,
      timestamp: new Date(),
      details,
    })

    // Sample tasks for Software Development workflow
    const devTasks = [
      {
        title: 'Implement User Authentication',
        description: 'Add JWT-based authentication with refresh tokens',
        priority: 'high' as const,
        workflow: devWorkflow._id,
        currentStage: devWorkflow.stages[0]!._id, // Backlog
        assignedTo: [manager._id, member._id],
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        activityLog: [createLog('created', admin._id, 'Task created in Backlog')],
      },
      {
        title: 'Design Database Schema',
        description: 'Create MongoDB schema for users, tasks, and workflows',
        priority: 'high' as const,
        workflow: devWorkflow._id,
        currentStage: devWorkflow.stages[1]!._id, // Analysis
        assignedTo: [manager._id],
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        activityLog: [
          createLog('created', admin._id, 'Task created in Backlog'),
          createLog('stage_changed', admin._id, 'Moved to Analysis'),
        ],
      },
      {
        title: 'Build REST API Endpoints',
        description: 'Create CRUD endpoints for all resources',
        priority: 'medium' as const,
        workflow: devWorkflow._id,
        currentStage: devWorkflow.stages[2]!._id, // Development
        assignedTo: [member._id],
        createdBy: manager._id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        activityLog: [
          createLog('created', manager._id, 'Task created in Backlog'),
          createLog('stage_changed', manager._id, 'Moved to Analysis'),
          createLog('stage_changed', manager._id, 'Moved to Development'),
        ],
      },
      {
        title: 'Write Unit Tests',
        description: 'Add comprehensive unit tests for all services',
        priority: 'medium' as const,
        workflow: devWorkflow._id,
        currentStage: devWorkflow.stages[4]!._id, // QA Testing
        assignedTo: [member._id],
        createdBy: manager._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        activityLog: [
          createLog('created', manager._id, 'Task created'),
          createLog('stage_changed', manager._id, 'Moved through stages'),
        ],
      },
      {
        title: 'Deploy to Production',
        description: 'Deploy application to production environment',
        priority: 'high' as const,
        workflow: devWorkflow._id,
        currentStage: devWorkflow.stages[6]!._id, // Done
        assignedTo: [admin._id],
        createdBy: admin._id,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Completed 2 days ago
        activityLog: [
          createLog('created', admin._id, 'Task created'),
          createLog('completed', admin._id, 'Task completed'),
        ],
      },
    ]

    // Sample tasks for Bug Fixing workflow
    const bugTasks = [
      {
        title: 'Fix Login Page Crash',
        description: 'Login page crashes when invalid credentials are entered',
        priority: 'high' as const,
        workflow: bugWorkflow._id,
        currentStage: bugWorkflow.stages[0]!._id, // Reported
        assignedTo: [member._id],
        createdBy: member._id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        activityLog: [createLog('created', member._id, 'Bug reported')],
      },
      {
        title: 'Memory Leak in Dashboard',
        description: 'Dashboard page has memory leak causing browser slowdown',
        priority: 'high' as const,
        workflow: bugWorkflow._id,
        currentStage: bugWorkflow.stages[2]!._id, // Investigating
        assignedTo: [manager._id, member._id],
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        activityLog: [
          createLog('created', admin._id, 'Bug reported'),
          createLog('stage_changed', admin._id, 'Moved to Investigating'),
        ],
      },
      {
        title: 'API Response Timeout',
        description: 'Some API endpoints timeout after 30 seconds',
        priority: 'medium' as const,
        workflow: bugWorkflow._id,
        currentStage: bugWorkflow.stages[4]!._id, // Testing
        assignedTo: [member._id],
        createdBy: manager._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        activityLog: [
          createLog('created', manager._id, 'Bug reported'),
          createLog('stage_changed', manager._id, 'Fix implemented, testing'),
        ],
      },
    ]

    // Sample tasks for Simple Task workflow
    const simpleTasks = [
      {
        title: 'Update Documentation',
        description: 'Update README with latest API changes',
        priority: 'low' as const,
        workflow: simpleWorkflow._id,
        currentStage: simpleWorkflow.stages[0]!._id, // Todo
        assignedTo: [member._id],
        createdBy: manager._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        activityLog: [createLog('created', manager._id, 'Task created')],
      },
      {
        title: 'Code Review for PR #123',
        description: 'Review pull request for new feature implementation',
        priority: 'high' as const,
        workflow: simpleWorkflow._id,
        currentStage: simpleWorkflow.stages[2]!._id, // Review
        assignedTo: [manager._id],
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        activityLog: [
          createLog('created', admin._id, 'Task created'),
          createLog('stage_changed', admin._id, 'Moved to Review'),
        ],
      },
      {
        title: 'Setup CI/CD Pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment',
        priority: 'medium' as const,
        workflow: simpleWorkflow._id,
        currentStage: simpleWorkflow.stages[1]!._id, // In Progress
        assignedTo: [admin._id, manager._id],
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        activityLog: [
          createLog('created', admin._id, 'Task created'),
          createLog('stage_changed', admin._id, 'Started working'),
        ],
      },
      {
        title: 'Refactor Authentication Module',
        description: 'Clean up authentication code and improve error handling',
        priority: 'low' as const,
        workflow: simpleWorkflow._id,
        currentStage: simpleWorkflow.stages[3]!._id, // Done
        assignedTo: [member._id],
        createdBy: manager._id,
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Completed 1 day ago
        activityLog: [
          createLog('created', manager._id, 'Task created'),
          createLog('completed', manager._id, 'Task completed'),
        ],
      },
    ]

    // Overdue task
    const overdueTasks = [
      {
        title: 'Fix Critical Security Vulnerability',
        description: 'SQL injection vulnerability in user input',
        priority: 'high' as const,
        workflow: bugWorkflow._id,
        currentStage: bugWorkflow.stages[1]!._id, // Triaged
        assignedTo: [admin._id, manager._id],
        createdBy: admin._id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days overdue
        activityLog: [
          createLog('created', admin._id, 'Critical bug reported'),
          createLog('priority_changed', admin._id, 'Priority set to HIGH'),
        ],
      },
    ]

    // Insert all tasks
    const allTasks = [...devTasks, ...bugTasks, ...simpleTasks, ...overdueTasks]
    await Task.insertMany(allTasks)

    console.log(`\n✅ Successfully seeded ${allTasks.length} tasks:`)
    console.log(`   📊 Software Development: ${devTasks.length} tasks`)
    console.log(`   🐛 Bug Fixing: ${bugTasks.length} tasks`)
    console.log(`   ✅ Simple Tasks: ${simpleTasks.length} tasks`)
    console.log(`   ⚠️  Overdue: ${overdueTasks.length} task`)
    console.log(`\n📈 Task Statistics:`)
    console.log(`   High Priority: ${allTasks.filter((t) => t.priority === 'high').length}`)
    console.log(`   Medium Priority: ${allTasks.filter((t) => t.priority === 'medium').length}`)
    console.log(`   Low Priority: ${allTasks.filter((t) => t.priority === 'low').length}`)
    console.log(`   Completed: ${allTasks.filter((t) => 'completedAt' in t && t.completedAt).length}`)
    console.log(`   Overdue: ${overdueTasks.length}`)

    await disconnectDB()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding tasks:', error)
    process.exit(1)
  }
}

seedTasks()
