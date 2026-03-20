# .sprint/ — Plans d'exécution des sprints

Ce répertoire contient les plans d'exécution détaillés pour chaque sprint.
Ces fichiers sont la **source de vérité** utilisée par le skill `sprintix`
pour séquencer l'implémentation des issues.

## Structure

```
.sprint/
├── README.md              ← Ce fichier
├── roadmap-sprints-2-6.md ← Vue d'ensemble Sprints 2-6
├── sprint-1.md            ← Sprint 1 — Fondations & Sécurité ✅
├── sprint-2.md            ← Sprint 2 — Upgrade Next.js 15 + Auth UI + Layout
├── sprint-3.md            ← Sprint 3 — Schémas BDD métier + API CRUD
├── sprint-4.md            ← Sprint 4 — Pages métier (dashboards, listes, fiches)
├── sprint-5.md            ← Sprint 5 — Features avancées & intégrations
├── sprint-6.md            ← Sprint 6 — Tests E2E, sécurité, RGPD, production
└── ...
```

## Format d'un plan de sprint

Chaque fichier `sprint-N.md` suit cette structure :

1. **En-tête** : nom, période, objectif
2. **Phases** : groupes d'issues ordonnés avec dépendances
3. **Points de contrôle** : critères de passage entre phases
4. **Résumé** : métriques du sprint
5. **Contraintes** : règles d'exécution

## Cycle de vie

```
pilotix planifie → .sprint/sprint-N.md créé
       ↓
utilisateur valide le plan
       ↓
sprintix run N → exécution séquentielle
       ↓
sprintix status N → suivi de progression
```

## Conventions

- **Ordre** : numéro séquentiel au sein du sprint (1, 2, 3...)
- **Phases** : regroupement logique (prérequis → indépendants → risqués)
- **Review ⚠️** : marque les issues nécessitant une validation humaine
- **Points de contrôle** : checklist entre chaque phase (build, tests)
