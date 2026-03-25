# CLAUDE.md — Link's Accompagnement

## Vue d'ensemble

Application extranet de suivi des bilans de compétences pour Link's Accompagnement.
Basée sur le socle Unanima (packages partagés @unanima/*).

**Client :** Link's Accompagnement
**Projet Supabase :** `vtycrvrogvfvvdnknyem`
**Framework :** Next.js 14 (App Router)

---

## Structure

```
src/
├── app/
│   ├── (protected)/           ← Routes authentifiées
│   │   ├── admin/             ← Espace super_admin
│   │   │   ├── dashboard/     ← KPIs, supervision, alertes inactivité
│   │   │   ├── utilisateurs/  ← Gestion comptes (CRUD, RGPD, reset mdp)
│   │   │   └── documents/     ← Upload/gestion documents par phase
│   │   ├── consultant/        ← Espace consultant
│   │   │   ├── dashboard/     ← KPIs consultant
│   │   │   └── beneficiaires/ ← Dossiers, planification, comptes-rendus
│   │   ├── dashboard/         ← Dashboard bénéficiaire
│   │   ├── bilans/            ← Questionnaires par phase (1-6)
│   │   ├── documents/         ← Documents phase (téléchargement)
│   │   └── profil/            ← Mes données personnelles
│   ├── api/
│   │   ├── admin/             ← CRUD users, stats, reset-password
│   │   ├── auth/              ← Login, logout, reset-password
│   │   ├── beneficiaires/     ← CRUD bénéficiaires
│   │   ├── bilans/            ← CRUD bilans
│   │   ├── consultant/        ← Bénéficiaires consultant, sessions, notes, export PDF
│   │   ├── documents/         ← Upload, download, suppression
│   │   ├── phase-responses/   ← Autosave réponses
│   │   ├── phase-validations/ ← Validation/dé-validation phases
│   │   ├── rgpd/              ← Export, suppression, cookies
│   │   └── health/            ← Health check
│   └── login/                 ← Page de connexion
├── config/
│   ├── auth.config.ts         ← Rôles, permissions, redirections
│   ├── auth-pages.config.tsx  ← Templates pages auth
│   └── rgpd.config.ts         ← Config RGPD (raison sociale, DPO)
├── lib/
│   ├── api/                   ← Fonctions API (questionnaires, bilans, responses...)
│   ├── types/
│   │   ├── database.ts        ← Types DB (Profile, Questionnaire, PhaseResponse...)
│   │   ├── schemas.ts         ← Schémas Zod (validation entrées/sorties)
│   │   └── index.ts           ← Exports centralisés
│   └── email/                 ← Templates email (bienvenue, reset, notifications)
├── styles/
│   └── theme.css              ← Variables CSS (couleurs, fonts)
└── middleware.ts              ← Protection routes + redirections
```

---

## Rôles et permissions

| Rôle | Accès | Permissions |
|------|-------|-------------|
| `beneficiaire` | Dashboard, bilans, documents, profil | Lecture/écriture propres données |
| `consultant` | Dashboard consultant, dossiers bénéficiaires | Lecture bénéficiaires assignés, écriture CR |
| `super_admin` | Tout + admin | CRUD comptes, upload documents, supervision |

Configuration : `src/config/auth.config.ts`

---

## Tables BDD (Supabase PostgreSQL)

| Table | Description | RLS |
|-------|-------------|-----|
| `profiles` | Extension auth.users (rôle, consultant_id, dates bilan) | Oui |
| `questionnaires` | Templates de questionnaire par phase (1-6) | Oui |
| `questions` | Questions associées aux questionnaires | Oui |
| `phase_responses` | Réponses bénéficiaire (autosave) | Oui |
| `phase_validations` | Statut validation par phase (libre/en_cours/validee) | Oui |
| `sessions` | 6 séances de suivi consultant ↔ bénéficiaire | Oui |
| `session_notes` | Comptes-rendus confidentiels (consultant only) | Oui |
| `phase_documents` | Documents PDF/DOCX par phase (Storage bucket) | Oui |
| `audit_logs` | Journal d'audit RGPD | Oui |

Migrations : `supabase/migrations/001_links_schema.sql`, `002_links_rls_policies.sql`

---

## Storage

| Bucket | Usage | Accès |
|--------|-------|-------|
| `phase-documents` | Documents PDF/DOCX par phase | Upload: super_admin (Service Role), Download: URL signée |

Validations upload : .pdf/.docx uniquement, max 10 Mo, max 3 documents par phase.

---

## Variables d'environnement

| Variable | Scope | Usage |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Serveur | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Serveur | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Serveur uniquement | Opérations admin (création comptes, upload) |
| `RESEND_API_KEY` | Serveur uniquement | Email transactionnel |

---

## API Routes principales

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/health` | Health check (BDD + env vars) |
| POST | `/api/admin/users` | Création compte (mdp temporaire) |
| PATCH | `/api/admin/users/[id]` | Modification profil + réassignation |
| DELETE | `/api/admin/users/[id]` | Suppression RGPD (double confirmation) |
| POST | `/api/admin/users/[id]/reset-password` | Réinitialisation mot de passe |
| GET | `/api/admin/stats` | KPIs + données supervision |
| POST | `/api/documents/upload` | Upload document (multipart) |
| DELETE | `/api/documents/[id]` | Suppression atomique (Storage + BDD) |
| GET | `/api/documents/[id]/download` | URL signée téléchargement |
| POST | `/api/phase-responses` | Autosave réponses |
| POST | `/api/phase-validations` | Validation/dé-validation phase |

---

## Tests

```bash
# Tests unitaires (Vitest)
pnpm test --filter=@unanima/links

# Tests E2E (Playwright) — nécessite app en cours d'exécution
pnpm test:e2e --filter=@unanima/links
```

Couverture : 136 tests unitaires (schémas Zod, logique métier, progression, inactivité, upload).
E2E : parcours bénéficiaire, parcours consultant, tests RBAC.

---

## Mode Simulation

Le mode simulation permet d'afficher tous les écrans de l'app avec des **données fictives**, sans connexion Supabase. Idéal pour les démos client et le développement frontend.

### Activation

```bash
# Dans apps/links/.env.local
NEXT_PUBLIC_SIMULATION_MODE=true
```

### Fonctionnement

- **Auth bypass** : aucun appel à Supabase Auth, le middleware redirige directement vers la home du rôle
- **API interception** : tous les route handlers retournent des données fictives depuis `src/lib/simulation/fixtures/`
- **Sélecteur de rôle** : un bandeau ambre en haut de page permet de basculer entre bénéficiaire, consultant et admin
- **Cookie `simulation-role`** : stocke le rôle sélectionné (défaut : `beneficiaire`)

### Données fictives disponibles

| Entité | Quantité | Détail |
|--------|----------|--------|
| Admin | 1 | Sophie Martin |
| Consultants | 2 | Marie Dupont, Jean Bernard |
| Bénéficiaires | 5 | Alice (terminé), Lucas (en cours 3/6), Emma (début 1/6), Thomas (nouveau), Camille (5/6) |
| Questionnaires | 6 | 1 par phase, 4 questions chacun |
| Sessions | 30 | 6 par bénéficiaire (passées, futures, non planifiées) |
| Documents | 7 | 1-2 par phase (PDF/DOCX fictifs) |
| Notes de session | 6 | Pour Alice et Lucas |

### Limitations

- **Pas de persistance** : les écritures (autosave, validation, création utilisateur) retournent un succès sans enregistrer
- **Pas de téléchargement** : les documents listés n'ont pas de fichier réel associé
- **Pas d'email** : aucun email n'est envoyé en mode simulation
- **Aucun impact en production** : si `NEXT_PUBLIC_SIMULATION_MODE` est absent ou `false`, le mode normal est actif

### Architecture

```
src/lib/simulation/
├── config.ts              ← isSimulationMode()
├── auth.ts                ← getSimulationSession(), cookie de rôle
├── handlers.ts            ← getSimulationUser() pour les route handlers
├── index.ts               ← Barrel export
└── fixtures/
    ├── profiles.ts        ← 8 profils (1 admin, 2 consultants, 5 bénéficiaires)
    ├── phases.ts          ← Validations de phase par bénéficiaire
    ├── questionnaires.ts  ← Questionnaires et questions (6 phases × 4 questions)
    ├── responses.ts       ← Réponses pré-remplies
    ├── sessions.ts        ← Sessions et notes de session
    ├── documents.ts       ← Documents de phase (PDF/DOCX)
    ├── stats.ts           ← KPIs admin calculés
    └── index.ts           ← Barrel export
```

---

## Déploiement

- **Plateforme :** Vercel (projet distinct)
- **Root Directory :** `apps/links`
- **Build Command :** `pnpm turbo run build --filter=@unanima/links`
- **Ignore Command :** `npx turbo-ignore @unanima/links`
- **Health Check :** `GET /api/health` → 200
