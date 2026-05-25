import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { createClerkClient } from '@clerk/backend'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export const requireClerkAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const request = getRequest()
    const token = request?.headers?.get('authorization')?.replace('Bearer ', '') ?? null

    if (!token) throw new Error('Unauthorized: No token provided')

    const { sub: userId } = await clerk.verifyToken(token)
    if (!userId) throw new Error('Unauthorized: Invalid token')

    return next({ context: { userId } })
  },
)
