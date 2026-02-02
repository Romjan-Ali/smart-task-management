// backend/scripts/seedNotifications.ts
import { connectDB, disconnectDB } from '../src/config/database'
import { Notification } from '../src/models/Notification'
import { User } from '../src/models/User'
import { Task } from '../src/models/Task'
import { Workflow } from '../src/models/Workflow'

const seedNotifications = async () => {
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

    // Get some tasks
    const tasks = await Task.find().limit(5)
    if (tasks.length === 0) {
      console.log('❌ No tasks found. Run seed:tasks first.')
      process.exit(1)
    }

    // Get workflows
    const workflows = await Workflow.find().limit(2)

    // Clear existing notifications
    await Notification.deleteMany({})
    console.log('🗑️  Cleared existing notifications')

    // Create sample notifications
    const notifications = [
      // Task assigned notifications
      {
        recipient: member._id,
        type: 'task_assigned' as const,
        title: 'New Task Assigned',
        message: `You have been assigned to task: "${tasks[0]?.title}"`,
        task: tasks[0]?._id,
        workflow: tasks[0]?.workflow,
        triggeredBy: admin._id,
        isRead: false,
      },
      {
        recipient: manager._id,
        type: 'task_assigned' as const,
        title: 'New Task Assigned',
        message: `You have been assigned to task: "${tasks[1]?.title}"`,
        task: tasks[1]?._id,
        workflow: tasks[1]?.workflow,
        triggeredBy: admin._id,
        isRead: false,
      },

      // Task completed notifications
      {
        recipient: member._id,
        type: 'task_completed' as const,
        title: 'Task Completed',
        message: `Task "${tasks[2]?.title}" has been completed`,
        task: tasks[2]?._id,
        workflow: tasks[2]?.workflow,
        triggeredBy: manager._id,
        isRead: true,
        readAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Read 2 hours ago
      },

      // Stage changed notifications
      {
        recipient: member._id,
        type: 'task_stage_changed' as const,
        title: 'Task Stage Changed',
        message: `Task "${tasks[0]?.title}" moved from "Backlog" to "In Progress"`,
        task: tasks[0]?._id,
        workflow: tasks[0]?.workflow,
        triggeredBy: manager._id,
        isRead: false,
        metadata: {
          oldStage: 'Backlog',
          newStage: 'In Progress',
        },
      },
      {
        recipient: manager._id,
        type: 'task_stage_changed' as const,
        title: 'Task Stage Changed',
        message: `Task "${tasks[1]?.title}" moved from "In Progress" to "Code Review"`,
        task: tasks[1]?._id,
        workflow: tasks[1]?.workflow,
        triggeredBy: member._id,
        isRead: false,
        metadata: {
          oldStage: 'In Progress',
          newStage: 'Code Review',
        },
      },

      // Overdue task notifications
      {
        recipient: member._id,
        type: 'task_overdue' as const,
        title: 'Task Overdue',
        message: `Task "${tasks[3]?.title}" is overdue`,
        task: tasks[3]?._id,
        workflow: tasks[3]?.workflow,
        isRead: false,
        metadata: {
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          daysOverdue: 2,
        },
      },
      {
        recipient: manager._id,
        type: 'task_overdue' as const,
        title: 'Task Overdue',
        message: `Task "${tasks[4]?.title}" is overdue`,
        task: tasks[4]?._id,
        workflow: tasks[4]?.workflow,
        isRead: false,
        metadata: {
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          daysOverdue: 1,
        },
      },

      // Task due soon notifications
      {
        recipient: member._id,
        type: 'task_due_soon' as const,
        title: 'Task Due Soon',
        message: `Task "${tasks[0]?.title}" is due within 24 hours`,
        task: tasks[0]?._id,
        workflow: tasks[0]?.workflow,
        isRead: false,
        metadata: {
          dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // Due in 12 hours
        },
      },
      {
        recipient: manager._id,
        type: 'task_due_soon' as const,
        title: 'Task Due Soon',
        message: `Task "${tasks[1]?.title}" is due within 24 hours`,
        task: tasks[1]?._id,
        workflow: tasks[1]?.workflow,
        isRead: true,
        readAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // Read 1 hour ago
        metadata: {
          dueDate: new Date(Date.now() + 18 * 60 * 60 * 1000), // Due in 18 hours
        },
      },

      // Additional notifications for admin
      {
        recipient: admin._id,
        type: 'task_completed' as const,
        title: 'Task Completed',
        message: `Task "${tasks[2]?.title}" has been completed`,
        task: tasks[2]?._id,
        workflow: tasks[2]?.workflow,
        triggeredBy: member._id,
        isRead: false,
      },
      {
        recipient: admin._id,
        type: 'task_assigned' as const,
        title: 'New Task Assigned',
        message: `You have been assigned to task: "${tasks[3]?.title}"`,
        task: tasks[3]?._id,
        workflow: tasks[3]?.workflow,
        triggeredBy: manager._id,
        isRead: false,
      },
    ]

    // Insert notifications
    await Notification.insertMany(notifications)

    // Count by type
    const byType = notifications.reduce((acc: any, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1
      return acc
    }, {})

    // Count by recipient
    const unreadByUser = {
      admin: notifications.filter((n) => n.recipient.toString() === admin._id.toString() && !n.isRead).length,
      manager: notifications.filter((n) => n.recipient.toString() === manager._id.toString() && !n.isRead).length,
      member: notifications.filter((n) => n.recipient.toString() === member._id.toString() && !n.isRead).length,
    }

    console.log(`\n✅ Successfully seeded ${notifications.length} notifications`)
    console.log(`\n📊 By Type:`)
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`)
    })
    console.log(`\n📬 Unread by User:`)
    console.log(`   Admin: ${unreadByUser.admin}`)
    console.log(`   Manager: ${unreadByUser.manager}`)
    console.log(`   Member: ${unreadByUser.member}`)

    await disconnectDB()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding notifications:', error)
    process.exit(1)
  }
}

seedNotifications()
