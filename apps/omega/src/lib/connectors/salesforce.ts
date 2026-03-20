/**
 * POC Connecteur Salesforce — Lecture seule
 *
 * Authentification : OAuth 2.0 Client Credentials
 * Objets lus : Account (clients), Custom Vehicle object
 * Credentials : via variables d'environnement Vercel (jamais dans le code)
 *
 * IMPORTANT: Ce POC dépend de la disponibilité du sandbox Salesforce.
 * En l'absence de sandbox, les fonctions retournent des données de test.
 */

interface SalesforceConfig {
  instanceUrl: string
  clientId: string
  clientSecret: string
}

interface SalesforceToken {
  access_token: string
  instance_url: string
  token_type: string
}

interface SalesforceAccount {
  Id: string
  Name: string
  Phone: string | null
  BillingCity: string | null
  Industry: string | null
}

interface SalesforceVehicle {
  Id: string
  Name: string
  Account__c: string
  Marque__c: string
  Modele__c: string
  Immatriculation__c: string | null
  VIN__c: string | null
}

export interface SalesforceClientVehicle {
  salesforceAccountId: string
  raisonSociale: string
  contact: string | null
  vehiculeMarque: string
  vehiculeModele: string
  immatriculation: string | null
  vin: string | null
}

function getConfig(): SalesforceConfig {
  const instanceUrl = process.env.SALESFORCE_INSTANCE_URL
  const clientId = process.env.SALESFORCE_CLIENT_ID
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET

  if (!instanceUrl || !clientId || !clientSecret) {
    throw new Error(
      'Variables Salesforce manquantes : SALESFORCE_INSTANCE_URL, SALESFORCE_CLIENT_ID, SALESFORCE_CLIENT_SECRET',
    )
  }

  return { instanceUrl, clientId, clientSecret }
}

async function authenticate(config: SalesforceConfig): Promise<SalesforceToken> {
  const res = await fetch(`${config.instanceUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Salesforce auth failed: ${res.status} — ${text}`)
  }

  return res.json()
}

async function query<T>(token: SalesforceToken, soql: string): Promise<T[]> {
  const url = `${token.instance_url}/services/data/v59.0/query?q=${encodeURIComponent(soql)}`
  const res = await fetch(url, {
    headers: { Authorization: `${token.token_type} ${token.access_token}` },
  })

  if (!res.ok) {
    throw new Error(`Salesforce query failed: ${res.status}`)
  }

  const data = await res.json()
  return data.records as T[]
}

export async function fetchClientsVehicules(): Promise<SalesforceClientVehicle[]> {
  try {
    const config = getConfig()
    const token = await authenticate(config)

    const accounts = await query<SalesforceAccount>(
      token,
      "SELECT Id, Name, Phone, BillingCity, Industry FROM Account WHERE IsDeleted = false LIMIT 200",
    )

    const vehicles = await query<SalesforceVehicle>(
      token,
      "SELECT Id, Name, Account__c, Marque__c, Modele__c, Immatriculation__c, VIN__c FROM Vehicle__c LIMIT 500",
    )

    const accountMap = new Map(accounts.map((a) => [a.Id, a]))

    return vehicles.map((v) => {
      const account = accountMap.get(v.Account__c)
      return {
        salesforceAccountId: v.Account__c,
        raisonSociale: account?.Name ?? 'Inconnu',
        contact: account?.Phone ?? null,
        vehiculeMarque: v.Marque__c,
        vehiculeModele: v.Modele__c,
        immatriculation: v.Immatriculation__c ?? null,
        vin: v.VIN__c ?? null,
      }
    })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Variables Salesforce manquantes')) {
      return getMockData()
    }
    throw err
  }
}

function getMockData(): SalesforceClientVehicle[] {
  return [
    {
      salesforceAccountId: 'SF-001',
      raisonSociale: 'Garage Martin (mock)',
      contact: '01 23 45 67 89',
      vehiculeMarque: 'Renault',
      vehiculeModele: 'Clio V',
      immatriculation: 'AA-123-BB',
      vin: 'VF1RFE00X12345678',
    },
    {
      salesforceAccountId: 'SF-002',
      raisonSociale: 'Auto Services Dupont (mock)',
      contact: '01 98 76 54 32',
      vehiculeMarque: 'Peugeot',
      vehiculeModele: '308',
      immatriculation: 'CC-456-DD',
      vin: 'VF3LCBHXWJS123456',
    },
  ]
}

export async function testConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const config = getConfig()
    await authenticate(config)
    return { connected: true, message: 'Connexion Salesforce OK' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    if (message.includes('Variables Salesforce manquantes')) {
      return { connected: false, message: 'Credentials Salesforce non configurés (mode mock actif)' }
    }
    return { connected: false, message }
  }
}
