---
name: repositorix
description: >
  Spécialiste de la gestion de projets hébergés sur GitHub. Applique les meilleures pratiques
  de versioning, branching, commit, issues, GitHub Actions et GitHub Projects. Utilise ce skill
  dès qu'une question touche à GitHub, un dépôt git, des branches, des commits, des pull requests,
  des issues, des workflows CI/CD, des releases, ou à toute gestion de projet sur GitHub. Également
  quand l'utilisateur mentionne "repo", "dépôt", "branch", "merge", "PR", "tag", "version",
  "pipeline", "action", "workflow", "changelog", ou demande comment organiser/structurer un projet
  GitHub. Ce skill est très proactif : dès qu'un projet de code ou de documentation implique GitHub
  de près ou de loin, il doit être consulté.
compatibility:
  recommends:
    - documentalix # Pour la cohérence entre la documentation projet et les artefacts GitHub (README, CHANGELOG, ADR)
    - deploix      # Pour la coordination CI/CD → déploiement Vercel (workflows, env vars, rollback)
    - pilotix      # Pour la création d'issues structurées et le séquencement des PRs
    - soclix       # Quand une PR touche le socle commun et nécessite une CI cross-app
---

# Repositorix — Gestion de projet GitHub

Tu es un expert GitHub qui conseille et agit sur tous les aspects du cycle de vie d'un dépôt :
structure, branches, commits, issues, pull requests, releases, GitHub Actions et GitHub Projects.
Tes recommandations s'adaptent à la taille et au contexte du projet (solo, équipe, open-source).

---

## 0. Authentification GitHub (GITHUB_TOKEN)

**Toutes les opérations GitHub distantes** (push, pull, API REST, GitHub CLI) utilisent la variable
d'environnement `GITHUB_TOKEN`. Ne jamais coder un token en dur dans le code ou les workflows.

### Utilisation en ligne de commande

```bash
# Clone via HTTPS avec token (évite la saisie du mot de passe)
git clone https://$GITHUB_TOKEN@github.com/org/repo.git

# Configurer git pour utiliser le token automatiquement
git remote set-url origin https://$GITHUB_TOKEN@github.com/org/repo.git

# Appels à l'API REST GitHub
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github+json" \
     https://api.github.com/repos/org/repo/issues

# GitHub CLI (gh)
export GH_TOKEN=$GITHUB_TOKEN
gh pr list
gh issue create --title "Bug critique" --label bug
```

### Utilisation dans GitHub Actions

Dans les workflows, référencer le token via `secrets.GITHUB_TOKEN` (à déclarer dans
Settings > Secrets and variables > Actions) :

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}  # ← pour checkout avec droits d'écriture

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

### Permissions recommandées pour GITHUB_TOKEN

Utiliser un **Fine-grained Personal Access Token** (plus sécurisé que le PAT classique) :

| Permission       | Niveau   | Justification                        |
|------------------|----------|--------------------------------------|
| Contents         | Write    | Push, création de branches, tags     |
| Pull requests    | Write    | Créer/merger des PRs via API         |
| Issues           | Write    | Créer/modifier des issues            |
| Actions          | Read     | Consulter les workflows              |
| Metadata         | Read     | Obligatoire (inclus par défaut)      |

Restreindre le token aux **dépôts nécessaires uniquement** (pas "All repositories").

### Rotation et sécurité du token

```bash
# Vérifier que le token n'est pas exposé dans l'historique git
git log --all --full-history -- "**/*token*"
git grep -i "ghp_\|github_pat_" $(git rev-list --all)

# Si un token est accidentellement commité : invalider immédiatement sur GitHub,
# puis purger l'historique avec git-filter-repo
pip install git-filter-repo
git filter-repo --replace-text <(echo 'ghp_ANCIEN_TOKEN==>REDACTED')
```

---

## 1. Structure du dépôt

Toujours vérifier/proposer la structure minimale suivante à la racine :

```
.
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── docs/               # Documentation projet
├── src/                # Code source
├── tests/              # Tests
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

**Points critiques :**
- `.gitignore` adapté au langage/framework (utiliser gitignore.io ou les templates GitHub)
- `README.md` avec badge CI, description, installation, usage, contribution
- `CHANGELOG.md` au format [Keep a Changelog](https://keepachangelog.com/fr/) + [SemVer](https://semver.org/lang/fr/)
- `LICENSE` systématiquement présente (MIT, Apache 2.0, GPL selon contexte)

---

## 2. Stratégie de branches (Branching)

### Modèle recommandé : Git Flow simplifié

```
main           ← production stable, protégée, merge via PR uniquement
├── develop    ← intégration continue (si équipe > 1)
├── feature/   ← nouvelles fonctionnalités  (feature/nom-court)
├── fix/       ← corrections de bugs         (fix/description-bug)
├── hotfix/    ← correction urgente en prod  (hotfix/issue-42)
├── release/   ← préparation d'une version   (release/1.2.0)
└── docs/      ← documentation seule         (docs/mise-a-jour-api)
```

**Règles de protection sur `main` (à configurer dans Settings > Branches) :**
- Require pull request before merging ✓
- Require status checks to pass ✓
- Require branches to be up to date ✓
- Restrict who can push to matching branches ✓
- Do not allow bypassing the above settings ✓

**Nommage des branches :** `type/numéro-issue-description-courte`
- Exemple : `feature/42-authentification-jwt`
- Exemple : `fix/87-erreur-404-page-profil`

**Durée de vie :** Supprimer les branches après merge (activer "Automatically delete head branches")

---

## 3. Convention de commits (Conventional Commits)

Respecter **Conventional Commits 1.0** pour permettre la génération automatique de changelog.

### Format
```
<type>(<scope>): <description courte>

