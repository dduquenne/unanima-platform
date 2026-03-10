# CLAUDE.md — Unanima Platform (Socle commun multi-projets)

## Vue d'ensemble

Ce monorepo contient le socle commun Unanima et les applications extranet métier de trois clients :
- **Link's Accompagnement** — Plateforme de suivi des bilans de compétences
- **CREAI Île-de-France** — Plateforme d'appui à la transformation de l'offre médico-sociale
- **Omega Automotive** — Dashboard opérationnel SAV (consolidation Salesforce/SAP)

Le socle commun fournit les briques transverses réutilisées par chaque application : authentification, composants de tableau de bord, accès base de données, e-mail transactionnel, conformité RGPD.

---

## Structure du monorepo

```
unanima-platform/
├── CLAUDE.md                    ← CE FICHIER (architecture globale)
├── package.json                 ← Workspace root (pnpm)
├── pnpm-workspace.yaml
├── turbo.json                   ← Configuration Turborepo
├── tsconfig.base.json           ← TypeScript partagé
├── .eslintrc.base.js            ← ESLint partagé
│
├── packages/
│   ├── core/                    ← Composants UI génériques, hooks, utilitaires
│   │   ├── package.json         ← @unanima/core
│   │   ├── src/
│   │   │   ├── components/      ← Button, Input, Modal, Card, Badge, etc.
│   │   │   ├── hooks/           ← useDebounce, useLocalState, useMediaQuery
│   │   │   └── utils/           ← formatDate, cn (classnames), validators
│   │   └── tsconfig.json
│   │
│   ├── auth/                    ← Authentification et RBAC générique
│   │   ├── package.json         ← @unanima/auth
│   │   ├── src/
│   │   │   ├── provider.tsx     ← AuthProvider (React Context)
│   │   │   ├── hooks.ts         ← useAuth, useRequireRole, useSession
│   │   │   ├── middleware.ts    ← Middleware Next.js (protection routes)
│   │   │   ├── rbac.ts          ← Moteur RBAC (rôles, permissions, guards)
│   │   │   ├── types.ts         ← AuthConfig, Role, Permission, Session
│   │   │   └── components/      ← LoginForm, ResetPasswordForm, ProtectedRoute
│   │   └── tsconfig.json
│   │
│   ├── db/                      ← Couche d'accès Supabase
│   │   ├── package.json         ← @unanima/db
│   │   ├── src/
│   │   │   ├── client.ts        ← createClient (serveur + navigateur)
│   │   │   ├── types.ts         ← Types générés depuis le schéma
│   │   │   ├── helpers.ts       ← CRUD générique, pagination, filtrage
│   │   │   └── audit.ts         ← Fonctions de journalisation
│   │   └── migrations/
│   │       ├── 001_profiles.sql
│   │       ├── 002_audit_logs.sql
│   │       └── 003_rls_policies.sql
│   │
│   ├── email/                   ← E-mail transactionnel (Resend)
│   │   ├── package.json         ← @unanima/email
│   │   ├── src/
│   │   │   ├── client.ts        ← Client Resend configuré
│   │   │   ├── send.ts          ← Fonctions d'envoi (sendEmail, sendBatch)
│   │   │   └── templates/       ← Templates React Email
│   │   │       ├── reset-password.tsx
│   │   │       ├── welcome.tsx
│   │   │       └── notification.tsx
│   │   └── tsconfig.json
│   │
│   ├── rgpd/                    ← Conformité RGPD
│   │   ├── package.json         ← @unanima/rgpd
│   │   ├── src/
│   │   │   ├── components/      ← LegalNotice, PrivacyPolicy, CookieBanner
│   │   │   ├── api/             ← Route handlers (export, delete, audit)
│   │   │   └── config.ts        ← RGPDConfig (raison sociale, DPO, finalités)
│   │   └── tsconfig.json
│   │
│   └── dashboard/               ← Composants de tableau de bord
│       ├── package.json         ← @unanima/dashboard
│       ├── src/
│       │   ├── KPICard.tsx
│       │   ├── DataTable.tsx    ← Tableau triable, filtrable, paginable
│       │   ├── StatusBadge.tsx  ← Badge coloré configurable
│       │   ├── ProgressBar.tsx
│       │   ├── AlertPanel.tsx   ← Alertes avec niveaux de sévérité
│       │   ├── ChartWrapper.tsx ← Encapsulation Recharts
│       │   ├── SearchBar.tsx    ← Recherche multi-critères
│       │   └── Layout.tsx       ← Sidebar + Header + Main
│       └── tsconfig.json
│
├── apps/
│   ├── links/                   ← App Link's Accompagnement
│   │   ├── CLAUDE.md            ← Règles métier Link's
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── vercel.json
│   │   └── src/
│   │       ├── app/             ← App Router Next.js
│   │       └── lib/             ← Logique métier spécifique
│   │
│   ├── creai/                   ← App CREAI Île-de-France
│   │   ├── CLAUDE.md            ← Règles métier CREAI
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── vercel.json
│   │   └── src/
│   │
│   └── omega/                   ← App Omega Automotive
│       ├── CLAUDE.md            ← Règles métier Omega
│       ├── package.json
│       ├── next.config.js
│       ├── vercel.json
│       └── src/
│
├── tooling/
│   ├── tsconfig/                ← Configs TypeScript partagées
│   ├── eslint/                  ← Configs ESLint partagées
│   └── tailwind/                ← Config Tailwind + presets de thèmes
│
└── scripts/
    ├── extract-app.sh           ← Script d'extraction pour livraison client
    ├── new-app.sh               ← Scaffolding d'une nouvelle app
    └── generate-types.sh        ← Génération des types Supabase
```

