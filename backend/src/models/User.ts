// backend/src/models/User.ts
import { Schema, model, Document } from 'mongoose'
import bcrypt from 'bcryptjs'
import { ROLES } from '../constants/roles'

export interface IUser extends Document {
  email: string
  password: string
  name: string
  role: string
  refreshToken?: string
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
  
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.MEMBER,
    },
    refreshToken: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Indexes (email index is already created by unique: true)
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })

// Password hashing middleware
userSchema.pre('save', async function (this: IUser) {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

// Password comparison method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password)
}

export const User = model<IUser>('User', userSchema)