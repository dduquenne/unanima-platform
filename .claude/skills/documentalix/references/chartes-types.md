# Chartes documentaires par type de projet

## Table des matières
1. [Projet SaaS / Application Web](#saas)
2. [API / Backend Service](#api)
3. [Monorepo / Multi-packages](#monorepo)
4. [Microservices](#microservices)
5. [Projet Data / ML](#data-ml)
6. [Projet Open Source](#open-source)

---

## 1. Projet SaaS / Application Web {#saas}

### Arborescence recommandée
```
docs/
├── 00-meta/           # Charte, glossaire, INDEX
├── 01-produit/        # Vision, roadmap, personas, user stories
├── 02-architecture/   # Stack, schémas, ADR
├── 03-specs/          # Specs fonctionnelles par feature
├── 04-ux/             # Designs, wireframes, design system
├── 05-api/            # API REST/GraphQL, webhooks
├── 06-dev/            # Guides setup, conventions code, CI/CD
├── 07-ops/            # Déploiement, monitoring, runbooks
├── 08-tests/          # Stratégie QA, plans de test
├── 09-business/       # Contrats, SLA, onboarding client
└── archives/
```

### Préfixes spécifiques SaaS
| Préfixe | Usage                        |
|---------|------------------------------|
| `FEAT`  | Documentation feature produit |
| `UX`    | Spécification UX/UI           |
| `SLA`   | Accord de niveau de service   |
| `ONB`   | Onboarding client             |

---

## 2. API / Backend Service {#api}

### Arborescence recommandée
```
docs/
├── 00-meta/
├── 01-overview/       # Présentation, use cases, limites
├── 02-quickstart/     # Getting started en < 5 minutes
├── 03-authentication/ # Auth flows, tokens, scopes
├── 04-endpoints/      # Référence endpoints (auto-généré si possible)
├── 05-errors/         # Codes d'erreur, troubleshooting
├── 06-webhooks/       # Événements, payloads, retry
├── 07-sdks/           # Guides d'intégration par langage
├── 08-changelog/      # Historique versions API
└── archives/
```

### Règle spécifique API
- La documentation des endpoints doit être **générée** depuis le code (OpenAPI/Swagger)
- Les fichiers générés vont dans `05-endpoints/generated/` — NE PAS éditer manuellement
- Maintenir un `CHANGELOG.md` strict avec breaking changes clairement identifiés

### Préfixes spécifiques API
| Préfixe | Usage                      |
|---------|----------------------------|
| `API`   | Documentation d'endpoint   |
| `INT`   | Guide d'intégration        |
| `SDK`   | Documentation SDK          |
| `CHG`   | Changelog de version       |

---

## 3. Monorepo / Multi-packages {#monorepo}

### Arborescence recommandée
```
docs/
├── 00-meta/           # Charte globale, INDEX global
├── 01-global/         # Architecture globale, décisions cross-packages
├── packages/
│   ├── [package-a]/   # Docs spécifiques au package A
│   │   ├── README.md
│   │   ├── CHANGELOG.md
│   │   └── docs/
│   └── [package-b]/
├── 02-workflows/      # Workflows de dev, release, contribution
├── 03-infrastructure/ # CI/CD global, déploiement
└── archives/
```

### Règle spécifique Monorepo
- Chaque package a son propre `CHANGELOG.md` versionné indépendamment
- Les ADR cross-packages vont dans `docs/01-global/decisions/`
- Le `docs/00-meta/INDEX.md` doit agréger tous les packages

---

## 4. Microservices {#microservices}

### Arborescence recommandée
```
docs/
├── 00-meta/                  # Charte, glossaire, INDEX
├── 01-architecture/          # Architecture globale, event flows
├── 02-services/              # Un dossier par service
│   ├── [service-auth]/
│   │   ├── README.md
│   │   ├── api.md
│   │   ├── events.md
│   │   └── runbook.md
│   └── [service-billing]/
├── 03-infrastructure/        # K8s, Docker, service mesh
├── 04-communication/         # Contrats d'interface, événements, schémas
├── 05-observability/         # Logs, métriques, traces, alertes
└── archives/
```

### Règle spécifique Microservices
- **Consumer-Driven Contract Testing** : les contrats d'interface sont des documents de premier rang
- Chaque service doit avoir un `runbook.md` opérationnel
- Le catalogue de services (`02-services/CATALOGUE.md`) est maintenu à jour automatiquement

---

## 5. Projet Data / ML {#data-ml}

### Arborescence recommandée
```
docs/
├── 00-meta/
├── 01-data/           # Sources de données, schemas, data catalog
├── 02-models/         # Fiches modèles, performances, biais
├── 03-pipelines/      # Pipelines ETL/ELT, DAGs, orchestration
├── 04-experiments/    # Journal d'expériences (MLflow-like en doc)
├── 05-gouvernance/    # RGPD, sécurité données, data lineage
├── 06-monitoring/     # Dérive de données, alertes modèles
└── archives/
```

### Règle spécifique Data/ML
- **Model Card** obligatoire pour chaque modèle en production (voir template `templates/model-card.md`)
- **Data Dictionary** maintenu dans `01-data/data-dictionary.md`
- Les expériences sont documentées dans `04-experiments/` avec résultats et hypothèses

---

## 6. Projet Open Source {#open-source}

### Arborescence recommandée
```
docs/                  # ou /documentation/ pour projets volumineux
├── README.md          # À la racine du repo
├── CONTRIBUTING.md    # Guide de contribution
├── CHANGELOG.md       # Historique versions
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── docs/
│   ├── getting-started/
│   ├── guides/
│   ├── api-reference/
│   ├── examples/
│   └── faq/
```

### Règle spécifique Open Source
- Tous les docs racine (`README`, `CONTRIBUTING`, etc.) suivent les conventions GitHub
- La documentation est optimisée pour les générateurs de sites statiques (Docusaurus, MkDocs, VitePress)
- Chaque PR doit inclure la mise à jour documentaire correspondante (CI check)

---

## Matrice de sélection de charte

| Critère                        | SaaS | API | Monorepo | Microservices | Data/ML | OSS |
|-------------------------------|------|-----|----------|---------------|---------|-----|
| Documentation produit          | ✅✅  | ✅   | ✅        | ✅             | ✅       | ✅✅ |
| Référence API auto-générée     | ✅   | ✅✅  | ✅        | ✅✅            | ✅       | ✅✅ |
| Runbooks opérationnels         | ✅   | ✅   | ✅        | ✅✅            | ✅       | ❌  |
| Data catalog / Model cards     | ❌   | ❌   | ❌        | ❌             | ✅✅      | ❌  |
| Contrats d'interface           | ✅   | ✅✅  | ✅        | ✅✅            | ✅       | ✅  |
| Gestion per-package            | ❌   | ❌   | ✅✅       | ✅✅            | ❌       | ✅  |
