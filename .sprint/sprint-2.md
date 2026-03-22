# Sprint 2 — Upgrade Next.js 15 + Auth UI + Layout applicatif

**Projet :** Roadmap Unanima Platform
**Période :** 2026-04-06 → 2026-04-19
**Objectif :** Mettre à jour le framework, déployer les pages d'authentification et le layout protégé pour les 3 apps.

---

## Phase 1 — Upgrade Next.js 15 (séquentiel, bloquant)

Epic critique reportée du Sprint 1. L'upgrade 14→15 corrige la dernière CVE HIGH (next@14) et débloque les nouvelles API async.

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| ✅ 1 | Upgrade Next.js 14 → 15 : adapter les 3 apps | 🔴 Critique | securix, soclix, archicodix | Sprint 1 | Fait (3f08e8d) |
| ✅ 2 | Adapter les `params`, `headers()`, `cookies()` async (Next.js 15 breaking changes) | 🔴 Critique | archicodix, anomalix | #1 | Fait (inclus dans 3f08e8d + 8a17d82) |
| ✅ 3 | Ajouter la règle ESLint `no-console` (prévention régression #56) | 🟡 Moyenne | soclix | — | Fait (9949c15) |

**Point de contrôle Phase 1 :**
- [x] `pnpm audit` : 0 HIGH CVEs
- [x] `pnpm build` passe pour les 3 apps
- [x] `pnpm test` : 228 tests passent
- [x] Aucune erreur TypeScript

---

## Phase 2 — Pages d'authentification (parallélisable par app)

Pages fonctionnelles avec le socle `@unanima/auth` existant.

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| ✅ 4 | Page login (`/login`) — 3 apps | 🟠 Haute | ergonomix, archicodix | Phase 1 | Fait (c2b1469) |
| ✅ 5 | Page reset password (`/reset-password`) — 3 apps | 🟠 Haute | ergonomix | Phase 1 | Fait (185f80e) |
| ✅ 6 | Page callback auth (`/auth/callback`) — 3 apps | 🟠 Haute | archicodix, securix | Phase 1 | Fait (04efc9a) |
| ✅ 7 | Middleware de protection des routes (`middleware.ts`) — 3 apps | 🟠 Haute | securix, archicodix | #4 | Fait (2d97222) |

**Point de contrôle Phase 2 :**
- [x] Login fonctionnel sur les 3 apps (avec Supabase)
- [x] Reset password fonctionnel
- [x] Routes protégées redirigent vers login
- [x] `pnpm build` et `pnpm test` passent

---

## Phase 3 — Layout protégé et navigation (parallélisable par app)

Layout sidebar + header commun à toutes les pages post-login.

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| ✅ 8 | Layout `(protected)/layout.tsx` avec sidebar et header — Links | 🟠 Haute | ergonomix, archicodix | #7 | Fait (7f00669) |
| ✅ 9 | Layout `(protected)/layout.tsx` avec sidebar et header — CREAI | 🟠 Haute | ergonomix, archicodix | #7 | Fait (995ed93) |
| ✅ 10 | Layout `(protected)/layout.tsx` avec sidebar et header — Omega | 🟠 Haute | ergonomix, archicodix | #7 | Fait (9c68733) |
| ✅ 11 | Page profil utilisateur (`/profile`) — socle commun | 🟡 Moyenne | ergonomix, soclix | #8, #9, #10 | Fait (a3aa8dc) |
| ✅ 12 | Page dashboard vide (`/dashboard`) avec placeholder — 3 apps | 🟡 Moyenne | ergonomix | #8, #9, #10 | Fait (b9dac77) |

**Point de contrôle Phase 3 :**
- [x] Navigation sidebar fonctionnelle par rôle pour les 3 apps
- [x] Page profil affiche les informations du user connecté
- [x] Page dashboard placeholder accessible après login
- [x] `pnpm build` et `pnpm test` passent

---

## Vérification d'exhaustivité
- [x] Toutes les issues du sprint dans le GitHub Project sont listées ci-dessus
- [x] Aucune issue n'a été omise ou reportée sans justification
- [x] L'ordre respecte la règle sécurité > features > mineurs

---

## Rapport d'exécution

**Date d'exécution :** Sprints 2 exécuté entre Sprint 1 (2026-03-20) et Sprint 3
**Issues traitées :** 12/12 (100%)
**Commits :** 11

| # | Issue | Commit | Résultat |
|---|-------|--------|----------|
| 1 | Upgrade Next.js 15 | `3f08e8d` | ✅ next@^15.0.0, 0 HIGH CVEs |
| 2 | Async params/headers/cookies | `8a17d82` | ✅ All routes use `await params`, `await cookies()` |
| 3 | ESLint no-console | `9949c15` | ✅ Rule set to `error`, 0 violations |
| 4 | Login pages | `c2b1469` | ✅ 3 apps, LoginForm + AuthProvider |
| 5 | Reset password pages | `185f80e` | ✅ 3 apps, ResetPasswordForm |
| 6 | Auth callback | `04efc9a` | ✅ 3 apps, Supabase code exchange |
| 7 | Middleware | `2d97222` | ✅ 3 apps, createAuthMiddleware |
| 8 | Layout Links | `7f00669` | ✅ Role-based sidebar (consultant/bénéficiaire) |
| 9 | Layout CREAI | `995ed93` | ✅ Role-based sidebar (direction/coordonnateur/professionnel) |
| 10 | Layout Omega | `9c68733` | ✅ Role-based sidebar (responsable_sav/technicien/operateur) |
| 11 | Profile page | `a3aa8dc` | ✅ 3 apps, useAuth() + Card |
| 12 | Dashboard placeholder | `b9dac77` | ✅ 3 apps, KPIs + charts + alerts |

### Métriques de qualité
- Build : ✅ (9/9 tasks, 3 apps + 6 packages)
- Tests : ✅ (228 tests, 100% passent)
- Lint : ✅ (no-console: error, 0 violations)
- CVE HIGH : 0 (vs 1 avant Sprint 2)
- Audit : 2 moderate vulnerabilities only
