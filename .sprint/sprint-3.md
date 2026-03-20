# Sprint 3 — Schémas BDD métier + API CRUD par application

**Projet :** Roadmap Unanima Platform
**Période :** 2026-04-20 → 2026-05-03
**Objectif :** Créer les tables métier, les politiques RLS et les endpoints API CRUD pour chaque application.
**Vélocité de référence :** Sprint 1 = 7 issues/3 jours, Sprint 2 = 12 issues/5 jours

---

## Pré-requis (vérifier avant démarrage)

- [ ] Sprint 2 mergé dans `master` (Next.js 15, Auth UI, Layouts)
- [ ] Auth pages fonctionnelles sur les 3 apps (login, reset-password, callback)
- [ ] Middleware de protection des routes actif
- [ ] Accès aux 3 projets Supabase (credentials dans `.env.local`)
- [ ] `pnpm build` et `pnpm test` passent sur `master`

---

## Phase 1 — Modélisation et migrations SQL (séquentiel par app, parallélisable entre apps)

Chaque app a son propre projet Supabase. Les migrations sont indépendantes.

| Ordre | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|----------|--------|--------|-----------|--------|
| 1 | Schéma BDD Links : `beneficiaires`, `bilans`, `questionnaires`, `questions`, `responses`, `documents` | 🔴 Critique | L | databasix, archicodix, projetix | Sprint 2 | ⚠️ Revue archicodix |
| 2 | Schéma BDD CREAI : `etablissements`, `diagnostics`, `indicateurs`, `rapports`, `recommandations` | 🔴 Critique | L | databasix, archicodix, projetix | Sprint 2 | ⚠️ Revue archicodix |
| 3 | Schéma BDD Omega : `interventions`, `affectations`, `pieces_detachees`, `kpis_sav`, `clients_vehicules` | 🔴 Critique | L | databasix, archicodix, projetix | Sprint 2 | ⚠️ Revue archicodix |

### Détail tâche #1 — Schéma Links

**Fichiers à créer :**
- `packages/db/migrations/005_links_beneficiaires.sql`
- `packages/db/migrations/006_links_bilans.sql`
- `packages/db/migrations/007_links_questionnaires.sql`
- `packages/db/migrations/008_links_documents.sql`

```sql
-- Tables principales
beneficiaires (id UUID PK, profile_id FK profiles, consultant_id FK profiles, statut TEXT, metadata JSONB, created_at, updated_at)
bilans (id UUID PK, beneficiaire_id FK, type TEXT, statut TEXT, date_debut DATE, date_fin DATE, created_at, updated_at)
questionnaires (id UUID PK, titre TEXT, description TEXT, version INT, is_active BOOLEAN, created_at)
questions (id UUID PK, questionnaire_id FK, ordre INT, texte TEXT, type TEXT, options JSONB, required BOOLEAN)
responses (id UUID PK, bilan_id FK, question_id FK, valeur JSONB, created_at)
documents (id UUID PK, beneficiaire_id FK, bilan_id FK, nom TEXT, type TEXT, storage_path TEXT, uploaded_by UUID, created_at)
```

**RLS :**
- Bénéficiaire : SELECT/UPDATE sur ses propres données (`profile_id = auth.uid()`)
- Consultant : SELECT sur ses bénéficiaires assignés (`consultant_id = auth.uid()`)
- Super_admin : SELECT/INSERT/UPDATE/DELETE sur tout

**Index :**
- `beneficiaires(consultant_id)`, `beneficiaires(statut)`
- `bilans(beneficiaire_id)`, `bilans(statut)`
- `responses(bilan_id, question_id)` UNIQUE
- `documents(beneficiaire_id)`, `documents(bilan_id)`

**Triggers :** `updated_at = now()` sur beneficiaires, bilans

**Rollback :** Chaque migration inclut un bloc `-- ROLLBACK: DROP TABLE IF EXISTS ... CASCADE;` en commentaire

**Critères d'acceptation :**
```gherkin
Feature: Schéma BDD Links
  Scenario: Tables créées avec contraintes
    Given la migration 005-008 est appliquée
    Then les tables beneficiaires, bilans, questionnaires, questions, responses, documents existent
    And chaque FK a une contrainte ON DELETE appropriée (CASCADE ou RESTRICT)
    And les index sont créés

  Scenario: RLS bénéficiaire ne voit que ses données
    Given un bénéficiaire connecté
    When il exécute SELECT * FROM beneficiaires
    Then il ne voit que les lignes où profile_id = son auth.uid()

  Scenario: Consultant voit ses bénéficiaires assignés
    Given un consultant connecté
    When il exécute SELECT * FROM beneficiaires
    Then il ne voit que les lignes où consultant_id = son auth.uid()
```

