# Audit technique — Plateforme Unanima

> Date : 2026-03-16
> Périmètre : monorepo `unanima-platform` (socle commun + 3 apps clients)

---

## 1. Stack & architecture

### Q1. Versions exactes utilisées

| Technologie | Version (package.json) |
|---|---|
| **Next.js** | `^14.2.23` (identique pour les 3 apps) |
| **React** | `^18.3.1` |
| **React DOM** | `^18.3.1` |
| **Node.js** | 20 LTS (cible documentée) |
| **TypeScript** | `^5.7.3` (mode `strict: true`, `noUncheckedIndexedAccess: true`) |
| **Supabase JS client** (`@supabase/supabase-js`) | `^2.48.1` |
| **Supabase SSR** (`@supabase/ssr`) | `^0.5.2` |
| **pnpm** | `9.15.4` (via `packageManager`) |
| **Turborepo** | `^2.4.4` |
| **Vitest** | `^1.6.1` |
| **ESLint** | `^8.57.0` |
| **Tailwind CSS** | via `@unanima/tailwind-config` (Tailwind 3.x) |
| **clsx** | `^2.1.1` |
| **tailwind-merge** | `^2.6.0` |

### Q2. Structure du monorepo

```
unanima-platform/
├── package.json             ← Workspace root (pnpm 9.15.4)
├── pnpm-workspace.yaml      ← Déclaration des workspaces
├── turbo.json               ← Orchestration Turborepo
├── tsconfig.base.json       ← Config TS partagée (strict)
├── .eslintrc.base.js        ← ESLint partagé
├── .prettierrc              ← Prettier (no semi, single quotes, trailing commas)
│
├── packages/                ← 6 packages partagés
│   ├── core/                ← @unanima/core — Composants UI, hooks, utils
│   ├── auth/                ← @unanima/auth — AuthProvider, RBAC, middleware
│   ├── db/                  ← @unanima/db — Client Supabase, CRUD, audit
│   ├── email/               ← @unanima/email — Resend + React Email
│   ├── rgpd/                ← @unanima/rgpd — Conformité RGPD
│   └── dashboard/           ← @unanima/dashboard — KPI, DataTable, Charts
│
├── apps/                    ← 3 applications clients
│   ├── links/               ← Link's Accompagnement (bilans de compétences)
│   ├── creai/               ← CREAI Île-de-France (médico-social)
│   └── omega/               ← Omega Automotive (SAV dashboard)
│
├── tooling/                 ← Configs partagées
│   ├── tsconfig/            ← @unanima/tsconfig
│   ├── eslint/              ← @unanima/eslint-config
│   └── tailwind/            ← @unanima/tailwind-config
│
└── scripts/                 ← 5 scripts utilitaires
    ├── extract-app.sh       ← Extraction pour livraison client
    ├── new-app.sh           ← Scaffolding d'une nouvelle app
    ├── generate-types.sh    ← Génération des types Supabase
    ├── vercel-ignore.sh     ← Isolation des déploiements Vercel
    └── check-lockfile.sh    ← Vérification lockfile en CI
```

**76 fichiers TypeScript/TSX** au total (packages : ~61, apps : ~15).

### Q3. Code partagé entre les 3 projets clients

Les 3 apps importent les **6 mêmes packages** via `workspace:*` :

| Package | Contenu partagé |
|---|---|
| `@unanima/core` | Composants UI (Button, Input, Modal, Card, Badge), hooks (useDebounce, useLocalState, useMediaQuery), utils (formatDate, cn, validators), tokens de thème |
| `@unanima/auth` | AuthProvider (React Context), hooks (useAuth, useRequireRole, useSession), middleware Next.js, moteur RBAC, composants (LoginForm, ResetPasswordForm, ProtectedRoute) |
| `@unanima/db` | Client Supabase (serveur + navigateur), types générés, CRUD générique, pagination, filtrage, journalisation d'audit |
| `@unanima/email` | Client Resend, fonctions d'envoi, templates React Email (reset-password, welcome, notification) |
| `@unanima/rgpd` | Composants (LegalNotice, PrivacyPolicy, CookieBanner), API (export, delete, audit), config RGPD |
| `@unanima/dashboard` | KPICard, DataTable, StatusBadge, ProgressBar, AlertPanel, ChartWrapper, SearchBar, Layout |

Schémas DB communs : `profiles` et `audit_logs` (migrations SQL dans `packages/db/migrations/`).

### Q4. App Router ou Pages Router ?

**App Router Next.js 14** pour les 3 projets. Les apps utilisent `src/app/` (convention App Router). Confirmé par la présence de `route.ts` (API routes App Router) et la structure `src/app/api/health/route.ts` dans chaque app.

---

## 2. Qualité de code & dette technique

### Q1. Tests automatisés

