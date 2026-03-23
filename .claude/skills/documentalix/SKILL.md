---
name: documentalix
description: >
  Compétence spécialisée dans la gestion complète du référentiel documentaire d'un projet
  informatique. Utilise ce skill dès qu'une question touche à la documentation projet :
  création ou modification de documents, respect de la charte documentaire, nommage de
  fichiers, structure des dossiers, versioning de documents, référencement, audit
  documentaire, génération d'index, migration de docs, onboarding documentaire, ou toute
  demande impliquant la cohérence et la qualité du référentiel docs d'un projet. Également
  lorsque l'utilisateur mentionne "charte documentaire", "référentiel docs", "documentalix",
  "arborescence docs", "nommage fichier", "versioning document", "index documentaire",
  "audit docs", "template document". Déclencher impérativement si l'utilisateur crée ou
  modifie un fichier .md, .docx, .pdf, ou tout document destiné à la base de connaissance
  du projet.
compatibility:
  recommends:
    - projetix        # Pour les documents de spécifications fonctionnelles et notes de cadrage
    - maquettix-final # Quand un document doit intégrer des maquettes SVG d'écrans
    - rgpdix          # Pour les documents RGPD (registre des traitements, mentions légales, politique de confidentialité)
---

# Documentalix — Gestionnaire de Référentiel Documentaire

## Conventions de performance

Ce skill applique les conventions de `_common/performance-workflow.md` :
- **Feedback continu** : afficher un message avant chaque opération documentaire
- **Lecture conditionnelle** : ne lire les références que si le type de projet n'est pas clair
- **Cadrage du scope** : identifier l'opération demandée avant de scanner tout le référentiel

### Lecture conditionnelle des références

| Demande | Fichiers à lire | Fichiers à NE PAS lire |
|---------|----------------|----------------------|
| Créer un document | Aucun (conventions ci-dessous suffisent) | Tous |
| Créer la charte d'un projet | `references/chartes-types.md` | `templates-catalogue.md`, `migration-guide.md` |
| Migrer un référentiel existant | `references/migration-guide.md` | `chartes-types.md` |
| Choisir un template | `references/templates-catalogue.md` | Les autres |

---

## Rôle et mission

Documentalix est le gardien du référentiel documentaire d'un projet informatique. Son rôle est
de garantir que chaque document créé, modifié ou archivé respecte une charte documentaire
cohérente, permettant une navigation intuitive, une traçabilité rigoureuse et une maintenabilité
durable de la base de connaissance projet.

**Avant toute action**, chercher la charte documentaire du projet si elle existe :
`docs/charte-documentaire.md` ou `docs/00-meta/CHARTE.md` — ne lire les références que si
la charte n'existe pas encore.

---

## Phase 1 — Diagnostic initial

Lors du premier usage dans un projet, ou si la charte n'existe pas encore :

1. **Scanner le répertoire docs existant** (si présent) pour comprendre l'état actuel
2. **Identifier les patterns** : nommage utilisé, profondeur d'arborescence, types de docs
3. **Détecter les incohérences** : fichiers mal nommés, doublons, docs orphelins, versions contradictoires
4. **Proposer ou confirmer la charte** selon le type de projet (voir `references/chartes-types.md`)

---

## Phase 2 — Charte documentaire

La charte est le contrat de cohérence du référentiel. Elle définit :

### 2.1 Structure des dossiers (arborescence standard)

```
docs/
├── 00-meta/              # Charte, glossaire, index général
├── 01-vision/            # Vision produit, objectifs, roadmap
├── 02-architecture/      # ADR, schémas techniques, stack
├── 03-specifications/    # Specs fonctionnelles et techniques
├── 04-guides/            # Guides d'installation, dev, ops
├── 05-api/               # Documentation API (OpenAPI, Postman)
├── 06-tests/             # Plans de test, rapports, stratégie QA
├── 07-decisions/         # ADR (Architecture Decision Records)
├── 08-runbooks/          # Procédures opérationnelles
├── 09-changelog/         # Historique des versions et releases
└── archives/             # Documents obsolètes conservés pour traçabilité
```

Adapter selon le type de projet (voir `references/chartes-types.md`).

### 2.2 Convention de nommage des fichiers

Format obligatoire : `[PREFIXE]-[CATEGORIE]-[NOM-COURT]-v[VERSION].[EXT]`

| Composant    | Règle                                              | Exemple              |
|-------------|-----------------------------------------------------|----------------------|
| PREFIXE     | Type doc : `SPEC`, `ADR`, `GUIDE`, `API`, `RUN`, `RPT` | `SPEC`            |
| CATEGORIE   | Domaine métier/technique en MAJUSCULES              | `AUTH`               |
| NOM-COURT   | Kebab-case, 2-4 mots significatifs                  | `login-oauth2`       |
| VERSION     | Semver simplifié : `1.0`, `1.1`, `2.0`             | `v1.2`               |
| EXT         | `.md` par défaut, `.pdf` pour exports formels        | `.md`                |

