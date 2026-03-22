# Sprint 3 — Schémas BDD métier + API CRUD par application

**Projet :** Roadmap Unanima Platform
**Période :** 2026-04-20 → 2026-05-03
**Objectif :** Créer les tables métier, les politiques RLS et les endpoints API CRUD pour chaque application.

---

## Phase 1 — Modélisation et migrations SQL (séquentiel par app, parallélisable entre apps)

Chaque app a son propre projet Supabase. Les migrations sont indépendantes.

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| ✅ 1 | Schéma BDD Links : `beneficiaires`, `bilans`, `questionnaires`, `questions`, `responses`, `documents` | 🔴 Critique | databasix, archicodix, projetix | Sprint 2 | Fait (2026-03-20) |
| ✅ 2 | Schéma BDD CREAI : `etablissements`, `diagnostics`, `indicateurs`, `rapports`, `recommandations` | 🔴 Critique | databasix, archicodix, projetix | Sprint 2 | Fait (2026-03-20) |
| ✅ 3 | Schéma BDD Omega : `interventions`, `affectations`, `pieces_detachees`, `kpis_sav`, `clients_vehicules` | 🔴 Critique | databasix, archicodix, projetix | Sprint 2 | Fait (2026-03-20) |

**Détail issue #1 — Schéma Links :**
```sql
-- Tables principales
beneficiaires (id, profile_id FK, consultant_id FK, statut, metadata, created_at, updated_at)
bilans (id, beneficiaire_id FK, type, statut, date_debut, date_fin, created_at, updated_at)
questionnaires (id, titre, description, version, is_active, created_at)
questions (id, questionnaire_id FK, ordre, texte, type, options JSONB, required)
responses (id, bilan_id FK, question_id FK, valeur JSONB, created_at)
documents (id, beneficiaire_id FK, bilan_id FK, nom, type, storage_path, uploaded_by, created_at)
```
- RLS : bénéficiaire voit ses propres données, consultant voit ses bénéficiaires assignés, super_admin voit tout
- Index sur `beneficiaire_id`, `consultant_id`, `bilan_id`, `statut`
- Triggers `updated_at` automatiques

**Détail issue #2 — Schéma CREAI :**
```sql
-- Tables principales
etablissements (id, nom, type, adresse, siret, capacite, statut, metadata JSONB, created_at, updated_at)
diagnostics (id, etablissement_id FK, auteur_id FK, date_diagnostic, statut, synthese TEXT, created_at, updated_at)
indicateurs (id, etablissement_id FK, categorie, nom, valeur NUMERIC, unite, periode, created_at)
rapports (id, diagnostic_id FK, titre, contenu JSONB, statut, date_publication, created_at, updated_at)
recommandations (id, diagnostic_id FK, priorite, description, statut, echeance, created_at, updated_at)
```
- RLS : professionnel voit son établissement, coordonnateur voit ses établissements assignés, direction/admin voit tout
- Index sur `etablissement_id`, `auteur_id`, `statut`, `categorie`

**Détail issue #3 — Schéma Omega :**
```sql
-- Tables principales
clients_vehicules (id, raison_sociale, contact, vehicule_marque, vehicule_modele, immatriculation, vin, metadata JSONB, created_at, updated_at)
interventions (id, client_vehicule_id FK, technicien_id FK, type, statut, priorite, description, date_planifiee, date_debut, date_fin, created_at, updated_at)
affectations (id, intervention_id FK, technicien_id FK, responsable_id FK, date_affectation, commentaire, created_at)
pieces_detachees (id, reference, designation, stock_actuel INT, seuil_alerte INT, prix_unitaire NUMERIC, created_at, updated_at)
kpis_sav (id, periode DATE, type, valeur NUMERIC, objectif NUMERIC, metadata JSONB, created_at)
```
- RLS : technicien voit ses interventions, responsable SAV voit tout, opérateur voit ses propres données
- Index sur `technicien_id`, `statut`, `priorite`, `client_vehicule_id`, `periode`

**Point de contrôle Phase 1 :**
- [x] Migrations SQL créées pour chaque app
- [x] RLS policies définies (admin, rôle standard, rôle restreint)
- [x] Types TypeScript manuels créés (en attendant connexion Supabase)
- [x] Schémas validés

---

## Phase 2 — Génération des types et couche d'accès (parallélisable)

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| ✅ 4 | Générer les types TypeScript Supabase pour les 3 apps | 🟠 Haute | databasix | #1, #2, #3 | Fait (2026-03-20) |
| ✅ 5 | Helpers CRUD métier Links (`src/lib/api/`) | 🟠 Haute | apix, archicodix | #1, #4 | Fait (2026-03-20) |
| ✅ 6 | Helpers CRUD métier CREAI (`src/lib/api/`) | 🟠 Haute | apix, archicodix | #2, #4 | Fait (2026-03-20) |
| ✅ 7 | Helpers CRUD métier Omega (`src/lib/api/`) | 🟠 Haute | apix, archicodix | #3, #4 | Fait (2026-03-20) |

**Détail issues #5/#6/#7 — Helpers CRUD :**
- Pattern commun : utiliser `fetchMany`, `fetchOne`, `insertOne`, `updateOne`, `deleteOne` de `@unanima/db`
- Wrappers typés par entité (ex: `getBeneficiaires(options)`, `createBilan(data)`)
- Validation Zod des entrées
- Gestion d'erreurs standardisée (`DbResult<T>`)
- Logging audit automatique pour les écritures

