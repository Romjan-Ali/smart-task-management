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
      path?: string
    } = {}
  ) {
    const defaultOptions = {
      maxAge: config.COOKIE_MAX_AGE,
      httpOnly: config.COOKIE_HTTP_ONLY,
      secure: config.COOKIE_SECURE,
      sameSite: config.COOKIE_SAME_SITE,
      path: '/', // Ensure cookie is available for all paths
    }

    res.cookie(name, value, { ...defaultOptions, ...options })
  }

  static clearCookie(res: Response, name: string) {
    res.clearCookie(name, {
      httpOnly: config.COOKIE_HTTP_ONLY,
      secure: config.COOKIE_SECURE,
      sameSite: config.COOKIE_SAME_SITE,
      path: '/', // Must match the path used when setting the cookie
    })
  }
}
