// backend/scripts/seedUsers.ts
import { connectDB, disconnectDB } from '../src/config/database'
import { User } from '../src/models/User'

const testUsers = [
  {
    email: 'admin@taskflow.com',
    password: 'Admin@123',
    name: 'System Administrator',
    role: 'admin',
  },
  {
    email: 'manager@taskflow.com',
    password: 'Manager@123',
    name: 'Project Manager',
    role: 'manager',
  },
  {
    email: 'member@taskflow.com',
    password: 'Member@123',
    name: 'Team Member',
    role: 'member',
  },
  {
    email: 'john.doe@taskflow.com',
    password: 'Password@123',
    name: 'John Doe',
    role: 'member',
  },
  {
    email: 'jane.smith@taskflow.com',
    password: 'Password@123',
    name: 'Jane Smith',
    role: 'manager',
  },
]

const seedUsers = async () => {
  try {
    await connectDB()
    
    console.log('🌱 Starting user seeding...\n')
    
    let created = 0
    let updated = 0
    let skipped = 0
    
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email })
      
      if (existingUser) {
        // Update role if different
        if (existingUser.role !== userData.role) {
          existingUser.role = userData.role
          existingUser.name = userData.name
          await existingUser.save()
          console.log(`✏️  Updated: ${userData.email} (${userData.role})`)
          updated++
        } else {
          console.log(`⏭️  Skipped: ${userData.email} (already exists)`)
          skipped++
        }
      } else {
        // Create new user
        await User.create(userData)
        console.log(`✅ Created: ${userData.email} (${userData.role})`)
        created++
      }
    }
    
    console.log('\n📊 Seeding Summary:')
    console.log(`   ✅ Created: ${created}`)
    console.log(`   ✏️  Updated: ${updated}`)
    console.log(`   ⏭️  Skipped: ${skipped}`)
    console.log(`   📝 Total: ${testUsers.length}`)
    
    console.log('\n🔐 Test Credentials:')
    console.log('   Admin:   admin@taskflow.com / Admin@123')
    console.log('   Manager: manager@taskflow.com / Manager@123')
    console.log('   Member:  member@taskflow.com / Member@123')
    console.log('\n⚠️  Please change passwords after first login!')
    
    await disconnectDB()
  } catch (error) {
    console.error('❌ Error seeding users:', error)
    process.exit(1)
  }
}

seedUsers()
