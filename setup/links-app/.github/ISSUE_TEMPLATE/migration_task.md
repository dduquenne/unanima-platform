---
name: "Migration Task"
about: "Tâche de migration depuis le monorepo unanima-platform"
title: "migration: "
labels: ["migration", "needs-triage"]
---

## Module source (monorepo)

<!-- Chemin dans unanima-platform (ex: packages/auth/src/) -->

## Cible dans links-app

<!-- Chemin de destination (ex: src/lib/auth/) -->

## Dépendances

<!-- Quels autres modules doivent être migrés avant ? -->

## Adaptations nécessaires

<!-- Changements à apporter lors de l'internalisation -->
- [ ] Réécriture des imports `@unanima/*` → chemins locaux
- [ ] Suppression des fonctionnalités non utilisées par Links
- [ ] Adaptation des types/interfaces
- [ ] Tests à migrer/adapter

## Critères de validation

- [ ] Code migré et fonctionnel
- [ ] Tests passent
- [ ] Pas d'import `@unanima/*` résiduel