### Détail tâche #2 — Schéma CREAI

**Fichiers à créer :**
- `packages/db/migrations/009_creai_etablissements.sql`
- `packages/db/migrations/010_creai_diagnostics.sql`
- `packages/db/migrations/011_creai_indicateurs.sql`

```sql
etablissements (id UUID PK, nom TEXT, type TEXT, adresse TEXT, siret TEXT, capacite INT, statut TEXT, metadata JSONB, created_at, updated_at)
diagnostics (id UUID PK, etablissement_id FK, auteur_id FK profiles, date_diagnostic DATE, statut TEXT, synthese TEXT, created_at, updated_at)
indicateurs (id UUID PK, etablissement_id FK, categorie TEXT, nom TEXT, valeur NUMERIC, unite TEXT, periode TEXT, created_at)
rapports (id UUID PK, diagnostic_id FK, titre TEXT, contenu JSONB, statut TEXT, date_publication DATE, created_at, updated_at)
recommandations (id UUID PK, diagnostic_id FK, priorite TEXT, description TEXT, statut TEXT, echeance DATE, created_at, updated_at)
```

**RLS :**
- Professionnel : SELECT sur son établissement
- Coordonnateur : SELECT sur ses établissements assignés
- Direction/admin : SELECT/INSERT/UPDATE/DELETE sur tout

**Critères d'acceptation :**
```gherkin
Feature: Schéma BDD CREAI
  Scenario: Coordonnateur accède aux diagnostics de ses établissements
    Given un coordonnateur assigné à l'établissement "EHPAD Les Lilas"
    When il exécute SELECT * FROM diagnostics
    Then il voit les diagnostics de "EHPAD Les Lilas"
    And il ne voit pas les diagnostics d'autres établissements
```

### Détail tâche #3 — Schéma Omega

**Fichiers à créer :**
- `packages/db/migrations/012_omega_clients_vehicules.sql`
- `packages/db/migrations/013_omega_interventions.sql`
- `packages/db/migrations/014_omega_pieces_detachees.sql`
- `packages/db/migrations/015_omega_kpis_sav.sql`

```sql
clients_vehicules (id UUID PK, raison_sociale TEXT, contact TEXT, vehicule_marque TEXT, vehicule_modele TEXT, immatriculation TEXT, vin TEXT UNIQUE, metadata JSONB, created_at, updated_at)
interventions (id UUID PK, client_vehicule_id FK, technicien_id FK profiles, type TEXT, statut TEXT, priorite TEXT, description TEXT, date_planifiee DATE, date_debut TIMESTAMPTZ, date_fin TIMESTAMPTZ, created_at, updated_at)
affectations (id UUID PK, intervention_id FK, technicien_id FK profiles, responsable_id FK profiles, date_affectation TIMESTAMPTZ, commentaire TEXT, created_at)
pieces_detachees (id UUID PK, reference TEXT UNIQUE, designation TEXT, stock_actuel INT, seuil_alerte INT, prix_unitaire NUMERIC(10,2), created_at, updated_at)
kpis_sav (id UUID PK, periode DATE, type TEXT, valeur NUMERIC, objectif NUMERIC, metadata JSONB, created_at)
```

**RLS :**
- Technicien : SELECT sur ses interventions (`technicien_id = auth.uid()`)
- Responsable SAV : SELECT/INSERT/UPDATE/DELETE sur tout
- Opérateur : SELECT sur les pièces et KPIs

**Critères d'acceptation :**
```gherkin
Feature: Schéma BDD Omega
  Scenario: Technicien ne voit que ses interventions
    Given un technicien connecté
    When il exécute SELECT * FROM interventions
    Then il ne voit que les interventions où technicien_id = son auth.uid()

  Scenario: Alerte stock pièces détachées
    Given une pièce avec stock_actuel = 3 et seuil_alerte = 5
    Then la pièce apparaît dans les alertes stock
```

### Point de contrôle Phase 1

- [ ] Migrations SQL appliquées sur chaque projet Supabase (3 projets)
- [ ] RLS policies testées manuellement (admin, rôle standard, rôle restreint)
- [ ] Types TypeScript générés (`pnpm generate:types --filter=@unanima/links` etc.)
- [ ] Revue archicodix validée pour chaque schéma
- [ ] `pnpm build` passe pour les 3 apps

---

## Phase 2 — Génération des types et couche d'accès (parallélisable)

