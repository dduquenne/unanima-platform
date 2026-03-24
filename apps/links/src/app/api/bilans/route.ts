// Stub Sprint 8 — Table "bilans" supprimée du schéma
// Remplacée par phase_responses + phase_validations
// Voir issues Sprint 9 (US-BEN-03+04, US-BEN-05+06)
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ data: [], meta: { total: 0 } })
}

export async function POST() {
  return NextResponse.json({ error: 'Non implémenté', code: 'NOT_IMPLEMENTED' }, { status: 501 })
}
