// Stub Sprint 8 — Route à implémenter en Sprint 9
// Voir issue #126 (US-ADM-03+04)
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: 'Non implémenté', code: 'NOT_IMPLEMENTED' }, { status: 501 })
}

export async function PATCH() {
  return NextResponse.json({ error: 'Non implémenté', code: 'NOT_IMPLEMENTED' }, { status: 501 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Non implémenté', code: 'NOT_IMPLEMENTED' }, { status: 501 })
}
