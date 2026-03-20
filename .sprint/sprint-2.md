# Sprint 2 — Upgrade Next.js 15 + Auth UI + Layout applicatif

**Projet :** Roadmap Unanima Platform
**Période :** 2026-04-06 → 2026-04-19
**Objectif :** Mettre à jour le framework, déployer les pages d'authentification et le layout protégé pour les 3 apps.

---

## Phase 1 — Upgrade Next.js 15 (séquentiel, bloquant)

Epic critique reportée du Sprint 1. L'upgrade 14→15 corrige la dernière CVE HIGH (next@14) et débloque les nouvelles API async.

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| 1 | Upgrade Next.js 14 → 15 : adapter les 3 apps | 🔴 Critique | securix, soclix, archicodix | Sprint 1 | ⚠️ Validation humaine |
| 2 | Adapter les `params`, `headers()`, `cookies()` async (Next.js 15 breaking changes) | 🔴 Critique | archicodix, anomalix | #1 | — |
| 3 | Ajouter la règle ESLint `no-console` (prévention régression #56) | 🟡 Moyenne | soclix | — | — |

**Détail issue #1 — Upgrade Next.js 15 :**
- Mettre à jour `next` dans les 3 apps + `@types/react` + `@types/react-dom`
- Mettre à jour `eslint-config-next`
- Supprimer les `overrides` pnpm pour glob/flatted (plus nécessaires après upgrade)
- Vérifier `pnpm audit` : 0 HIGH CVEs attendu

**Détail issue #2 — Async API :**
- `params` dans les pages dynamiques → `await params`
- `headers()` → `await headers()`
- `cookies()` → `await cookies()`
- `searchParams` → `await searchParams`
- Adapter le middleware `@unanima/auth` si nécessaire

**Point de contrôle Phase 1 :**
- [ ] `pnpm audit` : 0 HIGH CVEs
- [ ] `pnpm build` passe pour les 3 apps
- [ ] `pnpm test` : 174+ tests passent
- [ ] Aucune erreur TypeScript

---

## Phase 2 — Pages d'authentification (parallélisable par app)

Pages fonctionnelles avec le socle `@unanima/auth` existant.

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| 4 | Page login (`/login`) — 3 apps | 🟠 Haute | ergonomix, archicodix | Phase 1 | — |
| 5 | Page reset password (`/reset-password`) — 3 apps | 🟠 Haute | ergonomix | Phase 1 | — |
| 6 | Page callback auth (`/auth/callback`) — 3 apps | 🟠 Haute | archicodix, securix | Phase 1 | — |
| 7 | Middleware de protection des routes (`middleware.ts`) — 3 apps | 🟠 Haute | securix, archicodix | #4 | — |

**Détail issue #4 — Page login :**
- Utilise `<LoginForm>` de `@unanima/auth`
- Thème CSS spécifique par app (couleurs, logo)
- Gestion des erreurs (credentials invalides, compte désactivé)
- Redirect vers `/dashboard` après login

**Détail issue #7 — Middleware :**
- Routes publiques : `/login`, `/reset-password`, `/auth/callback`, `/api/health`
- Routes protégées : tout le reste
- Redirect vers `/login` si non authentifié
- Utilise `createAuthMiddleware()` de `@unanima/auth`

**Point de contrôle Phase 2 :**
- [ ] Login fonctionnel sur les 3 apps (avec Supabase)
- [ ] Reset password fonctionnel
- [ ] Routes protégées redirigent vers login
- [ ] `pnpm build` et `pnpm test` passent

---

## Phase 3 — Layout protégé et navigation (parallélisable par app)

Layout sidebar + header commun à toutes les pages post-login.

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| 8 | Layout `(protected)/layout.tsx` avec sidebar et header — Links | 🟠 Haute | ergonomix, archicodix | #7 | — |
| 9 | Layout `(protected)/layout.tsx` avec sidebar et header — CREAI | 🟠 Haute | ergonomix, archicodix | #7 | — |
| 10 | Layout `(protected)/layout.tsx` avec sidebar et header — Omega | 🟠 Haute | ergonomix, archicodix | #7 | — |
| 11 | Page profil utilisateur (`/profile`) — socle commun | 🟡 Moyenne | ergonomix, soclix | #8, #9, #10 | — |
| 12 | Page dashboard vide (`/dashboard`) avec placeholder — 3 apps | 🟡 Moyenne | ergonomix | #8, #9, #10 | — |

**Détail issue #8 — Layout Links :**
- Sidebar : Dashboard, Bénéficiaires, Bilans, Documents (consultant) / Mon espace, Mes bilans (bénéficiaire)
- Header : nom utilisateur, avatar, menu déroulant (profil, déconnexion)
- Navigation conditionnelle selon le rôle (`useRequireRole`)
- Responsive : sidebar collapsible sur mobile
- Utilise `<Layout>` de `@unanima/dashboard` comme base

**Détail issue #9 — Layout CREAI :**
- Sidebar : Tableau de bord, Établissements, Rapports, Indicateurs (direction/coordonnateur)
- Même pattern que Links avec rôles CREAI

**Détail issue #10 — Layout Omega :**
- Sidebar : Dashboard SAV, Interventions, Pièces détachées, KPIs (responsable_sav)
- Même pattern que Links avec rôles Omega

**Point de contrôle Phase 3 :**
- [ ] Navigation sidebar fonctionnelle par rôle pour les 3 apps
- [ ] Page profil affiche les informations du user connecté
- [ ] Page dashboard placeholder accessible après login
- [ ] `pnpm build` et `pnpm test` passent
- [ ] Responsive vérifié (mobile/desktop)

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Issues totales | 12 |
| Critiques | 2 (#1, #2) |
| Hautes | 5 (#4, #5, #6, #7, #8/#9/#10) |
| Moyennes | 2 (#3, #11, #12) |
| Chemin critique | #1 → #2 → #4 → #7 → #8 → #12 |
| Parallélisme max | 3 (Phase 2: auth pages) + 3 (Phase 3: layouts par app) |
| Effort estimé | ~5-7 jours |

---

## Contraintes d'exécution

- **Base :** `master` (après merge Sprint 1)
- **Build obligatoire** entre chaque phase
- **Tests obligatoires** avant chaque commit
- **Format commit :** `feat(scope): description (closes #XX)`
- **Scopes :** `auth`, `links`, `creai`, `omega`, `core`, `socle`
