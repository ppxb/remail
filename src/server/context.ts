import type { AppRequestContext, AuthResolution } from '@/server/auth/types'

export function createRequestContext(pathname: string, auth: AuthResolution): AppRequestContext {
  return {
    requestId: crypto.randomUUID(),
    pathname,
    receivedAt: new Date().toISOString(),
    auth: auth.identity,
    authMeta: {
      usedApiKey: auth.usedApiKey,
      invalidApiKey: auth.invalidApiKey,
    },
  }
}
