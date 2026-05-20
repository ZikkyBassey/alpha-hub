import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export const attachSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      return next()
    }

    const request = getRequest()
    const token = request?.headers?.get('authorization')?.replace('Bearer ', '') ?? null

    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    })

    let userId: string | null = null
    let claims: Record<string, unknown> | null = null

    if (token) {
      const { data } = await supabase.auth.getClaims(token)
      if (data?.claims?.sub) {
        userId = data.claims.sub
        claims = data.claims
      }
    }

    return next({ context: { supabase, userId, claims } })
  },
)
