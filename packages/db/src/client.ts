import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient as createSSRBrowserClient, createServerClient as createSSRServerClient } from '@supabase/ssr'

function getEnvVars() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set',
    )
  }

  return { url, anonKey }
}

export function createBrowserClient() {
  const { url, anonKey } = getEnvVars()
  return createSSRBrowserClient(url, anonKey)
}

export function createServerClient(cookieStore: {
  getAll: () => { name: string; value: string }[]
  set: (name: string, value: string, options: Record<string, unknown>) => void
}) {
  const { url, anonKey } = getEnvVars()
  return createSSRServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
        })
      },
    },
  })
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables for admin client',
    )
  }

  return createSupabaseClient(url, serviceRoleKey)
}
