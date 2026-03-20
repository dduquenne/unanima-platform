# Référence Audit — Documentation

## README.md

- [ ] Description du projet (à quoi ça sert, pour qui)
- [ ] Prérequis et versions (Node, npm, DB, services externes)
- [ ] Installation en < 5 commandes
- [ ] Variables d'environnement listées et expliquées
- [ ] Commandes principales (dev, build, test, lint)
- [ ] Architecture de haut niveau
- [ ] Contact / contributeurs

## Documentation technique

- [ ] JSDoc sur toutes les fonctions publiques et exportées
- [ ] Types TS expressifs (autodocumentants) — `getUserById(id: UserId): Promise<User | null>`
- [ ] ADR (Architecture Decision Records) pour les choix structurants
- [ ] CHANGELOG.md maintenu (ou conventionnal commits + release-it)
- [ ] Diagrammes à jour (C4, séquence, entités) — Mermaid recommandé

## Documentation API

- [ ] OpenAPI / Swagger si API REST
- [ ] tRPC types auto-générés documentés
- [ ] GraphQL schema documenté (descriptions sur les types et champs)
- [ ] Exemples de requêtes/réponses

## Onboarding

- [ ] CONTRIBUTING.md (comment contribuer, conventions)
- [ ] Setup en < 30 minutes pour un nouveau développeur
- [ ] Glossaire métier si domaine complexe
- [ ] Liens vers les environnements (dev, staging, prod, monitoring)

## Storybook / Documentation composants

- [ ] Composants UI documentés avec cas d'usage
- [ ] Props documentées avec types et valeurs par défaut
- [ ] États (loading, error, empty, filled) illustrés
