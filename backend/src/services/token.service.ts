import jwt, { type SignOptions } from 'jsonwebtoken'
import config from '../config/env'
import type { TokenPayload } from '../types'

export class TokenService {
  static generateAccessToken(payload: TokenPayload): string {
    if (!config.JWT_ACCESS_SECRET) {
      throw new Error('JWT_ACCESS_SECRET is not defined')
    }

    return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRY as SignOptions['expiresIn'],
    })
  }

  static generateRefreshToken(payload: TokenPayload): string {
    if (!config.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not defined')
    }

    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRY as SignOptions['expiresIn'],
    })
  }

  static verifyAccessToken(token: string): TokenPayload {
    if (!config.JWT_ACCESS_SECRET) {
      throw new Error('JWT_ACCESS_SECRET is not defined')
    }

    return jwt.verify(token, config.JWT_ACCESS_SECRET) as TokenPayload
  }

  static verifyRefreshToken(token: string): TokenPayload {
    if (!config.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not defined')
    }

    return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload
    } catch {
      return null
    }
  }
}
