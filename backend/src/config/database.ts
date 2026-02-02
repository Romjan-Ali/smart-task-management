import mongoose from 'mongoose'
import config from './env'

export const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI)
    console.log('✅ MongoDB Connected')
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error)
    process.exit(1)
  }
}

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect()
    console.log('✅ MongoDB Disconnected')
  } catch (error) {
    console.error('❌ MongoDB Disconnection Error:', error)
    process.exit(1)
  }
}
