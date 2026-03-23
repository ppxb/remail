import type { Role } from './permissions'

export type AuthSource = 'anonymous' | 'session' | 'api_key'

export interface AuthIdentity {
  source: AuthSource
  isAuthenticated: boolean
  userId: string | null
  roles: Role[]
  apiKeyId: string | null
}

export interface AuthResolution {
  identity: AuthIdentity
  usedApiKey: boolean
  invalidApiKey: boolean
}

export interface AppRequestContext {
  requestId: string
  pathname: string
  receivedAt: string
  auth: AuthIdentity
  authMeta: {
    usedApiKey: boolean
    invalidApiKey: boolean
  }
}

export const ANONYMOUS_IDENTITY: Readonly<AuthIdentity> = Object.freeze({
  source: 'anonymous',
  isAuthenticated: false,
  userId: null,
  roles: [],
  apiKeyId: null,
})
