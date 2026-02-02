// backend/scripts/seedWorkflows.ts
import { connectDB, disconnectDB } from '../src/config/database'
import { Workflow } from '../src/models/Workflow'
import { User } from '../src/models/User'

const seedDefaultWorkflows = async () => {
  try {
    await connectDB()
    
    // Get admin user
    const admin = await User.findOne({ email: 'admin@taskflow.com' })
    
    if (!admin) {
      console.log('❌ Admin user not found. Run seedAdmin first.')
      process.exit(1)
    }

    const defaultWorkflows = [
      {
        name: 'Software Development',
        description: 'Standard software development lifecycle workflow',
        isDefault: true,
        createdBy: admin._id,
        stages: [
          { name: 'Backlog', order: 0, color: '#6B7280' },
          { name: 'Analysis', order: 1, color: '#3B82F6' },
          { name: 'Development', order: 2, color: '#8B5CF6' },
          { name: 'Code Review', order: 3, color: '#F59E0B' },
          { name: 'QA Testing', order: 4, color: '#10B981' },
          { name: 'Deployment', order: 5, color: '#EF4444' },
          { name: 'Done', order: 6, color: '#64748B' },
        ],
      },
      {
        name: 'Bug Fixing',
        description: 'Bug resolution workflow for tracking and fixing issues',
        isDefault: true,
        createdBy: admin._id,
        stages: [
          { name: 'Reported', order: 0, color: '#DC2626' },
          { name: 'Triaged', order: 1, color: '#F59E0B' },
          { name: 'Investigating', order: 2, color: '#8B5CF6' },
          { name: 'Fix Ready', order: 3, color: '#3B82F6' },
          { name: 'Testing', order: 4, color: '#10B981' },
          { name: 'Verified', order: 5, color: '#059669' },
          { name: 'Deployed', order: 6, color: '#6366F1' },
        ],
      },
      {
        name: 'Content Creation',
        description: 'Workflow for creating and publishing content',
        isDefault: true,
        createdBy: admin._id,
        stages: [
          { name: 'Ideation', order: 0, color: '#7C3AED' },
          { name: 'Research', order: 1, color: '#5B21B6' },
          { name: 'Drafting', order: 2, color: '#1E40AF' },
          { name: 'Editing', order: 3, color: '#0D9488' },
          { name: 'SEO Review', order: 4, color: '#059669' },
          { name: 'Approval', order: 5, color: '#D97706' },
          { name: 'Published', order: 6, color: '#DC2626' },
        ],
      },
      {
        name: 'Simple Task',
        description: 'Simple task management workflow',
        isDefault: true,
        createdBy: admin._id,
        stages: [
          { name: 'Todo', order: 0, color: '#6B7280' },
          { name: 'In Progress', order: 1, color: '#3B82F6' },
          { name: 'Review', order: 2, color: '#F59E0B' },
          { name: 'Done', order: 3, color: '#10B981' },
        ],
      },
    ]

    let createdCount = 0
    let updatedCount = 0

    for (const workflowData of defaultWorkflows) {
      const existingWorkflow = await Workflow.findOne({ name: workflowData.name })
      
      if (existingWorkflow) {
        // Update existing workflow
        Object.assign(existingWorkflow, workflowData)
        await existingWorkflow.save()
        updatedCount++
        console.log(`✅ Updated workflow: ${workflowData.name}`)
      } else {
        // Create new workflow
        await Workflow.create(workflowData)
        createdCount++
        console.log(`✅ Created workflow: ${workflowData.name}`)
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   Created: ${createdCount} workflows`)
    console.log(`   Updated: ${updatedCount} workflows`)
    console.log(`   Total default workflows: ${defaultWorkflows.length}`)
    
    await disconnectDB()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding workflows:', error)
    process.exit(1)
  }
}

seedDefaultWorkflows()