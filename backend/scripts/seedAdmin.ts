import { connectDB, disconnectDB } from '../src/config/database'
import { User } from '../src/models/User'

const seedAdmin = async () => {
  try {
    await connectDB()
    
    const adminEmail = 'admin@taskflow.com'
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail })
    
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists')
      
      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin'
        await existingAdmin.save()
        console.log('✅ Updated existing user to admin role')
      }
      
      await disconnectDB()
      return
    }
    
    // Create admin user
    const admin = await User.create({
      email: adminEmail,
      password: 'Admin@123', // Will be hashed by pre-save middleware
      name: 'System Administrator',
      role: 'admin',
    })
    
    console.log('✅ Admin user created successfully')
    console.log(`📧 Email: ${admin.email}`)
    console.log(`🔑 Password: Admin@123`)
    console.log('⚠️ Please change the password after first login!')
    
    await disconnectDB()
  } catch (error) {
    console.error('❌ Error seeding admin:', error)
    process.exit(1)
  }
}

seedAdmin()