| Ordre | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|----------|--------|--------|-----------|--------|
| 4 | Générer les types TypeScript Supabase pour les 3 apps | 🟠 Haute | S | databasix | #1, #2, #3 | — |
| 5 | Helpers CRUD métier Links (`apps/links/src/lib/api/`) | 🟠 Haute | M | apix, archicodix | #1, #4 | — |
| 6 | Helpers CRUD métier CREAI (`apps/creai/src/lib/api/`) | 🟠 Haute | M | apix, archicodix | #2, #4 | — |
| 7 | Helpers CRUD métier Omega (`apps/omega/src/lib/api/`) | 🟠 Haute | M | apix, archicodix | #3, #4 | — |

### Détail tâche #4 — Types Supabase

**Commandes :**
```bash
pnpm generate:types --filter=@unanima/links
pnpm generate:types --filter=@unanima/creai
pnpm generate:types --filter=@unanima/omega
```

**Fichiers générés :**
- `apps/links/src/lib/database.types.ts`
- `apps/creai/src/lib/database.types.ts`
- `apps/omega/src/lib/database.types.ts`

### Détail tâches #5/#6/#7 — Helpers CRUD

**Fichiers à créer (Links) :**
- `apps/links/src/lib/api/beneficiaires.ts` — `getBeneficiaires`, `getBeneficiaire`, `createBeneficiaire`, `updateBeneficiaire`
- `apps/links/src/lib/api/bilans.ts` — `getBilans`, `getBilan`, `createBilan`, `updateBilan`
- `apps/links/src/lib/api/questionnaires.ts` — `getQuestionnaires`, `getQuestionnaire`
- `apps/links/src/lib/api/documents.ts` — `getDocuments`, `uploadDocument`, `deleteDocument`
- `apps/links/src/lib/api/index.ts` — barrel export

**Pattern commun :**
```typescript
// Utilise @unanima/db helpers
import { fetchMany, fetchOne, insertOne, updateOne } from '@unanima/db'
import { z } from 'zod'

// Schéma de validation Zod
const createBeneficiaireSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  consultant_id: z.string().uuid(),
})

// Helper typé
export async function createBeneficiaire(data: z.infer<typeof createBeneficiaireSchema>) {
  const validated = createBeneficiaireSchema.parse(data)
  return insertOne('beneficiaires', validated)
}
```

**Critères d'acceptation :**
```gherkin
Feature: Helpers CRUD
  Scenario: Création d'un bénéficiaire avec validation
    Given des données valides (nom, email, consultant_id)
    When j'appelle createBeneficiaire(data)
    Then le bénéficiaire est créé dans la base
    And la réponse contient l'id et les données

  Scenario: Rejet si données invalides
    Given un email au format invalide
    When j'appelle createBeneficiaire(data)
    Then une ZodError est levée
    And aucune insertion n'est faite
```

### Point de contrôle Phase 2

- [ ] Types TypeScript compilent sans erreur (`pnpm build`)
- [ ] Helpers CRUD typés pour chaque entité principale (4 fichiers/app minimum)
- [ ] Validation Zod en place sur les helpers d'écriture
- [ ] `pnpm build` passe

---

## Phase 3 — Route handlers API (parallélisable par app)

| Ordre | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|----------|--------|--------|-----------|--------|
| 8 | API Links : `/api/beneficiaires`, `/api/bilans`, `/api/documents` | 🟠 Haute | M | apix, securix | #5 | — |
| 9 | API CREAI : `/api/etablissements`, `/api/diagnostics`, `/api/rapports` | 🟠 Haute | M | apix, securix | #6 | — |
| 10 | API Omega : `/api/interventions`, `/api/affectations`, `/api/pieces` | 🟠 Haute | M | apix, securix | #7 | — |
| 11 | Tests unitaires des route handlers — 3 apps | 🟡 Moyenne | M | testix | #8, #9, #10 | — |

### Détail tâches #8/#9/#10 — Route handlers

**Fichiers à créer (Links) :**
- `apps/links/src/app/api/beneficiaires/route.ts` — GET (liste paginée), POST
- `apps/links/src/app/api/beneficiaires/[id]/route.ts` — GET, PATCH, DELETE
- `apps/links/src/app/api/bilans/route.ts` — GET, POST
- `apps/links/src/app/api/bilans/[id]/route.ts` — GET, PATCH, DELETE
- `apps/links/src/app/api/documents/route.ts` — GET, POST
- `apps/links/src/app/api/documents/[id]/route.ts` — GET, DELETE

**Pattern REST standard (Next.js 15 App Router) :**
```typescript
// apps/links/src/app/api/beneficiaires/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@unanima/db'
import { hasPermission } from '@unanima/auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = Number(searchParams.get('page') ?? '1')
  const limit = Number(searchParams.get('limit') ?? '20')
  const sort = searchParams.get('sort') ?? 'created_at'
  const order = searchParams.get('order') ?? 'desc'
  const search = searchParams.get('search')
  const statut = searchParams.get('statut')

  // ... auth check, query, response
  return NextResponse.json({ data, meta: { total, page, limit } })
}
```