**Exemples corrects :**
- `SPEC-AUTH-login-oauth2-v1.2.md`
- `ADR-INFRA-choix-kubernetes-v1.0.md`
- `GUIDE-DEV-setup-local-v2.1.md`
- `RPT-TEST-rapport-regression-sprint14-v1.0.md`

**Règles strictes :**
- Jamais d'espaces → tirets uniquement
- Jamais de caractères spéciaux, accents, ou majuscules dans le NOM-COURT
- Jamais de `final`, `new`, `v2_new_ok` dans le nom → le versioning le gère
- Les dates dans le nom uniquement pour les rapports horodatés : `RPT-OPS-incident-20250319-v1.0.md`

### 2.3 Versioning des documents

Documentalix applique un **versioning sémantique documentaire** :

| Incrément | Déclencheur                                          |
|-----------|------------------------------------------------------|
| MAJEUR (X.0) | Refonte complète, changement structurel fondamental |
| MINEUR (x.Y) | Ajout de contenu significatif, nouvelle section     |
| PATCH (x.y.z) | Corrections, reformulations, fautes               |

**En-tête obligatoire** de chaque document :

```markdown
---
title: "Titre complet du document"
id: PREFIXE-CATEGORIE-nom-court
version: 1.2.0
status: draft | review | approved | archived
author: Prénom Nom
created: YYYY-MM-DD
updated: YYYY-MM-DD
reviewers: []
tags: [tag1, tag2]
related: [id-doc-lié-1, id-doc-lié-2]
---
```

### 2.4 Statuts documentaires

```
draft → review → approved → archived
                    ↓
               deprecated
```

- **draft** : en cours de rédaction, ne pas utiliser en production
- **review** : soumis à relecture, en attente de validation
- **approved** : validé, fait référence
- **archived** : remplacé par une version plus récente, conservé
- **deprecated** : obsolète, à ne plus utiliser, à supprimer après X mois

### 2.5 Index documentaire

Maintenir un `docs/00-meta/INDEX.md` auto-généré avec :
- Référence de tous les documents par catégorie
- Statut, version, date de mise à jour
- Score de fraîcheur (alerte si non mis à jour depuis > 90 jours)

---

## Phase 3 — Workflows opérationnels

### Créer un nouveau document

1. Déterminer le type → choisir le PREFIXE approprié
2. Identifier la catégorie → dossier cible dans l'arborescence
3. Générer le nom selon la convention (validation automatique)
4. Insérer le frontmatter YAML complet avec `status: draft`
5. Appliquer le template correspondant (voir `templates/`)
6. Enregistrer dans le bon dossier
7. Mettre à jour `INDEX.md`

### Modifier un document existant

1. Lire le frontmatter existant
2. Incrémenter la version selon l'amplitude du changement
3. Mettre à jour `updated:` avec la date du jour
4. Si le statut était `approved` → repasser en `review` si changement significatif
5. Consigner le changement dans le CHANGELOG du document (section `## Historique`)
6. Mettre à jour `INDEX.md`

### Archiver un document

1. Déplacer vers `docs/archives/[année]/`
2. Changer le statut en `archived`
3. Ajouter dans l'en-tête `archived_by` et `archived_date`
4. Créer ou mettre à jour le successeur avec `supersedes: [id-ancien]`
5. Mettre à jour `INDEX.md`

### Audit documentaire

Exécuter régulièrement (script disponible dans `scripts/audit_docs.py`) :
- Vérifier la conformité du nommage de tous les fichiers
- Détecter les documents sans frontmatter
- Identifier les docs `draft` de plus de 30 jours
- Signaler les docs `approved` non mis à jour depuis > 90 jours
- Détecter les liens internes cassés
- Calculer le taux de couverture documentaire

---

## Phase 4 — Qualité et meilleures pratiques

### Principes rédactionnels

- **Docs as Code** : la documentation vit dans le même repo que le code, versionnée avec Git
- **Single Source of Truth** : un seul document fait référence pour chaque sujet
- **Docs Driven Development** : écrire la doc avant ou pendant le développement, pas après
- **Diátaxis Framework** : classer chaque doc en Tutorial, How-to, Reference ou Explanation
- **Living Documentation** : les docs automatiques (API, tests) sont générées, pas écrites à la main

### Architecture Decision Records (ADR)

Pour chaque décision technique importante, créer un ADR dans `docs/07-decisions/` :

```markdown
# ADR-[NNN]: [Titre de la décision]

## Statut
[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Contexte
[Pourquoi cette décision est nécessaire]

## Décision
[Ce qui a été décidé]

## Conséquences
### Positives
### Négatives
### Risques
```

### Liens et références croisées

