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
      partitioned?: boolean
    } = {}
  ) {
    const defaultOptions: any = {
      maxAge: config.COOKIE_MAX_AGE,
      httpOnly: config.COOKIE_HTTP_ONLY,
      secure: config.COOKIE_SECURE,
      sameSite: config.COOKIE_SAME_SITE,
      path: '/', // Ensure cookie is available for all paths
    }

    // Add partitioned attribute for cross-site cookies in Chrome
    // This is required for third-party cookies in embedded contexts
    if (config.COOKIE_SAME_SITE === 'none' && config.COOKIE_SECURE) {
      defaultOptions.partitioned = true
    }

    res.cookie(name, value, { ...defaultOptions, ...options })
  }

  static clearCookie(res: Response, name: string) {
    const clearOptions: any = {
      httpOnly: config.COOKIE_HTTP_ONLY,
      secure: config.COOKIE_SECURE,
      sameSite: config.COOKIE_SAME_SITE,
      path: '/', // Must match the path used when setting the cookie
    }

    // Add partitioned attribute if it was used when setting
    if (config.COOKIE_SAME_SITE === 'none' && config.COOKIE_SECURE) {
      clearOptions.partitioned = true
    }

    res.clearCookie(name, clearOptions)
  }
}
