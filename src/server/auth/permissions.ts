export const ROLES = {
  EMPEROR: 'emperor',
  DUKE: 'duke',
  KNIGHT: 'knight',
  CIVILIAN: 'civilian',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const PERMISSIONS = {
  MANAGE_EMAIL: 'manage_email',
  MANAGE_WEBHOOK: 'manage_webhook',
  PROMOTE_USER: 'promote_user',
  MANAGE_CONFIG: 'manage_config',
  MANAGE_API_KEY: 'manage_api_key',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [ROLES.EMPEROR]: Object.values(PERMISSIONS),
  [ROLES.DUKE]: [
    PERMISSIONS.MANAGE_EMAIL,
    PERMISSIONS.MANAGE_WEBHOOK,
    PERMISSIONS.MANAGE_API_KEY,
  ],
  [ROLES.KNIGHT]: [
    PERMISSIONS.MANAGE_EMAIL,
    PERMISSIONS.MANAGE_WEBHOOK,
  ],
  [ROLES.CIVILIAN]: [],
}

export const API_PERMISSION_RULES = [
  { prefix: '/api/emails', permission: PERMISSIONS.MANAGE_EMAIL },
  { prefix: '/api/webhook', permission: PERMISSIONS.MANAGE_WEBHOOK },
  { prefix: '/api/roles/promote', permission: PERMISSIONS.PROMOTE_USER },
  { prefix: '/api/config', permission: PERMISSIONS.MANAGE_CONFIG },
  { prefix: '/api/api-keys', permission: PERMISSIONS.MANAGE_API_KEY },
] as const

export const PUBLIC_API_PREFIXES = [
  '/api/auth',
  '/api/health',
] as const

const ALL_ROLES = new Set<Role>(Object.values(ROLES))

export function isRole(value: string): value is Role {
  return ALL_ROLES.has(value as Role)
}

export function parseRoles(rawRoles: string | null | undefined) {
  if (!rawRoles) {
    return []
  }

  return rawRoles
    .split(',')
    .map(v => v.trim())
    .filter(isRole)
}

export function hasPermission(roles: readonly Role[], permission: Permission) {
  return roles.some(role => ROLE_PERMISSIONS[role].includes(permission))
}

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function getRequiredPermission(pathname: string) {
  return API_PERMISSION_RULES.find(rule => matchesPrefix(pathname, rule.prefix))?.permission ?? null
}

export function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some(prefix => matchesPrefix(pathname, prefix))
}