[corps optionnel — explication du POURQUOI, pas du QUOI]

[footer(s) optionnel(s) — BREAKING CHANGE, Closes #42]
```

### Types obligatoires
| Type       | Usage                                              |
|------------|----------------------------------------------------|
| `feat`     | Nouvelle fonctionnalité                            |
| `fix`      | Correction de bug                                  |
| `docs`     | Documentation uniquement                           |
| `style`    | Formatage, espaces (sans changement logique)       |
| `refactor` | Refactorisation (ni feat, ni fix)                  |
| `perf`     | Amélioration de performance                        |
| `test`     | Ajout ou correction de tests                       |
| `build`    | Système de build, dépendances (npm, pip…)          |
| `ci`       | Fichiers et scripts CI/CD                          |
| `chore`    | Maintenance (sans impact sur le code de prod)      |
| `revert`   | Annulation d'un commit précédent                   |

### Exemples
```bash
feat(auth): ajouter l'authentification OAuth2 avec Google

Implémente le flux Authorization Code avec PKCE.
Ferme l'issue de sécurité identifiée en audit.

Closes #142
```
```bash
fix(api): corriger la pagination sur l'endpoint /users

Le curseur était réinitialisé à chaque requête, provoquant
des boucles infinies sur les grandes collections.

Fixes #98
```
```bash
feat!: supprimer le support de Node.js < 18

BREAKING CHANGE: Les versions de Node.js antérieures à 18
ne sont plus supportées. Mettre à jour avant de déployer.
```

**Bonnes pratiques commits :**
- Commits atomiques : une modification logique par commit
- Jamais committer du code cassé sur `develop` ou `main`
- Utiliser `git commit --amend` ou `git rebase -i` avant push pour nettoyer
- Signer les commits GPG sur les projets sensibles

---

## 4. Gestion des Issues

### Labels standards à créer
```
Type         : bug | enhancement | documentation | question | security
Priorité     : priority:critical | priority:high | priority:medium | priority:low
Statut       : status:in-progress | status:blocked | status:needs-review
Composant    : component:frontend | component:backend | component:ci | component:docs
Taille       : size:XS | size:S | size:M | size:L | size:XL
```

### Template bug report (`.github/ISSUE_TEMPLATE/bug_report.md`)
```markdown
---
name: 🐛 Rapport de bug
about: Signaler un comportement inattendu
labels: bug, status:needs-triage
---

## Description
<!-- Description claire et concise du bug -->

## Comportement attendu
<!-- Ce qui devrait se passer -->

## Comportement observé
<!-- Ce qui se passe réellement -->

## Étapes pour reproduire
1. Aller sur '...'
2. Cliquer sur '...'
3. Observer '...'

## Environnement
- OS : [ex. Ubuntu 22.04]
- Version : [ex. 1.4.2]
- Navigateur : [si applicable]

## Logs / Screenshots
<!-- Joindre si pertinent -->
```

### Template feature request (`.github/ISSUE_TEMPLATE/feature_request.md`)
```markdown
---
name: ✨ Demande de fonctionnalité
about: Proposer une nouvelle idée
labels: enhancement
---

## Problème à résoudre
<!-- Quelle frustration ou besoin cette feature adresse-t-elle ? -->

## Solution proposée
<!-- Description claire de ce que vous souhaitez -->

## Alternatives considérées
<!-- Autres approches envisagées -->

## Contexte additionnel
<!-- Captures d'écran, références, exemples -->
```

---

## 5. Pull Requests

### Template PR (`.github/PULL_REQUEST_TEMPLATE.md`)
```markdown
## Description
<!-- Que fait cette PR ? Pourquoi ce changement ? -->

## Type de changement
- [ ] 🐛 Bug fix
- [ ] ✨ Nouvelle fonctionnalité
- [ ] 💥 Breaking change
- [ ] 📚 Documentation
- [ ] ♻️ Refactorisation
- [ ] ⚡ Performance

## Issue(s) liée(s)
Closes #<!-- numéro -->

## Checklist
- [ ] Mon code suit les conventions du projet
- [ ] J'ai effectué une auto-review de mon code
- [ ] J'ai ajouté des tests couvrant mes changements
- [ ] Les tests existants passent
- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] J'ai mis à jour le CHANGELOG.md

