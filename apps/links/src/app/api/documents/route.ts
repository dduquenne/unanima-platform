// Stub Sprint 8 — Table "documents" supprimée du schéma
// Remplacée par phase_documents (admin) + bucket Supabase Storage
// Voir issue #125 (US-ADM-06)
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: 'Non implémenté', code: 'NOT_IMPLEMENTED' }, { status: 501 })
}

export async function POST() {
  return NextResponse.json({ error: 'Non implémenté', code: 'NOT_IMPLEMENTED' }, { status: 501 })
}
