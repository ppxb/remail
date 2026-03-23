import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: ({ context }) =>
        Response.json({
          ok: true,
          service: 'remail',
          requestId: context.requestId,
          receivedAt: context.receivedAt,
          auth: {
            source: context.auth.source,
            isAuthenticated: context.auth.isAuthenticated,
          },
        }),
    },
  },
})
