# Guide de migration documentaire

## Quand utiliser ce guide
Ce guide s'applique quand un projet existant a une documentation non structurée ou
partiellement structurée, et que l'on souhaite migrer vers le référentiel Documentalix.

## Phase 0 — Audit de l'existant

### 0.1 Inventaire automatisé
```bash
# Lister tous les fichiers docs existants
find . -name "*.md" -o -name "*.txt" -o -name "*.docx" -o -name "*.pdf" \
  | grep -v node_modules | grep -v .git \
  > /tmp/inventory.txt

# Compter par type
find . -name "*.md" | grep -v node_modules | wc -l
```

### 0.2 Diagnostic des problèmes courants

| Problème              | Indicateur                              | Fréquence typique |
|----------------------|------------------------------------------|-------------------|
| Nommage incohérent    | `final`, `new`, `v2_ok`, espaces         | ~60% des projets  |
| Doublons              | Même contenu, noms différents            | ~40%              |
| Docs orphelins        | Non référencés, non linkés               | ~50%              |
| Frontmatter absent    | Pas de métadonnées YAML                  | ~70%              |
| Versioning manuel     | Versions dans le contenu du fichier      | ~80%              |
| Structure plate       | Tout dans un seul dossier               | ~45%              |

### 0.3 Scoring de maturité documentaire

Évaluer le score actuel (0-100) :

| Critère                          | Points max |
|----------------------------------|-----------|
| Structure de dossiers cohérente  | 20        |
| Convention de nommage respectée  | 20        |
| Frontmatter YAML présent         | 15        |
| Versioning documenté             | 15        |
| INDEX à jour                     | 10        |
| Liens internes fonctionnels      | 10        |
| Templates utilisés               | 10        |

---

## Phase 1 — Préparation

### 1.1 Créer la nouvelle arborescence
```bash
mkdir -p docs/{00-meta,01-vision,02-architecture,03-specifications,04-guides,05-api,06-tests,07-decisions,08-runbooks,09-changelog,archives}
```

### 1.2 Sauvegarder l'existant
```bash
# Créer une branche de sauvegarde Git
git checkout -b docs/pre-migration-backup
git add -A && git commit -m "docs: sauvegarde pré-migration documentaire"
git checkout -b docs/migration-documentaire
```

---

## Phase 2 — Migration par catégorie

### Algorithme de classification automatique

Pour chaque document existant, appliquer dans l'ordre :

1. **Lire les 50 premières lignes** pour comprendre le contenu
2. **Identifier le type** selon les mots-clés :
   - "comment", "tutorial", "step by step" → `GUIDE`
   - "decision", "we chose", "ADR" → `ADR`
   - "spec", "requirement", "feature", "user story" → `SPEC`
   - "deploy", "install", "setup", "configuration" → `GUIDE-OPS`
   - "test", "QA", "coverage", "report" → `RPT-TEST`
   - "API", "endpoint", "request", "response" → `API`
   - "incident", "post-mortem", "outage" → `RPT-OPS`
3. **Générer le nouveau nom** selon la convention
4. **Créer le frontmatter** avec les métadonnées récupérées

### 2.1 Règles de renommage

| Ancien pattern             | Nouveau pattern                           |
|---------------------------|-------------------------------------------|
| `README.md`               | Reste `README.md` (convention universelle)|
| `setup-guide.md`          | `GUIDE-OPS-setup-v1.0.md`                 |
| `api-docs.md`             | `API-CORE-reference-v1.0.md`              |
| `architecture.md`         | `ADR-ARCH-overview-v1.0.md`               |
| `test-plan.md`            | `RPT-TEST-plan-v1.0.md`                   |
| `spec_feature_login.md`   | `SPEC-AUTH-login-v1.0.md`                 |
| `doc v2 final OK.docx`    | Convertir en `.md` + renommer             |

### 2.2 Ajouter le frontmatter manquant

Pour chaque fichier sans frontmatter, insérer en tête :

```markdown
---
title: "[Titre extrait du contenu ou demander à l'utilisateur]"
id: [généré depuis le nom de fichier]
version: 1.0.0
status: approved
author: "[récupéré depuis git blame ou inconnu]"
created: "[date git du premier commit ou date du fichier]"
updated: "[date git du dernier commit]"
reviewers: []
tags: []
related: []
migrated_from: "[ancien chemin du fichier]"
migration_date: YYYY-MM-DD
---
```

Le champ `migrated_from` assure la traçabilité de la migration.

---

## Phase 3 — Validation post-migration

### 3.1 Checklist de validation

- [ ] Tous les fichiers ont un frontmatter valide
- [ ] Tous les fichiers respectent la convention de nommage
- [ ] Tous les fichiers sont dans le bon dossier
- [ ] L'INDEX.md a été regénéré
- [ ] Les liens internes ont été mis à jour
- [ ] Aucun document n'a été perdu (comparer les comptages)
- [ ] Les anciens chemins ont des redirections ou une note de migration
- [ ] La charte documentaire a été créée dans `docs/00-meta/`

### 3.2 Script de validation
```bash
python scripts/validate_migration.py docs/ --compare-with /tmp/inventory.txt
```

---

## Phase 4 — Communication et adoption

### 4.1 Annoncer la migration
Créer un `docs/00-meta/MIGRATION-NOTES.md` expliquant :
- Ce qui a changé et pourquoi
- Comment trouver un document (utiliser INDEX.md)
- La nouvelle convention à suivre pour les nouveaux docs

### 4.2 Mettre à jour le README principal
Ajouter une section "Documentation" pointant vers `docs/00-meta/INDEX.md`

### 4.3 Configurer les gardes CI/CD
Ajouter des checks qui rejettent les PR si :
- Un nouveau fichier `.md` ne respecte pas la convention de nommage
- Un fichier `.md` n'a pas de frontmatter valide
- L'INDEX.md n'a pas été mis à jour

---

## Durée estimée de migration

| Taille du projet    | Nombre de docs | Durée estimée |
|--------------------|----------------|---------------|
| Petit              | < 20 docs      | 1-2 heures    |
| Moyen              | 20-100 docs    | 1 journée     |
| Grand              | 100-500 docs   | 2-5 jours     |
| Très grand         | > 500 docs     | Sprint dédié  |
