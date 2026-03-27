// Stub Sprint 8 — Route à implémenter en Sprint 9
// Voir issue #123 (US-ADM-02) et #124 (US-ADM-05)
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: 'Non implémenté', code: 'NOT_IMPLEMENTED' }, { status: 501 })
}

export async function POST() {
  return NextResponse.json({ error: 'Non implémenté', code: 'NOT_IMPLEMENTED' }, { status: 501 })
}
