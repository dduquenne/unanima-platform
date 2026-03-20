# Sprint 1 — Fondations & Sécurité Critique

**Projet :** Roadmap Audit Socle Unanima
**Période :** 2026-03-23 → 2026-04-05
**Objectif :** Sécuriser les fondations du socle (env vars, CVE, performance BDD) et corriger les quick wins.

---

## Phase 1 — Prérequis critiques (séquentiel)

Ces issues bloquent potentiellement le fonctionnement des autres corrections.

| Ordre | Issue | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|-----------|--------|
| 1 | #44 | Variables d'environnement Supabase silencieusement vides | 🔴 Critique | securix, soclix | — | — |
| 2 | #52 | Turbo cache inutilisable pour les 6 packages | 🟠 Haute | optimix, soclix | — | — |

**Justification de l'ordre :**
- #44 est un prérequis fondamental : si les env vars ne sont pas validées, tout le socle est instable.
- #52 améliore le DX pour toutes les corrections suivantes (build plus rapide).

**Point de contrôle Phase 1 :**
- [ ] `pnpm build` passe sans warnings turbo
- [ ] Les apps démarrent correctement avec les env vars validées

---

## Phase 2 — Corrections indépendantes (parallélisable)

Issues sans dépendance entre elles, exécutables dans n'importe quel ordre.

| Ordre | Issue | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|-----------|--------|
| 3 | #51 | Index manquants sur audit_logs (user_id, created_at) | 🟠 Haute | databasix, migratix | — | — |
| 4 | #53 | Adresse email expéditeur codée en dur | 🟠 Haute | soclix, apix | — | — |
| 5 | #56 | console.log résiduels dans composants de production | 🟡 Moyenne | soclix | — | — |
| 6 | #57 | Typo DataTable : 'resultat' au lieu de 'résultats' | 🟡 Moyenne | soclix | — | — |

**Justification :**
- #51 : migration SQL indépendante, améliore les perfs des requêtes d'audit.
- #53 : refactoring isolé dans le package email.
- #56 et #57 : quick wins de nettoyage, aucun risque de régression.

**Point de contrôle Phase 2 :**
- [ ] Migration SQL #51 validée (index créés)
- [ ] `pnpm build` passe pour les 3 apps
- [ ] `pnpm test` passe

---

## Phase 3 — Risque maîtrisé (validation humaine requise)

| Ordre | Issue | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|-----------|--------|
| 7 | #45 | 3 CVE HIGH dans les dépendances (next, glob, flatted) | 🔴 Critique | securix | Phase 1+2 | ⚠️ REVIEW |

**Justification :**
- Les mises à jour de dépendances (surtout Next.js) peuvent causer des régressions.
- Exécutée en dernier pour que le pipeline soit stable avant d'introduire des risques.
- **Validation humaine obligatoire** avant merge.

**Point de contrôle Phase 3 :**
- [ ] `npm audit` ne montre plus de CVE HIGH
- [ ] `pnpm build` passe pour les 3 apps
- [ ] `pnpm test` passe
- [ ] Review humaine effectuée

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

- **Branche :** une branche par issue (`fix/auditix-crit-002`, etc.) ou branche sprint groupée
- **Base :** `dev`
- **Build obligatoire** entre chaque phase
- **Tests obligatoires** avant chaque commit
- **Format commit :** `fix(scope): description (closes #XX)`
- **Statut Project :** mettre à jour `📋 Backlog` → `🏗️ En cours` → `✅ Terminé`
