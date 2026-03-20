/**
 * POC Connecteur SAP — Lecture seule
 *
 * API REST SAP Business One / RFC
 * Objets lus : Catalogue pièces, niveaux de stock
 * Credentials : via variables d'environnement Vercel
 * Résilience : circuit breaker + retry
 *
 * IMPORTANT: Ce POC dépend de la disponibilité du sandbox SAP.
 * En l'absence de sandbox, les fonctions retournent des données de test.
 */

interface SapConfig {
  baseUrl: string
  companyDb: string
  username: string
  password: string
}

interface SapSession {
  SessionId: string
}

export interface SapPiece {
  reference: string
  designation: string
  stockActuel: number
  seuilAlerte: number
  prixUnitaire: number
}

// --- Circuit Breaker ---

let failures = 0
let lastFailure = 0
const MAX_FAILURES = 3
const RESET_TIMEOUT = 60_000

function isCircuitOpen(): boolean {
  if (failures >= MAX_FAILURES) {
    if (Date.now() - lastFailure > RESET_TIMEOUT) {
      failures = 0
      return false
    }
    return true
  }
  return false
}

function recordFailure() {
  failures++
  lastFailure = Date.now()
}

function recordSuccess() {
  failures = 0
}

// --- Config ---

function getConfig(): SapConfig {
  const baseUrl = process.env.SAP_BASE_URL
  const companyDb = process.env.SAP_COMPANY_DB
  const username = process.env.SAP_USERNAME
  const password = process.env.SAP_PASSWORD

  if (!baseUrl || !companyDb || !username || !password) {
    throw new Error(
      'Variables SAP manquantes : SAP_BASE_URL, SAP_COMPANY_DB, SAP_USERNAME, SAP_PASSWORD',
    )
  }

  return { baseUrl, companyDb, username, password }
}

// --- Auth ---

async function login(config: SapConfig): Promise<SapSession> {
  const res = await fetch(`${config.baseUrl}/b1s/v1/Login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      CompanyDB: config.companyDb,
      UserName: config.username,
      Password: config.password,
    }),
  })

  if (!res.ok) {
    throw new Error(`SAP login failed: ${res.status}`)
  }

  return res.json()
}

// --- Retry helper ---

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await fn()
      recordSuccess()
      return result
    } catch (err) {
      if (attempt === retries) {
        recordFailure()
        throw err
      }
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
    }
  }
  throw new Error('Unreachable')
}

// --- API ---

export async function fetchPiecesDetachees(): Promise<SapPiece[]> {
  if (isCircuitOpen()) {
    return getMockPieces()
  }

  try {
    const config = getConfig()
    const session = await login(config)

    const res = await withRetry(async () => {
      const r = await fetch(`${config.baseUrl}/b1s/v1/Items?$filter=ItemType eq 'I'&$top=500`, {
        headers: {
          Cookie: `B1SESSION=${session.SessionId}`,
        },
      })
      if (!r.ok) throw new Error(`SAP query failed: ${r.status}`)
      return r.json()
    })

    return (res.value ?? []).map((item: Record<string, unknown>) => ({
      reference: String(item.ItemCode ?? ''),
      designation: String(item.ItemName ?? ''),
      stockActuel: Number(item.QuantityOnStock ?? 0),
      seuilAlerte: Number(item.MinimumInventory ?? 0),
      prixUnitaire: Number(item.AvgStdPrice ?? 0),
    }))
  } catch (err) {
    if (err instanceof Error && err.message.includes('Variables SAP manquantes')) {
      return getMockPieces()
    }
    throw err
  }
}

function getMockPieces(): SapPiece[] {
  return [
    { reference: 'FIL-001', designation: 'Filtre à huile (mock)', stockActuel: 45, seuilAlerte: 10, prixUnitaire: 12.50 },
    { reference: 'PLQ-002', designation: 'Plaquettes de frein (mock)', stockActuel: 8, seuilAlerte: 15, prixUnitaire: 35.00 },
    { reference: 'BAT-003', designation: 'Batterie 12V (mock)', stockActuel: 3, seuilAlerte: 5, prixUnitaire: 89.90 },
    { reference: 'BOU-004', designation: 'Bougie allumage (mock)', stockActuel: 120, seuilAlerte: 20, prixUnitaire: 8.50 },
  ]
}

export async function testConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const config = getConfig()
    await login(config)
    return { connected: true, message: 'Connexion SAP OK' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    if (message.includes('Variables SAP manquantes')) {
      return { connected: false, message: 'Credentials SAP non configurés (mode mock actif)' }
    }
    return { connected: false, message }
  }
}
