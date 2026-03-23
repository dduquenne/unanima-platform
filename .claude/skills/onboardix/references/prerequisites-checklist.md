# Checklist des prérequis — Onboarding développeur

## Vérification automatisée

```bash
# 1. Node.js (>= 20 LTS requis)
node --version  # Doit afficher v20.x ou supérieur

# 2. pnpm (>= 9.x requis)
pnpm --version  # Doit afficher 9.x

# 3. Git
git --version   # Doit être installé

# 4. GitHub CLI
gh --version    # Recommandé pour les interactions GitHub

# 5. Vérifier l'authentification GitHub
gh auth status

# 6. Accès au repo
git remote -v   # Doit pointer vers le bon dépôt
```

## Matrice des prérequis

| Outil | Version minimale | Installation | Obligatoire |
|-------|-----------------|--------------|-------------|
| Node.js | 20 LTS | `nvm install 20` ou `fnm use 20` | Oui |
| pnpm | 9.x | `corepack enable && corepack prepare pnpm@latest --activate` | Oui |
| Git | 2.x | Fourni avec l'OS ou `brew install git` | Oui |
| GitHub CLI | 2.x | `brew install gh` ou cli.github.com | Recommandé |
| VS Code | Latest | code.visualstudio.com | Recommandé |
| Docker | Latest | Pour les tests avec services | Optionnel |

## Résolution des problèmes courants

| Problème | Cause probable | Solution |
|----------|---------------|----------|
| `command not found: pnpm` | Corepack non activé | `corepack enable` |
| `ERR_PNPM_PEER_DEP_ISSUES` | Dépendances incompatibles | `pnpm install --no-strict-peer-dependencies` |
| `node: command not found` | Node.js non installé | Installer via nvm/fnm |
| Version Node incorrete | Mauvaise version active | `nvm use` (lit `.nvmrc`) |
| `EACCES permission denied` | Permissions npm globales | Ne jamais `sudo npm`, utiliser nvm |
| Git push rejected | Droits insuffisants | Vérifier l'accès au repo GitHub |

## Extensions VS Code recommandées

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-playwright.playwright",
    "prisma.prisma",
    "biomejs.biome"
  ]
}
```

## Settings VS Code recommandés

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## Checklist des accès

| Service | Accès nécessaire | Comment l'obtenir | Obligatoire |
|---------|-----------------|-------------------|-------------|
| GitHub | Repo unanima-platform | Invitation par un admin GitHub | Oui |
| Supabase | Dashboard projet | Invitation par admin Supabase | Oui |
| Vercel | Dashboard projets | Invitation par admin Vercel | Recommandé |
| Resend | Dashboard | Invitation si besoin d'email | Optionnel |
| Sentry | Dashboard erreurs | Invitation par admin Sentry | Recommandé |
| Slack | Canal #dev, #incidents | Invitation par admin Slack | Recommandé |

## Vérification des accès

```bash
# GitHub
gh repo view <org>/unanima-platform --json nameWithOwner

# Supabase (si CLI installé)
supabase projects list

# Vercel (si CLI installé)
vercel ls
```