---

## Stack technique

| Couche | Technologie | Version cible |
|---|---|---|
| Runtime | Node.js | 20 LTS |
| Gestionnaire de packages | pnpm | 9.x |
| Build orchestrator | Turborepo | 2.x |
| Framework frontend | Next.js (App Router) | 14.x |
| Langage | TypeScript | 5.x (strict) |
| UI | Tailwind CSS + shadcn/ui | 3.x + latest |
| Base de données | Supabase (PostgreSQL) | Dernière version |
| Authentification | Supabase Auth | Intégrée |
| E-mail | Resend + React Email | Dernières versions |
| Hébergement | Vercel | — |
| Tests unitaires | Vitest | 1.x |
| Tests E2E | Playwright | 1.x |

---

## Conventions de code

### TypeScript
- Mode `strict: true` obligatoire
- Pas de `any` explicite — utiliser `unknown` + type guards
- Types exportés depuis chaque package dans `types.ts`
- Interfaces préférées aux types pour les objets (extensibilité)

### Nommage
- **Fichiers** : kebab-case (`kpi-card.tsx`, `use-auth.ts`)
- **Composants React** : PascalCase (`KPICard`, `DataTable`)
- **Hooks** : camelCase préfixé `use` (`useAuth`, `useDebounce`)
- **Fonctions utilitaires** : camelCase (`formatDate`, `validateEmail`)
- **Variables d'environnement** : SCREAMING_SNAKE_CASE (`NEXT_PUBLIC_SUPABASE_URL`)
- **Tables SQL** : snake_case (`audit_logs`, `user_profiles`)
- **Colonnes SQL** : snake_case (`created_at`, `full_name`)

### Imports
```typescript
// 1. Packages externes
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// 2. Packages internes du monorepo
import { useAuth } from '@unanima/auth'
import { KPICard } from '@unanima/dashboard'

// 3. Imports locaux (relatifs)
import { BeneficiaireForm } from './components/beneficiaire-form'
```

### Composants React
- Composants fonctionnels uniquement (pas de classes)
- Props typées avec interface dédiée (`interface KPICardProps { ... }`)
- Export par défaut pour les pages Next.js, export nommé pour le reste
- Pas de logique métier dans les composants — extraire dans des hooks ou utilitaires

### Git
- Branches : `main` (production), `dev` (intégration), `feat/xxx`, `fix/xxx`
- Commits : format conventionnel (`feat(auth): add password reset flow`)
- PR obligatoire pour merge dans `main`
- Scope des commits : `core`, `auth`, `db`, `email`, `rgpd`, `dashboard`, `links`, `creai`, `omega`

---

## Configuration RBAC

