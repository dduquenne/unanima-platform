import { NextResponse } from 'next/server'
import { createAdminClient } from '@unanima/db'

export async function GET() {
  const timestamp = new Date().toISOString()

  // Check environment variables
  const envCheck = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  const missingVars = Object.entries(envCheck)
    .filter(([, ok]) => !ok)
    .map(([name]) => name)

  if (missingVars.length > 0) {
    return NextResponse.json(
      {
        status: 'error',
        app: 'creai',
        timestamp,
        database: {
          connected: false,
          error: `Missing environment variables: ${missingVars.join(', ')}`,
        },
      },
      { status: 503 },
    )
  }

  // Test database connectivity
  const start = performance.now()
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('profiles').select('id').limit(1)
    const latencyMs = Math.round(performance.now() - start)

    if (error) {
      return NextResponse.json(
        {
          status: 'degraded',
          app: 'creai',
          timestamp,
          database: {
            connected: false,
            latencyMs,
            error: error.message,
          },
        },
        { status: 503 },
      )
    }

    return NextResponse.json({
      status: 'ok',
      app: 'creai',
      timestamp,
      database: {
        connected: true,
        latencyMs,
      },
    })
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start)
    return NextResponse.json(
      {
        status: 'error',
        app: 'creai',
        timestamp,
        database: {
          connected: false,
          latencyMs,
          error: err instanceof Error ? err.message : 'Unknown error',
        },
      },
      { status: 503 },
    )
  }
}
