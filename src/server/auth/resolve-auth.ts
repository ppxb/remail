import type { AuthIdentity, AuthResolution } from './types'
import process from 'node:process'
import { parseRoles } from './permissions'
import { ANONYMOUS_IDENTITY } from './types'

const DEV_SESSION_USER_ID_HEADER = 'x-dev-user-id'
const DEV_SESSION_ROLES_HEADER = 'x-dev-user-roles'
const DEV_API_KEY_USER_ID_HEADER = 'x-api-user-id'
const DEV_API_KEY_ROLES_HEADER = 'x-api-user-roles'
const DEV_API_KEY_ID_HEADER = 'x-api-key-id'
const DEV_API_KEY_ENV = 'REMAIL_DEV_API_KEY'

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return {}
  }

  return cookieHeader
    .split(';')
    .reduce<Record<string, string>>((acc, chunk) => {
      const i = chunk.indexOf('=')
      if (i <= 0) {
        return acc
      }
      const key = chunk.slice(0, i).trim()
      const value = chunk.slice(i + 1).trim()
      acc[key] = decodeURIComponent(value)
      return acc
    }, {})
}

function readHeaderOrCookie(request: Request, cookies: Record<string, string>, headerName: string, cookieName: string) {
  return request.headers.get(headerName)?.trim() || cookies[cookieName]?.trim() || null
}

function resolveSessionIdentity(request: Request, cookies: Record<string, string>): AuthIdentity | null {
  const userId = readHeaderOrCookie(request, cookies, DEV_SESSION_USER_ID_HEADER, 'remail_user_id')

  if (!userId) {
    return null
  }

  return {
    source: 'session',
    isAuthenticated: true,
    userId,
    roles: parseRoles(readHeaderOrCookie(request, cookies, DEV_SESSION_ROLES_HEADER, 'remail_user_roles')),
    apiKeyId: null,
  }
}

function resolveApiKeyIdentity(request: Request, cookies: Record<string, string>): AuthIdentity | null {
  const apiKey = request.headers.get('x-api-key')?.trim()
  if (!apiKey) {
    return null
  }

  const expectedApiKey = process.env[DEV_API_KEY_ENV]?.trim()
  if (expectedApiKey && apiKey !== expectedApiKey) {
    return null
  }

  const userId = readHeaderOrCookie(request, cookies, DEV_API_KEY_USER_ID_HEADER, 'remail_api_user_id')
  if (!userId) {
    return null
  }

  return {
    source: 'api_key',
    isAuthenticated: true,
    userId,
    roles: parseRoles(readHeaderOrCookie(request, cookies, DEV_API_KEY_ROLES_HEADER, 'remail_api_user_roles')),
    apiKeyId: readHeaderOrCookie(request, cookies, DEV_API_KEY_ID_HEADER, '') || apiKey.slice(0, 12),
  }
}

export async function resolveRequestAuth(request: Request): Promise<AuthResolution> {
  const cookies = parseCookieHeader(request.headers.get('cookie'))
  const usedApiKey = Boolean(request.headers.get('x-api-key')?.trim())

  if (usedApiKey) {
    const identity = resolveApiKeyIdentity(request, cookies)
    return {
      identity: identity ?? ANONYMOUS_IDENTITY,
      usedApiKey: true,
      invalidApiKey: !identity,
    }
  }

  return {
    identity: resolveSessionIdentity(request, cookies) ?? ANONYMOUS_IDENTITY,
    usedApiKey: false,
    invalidApiKey: false,
  }
}
