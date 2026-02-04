// backend/scripts/seedTestData.ts
import { connectDB } from '../src/config/database'
import { User } from '../src/models/User'
import { Workflow } from '../src/models/Workflow'
import { Task } from '../src/models/Task'
import { Notification } from '../src/models/Notification'
import { Types } from 'mongoose'

async function seedTestData() {
  try {
    await connectDB()
    console.log('🔗 Connected to database')

    // Clear existing data
    await Promise.all([
      Task.deleteMany({}),
      Workflow.deleteMany({}),
      Notification.deleteMany({}),
    ])
    console.log('🗑️  Cleared existing workflows, tasks, and notifications')

    // Get users
    const admin = await User.findOne({ email: 'admin@taskflow.com' })
    const manager = await User.findOne({ email: 'manager@taskflow.com' })
    const member = await User.findOne({ email: 'member@taskflow.com' })

    if (!admin || !manager || !member) {
      console.error('❌ Users not found. Please run seedUsers.ts first')
      process.exit(1)
    }

    console.log('✅ Found users')

    // Create Workflows
    const workflows = [
      {
        name: 'Software Development',
        description: 'Standard software development workflow',
        isDefault: true,
        createdBy: admin._id,
        stages: [
          { name: 'Backlog', description: 'Tasks waiting to be started', order: 0, color: '#94A3B8', isFinal: false },
          { name: 'In Progress', description: 'Currently being worked on', order: 1, color: '#3B82F6', isFinal: false },
          { name: 'Code Review', description: 'Under review', order: 2, color: '#F59E0B', isFinal: false },
          { name: 'QA Testing', description: 'Being tested', order: 3, color: '#8B5CF6', isFinal: false },
          { name: 'Done', description: 'Completed tasks', order: 4, color: '#10B981', isFinal: true },
        ],
      },
      {
        name: 'Marketing Campaign',
        description: 'Marketing campaign workflow',
        isDefault: false,
        createdBy: manager._id,
        stages: [
          { name: 'Planning', description: 'Campaign planning', order: 0, color: '#EC4899', isFinal: false },
          { name: 'Design', description: 'Creating assets', order: 1, color: '#8B5CF6', isFinal: false },
          { name: 'Review', description: 'Stakeholder review', order: 2, color: '#F59E0B', isFinal: false },
          { name: 'Launch', description: 'Campaign live', order: 3, color: '#10B981', isFinal: true },
        ],
      },
      {
        name: 'Bug Tracking',
        description: 'Bug fix workflow',
        isDefault: false,
        createdBy: admin._id,
        stages: [
          { name: 'Reported', description: 'Bug reported', order: 0, color: '#EF4444', isFinal: false },
          { name: 'Investigating', description: 'Finding root cause', order: 1, color: '#F59E0B', isFinal: false },
          { name: 'Fixing', description: 'Implementing fix', order: 2, color: '#3B82F6', isFinal: false },
          { name: 'Testing', description: 'Verifying fix', order: 3, color: '#8B5CF6', isFinal: false },
          { name: 'Resolved', description: 'Bug fixed', order: 4, color: '#10B981', isFinal: true },
        ],
      },
    ]

    const createdWorkflows = await Workflow.insertMany(workflows)
    console.log(`✅ Created ${createdWorkflows.length} workflows`)

    // Create Tasks
    const devWorkflow = createdWorkflows[0]
    const marketingWorkflow = createdWorkflows[1]
    const bugWorkflow = createdWorkflows[2]

    const tasks = [
      // Software Development Tasks
      {
        title: 'Implement User Authentication',
        description: '**Implement JWT-based authentication**\n\n- Set up login/register endpoints\n- Add middleware for protected routes\n- Implement refresh token logic\n\n`Code: auth.service.ts`',
        priority: 'high',
        workflow: devWorkflow._id,
        currentStage: devWorkflow.stages[1]._id, // In Progress
        assignedTo: [admin._id, member._id],
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        activityLog: [
          {
            _id: new Types.ObjectId(),
            action: 'created',
            performedBy: admin._id,
            timestamp: new Date(),
            details: 'Task created',
          },
        ],
      },
      {
        title: 'Design Dashboard UI',
        description: 'Create responsive dashboard with:\n- Stats cards\n- Recent activity\n- Charts for analytics',
        priority: 'medium',
        workflow: devWorkflow._id,
        currentStage: devWorkflow.stages[0]._id, // Backlog
        assignedTo: [manager._id],
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        activityLog: [
          {
            _id: new Types.ObjectId(),
            action: 'created',
            performedBy: admin._id,
            timestamp: new Date(),
            details: 'Task created',
          },
        ],
      },
      {
        title: 'API Documentation',
        description: 'Document all API endpoints with examples',
        priority: 'low',
        workflow: devWorkflow._id,
        currentStage: devWorkflow.stages[2]._id, // Code Review
        assignedTo: [member._id],
        createdBy: manager._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        activityLog: [
          {
            _id: new Types.ObjectId(),
            action: 'created',
            performedBy: manager._id,
            timestamp: new Date(),
            details: 'Task created',
          },
        ],
      },
      {
        title: 'Setup CI/CD Pipeline',
        description: '- Configure GitHub Actions\n- Add automated tests\n- Setup deployment to Vercel',
        priority: 'high',
        workflow: devWorkflow._id,
        currentStage: devWorkflow.stages[3]._id, // QA Testing
        assignedTo: [admin._id],
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        activityLog: [
          {
            _id: new Types.ObjectId(),
            action: 'created',
            performedBy: admin._id,
            timestamp: new Date(),
            details: 'Task created',
          },
        ],
      },
      {
        title: 'Implement Drag & Drop',
        description: 'Add drag and drop functionality for task cards using @dnd-kit',
        priority: 'medium',
        workflow: devWorkflow._id,
        currentStage: devWorkflow.stages[4]._id, // Done
        assignedTo: [admin._id, member._id],
        createdBy: admin._id,
        completedAt: new Date(),
        activityLog: [
          {
            _id: new Types.ObjectId(),
            action: 'created',
            performedBy: admin._id,
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            details: 'Task created',
          },
          {
            _id: new Types.ObjectId(),
            action: 'completed',
            performedBy: admin._id,
            timestamp: new Date(),
            details: 'Task completed',
          },
        ],
      },

      // Marketing Campaign Tasks
      {
        title: 'Q1 Product Launch Campaign',
        description: '**Launch campaign for new product features**\n\nTargets:\n- 10K impressions\n- 500 signups\n- 50 conversions',
        priority: 'high',
        workflow: marketingWorkflow._id,
        currentStage: marketingWorkflow.stages[0]._id, // Planning
        assignedTo: [manager._id, member._id],
        createdBy: manager._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        activityLog: [
          {
            _id: new Types.ObjectId(),
            action: 'created',
            performedBy: manager._id,
            timestamp: new Date(),
            details: 'Campaign task created',
          },
        ],
      },
      {
        title: 'Social Media Graphics',
        description: 'Create graphics for:\n- Instagram posts\n- Twitter banners\n- LinkedIn ads',
        priority: 'medium',
        workflow: marketingWorkflow._id,
        currentStage: marketingWorkflow.stages[1]._id, // Design
        assignedTo: [member._id],
        createdBy: manager._id,
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        activityLog: [
          {
            _id: new Types.ObjectId(),
            action: 'created',
            performedBy: manager._id,
            timestamp: new Date(),
            details: 'Design task created',
          },
        ],
      },

      // Bug Tracking Tasks
      {
        title: 'Login Page Not Responsive',
        description: '**Issue:** Login page breaks on mobile devices\n\n**Steps to reproduce:**\n1. Open on mobile\n2. Try to login\n3. Buttons overlap',
        priority: 'high',
        workflow: bugWorkflow._id,
        currentStage: bugWorkflow.stages[0]._id, // Reported
        assignedTo: [admin._id],
        createdBy: member._id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        activityLog: [
          {
            _id: new Types.ObjectId(),
            action: 'created',
            performedBy: member._id,
            timestamp: new Date(),
            details: 'Bug reported',
          },
        ],
      },
      {
        title: 'Task Cards Not Draggable on Safari',
        description: 'Drag and drop not working on Safari browser',
        priority: 'medium',
        workflow: bugWorkflow._id,
        currentStage: bugWorkflow.stages[2]._id, // Fixing
        assignedTo: [admin._id, member._id],
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        activityLog: [
          {
            _id: new Types.ObjectId(),
            action: 'created',
            performedBy: admin._id,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            details: 'Bug reported',
          },
          {
            _id: new Types.ObjectId(),
            action: 'stage_changed',
            performedBy: admin._id,
            timestamp: new Date(),
            details: 'Moved to Fixing',
          },
        ],
      },
      {
        title: 'Notification Bell Not Updating',
        description: 'Real-time notification count not updating',
        priority: 'low',
        workflow: bugWorkflow._id,
        currentStage: bugWorkflow.stages[4]._id, // Resolved
        assignedTo: [member._id],
        createdBy: manager._id,
        completedAt: new Date(),
        activityLog: [
          {
            _id: new Types.ObjectId(),
            action: 'created',
            performedBy: manager._id,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            details: 'Bug reported',
          },
          {
            _id: new Types.ObjectId(),
            action: 'completed',
            performedBy: member._id,
            timestamp: new Date(),
            details: 'Bug fixed and verified',
          },
        ],
      },

      // Additional tasks for testing
      {
        title: 'Overdue Task Example',
        description: 'This task is overdue to test the overdue indicator',
        priority: 'high',
        workflow: devWorkflow._id,
        currentStage: devWorkflow.stages[1]._id,
        assignedTo: [member._id],
        createdBy: admin._id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
        activityLog: [
          {
            _id: new Types.ObjectId(),
            action: 'created',
            performedBy: admin._id,
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            details: 'Task created',
          },
        ],
      },
      {
        title: 'Test Markdown Rendering',
        description: `# Markdown Test

## Features to Test

### Text Formatting
- **Bold text** works
- *Italic text* works
- ~~Strikethrough~~ works
- \`Inline code\` works

### Lists
1. First item
2. Second item
3. Third item

### Code Block
\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`

### Links
[Visit Documentation](https://nextjs.org)

> This is a blockquote for testing`,
        priority: 'low',
        workflow: devWorkflow._id,
        currentStage: devWorkflow.stages[0]._id,
        assignedTo: [admin._id, manager._id, member._id],
        createdBy: admin._id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        activityLog: [
          {
            _id: new Types.ObjectId(),
            action: 'created',
            performedBy: admin._id,
            timestamp: new Date(),
            details: 'Task created for markdown testing',
          },
        ],
      },
    ]

    const createdTasks = await Task.insertMany(tasks)
    console.log(`✅ Created ${createdTasks.length} tasks`)

    // Create some notifications
    const notifications = [
      {
        recipient: admin._id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: 'You have been assigned to "Implement User Authentication"',
        task: createdTasks[0]._id,
        workflow: devWorkflow._id,
        triggeredBy: admin._id,
        isRead: false,
      },
      {
        recipient: member._id,
        type: 'task_stage_changed',
        title: 'Task Stage Changed',
        message: 'Task "Task Cards Not Draggable on Safari" moved to Fixing',
        task: createdTasks[8]._id,
        workflow: bugWorkflow._id,
        triggeredBy: admin._id,
        isRead: false,
      },
      {
        recipient: member._id,
        type: 'task_completed',
        title: 'Task Completed',
        message: 'Task "Notification Bell Not Updating" has been completed',
        task: createdTasks[9]._id,
        workflow: bugWorkflow._id,
        triggeredBy: member._id,
        isRead: true,
        readAt: new Date(),
      },
    ]

    await Notification.insertMany(notifications)
    console.log(`✅ Created ${notifications.length} notifications`)

    console.log('\n🎉 Test data seeded successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - ${createdWorkflows.length} workflows`)
    console.log(`   - ${createdTasks.length} tasks`)
    console.log(`   - ${notifications.length} notifications`)
    console.log('\n🔐 Test Accounts:')
    console.log('   Admin: admin@taskflow.com / Admin@123')
    console.log('   Manager: manager@taskflow.com / Manager@123')
    console.log('   Member: member@taskflow.com / Member@123')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding test data:', error)
    process.exit(1)
  }
}

seedTestData()
