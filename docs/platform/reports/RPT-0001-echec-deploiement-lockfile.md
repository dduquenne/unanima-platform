---
ref: RPT-0001
title: Échec du déploiement des trois applications — lockfile désynchronisé
type: RPT
scope: platform
status: accepted
version: "1.0"
created: 2026-03-10
updated: 2026-03-10
author: Claude
related-issues: ["#4"]
supersedes: null
superseded-by: null
---

# RPT-0001 — Échec du déploiement des trois applications — lockfile désynchronisé

## Contexte

Les trois applications (links, creai, omega) échouent au déploiement sur Vercel
avec l'erreur `ERR_PNPM_OUTDATED_LOCKFILE`.

## Diagnostic

### Erreur observée

```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile"
because pnpm-lock.yaml is not up to date with <ROOT>/apps/creai/package.json

Failure reason:
specifiers in the lockfile ({}) don't match specs in package.json (...)
```

### Cause racine

Le fichier `pnpm-lock.yaml` ne contenait aucune entrée `importers` pour les
trois applications (`apps/links`, `apps/creai`, `apps/omega`). Seuls les
packages du socle (`packages/*`, `tooling/*`) et la racine étaient référencés.

Sur Vercel, `pnpm install` s'exécute en mode `frozen-lockfile` (comportement
par défaut en environnement CI), ce qui provoque un échec immédiat lorsque le
lockfile est désynchronisé avec un `package.json` du workspace.

### Impact

- **3/3 applications** en erreur de déploiement
- Aucun impact sur les packages partagés ni sur le développement local

## Correction

1. **Regénération du lockfile** — `pnpm install` pour inclure les trois apps
   dans les `importers` du lockfile.
2. **Script de vérification CI** — `scripts/check-lockfile.sh` ajouté pour
   détecter toute désynchronisation du lockfile en amont, avant qu'elle
   n'atteigne la production.
3. **Workflow GitHub Actions** — `.github/workflows/ci-lockfile.yml` déclenché
   sur toute PR vers `main` ou `dev`, indépendamment des paths modifiés.

## Prévention

Le nouveau workflow `ci-lockfile.yml` bloquera toute PR dont le lockfile n'est
pas synchronisé avec l'ensemble des `package.json` du workspace.
