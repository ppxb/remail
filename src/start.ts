import { createMiddleware, createStart } from '@tanstack/react-start'
import { getRequiredPermission, hasPermission, isPublicApiPath } from '@/server/auth/permissions'
import { resolveRequestAuth } from '@/server/auth/resolve-auth'
import { createRequestContext } from '@/server/context'
import { jsonFromHttpError } from '@/server/http/json'
import { forbidden, unauthorized } from './server/http/errors'

const requestContextMiddleware = createMiddleware({ type: 'request' })
  .server(
    async ({ next, pathname, request }) => {
      const authResolution = await resolveRequestAuth(request)
      const context = createRequestContext(pathname, authResolution)
      return next({ context })
    },
  )

const apiAccessMiddleware = createMiddleware({ type: 'request' })
  .middleware([requestContextMiddleware])
  .server(
    async ({ next, pathname, request, context }) => {
      if (!pathname.startsWith('/api') || isPublicApiPath(pathname)) {
        return next()
      }

      if (context.authMeta.invalidApiKey) {
        return jsonFromHttpError(unauthorized('Invalid API key'), context)
      }

      if (!context.auth.isAuthenticated) {
        return jsonFromHttpError(unauthorized(), context)
      }

      if (pathname === '/api/config' && request.method.toUpperCase() === 'GET') {
        return next()
      }

      const requiredPermission = getRequiredPermission(pathname)
      if (!requiredPermission) {
        return next()
      }

      if (!hasPermission(context.auth.roles, requiredPermission)) {
        return jsonFromHttpError(forbidden(), context)
      }
      return next()
    },
  )

export const startInstance = createStart(() => ({
  requestMiddleware: [
    apiAccessMiddleware,
  ],
}))
