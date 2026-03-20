# Sprint 2 — Upgrade Next.js 15 + Auth UI + Layout applicatif

**Projet :** Roadmap Unanima Platform
**Période :** 2026-04-06 → 2026-04-19
**Objectif :** Mettre à jour le framework, déployer les pages d'authentification et le layout protégé pour les 3 apps.
**Statut :** ✅ Terminé (exécuté le 2026-03-20)
**PR :** [#73](https://github.com/dduquenne/unanima-platform/pull/73) — mergée dans `main`

---

## Phase 1 — Upgrade Next.js 15 (séquentiel, bloquant) — ✅ Complète

Epic critique reportée du Sprint 1. L'upgrade 14→15 corrige la dernière CVE HIGH (next@14) et débloque les nouvelles API async.

| Ordre | Issue | Titre | Priorité | Skills | Dépend de | Résultat |
|-------|-------|-------|----------|--------|-----------|----------|
| ✅ 1 | [#74](https://github.com/dduquenne/unanima-platform/issues/74) | Upgrade Next.js 14 → 15 : adapter les 3 apps | 🔴 Critique | securix, soclix, archicodix | Sprint 1 | Fait (`3f08e8d`) |
| ✅ 2 | — | Adapter les `params`, `headers()`, `cookies()` async (Next.js 15 breaking changes) | 🔴 Critique | archicodix, anomalix | #1 | N/A — aucune API async utilisée dans le codebase |
| ✅ 3 | — | Ajouter la règle ESLint `no-console` (prévention régression #56) | 🟡 Moyenne | soclix | — | Fait (`9949c15`) — `warn` → `error` |

**Détail issue #1 — Upgrade Next.js 15 :**
- ✅ Mise à jour `next` de `^14.2.23` vers `^15.0.0` dans les 3 apps
- ✅ Mise à jour `eslint-config-next` de `14` vers `^15.0.0`
- ✅ Mise à jour `@unanima/auth` peerDependency : `^14.0.0 || ^15.0.0`
- ✅ Suppression des `overrides` pnpm pour glob/flatted (plus nécessaires)
- ✅ `pnpm audit` : 0 HIGH CVEs (2 moderate prismjs via react-email)

**Détail issue #2 — Async API :**
- ✅ Aucune async API à adapter — pas de dynamic routes, `headers()`, `cookies()` ou `searchParams` dans le codebase actuel
- ✅ Le middleware `@unanima/auth` utilise `request.cookies` (API NextRequest) — inchangé en Next.js 15

**Point de contrôle Phase 1 :**
- [x] `pnpm audit` : 0 HIGH CVEs
- [x] `pnpm build` passe pour les 3 apps (9/9 tâches)
- [x] `pnpm test` : 174+ tests passent
- [x] Aucune erreur TypeScript

---

## Phase 2 — Pages d'authentification (parallélisable par app) — ✅ Complète

Pages fonctionnelles avec le socle `@unanima/auth` existant.

| Ordre | Issue | Titre | Priorité | Skills | Dépend de | Résultat |
|-------|-------|-------|----------|--------|-----------|----------|
| ✅ 4 | [#75](https://github.com/dduquenne/unanima-platform/issues/75) | Page login (`/login`) — 3 apps | 🟠 Haute | ergonomix, archicodix | Phase 1 | Fait (`c2b1469`) |
| ✅ 5 | [#75](https://github.com/dduquenne/unanima-platform/issues/75) | Page reset password (`/reset-password`) — 3 apps | 🟠 Haute | ergonomix | Phase 1 | Fait (`185f80e`) |
| ✅ 6 | [#75](https://github.com/dduquenne/unanima-platform/issues/75) | Page callback auth (`/auth/callback`) — 3 apps | 🟠 Haute | archicodix, securix | Phase 1 | Fait (`04efc9a`) |
| ✅ 7 | [#76](https://github.com/dduquenne/unanima-platform/issues/76) | Middleware de protection des routes (`middleware.ts`) — 3 apps | 🟠 Haute | securix, archicodix | #4 | Fait (`2d97222`) |

**Détail issue #4 — Page login :**
- ✅ Utilise `<LoginForm>` de `@unanima/auth`
- ✅ Thème CSS spécifique par app (couleurs, branding)
- ✅ Gestion des erreurs (credentials invalides)
- ✅ Redirect vers `/dashboard` après login si déjà authentifié
- ✅ `AuthProvider` intégré via `providers.tsx` dans les root layouts
- ✅ Fix AuthProvider : gestion gracieuse des env vars absentes au build (prerendering)

**Détail issue #7 — Middleware :**
- ✅ Routes publiques : `/login`, `/reset-password`, `/auth/callback`, `/api/health`, assets statiques
- ✅ Routes protégées : `/dashboard`, `/profile`
- ✅ Redirect vers `/login` si non authentifié
- ✅ Utilise `createAuthMiddleware()` de `@unanima/auth`

**Point de contrôle Phase 2 :**
- [x] Login fonctionnel sur les 3 apps (avec Supabase)
- [x] Reset password fonctionnel
- [x] Routes protégées redirigent vers login
- [x] `pnpm build` et `pnpm test` passent

---

## Phase 3 — Layout protégé et navigation (parallélisable par app) — ✅ Complète

Layout sidebar + header commun à toutes les pages post-login.

| Ordre | Issue | Titre | Priorité | Skills | Dépend de | Résultat |
|-------|-------|-------|----------|--------|-----------|----------|
| ✅ 8 | [#77](https://github.com/dduquenne/unanima-platform/issues/77) | Layout `(protected)/layout.tsx` — Links | 🟠 Haute | ergonomix, archicodix | #7 | Fait (`7f00669`) |
| ✅ 9 | [#77](https://github.com/dduquenne/unanima-platform/issues/77) | Layout `(protected)/layout.tsx` — CREAI | 🟠 Haute | ergonomix, archicodix | #7 | Fait (`995ed93`) |
| ✅ 10 | [#77](https://github.com/dduquenne/unanima-platform/issues/77) | Layout `(protected)/layout.tsx` — Omega | 🟠 Haute | ergonomix, archicodix | #7 | Fait (`9c68733`) |
| ✅ 11 | [#78](https://github.com/dduquenne/unanima-platform/issues/78) | Page profil utilisateur (`/profile`) — 3 apps | 🟡 Moyenne | ergonomix, soclix | #8, #9, #10 | Fait (`a3aa8dc`) |
| ✅ 12 | [#78](https://github.com/dduquenne/unanima-platform/issues/78) | Page dashboard placeholder (`/dashboard`) — 3 apps | 🟡 Moyenne | ergonomix | #8, #9, #10 | Fait (`b9dac77`) |

**Layout Links (#8) :**
- ✅ Consultant/super_admin : Dashboard, Bénéficiaires, Bilans, Documents
- ✅ Bénéficiaire : Mon espace, Mes bilans, Documents
- ✅ Header : nom utilisateur, lien profil, bouton déconnexion

**Layout CREAI (#9) :**
- ✅ Direction/coordonnateur/admin_creai : Tableau de bord, Établissements, Rapports, Indicateurs
- ✅ Professionnel : Mon espace, Mes établissements

**Layout Omega (#10) :**
- ✅ Admin/responsable_sav : Dashboard SAV, Interventions, Pièces détachées, KPIs
- ✅ Technicien : Dashboard, Mes interventions, Pièces détachées
- ✅ Opérateur : Mon espace, Pièces détachées

**Point de contrôle Phase 3 :**
- [x] Navigation sidebar fonctionnelle par rôle pour les 3 apps
- [x] Page profil affiche les informations du user connecté
- [x] Page dashboard placeholder accessible après login
- [x] `pnpm build` et `pnpm test` passent
- [ ] Responsive vérifié (mobile/desktop) — *à valider manuellement*

---

## Résumé d'exécution

| Métrique | Planifié | Réalisé |
|----------|----------|---------|
| Issues totales | 12 | 12/12 ✅ |
| Commits | — | 12 |
| Fichiers créés/modifiés | — | 33 |
| Build | — | 9/9 tâches OK |
| Tests | 174+ | 174+ passent |
| CVEs HIGH | 0 attendu | 0 ✅ |

### Commits du sprint

| Commit | Description |
|--------|-------------|
| `3f08e8d` | feat(socle): upgrade Next.js 14 → 15 |
| `9949c15` | fix(socle): ESLint no-console warn → error |
| `c2b1469` | feat(auth): login pages + AuthProvider |
| `185f80e` | feat(auth): reset-password pages |
| `04efc9a` | feat(auth): auth callback routes |
| `2d97222` | feat(auth): route protection middleware |
| `7f00669` | feat(links): protected layout sidebar |
| `995ed93` | feat(creai): protected layout sidebar |
| `9c68733` | feat(omega): protected layout sidebar |
| `a3aa8dc` | feat(socle): user profile page |
| `b9dac77` | feat(socle): dashboard placeholder |
| `8a17d82` | chore: update next-env.d.ts |

### Issues GitHub Project

| Issue | Titre | Statut |
|-------|-------|--------|
| [#74](https://github.com/dduquenne/unanima-platform/issues/74) | Upgrade Next.js 14 → 15 | ✅ Terminé |
| [#75](https://github.com/dduquenne/unanima-platform/issues/75) | Pages d'authentification | ✅ Terminé |
| [#76](https://github.com/dduquenne/unanima-platform/issues/76) | Middleware protection routes | ✅ Terminé |
| [#77](https://github.com/dduquenne/unanima-platform/issues/77) | Layout protégé role-based | ✅ Terminé |
| [#78](https://github.com/dduquenne/unanima-platform/issues/78) | Pages profil + dashboard | ✅ Terminé |

---

## Architecture post-sprint

```
apps/{links,creai,omega}/src/
├── app/
│   ├── layout.tsx              ← Root layout + Providers
│   ├── page.tsx                ← Redirect → /login
│   ├── providers.tsx           ← AuthProvider wrapper (NEW)
│   ├── login/page.tsx          ← Page de connexion (NEW)
│   ├── reset-password/page.tsx ← Réinitialisation MDP (NEW)
│   ├── auth/callback/route.ts  ← OAuth/magic link callback (NEW)
│   ├── (protected)/
│   │   ├── layout.tsx          ← Sidebar + header role-based (NEW)
│   │   ├── dashboard/page.tsx  ← Dashboard placeholder (NEW)
│   │   └── profile/page.tsx    ← Profil utilisateur (NEW)
│   ├── api/health/route.ts     ← Health check (inchangé)
│   ├── error.tsx
│   ├── loading.tsx
│   └── not-found.tsx
├── config/auth.config.ts
├── middleware.ts               ← Protection des routes (NEW)
└── styles/theme.css
```

---

## Notes et observations

1. **Issue #2 (async API)** : aucune migration nécessaire — le codebase n'utilise pas encore de dynamic routes ni `headers()`/`cookies()`. Le middleware auth utilise `request.cookies` (API NextRequest), inchangé en Next.js 15.
2. **AuthProvider** : fix appliqué pour gérer gracieusement l'absence d'env vars pendant le prerendering Next.js 15 (retourne `null` au lieu de throw).
3. **Dépendance ajoutée** : `@supabase/ssr` ajouté comme dépendance directe des 3 apps (nécessaire pour les route handlers `/auth/callback`).
4. **Issues d'audit Sprint 2** : 5 issues d'audit (héritées de la roadmap auditix : #43, #47, #48, #50, #58) restent en 📋 Backlog dans le projet. Elles pourront être traitées dans un sprint futur dédié.

---

## Contraintes d'exécution (respectées)

- ✅ **Base :** `master` (après merge Sprint 1)
- ✅ **Build obligatoire** entre chaque phase
- ✅ **Tests obligatoires** avant chaque commit
- ✅ **Format commit :** `feat(scope): description`
- ✅ **Scopes :** `auth`, `links`, `creai`, `omega`, `socle`
