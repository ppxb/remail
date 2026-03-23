import type { AppRequestContext } from '@/server/auth/types'
import { HttpError, internalError } from '@/server/http/errors'

export function jsonFromHttpError(error: HttpError, context?: Pick<AppRequestContext, 'requestId'>) {
  const body = {
    error: {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined && { details: error.details }),
    },
    ...(context?.requestId && { requestId: context.requestId }),
  }
  return Response.json(body, { status: error.status })
}

export function jsonFromError(error: unknown, context?: Pick<AppRequestContext, 'requestId'>) {
  if (error instanceof HttpError) {
    return jsonFromHttpError(error, context)
  }

  const message = error instanceof Error ? error.message : 'Internal Server Error'
  return jsonFromHttpError(internalError(message), context)
}