Chaque app définit sa configuration de rôles dans `src/config/auth.config.ts` :

```typescript
import type { AuthConfig } from '@unanima/auth'

export const authConfig: AuthConfig = {
  roles: ['beneficiaire', 'consultant', 'super_admin'],
  defaultRole: 'beneficiaire',
  redirects: {
    afterLogin: '/dashboard',
    afterLogout: '/login',
    unauthorized: '/login',
  },
  permissions: {
    super_admin: ['*'],
    consultant: ['read:beneficiaires', 'read:responses', 'read:dashboard'],
    beneficiaire: ['read:own', 'write:own', 'read:documents'],
  },
}
```

---

## Base de données — Tables communes

### profiles
Extension de `auth.users` avec métadonnées métier.
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- L'utilisateur voit son propre profil
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Les admins voient tous les profils
CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin_creai', 'direction')
    )
  );
```

### audit_logs
Journal d'audit RGPD.
```sql
CREATE TABLE public.audit_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Insertion par tout utilisateur authentifié
CREATE POLICY "Authenticated users insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Lecture par admins uniquement
CREATE POLICY "Admins read audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin_creai', 'direction')
    )
  );
```

---

## Thémabilité

Chaque app surcharge les variables CSS via `src/styles/theme.css` :

```css
/* apps/links/src/styles/theme.css */
:root {
  --color-primary: #1E6FC0;
  --color-primary-dark: #0D3B6E;
  --color-success: #28A745;
  --color-warning: #FF6B35;
  --color-background: #F5F7FA;
  --color-text: #4A4A4A;
  --color-border: #DCE1EB;
  --font-family: 'Inter', sans-serif;
}
```

Les composants du socle utilisent exclusivement ces variables CSS, jamais de couleurs en dur.

---

## Commandes

```bash
# Installation
pnpm install

# Développement (toutes les apps)
pnpm dev

# Développement (une seule app)
pnpm dev --filter=@unanima/links

# Build
pnpm build
pnpm build --filter=@unanima/links

# Tests
pnpm test                           # Tous les tests
pnpm test --filter=@unanima/auth    # Tests d'un package

# Lint
pnpm lint

# Génération des types Supabase
pnpm generate:types --filter=@unanima/links

# Extraction pour livraison client
./scripts/extract-app.sh links /chemin/sortie
```

---

## Script d'extraction pour livraison client

Le script `scripts/extract-app.sh` extrait une app et ses dépendances du monorepo pour produire un dépôt Git autonome livrable au client :

```bash
./scripts/extract-app.sh <app-name> <output-dir>
# Exemple : ./scripts/extract-app.sh links ~/livraison-links
```

Le script :
1. Copie `apps/<app-name>/` vers `<output-dir>/`
2. Copie les packages dont l'app dépend dans `<output-dir>/lib/`
3. Réécrit les imports `@unanima/*` vers `./lib/*`
4. Génère un `package.json` autonome
5. Copie le CLAUDE.md de l'app enrichi des informations du socle
6. Initialise un nouveau dépôt Git avec un commit initial

---

## Règles strictes

1. **Ne jamais importer de code d'une app vers une autre** — les apps sont isolées
2. **Ne jamais stocker de secrets dans le code** — utiliser les variables d'environnement Vercel
3. **Toute nouvelle fonctionnalité du socle doit être utilisée par ≥ 2 apps** — sinon elle reste dans l'app
4. **Les migrations SQL du socle ne doivent jamais être modifiées après déploiement** — créer une nouvelle migration
5. **Chaque PR qui touche un package du socle doit passer les tests des 3 apps**
6. **Le CLAUDE.md doit être mis à jour à chaque changement structurel**

---

## Projets clients — Références

| App | Note de cadrage | Budget | Calendrier |
|---|---|---|---|
| Link's Accompagnement | `docs/note-cadrage-links-v1.12.pdf` | Voir proposition commerciale | 6 semaines (v1) |
| CREAI Île-de-France | `docs/note-cadrage-creai-v1.6.docx` | 15 000 € HT (PMV) | 6-8 semaines |
| Omega Automotive | `docs/note-synthese-omega-v1.docx` | À définir | 4-5 semaines |
