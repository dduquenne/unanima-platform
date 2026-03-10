import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'omega',
    timestamp: new Date().toISOString(),
  })
}
