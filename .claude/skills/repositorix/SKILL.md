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
    - sprintix     # Pour synchroniser les statuts du GitHub Project avec la progression sprint
---

# Repositorix — Gestion de projet GitHub

Tu es un expert GitHub qui conseille et agit sur tous les aspects du cycle de vie d'un dépôt :
structure, branches, commits, issues, pull requests, releases, GitHub Actions et GitHub Projects.
Tes recommandations s'adaptent à la taille et au contexte du projet (solo, équipe, open-source).

---

## 0. Authentification GitHub (GITHUB_TOKEN)

**Toutes les opérations GitHub distantes** (push, pull, API REST, GitHub CLI) utilisent la variable
d'environnement `GITHUB_TOKEN`. Ne jamais coder un token en dur dans le code ou les workflows.

### Utilisation

```bash
# Git : clone/remote avec token
git clone https://$GITHUB_TOKEN@github.com/org/repo.git

# GitHub CLI
export GH_TOKEN=$GITHUB_TOKEN
gh pr list

# GitHub Actions : utiliser secrets.GITHUB_TOKEN (Settings > Secrets > Actions)
```

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

### Rotation et sécurité

Si un token est commité : invalider immédiatement sur GitHub, puis purger avec `git-filter-repo`.
Vérifier l'historique : `git grep -i "ghp_\|github_pat_" $(git rev-list --all)`

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

### Exemple
```bash
feat(auth): ajouter l'authentification OAuth2 avec Google

Implémente le flux Authorization Code avec PKCE.
Closes #142
```

Plus d'exemples (fix, breaking change, etc.) : voir `references/commit-examples.md`.

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

Templates d'issues (bug report et feature request) : voir `references/templates.md` pour les fichiers complets.

---

## 5. Pull Requests

Template PR : voir `references/templates.md` pour le fichier `.github/PULL_REQUEST_TEMPLATE.md` complet.

### Règles de review
- Au moins 1 approbation requise avant merge
- PR title = même format que Conventional Commits
- PR liée à une issue via `Closes #N` ou `Fixes #N`
- Préférer le **Squash merge** pour garder `main` propre
- Supprimer la branche automatiquement après merge

---

## 6. GitHub Actions (CI/CD)

Workflows CI et release complets : voir `references/workflow-examples.md` pour les YAML de `ci.yml` et `release.yml`.

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

Créer une branche `release/X.Y.Z` depuis `develop`, bumper la version, mettre à jour le CHANGELOG,
merger dans `main` avec tag, puis merger en retour dans `develop`. Détails : voir `references/release-process.md`.

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
1.  Créer/sélectionner une issue → l'assigner → changer statut "In Progress"
2.  Mettre à jour le statut dans le GitHub Project → 🏗️ En cours
3.  git checkout develop && git pull
4.  git checkout -b feature/42-ma-feature
5.  [développer, committer régulièrement en Conventional Commits]
6.  git push -u origin feature/42-ma-feature
7.  Ouvrir une PR vers develop → lier l'issue → demander review
8.  Mettre à jour le statut dans le GitHub Project → 👀 En review
9.  CI passe ✓ → reviewer approuve ✓ → Squash & Merge
10. Issue fermée automatiquement (via "Closes #42" dans la PR)
11. Mettre à jour le statut dans le GitHub Project → ✅ Terminé
12. Branche supprimée automatiquement
13. Pour une release : suivre §7 (release branch → tag → GitHub Release)
```

### Mise à jour des statuts GitHub Project

Chaque transition d'état d'une issue doit être reflétée dans le GitHub Project.
C'est essentiel pour le suivi de progression par **sprintix** et pour la
visibilité du board.

| Moment | Statut Project | Qui déclenche |
|--------|---------------|---------------|
| Début d'implémentation | 📋 → 🏗️ En cours | `/issue` ou `/sprintix run` |
| PR créée | 🏗️ → 👀 En review | `/issue` étape 4 |
| PR mergée | 👀 → ✅ Terminé | `/issue` étape 5 ou automatique |
| Issue reportée | 📋 → ⏭️ Reporté | `/sprintix` si blocage |

Commandes `gh` pour la mise à jour (voir `sprintix/references/github-project-api.md`
pour les détails) :

```bash
# Récupérer le projet et l'item
PROJECT_NUM=4  # Unanima Platform
OWNER=dduquenne

# Lister les items pour trouver l'ID
gh project item-list $PROJECT_NUM --owner $OWNER --format json | \
  jq '.items[] | select(.content.number == 42) | .id'

# Modifier le statut via gh project item-edit
gh project item-edit --project-id <PROJECT_ID> --id <ITEM_ID> \
  --field-id <STATUS_FIELD_ID> --single-select-option-id <OPTION_ID>
```

---

## Références complémentaires

Pour aller plus loin, lire les fichiers de référence :

- `references/gitflow.md` — Détail complet du Git Flow et cas particuliers
- `references/actions-catalog.md` — Catalogue d'actions GitHub réutilisables
- `references/commit-examples.md` — Exemples de messages de commit par domaine
- `references/workflows.md` — Workflows GitHub Actions complets (CI, release)
- `references/issue-templates.md` — Templates d'issues (bug, feature) et PR
- `references/release-process.md` — Processus de release avec commandes
