# Sprint 1 — Fondations & Sécurité Critique

**Projet :** Roadmap Audit Socle Unanima
**Période :** 2026-03-23 → 2026-04-05
**Objectif :** Sécuriser les fondations du socle (env vars, CVE, performance BDD) et corriger les quick wins.

---

## Phase 1 — Prérequis critiques (séquentiel)

Ces issues bloquent potentiellement le fonctionnement des autres corrections.

| Ordre | Issue | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|-----------|--------|
| ✅ 1 | #44 | Variables d'environnement Supabase silencieusement vides | 🔴 Critique | securix, soclix | — | Fait (2026-03-20) |
| ✅ 2 | #52 | Turbo cache inutilisable pour les 6 packages | 🟠 Haute | optimix, soclix | — | Fait (2026-03-20) |

**Justification de l'ordre :**
- #44 est un prérequis fondamental : si les env vars ne sont pas validées, tout le socle est instable.
- #52 améliore le DX pour toutes les corrections suivantes (build plus rapide).

**Point de contrôle Phase 1 :**
- [x] `pnpm build` passe sans warnings turbo
- [x] Les apps démarrent correctement avec les env vars validées

---

## Phase 2 — Corrections indépendantes (parallélisable)

Issues sans dépendance entre elles, exécutables dans n'importe quel ordre.

| Ordre | Issue | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|-----------|--------|
| ✅ 3 | #51 | Index manquants sur audit_logs (user_id, created_at) | 🟠 Haute | databasix, migratix | — | Fait (2026-03-20) |
| ✅ 4 | #53 | Adresse email expéditeur codée en dur | 🟠 Haute | soclix, apix | — | Fait (2026-03-20) |
| ✅ 5 | #56 | console.log résiduels dans composants de production | 🟡 Moyenne | soclix | — | Fait (2026-03-20) |
| ✅ 6 | #57 | Typo DataTable : 'resultat' au lieu de 'résultats' | 🟡 Moyenne | soclix | — | Fait (2026-03-20) |

**Justification :**
- #51 : migration SQL indépendante, améliore les perfs des requêtes d'audit.
- #53 : refactoring isolé dans le package email.
- #56 et #57 : quick wins de nettoyage, aucun risque de régression.

**Point de contrôle Phase 2 :**
- [x] Migration SQL #51 validée (index créés)
- [x] `pnpm build` passe pour les 3 apps
- [x] `pnpm test` passe

---

## Phase 3 — Risque maîtrisé (validation humaine requise)

| Ordre | Issue | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|-----------|--------|
| ⚠️ 7 | #45 | 3 CVE HIGH dans les dépendances (next, glob, flatted) | 🔴 Critique | securix | Phase 1+2 | Partiel (2026-03-20) — glob+flatted fixés, Next.js 15 reporté Sprint 2 |

**Justification :**
- Les mises à jour de dépendances (surtout Next.js) peuvent causer des régressions.
- Exécutée en dernier pour que le pipeline soit stable avant d'introduire des risques.
- **Validation humaine obligatoire** avant merge.

**Point de contrôle Phase 3 :**
- [x] `pnpm audit` — HIGH CVEs réduites de 3 à 1 (glob+flatted fixés via overrides)
- [ ] CVE restante : next@14 → 15.0.8+ (Epic Sprint 2)
- [x] `pnpm build` passe pour les 3 apps
- [x] `pnpm test` passe
- [x] Review humaine effectuée (Option A validée)

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Issues totales | 7 |
| Critiques | 2 (#44, #45) |
| Hautes | 3 (#51, #52, #53) |
| Moyennes | 2 (#56, #57) |
| Chemin critique | #44 → Phase 2 → #45 |
| Parallélisme max | 4 issues (Phase 2) |
| Effort estimé | ~2-3 jours |

---

## Contraintes d'exécution

- **Branche :** `claude/plan-pilotix-sprint-1-VQgCk`
- **Base :** `master`
- **Build obligatoire** entre chaque phase
- **Tests obligatoires** avant chaque commit
- **Format commit :** `fix(scope): description (closes #XX)`

---

## Rapport d'exécution

**Date d'exécution :** 2026-03-20
**Issues traitées :** 7/7 (6 complètes + 1 partielle)
**Commits :** 8

| # | Issue | Commit | Résultat |
|---|-------|--------|----------|
| 1 | #44 | `32e64a8` | Auth env vars : `?? ''` → throw explicite |
| 2 | #52 | `528e030` | Turbo cache : per-package `outputs: []` → FULL TURBO 94ms |
| 3 | #51 | `66aa37e` | Migration `004_audit_logs_indexes.sql` |
| 4 | #53 | `e73aa0b` | `EMAIL_FROM` env var configurable |
| 5 | #56 | `4f013d1` | `console.error` gardé par `NODE_ENV` |
| 6 | #57 | `e04f001` | `resultats` → `résultats` |
| 7 | #45 | `e4a4199` | glob+flatted HIGH CVEs fixés (Next.js 15 → Sprint 2) |

### Métriques
- Build : 9/9 tasks, 0 warnings
- Tests : 174 tests, 100% passent
- CVE HIGH : 3 → 1 (restante : next@14, planifiée Sprint 2)

### Recommandations Sprint 2
- **Epic Next.js 15** : upgrade majeur 14→15, adapter async params/headers/cookies
- Ajouter une règle ESLint `no-console` pour prévenir les régressions #56
