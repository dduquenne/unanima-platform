---
ref: RPT-0002
title: Échec Vercel — buildCommand exécuté depuis le mauvais répertoire
type: RPT
scope: platform
status: accepted
version: "1.0"
created: 2026-03-10
updated: 2026-03-10
author: Claude
related-issues: ["#6"]
supersedes: null
superseded-by: null
---

# RPT-0002 — Échec Vercel — buildCommand exécuté depuis le mauvais répertoire

## Contexte

Le déploiement des trois applications (links, creai, omega) échouait systématiquement sur Vercel.

## Symptôme

```
error: unknown option '--filter=@unanima/links'
ELIFECYCLE  Command failed with exit code 1.
```

## Investigation

### Configuration d'origine

Chaque `apps/<app>/vercel.json` contenait :

```json
{
  "buildCommand": "pnpm build --filter=@unanima/<app>"
}
```

### Analyse du problème

Sur Vercel, chaque application est configurée comme un projet distinct avec un **Root Directory** pointant vers `apps/<app>/`. Le `buildCommand` s'exécute depuis ce Root Directory.

Quand `pnpm build --filter=@unanima/<app>` est exécuté depuis `apps/<app>/` :

1. pnpm trouve le `package.json` local de l'app
2. pnpm exécute le script `build` local : `next build`
3. `--filter=@unanima/<app>` est passé comme **argument** à `next build`
4. `next build` ne reconnaît pas `--filter` → **échec**

Quand la même commande est exécutée depuis la **racine du workspace** :

1. pnpm trouve le `package.json` racine
2. pnpm exécute le script `build` racine : `turbo run build`
3. `--filter=@unanima/<app>` est passé à turbo, qui le reconnaît → **succès**

### Pourquoi le build local fonctionnait

En local, `pnpm build --filter=@unanima/<app>` était toujours exécuté depuis la racine du monorepo (via les scripts racine `build:links`, `build:creai`, `build:omega`), masquant le problème.

## Solution

Modification du `buildCommand` dans les 3 fichiers `vercel.json` :

```json
{
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@unanima/<app>"
}
```

Cette commande :
1. Remonte à la racine du workspace (`cd ../..`)
2. Exécute turbo directement (pas via le script pnpm) pour éviter toute ambiguïté
3. Utilise `--filter` de turbo pour ne builder que l'app ciblée et ses dépendances

## Fichiers modifiés

| Fichier | Modification |
|---|---|
| `apps/links/vercel.json` | buildCommand corrigé |
| `apps/creai/vercel.json` | buildCommand corrigé |
| `apps/omega/vercel.json` | buildCommand corrigé |
