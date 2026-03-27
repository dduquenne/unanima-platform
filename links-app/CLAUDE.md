# CLAUDE.md — Link's Accompagnement

## Vue d'ensemble

Application extranet de suivi des bilans de compétences pour Link's Accompagnement.
Projet Next.js standalone (migré depuis le monorepo unanima-platform).

**Client :** Link's Accompagnement
**Projet Supabase :** `vtycrvrogvfvvdnknyem`

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| Langage | TypeScript 5.x (strict) |
| UI | Tailwind CSS + composants internes |
| Base de données | Supabase (PostgreSQL) |
| Authentification | Supabase Auth + RBAC custom |
| E-mail | Resend + React Email |
| Tests unitaires | Vitest |
| Tests E2E | Playwright |
| Hébergement | Vercel |

---

## Structure

```
src/
├── app/                         ← App Router Next.js
│   ├── (protected)/             ← Routes authentifiées
│   │   ├── admin/               ← Espace super_admin
│   │   ├── consultant/          ← Espace consultant
│   │   ├── dashboard/           ← Dashboard bénéficiaire
│   │   ├── bilans/              ← Questionnaires par phase (1-6)
│   │   ├── documents/           ← Documents phase
│   │   └── profil/              ← Données personnelles
│   ├── api/                     ← Route handlers
│   └── login/                   ← Page de connexion
├── components/
│   └── ui/                      ← Composants UI (Button, Input, Card, Modal, Spinner)
├── config/
│   ├── auth.config.ts           ← Rôles, permissions, redirections
│   ├── phases.config.ts         ← 6 phases du bilan
│   └── rgpd.config.ts           ← Config RGPD
├── lib/
│   ├── auth/                    ← AuthProvider, hooks, RBAC, composants auth
│   ├── supabase/                ← Clients Supabase (browser, server, admin), audit
│   ├── rgpd/                    ← Export données, suppression compte, cookie banner
│   ├── email/                   ← Client Resend, templates email
│   ├── api/                     ← Fonctions API métier
│   ├── simulation/              ← Mode démo sans Supabase
│   └── types/                   ← Types DB, schémas Zod
├── styles/
│   └── theme.css                ← Variables CSS (charte graphique)
└── middleware.ts                ← RBAC routes + redirections
```

---

## Rôles et permissions

| Rôle | Accès |
|------|-------|
| `beneficiaire` | Dashboard, bilans, documents, profil |
| `consultant` | Dashboard consultant, dossiers bénéficiaires |
| `super_admin` | Tout + admin (CRUD comptes, upload, supervision) |

---

## Tables BDD

| Table | Description |
|-------|-------------|
| `profiles` | Extension auth.users (rôle, consultant_id, dates bilan) |
| `questionnaires` | Templates questionnaire par phase (1-6) |
| `questions` | Questions associées aux questionnaires |
| `phase_responses` | Réponses bénéficiaire (autosave) |
| `phase_validations` | Statut validation par phase |
| `sessions` | 6 séances consultant ↔ bénéficiaire |
| `session_notes` | Comptes-rendus confidentiels (consultant only) |
| `phase_documents` | Documents PDF/DOCX par phase |
| `audit_logs` | Journal d'audit RGPD |

Toutes les tables ont RLS activé.

---

## Conventions de code

- **TypeScript strict** — pas de `any`, utiliser `unknown` + type guards
- **Fichiers** : kebab-case (`kpi-card.tsx`)
- **Composants** : PascalCase (`LoginForm`)
- **Hooks** : camelCase préfixé `use` (`useAuth`)
- **Imports** : externes → lib internes → relatifs
- **Commits** : format conventionnel (`feat(auth): add password reset`)

---

## Variables d'environnement

| Variable | Scope | Usage |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Serveur | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Serveur | Clé publique |
| `SUPABASE_SERVICE_ROLE_KEY` | Serveur | Opérations admin |
| `RESEND_API_KEY` | Serveur | Email transactionnel |
| `NEXT_PUBLIC_SIMULATION_MODE` | Client | Mode démo (optionnel) |

---

## Commandes

```bash
npm install           # Installation
npm run dev           # Développement
npm run build         # Build production
npm run lint          # Lint
npm run test          # Tests unitaires
npm run test:e2e      # Tests E2E
npm run type-check    # Vérification types
```

---

## Mode Simulation

Activer avec `NEXT_PUBLIC_SIMULATION_MODE=true` dans `.env.local`.
Affiche tous les écrans avec données fictives, sans Supabase.
Sélecteur de rôle en bandeau ambre.

---

## Déploiement

- **Plateforme :** Vercel
- **Health Check :** `GET /api/health` → 200
