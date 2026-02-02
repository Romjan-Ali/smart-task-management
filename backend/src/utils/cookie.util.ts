// backend/src/utils/cookie.util.ts
import type { Response } from 'express'
import config from '../config/env'

export class CookieUtil {
  static setCookie(
    res: Response,
    name: string,
    value: string,
    options: {
      maxAge?: number
      httpOnly?: boolean
      secure?: boolean
      sameSite?: 'strict' | 'lax' | 'none'
    } = {}
  ) {
    const defaultOptions = {
      maxAge: config.COOKIE_MAX_AGE,
      httpOnly: config.COOKIE_HTTP_ONLY,
      secure: config.COOKIE_SECURE,
      sameSite: config.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none',
    }

    res.cookie(name, value, { ...defaultOptions, ...options })
  }

  static clearCookie(res: Response, name: string) {
    res.clearCookie(name, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    })
  }
}
