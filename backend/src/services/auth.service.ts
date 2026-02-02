// backend/src/services/auth.service.ts
import { User } from '../models/User'
import { TokenService } from './token.service'
import type { RegisterInput, LoginInput } from '../schemas/auth.schema'
import type { TokenPayload } from '../types'
import { AppError } from '../utils/AppError'

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterInput) {
    const { email, password, name, role } = data

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new AppError(409, 'User already exists')
    }

    // Create user (password will be hashed by pre-save middleware)
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'member',
    })

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      role: user.role as 'admin' | 'manager' | 'member',
    }

    const accessToken = TokenService.generateAccessToken(tokenPayload)
    const refreshToken = TokenService.generateRefreshToken(tokenPayload)

    // Save refresh token to user
    user.refreshToken = refreshToken
    await user.save()

    // Return user data (without password) and tokens
    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    }
  }

  /**
   * Login user
   */
  static async login(data: LoginInput) {
    const { email, password } = data

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      throw new AppError(401, 'Invalid credentials')
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError(403, 'Account is disabled')
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials')
    }

    // Update last login
    user.lastLoginAt = new Date()
    await user.save()

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      role: user.role as 'admin' | 'manager' | 'member',
    }

    const accessToken = TokenService.generateAccessToken(tokenPayload)
    const refreshToken = TokenService.generateRefreshToken(tokenPayload)

    // Save refresh token to user
    user.refreshToken = refreshToken
    await user.save()

    // Return user data (without password) and tokens
    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
      },
      accessToken,
      refreshToken,
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError(401, 'Refresh token is required')
    }

    // Verify refresh token
    const decoded = TokenService.verifyRefreshToken(refreshToken)

    // Find user with this refresh token
    const user = await User.findOne({
      _id: decoded.userId,
      refreshToken,
      isActive: true,
    })

    if (!user) {
      throw new AppError(401, 'Invalid refresh token')
    }

    // Generate new tokens
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      role: user.role as 'admin' | 'manager' | 'member',
    }

    const newAccessToken = TokenService.generateAccessToken(tokenPayload)
    const newRefreshToken = TokenService.generateRefreshToken(tokenPayload)

    // Update refresh token in database
    user.refreshToken = newRefreshToken
    await user.save()

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  }

  /**
   * Logout user
   */
  static async logout(refreshToken?: string) {
    if (refreshToken) {
      // Remove refresh token from database
      await User.findOneAndUpdate(
        { refreshToken },
        { $unset: { refreshToken: 1 } }
      )
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(userId: string) {
    const user = await User.findById(userId).select('-password -refreshToken')

    if (!user) {
      throw new AppError(404, 'User not found')
    }

    return user
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, data: { name: string }) {
    const { name } = data

    if (!name) {
      throw new AppError(400, 'Name is required')
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true, runValidators: true }
    ).select('-password -refreshToken')

    if (!user) {
      throw new AppError(404, 'User not found')
    }

    return user
  }
}
