import { createClient } from '@supabase/supabase-js'

interface RateLimitOptions {
  supabaseUrl: string
  supabaseServiceRoleKey: string
}

interface RateLimitCheck {
  key: string
  maxRequests: number
  windowSeconds: number
}

export async function checkRateLimit(
  { supabaseUrl, supabaseServiceRoleKey }: RateLimitOptions,
  { key, maxRequests, windowSeconds }: RateLimitCheck
): Promise<{ allowed: boolean; error: Error | null }> {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  const { data, error } = await supabase.rpc('check_rate_limit', {
    rate_key: key,
    max_requests: maxRequests,
    window_seconds: windowSeconds,
  })

  if (error) {
    return { allowed: false, error: new Error(error.message) }
  }

  return { allowed: data as boolean, error: null }
}