| Aspect | Détail |
|---|---|
| **Framework** | Vitest `^1.6.1` |
| **Nombre de fichiers de test** | **8** |
| **Type** | Unitaires uniquement |
| **E2E** | Playwright mentionné dans la doc mais **pas configuré** (aucun `playwright.config.ts`) |

**Répartition des tests :**

| Package | Fichiers de test |
|---|---|
| `@unanima/core` | 3 (components, theme-tokens, utils) |
| `@unanima/auth` | 1 (rbac) |
| `@unanima/dashboard` | 1 (exports) |
| `@unanima/db` | 1 (types) |
| `@unanima/email` | 1 (exports) |
| `@unanima/rgpd` | 1 (config) |
| **Apps (links, creai, omega)** | **0** (scripts configurés avec `--passWithNoTests`) |

### Q2. Couverture de tests estimée

**Faible (~10-15% estimé).** Les 8 tests couvrent essentiellement les exports et la configuration des packages du socle. Aucun test d'intégration, aucun test E2E, aucun test applicatif dans les 3 apps. Les scripts de test des apps utilisent `--passWithNoTests`, ce qui confirme qu'aucun test applicatif n'existe.

### Q3. Modules fragiles

Aucun module identifié comme "fragile" dans le code (0 commentaires TODO/FIXME/HACK/XXX dans tout le codebase). La base de code est jeune (18 commits, premier commit récent) et n'a pas encore accumulé de fragilités.

### Q4. Dette technique connue — 3 points critiques

1. **Absence de tests E2E** — Playwright est mentionné dans la stack cible mais n'est pas configuré. Aucun test de bout en bout ne valide les parcours utilisateurs. C'est le risque le plus élevé pour la qualité en production.

2. **Absence de tests applicatifs** — Les 3 apps (links, creai, omega) n'ont aucun test. Les scripts utilisent `--passWithNoTests` comme contournement. Les tests existants (8 fichiers) ne couvrent que les exports/configs des packages partagés, pas la logique métier.

3. **Pas de configuration Vitest dédiée** — Aucun `vitest.config.ts` n'existe dans le repo. Les tests s'exécutent avec la configuration par défaut, ce qui pourrait poser des problèmes de résolution de modules ou de couverture à mesure que le projet grandit.

---

## 3. Performance & sécurité

### Q1. Core Web Vitals

**Non mesurés.** Le projet est en phase de construction (phase 0 / fondation). Aucune mesure de LCP, CLS ou INP n'a été effectuée. Les applications ne sont pas encore en production avec du trafic utilisateur.

### Q2. Row Level Security (RLS)

**Oui, activé sur les 2 tables communes** (`profiles` et `audit_logs`).

6 politiques RLS définies dans `packages/db/migrations/003_rls_policies.sql` :

| Table | Politique | Opération | Règle |
|---|---|---|---|
| `profiles` | Users read own profile | SELECT | `auth.uid() = id` |
| `profiles` | Admins read all profiles | SELECT | Rôle in (super_admin, admin_creai, direction) |
| `profiles` | Users update own profile | UPDATE | `auth.uid() = id` |
| `audit_logs` | Authenticated users insert | INSERT | `auth.uid() IS NOT NULL` |
| `audit_logs` | Admins read audit logs | SELECT | Rôle in (super_admin, admin_creai, direction) |

**Note :** les tables métier spécifiques à chaque app (à venir) devront également avoir leurs propres politiques RLS.

### Q3. Gestion des secrets et variables d'environnement

| Mécanisme | Détail |
|---|---|
| **Développement local** | Fichiers `.env.local` par app (gitignorés), créés à partir des `.env.local.example` |
| **Production** | Variables d'environnement Vercel (par projet, jamais partagées) |
| **Séparation public/secret** | Stricte — les variables secrètes (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) ne sont jamais préfixées `NEXT_PUBLIC_` |
| **Isolation par app** | Chaque app a son propre projet Supabase avec ses propres clés |
| **Vault externe** | Non utilisé (Vercel env suffit pour le périmètre actuel) |

