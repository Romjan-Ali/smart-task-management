// backend/src/constants/roles.ts
export const ROLES = {
  ADMIN: 'admin' as const,
  MANAGER: 'manager' as const,
  MEMBER: 'member' as const,
} as const

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.MEMBER]: 1,
}

export type UserRole = keyof typeof ROLES