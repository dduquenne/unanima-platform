# GitHub Actions — Workflow Examples

## Workflow CI de base (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    name: Tests (${{ matrix.os }})
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest]
        # Ajouter node-version, python-version, etc. selon le projet

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup (adapter selon langage)
        uses: actions/setup-node@v4  # ou setup-python@v5, etc.
        with:
          node-version: '20'
          cache: 'npm'

      - name: Installer les dépendances
        run: npm ci

      - name: Linter
        run: npm run lint

      - name: Tests unitaires
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Workflow de release automatisée (`.github/workflows/release.yml`)

```yaml
name: Release

on:
  push:
    tags:
      - 'v[0-9]+.[0-9]+.[0-9]+'

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Générer le changelog
        id: changelog
        uses: orhun/git-cliff-action@v3
        with:
          config: cliff.toml
          args: --latest

      - name: Créer la release GitHub
        uses: softprops/action-gh-release@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          body: ${{ steps.changelog.outputs.content }}
          draft: false
          prerelease: ${{ contains(github.ref, '-rc') || contains(github.ref, '-beta') }}
```

## Utilisation du token dans les workflows

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}  # pour checkout avec droits d'écriture

      - name: Appel API GitHub
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh release create v${{ env.VERSION }} --generate-notes
```

> **Note :** GitHub Actions injecte automatiquement un token éphémère via `github.token`
> ou `env.GITHUB_TOKEN` (droits limités au dépôt courant, durée de vie = durée du job).
> Le secret `secrets.GITHUB_TOKEN` défini manuellement dans Settings est un **PAT ou
> Fine-grained token** avec des droits étendus. Préférer ce dernier pour les opérations
> cross-repo, les packages, ou les accès organisation.