4 variables par app : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`.

### Q4. Incidents en production

**Aucun incident.** Le projet est en phase de fondation et n'est pas encore en production avec des utilisateurs finaux. Le dernier commit date de la phase de personnalisation des chartes graphiques.

---

## 4. CI/CD & déploiement

### Q1. Pipeline CI/CD actuel

**GitHub Actions + Vercel auto-deploy.**

5 workflows GitHub Actions :

| Workflow | Déclencheur | Actions |
|---|---|---|
| `ci-links.yml` | Push/PR sur `main`/`dev` + changements dans `apps/links/**` ou `packages/**` | lint, build, test (filtré Links) |
| `ci-creai.yml` | Push/PR sur `main`/`dev` + changements dans `apps/creai/**` ou `packages/**` | lint, build, test (filtré CREAI) |
| `ci-omega.yml` | Push/PR sur `main`/`dev` + changements dans `apps/omega/**` ou `packages/**` | lint, build, test (filtré Omega) |
| `ci-packages.yml` | Push/PR sur `main`/`dev` + changements dans `packages/**` ou `tooling/**` | lint, build, test des 3 apps en parallèle (`fail-fast: false`) |
| `ci-lockfile.yml` | PR sur `main`/`dev` | Vérification de synchronisation du lockfile pnpm |

Chaque workflow utilise la concurrence (`cancel-in-progress`) pour éviter les exécutions redondantes.

### Q2. Preview deployments

**Oui**, via Vercel. Chaque app est un projet Vercel distinct avec `ignoreCommand` (`scripts/vercel-ignore.sh`) qui filtre les déploiements selon les fichiers modifiés. Un push sur une branche de PR déclenche un preview deployment uniquement pour les apps impactées.

### Q3. Migrations de base de données

**Gestion manuelle via fichiers SQL numérotés** dans `packages/db/migrations/` :

```
001_profiles.sql
002_audit_logs.sql
003_rls_policies.sql
```

Convention : les migrations déployées ne sont jamais modifiées — toute modification passe par une nouvelle migration avec un numéro incrémenté. Pas d'outil de migration automatisé (type Supabase CLI migrations ou Prisma) — l'application des migrations est manuelle.

### Q4. Temps de build moyen

**Non mesuré précisément.** Le projet est léger (76 fichiers TS/TSX, ~15 fichiers par app). Un build Next.js pour une app de cette taille sur Vercel prend typiquement **30-60 secondes** (estimation), dépendances Turborepo + cache aidant.

---

## 5. Utilisation de Claude Code & outillage

### Q1. Utilisation de Claude Code

Claude Code est utilisé comme **outil principal de développement** sur ce projet :

- **Génération de code** : fondation complète du monorepo (Phase 0), scaffolding des packages et apps
- **Résolution d'issues** : commande `/issue` personnalisée pour le monorepo (cf. commit `9a6cdb7`)
- **CI/CD** : mise en place de l'isolation des déploiements, workflows GitHub Actions
- **Refactoring** : personnalisation des chartes graphiques, correction des configs Vercel
- **Documentation** : CLAUDE.md maintenu comme source de vérité architecturale

L'historique Git montre que la quasi-totalité des commits sont produits via Claude Code (branches `claude/*`).

### Q2. Conventions de code documentées

**Oui, extensivement documentées** dans `CLAUDE.md` et outillées :

| Aspect | Outil/Config |
|---|---|
| **Linting** | ESLint `^8.57.0` + `eslint-config-next` + config partagée `@unanima/eslint-config` |
| **Formatage** | Prettier (`.prettierrc` : no semi, single quotes, trailing commas, 100 chars) |
| **TypeScript** | `strict: true`, `noUncheckedIndexedAccess: true`, zéro `any` explicite |
| **Nommage** | kebab-case (fichiers), PascalCase (composants), camelCase (hooks/utils) |
| **Imports** | Ordre documenté : externes → monorepo → locaux |
| **Git** | Commits conventionnels (`feat(scope):`, `fix(scope):`), scopes définis |
| **Architecture** | Règles strictes (pas d'import entre apps, ≥2 apps pour le socle, etc.) |

### Q3. Dépendances npm obsolètes

**Très peu, voire aucune.** Le projet est récent et utilise des versions quasi-actuelles :
- Next.js 14.2.x (dernière 14.x stable)
- React 18.3.x (dernière 18.x)
- TypeScript 5.7.x (récent)
- Supabase JS 2.48.x (récent)

**Processus de mise à jour** : non formalisé. Le lockfile est vérifié en CI (`ci-lockfile.yml` + `check-lockfile.sh`) mais il n'y a pas de Renovate/Dependabot configuré pour les mises à jour automatiques.

**Recommandation** : configurer Renovate ou Dependabot pour automatiser le suivi des mises à jour.

### Q4. Choix technique regrettable

Basé sur l'analyse du codebase, les choix techniques sont cohérents et bien exécutés. Cependant, un point mérite attention :

- **Pas de Playwright configuré malgré sa mention dans la stack** — Playwright est listé comme outil E2E cible mais n'a jamais été mis en place. Plus le projet avance sans tests E2E, plus il sera difficile de les introduire. La mise en place dès maintenant (même avec un seul test de smoke par app) serait un investissement rentable.
- **Migrations SQL manuelles** — l'absence d'outil de migration automatisé (Supabase CLI, Prisma) deviendra un frein à mesure que le schéma évolue avec les 3 apps en parallèle.
