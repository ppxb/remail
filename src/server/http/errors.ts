export class HttpError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function unauthorized(message = 'Unauthorized', details?: unknown) {
  return new HttpError(401, 'UNAUTHORIZED', message, details)
}

export function forbidden(message = 'Forbidden', details?: unknown) {
  return new HttpError(403, 'FORBIDDEN', message, details)
}

export function badRequest(message = 'Bad Request', details?: unknown) {
  return new HttpError(400, 'BAD_REQUEST', message, details)
}

export function internalError(message = 'Internal Server Error', details?: unknown) {
  return new HttpError(500, 'INTERNAL_SERVER_ERROR', message, details)
}
