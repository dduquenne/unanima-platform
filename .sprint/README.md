# .sprint/ — Plans d'exécution des sprints

Ce répertoire contient les plans d'exécution détaillés pour chaque sprint.
Ces fichiers sont la **source de vérité** utilisée par le skill `sprintix`
pour séquencer l'implémentation des issues.

## Structure

```
.sprint/
├── README.md              ← Ce fichier
├── roadmap-sprints-2-6.md ← Vue d'ensemble Sprints 2-6 (vélocité, MoSCoW, risques)
├── sprint-1.md            ← Sprint 1 — Fondations & Sécurité ✅ (7 issues, 3j)
├── sprint-2.md            ← Sprint 2 — Upgrade Next.js 15 + Auth UI + Layout (12 issues)
├── sprint-3.md            ← Sprint 3 — Schémas BDD métier + API CRUD (11 issues)
├── sprint-4.md            ← Sprint 4 — Pages métier : dashboards, listes, fiches (16 issues)
├── sprint-5.md            ← Sprint 5 — Features avancées & intégrations (12 issues, MoSCoW)
├── sprint-6.md            ← Sprint 6 — Tests E2E, sécurité, RGPD, production (17 issues)
└── ...
```

## Format d'un plan de sprint

Chaque fichier `sprint-N.md` suit cette structure :

1. **En-tête** : nom, période, objectif, vélocité de référence
2. **Pré-requis** : checklist à vérifier avant démarrage
3. **Phases** : groupes d'issues ordonnés avec dépendances
   - Chaque tâche : titre, priorité, **effort** (XS/S/M/L), skills, dépendances, review
   - Détails : fichiers à créer, patterns de code, **critères d'acceptation Gherkin**
4. **Points de contrôle** : critères de passage entre phases
5. **Résumé** : métriques du sprint + **estimations par tâche**
6. **Contraintes** : règles d'exécution
7. **Risques** : tableau risques/mitigations par sprint

## Enrichissements v2 (2026-03-20)

Les plans sprints 3-6 ont été complétés avec :
- **Estimations par tâche** (XS/S/M/L) basées sur la vélocité Sprint 1
- **Critères d'acceptation Gherkin** pour les tâches critiques et hautes
- **Chemins de fichiers concrets** basés sur la structure réelle du codebase
- **Patterns de code** (exemples TypeScript) pour les route handlers et helpers
- **Priorisation MoSCoW** (Sprint 5) pour gérer le risque de scope creep
- **Pré-requis explicites** en début de chaque sprint
- **Risques et mitigations** par sprint
- **Stratégies de rollback** pour les migrations BDD
- **Scénario si retard** (Sprint 5) avec ordre de report des tâches

## Cycle de vie

```
pilotix planifie → .sprint/sprint-N.md créé
       ↓
utilisateur valide le plan
       ↓
sprintix run N → exécution séquentielle
       ↓
sprintix status N → suivi de progression
       ↓
pilotix réordonne si blocage
```

## Conventions

- **Ordre** : numéro séquentiel au sein du sprint (1, 2, 3...)
- **Phases** : regroupement logique (prérequis → indépendants → risqués)
- **Effort** : XS (< 2h), S (< 0.5j), M (0.5-1j), L (1-2j)
- **MoSCoW** : Must / Should / Could / Won't (Sprint 5 uniquement)
- **Review ⚠️** : marque les issues nécessitant une validation humaine
- **Points de contrôle** : checklist entre chaque phase (build, tests)
- **Gherkin** : critères d'acceptation au format Given/When/Then
