// Stub Sprint 8 — Table "responses" supprimée du schéma
// Remplacée par phase_responses
// Voir issue #114 (US-BEN-03+04)
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: 'Non implémenté', code: 'NOT_IMPLEMENTED' }, { status: 501 })
}

export async function POST() {
  return NextResponse.json({ error: 'Non implémenté', code: 'NOT_IMPLEMENTED' }, { status: 501 })
}