**Point de contrôle Phase 2 :**
- [x] Types TypeScript compilent sans erreur
- [x] Helpers CRUD typés pour chaque entité principale
- [x] `pnpm build` passe

---

## Phase 3 — Route handlers API (parallélisable par app)

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| ✅ 8 | API Links : `/api/beneficiaires`, `/api/bilans`, `/api/documents` | 🟠 Haute | apix, securix | #5 | Fait (2026-03-20) |
| ✅ 9 | API CREAI : `/api/etablissements`, `/api/diagnostics`, `/api/rapports` | 🟠 Haute | apix, securix | #6 | Fait (2026-03-20) |
| ✅ 10 | API Omega : `/api/interventions`, `/api/affectations`, `/api/pieces` | 🟠 Haute | apix, securix | #7 | Fait (2026-03-20) |
| ✅ 11 | Tests unitaires des route handlers — 3 apps | 🟡 Moyenne | testix | #8, #9, #10 | Fait (2026-03-20) |

**Détail issues #8/#9/#10 — Route handlers :**
- Pattern REST standard : `GET` (liste paginée), `GET /[id]` (détail), `POST` (création), `PATCH /[id]` (mise à jour), `DELETE /[id]`
- Validation Zod du body pour POST/PATCH
- Vérification des permissions via `hasPermission()` de `@unanima/auth`
- Pagination : `?page=1&limit=20&sort=created_at&order=desc`
- Filtrage : `?statut=en_cours&search=dupont`
- Réponse standardisée : `{ data, meta: { total, page, limit } }` ou `{ error, code }`

**Point de contrôle Phase 3 :**
- [x] Endpoints API fonctionnels (testables via curl/Postman)
- [x] Permissions vérifiées (403 si non autorisé)
- [x] Pagination et filtrage fonctionnels
- [x] Tests unitaires couvrent les cas nominaux + erreurs (48 tests)
- [x] `pnpm build` et `pnpm test` passent

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Issues totales | 11 |
| Critiques | 3 (#1, #2, #3) |
| Hautes | 6 (#4, #5, #6, #7, #8, #9, #10) |
| Moyennes | 1 (#11) |
| Chemin critique | #1 → #4 → #5 → #8 → #11 |
| Parallélisme max | 3 (Phase 1: schémas) + 3 (Phase 3: APIs) |
| Effort estimé | ~7-10 jours |

---

## Contraintes d'exécution

- **Base :** `master` (après merge Sprint 2)
- **Build obligatoire** entre chaque phase
- **Tests obligatoires** avant chaque commit
- **⚠️ Revue archicodix obligatoire** pour les schémas BDD (Phase 1)
- **Format commit :** `feat(scope): description (closes #XX)`
- **Scopes :** `db`, `links`, `creai`, `omega`, `api`
- **Chaque migration SQL est irréversible** une fois déployée — vérifier avant commit

---

## Vérification d'exhaustivité
- [x] Toutes les issues du sprint sont listées ci-dessus (11/11)
- [x] Aucune issue n'a été omise ou reportée sans justification
- [x] L'ordre respecte la règle sécurité > features > mineurs

---

## Rapport d'exécution

**Date d'exécution :** Sprint 3 implémenté et mergé (commit `81f5670`)
**Issues traitées :** 11/11 (100%)
**Commit de merge :** `81f5670` — feat: Sprint 3 — Schémas BDD métier, CRUD helpers et API REST pour les 3 apps (#79)

| # | Issue | Résultat |
|---|-------|----------|
| 1 | Schéma BDD Links (6 tables) | ✅ beneficiaires, bilans, questionnaires, questions, responses, documents |
| 2 | Schéma BDD CREAI (5 tables) | ✅ etablissements, diagnostics, indicateurs, rapports, recommandations |
| 3 | Schéma BDD Omega (5 tables) | ✅ clients_vehicules, interventions, affectations, pieces_detachees, kpis_sav |
| 4 | Types TypeScript Supabase | ✅ database.ts + schemas.ts + index.ts par app |
| 5 | Helpers CRUD Links | ✅ 7 modules (beneficiaires, bilans, questionnaires, questions, responses, documents, utils) |
| 6 | Helpers CRUD CREAI | ✅ 6 modules (etablissements, diagnostics, indicateurs, rapports, recommandations, utils) |
| 7 | Helpers CRUD Omega | ✅ 6 modules (interventions, affectations, pieces-detachees, clients-vehicules, kpis-sav, utils) |
| 8 | API Links | ✅ /api/beneficiaires, /api/bilans, /api/documents + [id] routes |
| 9 | API CREAI | ✅ /api/etablissements, /api/diagnostics, /api/rapports + [id] routes |
| 10 | API Omega | ✅ /api/interventions, /api/affectations, /api/pieces + [id] routes |
| 11 | Tests unitaires | ✅ schemas.test.ts + domain tests per app |

### Métriques de qualité
- Build : ✅ (9/9 tasks, FULL TURBO)
- Tests : ✅ (228 tests, 100% passent)
- Lint : ✅
- CVE HIGH : 0