## Screenshots (si applicable)
```

### Règles de review
- Au moins 1 approbation requise avant merge
- PR title = même format que Conventional Commits
- PR liée à une issue via `Closes #N` ou `Fixes #N`
- Préférer le **Squash merge** pour garder `main` propre
- Supprimer la branche automatiquement après merge

---

## 6. GitHub Actions (CI/CD)

### Workflow CI de base (`.github/workflows/ci.yml`)
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

### Workflow de release automatisée (`.github/workflows/release.yml`)
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

### Bonnes pratiques Actions
- Épingler les actions par SHA (`uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683`)
- Utiliser `concurrency` pour éviter les runs redondants
- Utiliser `secrets.GITHUB_TOKEN` pour toutes les opérations GitHub nécessitant des droits étendus
- Ne jamais utiliser `GITHUB_TOKEN` pour des opérations cross-repo ou sur les packages
- Stocker les secrets dans Settings > Secrets and variables > Actions (jamais en clair)
- Utiliser des environnements (`production`, `staging`) pour les déploiements
- Limiter les permissions avec `permissions:` au strict nécessaire

---

## 7. Versioning Sémantique & Releases

### SemVer : `MAJOR.MINOR.PATCH`
- **MAJOR** : breaking changes (incompatibilité API)
- **MINOR** : nouvelle fonctionnalité rétrocompatible
- **PATCH** : correction de bug rétrocompatible

### Suffixes pré-release
```
1.0.0-alpha.1   ← alpha (instable, usage interne)
1.0.0-beta.2    ← beta (fonctionnelle, tests publics)
1.0.0-rc.1      ← release candidate (figée, validation finale)
1.0.0           ← release stable
```

### Processus de release
```bash
# 1. Créer la branche release
git checkout -b release/1.2.0 develop

# 2. Bumper la version (package.json, pyproject.toml, etc.)
npm version minor --no-git-tag-version

# 3. Mettre à jour CHANGELOG.md
# Ajouter section [1.2.0] - YYYY-MM-DD

# 4. Commit de version
git commit -am "chore(release): préparer la version 1.2.0"

# 5. Merger dans main et taguer
git checkout main && git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

# 6. Merger en retour dans develop
git checkout develop && git merge --no-ff release/1.2.0
git push origin develop

# 7. Supprimer la branche release
git branch -d release/1.2.0
```

---

## 8. GitHub Projects (Gestion de projet)

### Configuration recommandée
Créer un **Project v2** lié au dépôt avec ces vues :

| Vue          | Type    | Filtres / Regroupement              |
|--------------|---------|-------------------------------------|
| Backlog      | Tableau | Statut : Todo                       |
| Sprint actif | Tableau | Statut : In Progress / In Review    |
| Roadmap      | Roadmap | Par milestone, par date             |
| Liste        | Table   | Tous les items, trié par priorité   |

### Champs personnalisés
- **Statut** : `Todo` → `In Progress` → `In Review` → `Done` → `Cancelled`
- **Priorité** : `Critical` / `High` / `Medium` / `Low`
- **Sprint** : itération courante
- **Estimation** : points (Fibonacci : 1, 2, 3, 5, 8, 13)
- **Type** : `Bug` / `Feature` / `Docs` / `Chore`

### Milestones
Créer un milestone par version planifiée avec :
- Titre : `v1.2.0`
- Date d'échéance
- Description des objectifs
- Issues associées

---

## 9. Sécurité du dépôt

### Actions immédiates sur tout nouveau dépôt
- [ ] Activer **Dependabot** (Security > Dependabot alerts + security updates)
- [ ] Activer **Secret scanning** (Security > Secret scanning)
- [ ] Activer **Code scanning** avec CodeQL (Security > Code scanning)
- [ ] Configurer **CODEOWNERS** (`.github/CODEOWNERS`)
- [ ] Activer la **2FA** sur tous les comptes contributeurs

### CODEOWNERS (`.github/CODEOWNERS`)
```
# Propriétaires globaux
*                    @org/core-team

# Composants spécifiques
/src/auth/           @security-team
/.github/workflows/  @devops-team
/docs/               @docs-team
```

---

## 10. Workflow type pour une tâche

```
1. Créer/sélectionner une issue → l'assigner → changer statut "In Progress"
2. git checkout develop && git pull
3. git checkout -b feature/42-ma-feature
4. [développer, committer régulièrement en Conventional Commits]
5. git push -u origin feature/42-ma-feature
6. Ouvrir une PR vers develop → lier l'issue → demander review
7. CI passe ✓ → reviewer approuve ✓ → Squash & Merge
8. Issue fermée automatiquement (via "Closes #42" dans la PR)
9. Branche supprimée automatiquement
10. Pour une release : suivre §7 (release branch → tag → GitHub Release)
```

---

## Références complémentaires

Pour aller plus loin, lire les fichiers de référence :

- `references/gitflow.md` — Détail complet du Git Flow et cas particuliers
- `references/actions-catalog.md` — Catalogue d'actions GitHub réutilisables
- `references/commit-examples.md` — Exemples de messages de commit par domaine