**Réponses standardisées :**
- Succès : `{ data: T | T[], meta?: { total, page, limit } }`
- Erreur : `{ error: string, code: string }` avec status HTTP approprié
- 401 si non authentifié, 403 si non autorisé, 400 si validation échoue, 404 si non trouvé

**Critères d'acceptation :**
```gherkin
Feature: API CRUD bénéficiaires
  Scenario: Liste paginée
    Given je suis connecté en tant que consultant
    When j'appelle GET /api/beneficiaires?page=1&limit=10
    Then je reçois 200 avec { data: [...], meta: { total, page: 1, limit: 10 } }

  Scenario: Création avec données valides
    Given je suis connecté en tant que consultant
    When j'appelle POST /api/beneficiaires avec { full_name, email }
    Then je reçois 201 avec le bénéficiaire créé

  Scenario: Accès refusé pour un bénéficiaire non assigné
    Given je suis connecté en tant que consultant A
    When j'appelle GET /api/beneficiaires/{id_d'un_beneficiaire_du_consultant_B}
    Then je reçois 403

  Scenario: Filtrage par statut
    Given 5 bénéficiaires dont 2 actifs
    When j'appelle GET /api/beneficiaires?statut=actif
    Then je reçois 2 résultats
```

### Détail tâche #11 — Tests unitaires

**Fichiers à créer :**
- `apps/links/src/app/api/beneficiaires/__tests__/route.test.ts`
- `apps/links/src/app/api/bilans/__tests__/route.test.ts`
- `apps/creai/src/app/api/etablissements/__tests__/route.test.ts`
- `apps/omega/src/app/api/interventions/__tests__/route.test.ts`

**Couverture minimale :** cas nominal GET/POST/PATCH/DELETE + 401/403/400/404

### Point de contrôle Phase 3

- [ ] Endpoints API fonctionnels (testables via curl/Postman)
- [ ] Permissions vérifiées (401 si non auth, 403 si non autorisé)
- [ ] Pagination : `?page=1&limit=20&sort=created_at&order=desc`
- [ ] Filtrage : `?statut=en_cours&search=dupont`
- [ ] Réponse standardisée `{ data, meta }` ou `{ error, code }`
- [ ] Tests unitaires couvrent les cas nominaux + erreurs (≥ 80% coverage sur les routes)
- [ ] `pnpm build` et `pnpm test` passent

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Issues totales | 11 |
| Critiques | 3 (#1, #2, #3 — schémas BDD) |
| Hautes | 7 (#4-#10 — types, helpers, API) |
| Moyennes | 1 (#11 — tests) |
| Effort total | L (7-10 jours) |
| Chemin critique | #1 → #4 → #5 → #8 → #11 |
| Parallélisme max | 3 (Phase 1: schémas) + 3 (Phase 2: helpers) + 3 (Phase 3: APIs) |
| Vélocité attendue | ~11 issues / 2 semaines (basé sur Sprint 2) |

### Estimations par tâche

| Effort | Tâches | Description |
|--------|--------|-------------|
| S (< 0.5j) | #4 | Génération de types (commande automatisée) |
| M (0.5-1j) | #5, #6, #7, #8, #9, #10, #11 | Helpers CRUD et route handlers |
| L (1-2j) | #1, #2, #3 | Schémas BDD avec RLS et index |

---

## Contraintes d'exécution

- **Base :** `master` (après merge Sprint 2)
- **Build obligatoire** entre chaque phase
- **Tests obligatoires** avant chaque commit
- **⚠️ Revue archicodix obligatoire** pour les schémas BDD (Phase 1)
- **Format commit :** `feat(scope): description`
- **Scopes :** `db`, `links`, `creai`, `omega`, `api`
- **Chaque migration SQL est irréversible** une fois déployée — inclure un commentaire `-- ROLLBACK` en tête
- **Zod obligatoire** pour toute validation d'entrée API

---

## Risques et mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Schéma BDD sous-estimé | Faible | Moyen | Revue archicodix avant application des migrations |
| RLS trop restrictives | Moyenne | Moyen | Tester chaque rôle manuellement après migration |
| Types Supabase désynchronisés | Faible | Fort | Regénérer après chaque modification de schéma |
| Helpers CRUD non typés correctement | Faible | Moyen | Utiliser les types générés, pas de `any` |
| Pagination incohérente entre apps | Moyenne | Faible | Pattern commun documenté + review croisée |