- Toujours utiliser des liens relatifs entre docs : `[voir ADR-001](../07-decisions/ADR-INFRA-choix-bdd-v1.0.md)`
- Référencer via l'`id` frontmatter dans le champ `related:` pour les liens sémantiques
- Ne jamais coder en dur des URLs absolues vers des docs internes

---

## Phase 5 — Génération et automatisation

### Générer l'index documentaire

Utiliser le script : `python scripts/generate_index.py docs/`

Produit un `INDEX.md` tabulaire avec statut, version, fraîcheur et liens.

### Valider la conformité d'un document

```bash
python scripts/validate_doc.py chemin/vers/document.md
```

Vérifie : frontmatter complet, nommage conforme, liens valides, statut cohérent.

### Migrer une documentation existante

Voir `references/migration-guide.md` pour le workflow complet de migration documentaire.

---

## Références complémentaires

- `references/chartes-types.md` — Chartes adaptées par type de projet (SaaS, API, monorepo, microservices)
- `references/templates-catalogue.md` — Catalogue de tous les templates disponibles
- `references/migration-guide.md` — Guide de migration d'un référentiel existant
- `references/diátaxis.md` — Application du framework Diátaxis à la doc projet
- `templates/` — Templates prêts à l'emploi pour chaque type de document

---

## Phase 6 — Détection automatique des documents obsolètes

### 6.1 Critères d'obsolescence

Documentalix détecte proactivement les documents qui nécessitent une attention :

| Signal | Seuil | Action |
|--------|-------|--------|
| Date `updated` > 90 jours | ⚠️ Alerte fraîcheur | Vérifier si le contenu est toujours exact |
| Date `updated` > 180 jours | 🔴 Alerte critique | Réviser ou archiver |
| Statut `draft` > 30 jours | ⚠️ Draft abandonné | Finaliser ou supprimer |
| Statut `deprecated` > 90 jours | 🔴 À supprimer | Archiver définitivement |
| Liens internes cassés | ⚠️ Incohérence | Corriger les références |
| Document non référencé dans INDEX.md | ⚠️ Orphelin | Ajouter à l'index ou supprimer |

### 6.2 Rapport de fraîcheur automatique

Générer un rapport de fraîcheur documentaire à chaque invocation d'audit :

```markdown
## Rapport de fraîcheur documentaire — YYYY-MM-DD

### Statistiques
- Documents total : N
- À jour (< 90 jours) : N (XX%)
- Attention requise (90-180 jours) : N (XX%)
- Obsolètes (> 180 jours) : N (XX%)
- Drafts abandonnés (> 30 jours) : N
- Orphelins (hors INDEX) : N

### Documents nécessitant une action

| Document | Statut | Dernière MAJ | Âge | Action recommandée |
|----------|--------|-------------|-----|-------------------|
| SPEC-AUTH-login-v1.2.md | approved | 2025-09-15 | 189j | 🔴 Réviser |
| GUIDE-DEV-setup-v1.0.md | draft | 2025-12-01 | 112j | ⚠️ Finaliser |
```

---

## Phase 7 — Génération automatique d'index documentaire

### 7.1 Index tabulaire complet

Documentalix génère un `INDEX.md` structuré automatiquement en scannant l'arborescence `docs/` :

```markdown
# Index Documentaire — Unanima Platform

*Généré automatiquement le YYYY-MM-DD — N documents référencés*

## Par catégorie

### Architecture (02-architecture/)
| ID | Titre | Version | Statut | MAJ | Fraîcheur |
|----|-------|---------|--------|-----|-----------|
| ADR-INFRA-choix-bdd | Choix de BDD | 1.0 | approved | 2025-10-01 | 🟢 |

### Spécifications (03-specifications/)
| ID | Titre | Version | Statut | MAJ | Fraîcheur |
|----|-------|---------|--------|-----|-----------|
| SPEC-AUTH-login-oauth2 | Login OAuth2 | 1.2 | approved | 2025-09-15 | 🟠 |

## Par statut
- **approved** : N documents
- **review** : N documents
- **draft** : N documents
- **archived** : N documents

## Alertes
- 🔴 N documents obsolètes (> 180 jours)
- ⚠️ N documents à vérifier (> 90 jours)
- ⚠️ N drafts abandonnés (> 30 jours)
```

### 7.2 Actualisation automatique

L'index doit être régénéré à chaque opération documentaire (création, modification, archivage).
Documentalix vérifie systématiquement la cohérence entre l'index et le système de fichiers.

---

## Règles absolues (non négociables)

1. **Jamais de document sans frontmatter YAML** — c'est l'identité du document
2. **Jamais de versioning dans le contenu** du fichier sans incrémenter la version frontmatter
3. **Jamais de suppression** d'un document approuvé — toujours archiver
4. **Toujours mettre à jour INDEX.md** après toute opération documentaire
5. **La charte documentaire prime** sur les habitudes individuelles — documenter les exceptions
6. **Toujours vérifier la fraîcheur** lors d'un audit — signaler les documents > 90 jours
