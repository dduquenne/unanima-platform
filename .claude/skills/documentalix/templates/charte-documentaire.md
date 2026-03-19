---
title: "Charte documentaire — [Nom du projet]"
id: META-GLOBAL-charte-documentaire
version: 1.0.0
status: approved
author: "[Auteur]"
created: YYYY-MM-DD
updated: YYYY-MM-DD
reviewers: []
tags: [meta, charte, référentiel]
related: [META-GLOBAL-index]
---

# Charte documentaire — [Nom du projet]

> Ce document fait référence pour toute question relative à la gestion du référentiel
> documentaire du projet. Il est opposable à tous les contributeurs.

---

## 1. Objectifs

Cette charte définit les règles de gestion de la documentation du projet **[Nom du projet]**.
Elle vise à garantir :

- **Cohérence** : un référentiel unifié et navigable
- **Traçabilité** : historique des changements, versions, décisions
- **Accessibilité** : tout collaborateur peut trouver un document en < 2 minutes
- **Maintenabilité** : la documentation évolue avec le code, pas après

---

## 2. Périmètre

Cette charte s'applique à **tous les documents** placés dans le répertoire `docs/` du projet,
quel que soit leur auteur ou leur format.

Sont exclus du périmètre : les commentaires de code, les messages de commit, les tickets.

---

## 3. Structure des dossiers

```
docs/
├── 00-meta/              # [Cette charte, glossaire, INDEX]
├── 01-[section]/         # [Adapter selon le type de projet]
├── ...
└── archives/             # Documents obsolètes, jamais supprimés
```

> **Règle** : ne jamais créer de dossiers hors de cette arborescence sans mise à jour de la charte.

---

## 4. Convention de nommage

### Format
```
[PREFIXE]-[CATEGORIE]-[nom-court]-v[X.Y].md
```

### Préfixes autorisés

| Préfixe | Type de document            |
|---------|-----------------------------|
| `SPEC`  | Spécification fonctionnelle |
| `ADR`   | Decision d'architecture     |
| `GUIDE` | Guide ou tutorial           |
| `API`   | Documentation d'API         |
| `RUN`   | Runbook opérationnel        |
| `RPT`   | Rapport (test, incident...) |

### Catégories du projet

| Catégorie | Domaine concerné |
|-----------|-----------------|
| `[CAT1]`  | [Domaine 1]     |
| `[CAT2]`  | [Domaine 2]     |

### Règles strictes
- ❌ Jamais d'espaces → utiliser des tirets
- ❌ Jamais d'accents ou caractères spéciaux
- ❌ Jamais de `final`, `new`, `ok`, `v2_new` dans le nom
- ✅ Le versioning est géré par le suffixe `-vX.Y`

---

## 5. Frontmatter YAML obligatoire

Tout document `.md` doit commencer par :

```yaml
---
title: "Titre complet"
id: PREFIXE-CAT-nom-court
version: 1.0.0
status: draft | review | approved | archived | deprecated
author: Prénom Nom
created: YYYY-MM-DD
updated: YYYY-MM-DD
reviewers: []
tags: []
related: []
---
```

---

## 6. Versioning

| Incrément | Déclencheur                                 |
|-----------|---------------------------------------------|
| X.0.0     | Refonte complète, rupture structurelle      |
| x.Y.0     | Ajout de contenu significatif               |
| x.y.Z     | Corrections, reformulations mineures        |

Chaque modification doit incrémenter `version` et mettre à jour `updated`.

---

## 7. Cycle de vie des documents

```
draft → review → approved → archived
```

- **draft** : en cours, ne pas utiliser en référence
- **review** : soumis, en attente de validation
- **approved** : fait référence officielle
- **archived** : remplacé, conservé dans `docs/archives/`

> **Règle absolue** : ne jamais supprimer un document `approved`. Toujours archiver.

---

## 8. Maintenance de l'index

Le fichier `docs/00-meta/INDEX.md` doit être mis à jour :
- Après chaque création de document
- Après chaque modification de statut
- Via le script : `python docs/scripts/generate_index.py`

---

## 9. Contrôle qualité

### Avant toute PR
```bash
python docs/scripts/validate_doc.py [nouveau_fichier.md]
python docs/scripts/audit_docs.py docs/
```

### Audit périodique
Un audit complet est réalisé **une fois par sprint** et le rapport est publié dans
`docs/00-meta/audit-[YYYY-MM].md`.

---

## 10. Responsabilités

| Rôle                | Responsabilité                              |
|--------------------|---------------------------------------------|
| Tout contributeur   | Respecter la charte pour tout nouveau doc   |
| Tech Lead / Archi   | Valider les ADR avant approbation           |
| Product Owner       | Valider les SPEC avant approbation          |
| Responsable docs    | Audit mensuel, mise à jour de la charte     |

---

## Historique des révisions

| Version | Date | Auteur | Changements |
|---------|------|--------|-------------|
| 1.0.0   |      |        | Création initiale |
