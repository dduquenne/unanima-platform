#!/usr/bin/env bash
# =============================================================================
# setup-repo.sh — Création et configuration du dépôt dduquenne/links-app
# =============================================================================
# Prérequis :
#   - GitHub CLI (gh) authentifié : gh auth status
#   - jq installé
#
# Usage :
#   chmod +x setup-repo.sh
#   ./setup-repo.sh
# =============================================================================

set -euo pipefail

OWNER="dduquenne"
REPO="links-app"
FULL_REPO="$OWNER/$REPO"

echo "==========================================="
echo " Setup du dépôt $FULL_REPO"
echo "==========================================="

# ------------------------------------------------------------------
# 1. Création du dépôt
# ------------------------------------------------------------------
echo ""
echo "--- 1. Création du dépôt ---"
if gh repo view "$FULL_REPO" &>/dev/null; then
  echo "Le dépôt $FULL_REPO existe déjà, on continue."
else
  gh repo create "$FULL_REPO" \
    --private \
    --description "Link's Accompagnement — Plateforme de suivi des bilans de compétences" \
    --clone=false
  echo "Dépôt $FULL_REPO créé."
fi

# ------------------------------------------------------------------
# 2. Push des fichiers initiaux
# ------------------------------------------------------------------
echo ""
echo "--- 2. Push des fichiers initiaux ---"

TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

cd "$TMPDIR"
git init
git remote add origin "https://github.com/$FULL_REPO.git"

# Copier les fichiers depuis le répertoire setup
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp "$SCRIPT_DIR/README.md" .
cp "$SCRIPT_DIR/.gitignore" .
cp "$SCRIPT_DIR/.nvmrc" .
cp "$SCRIPT_DIR/.env.local.example" .
cp -r "$SCRIPT_DIR/.github" .

git add -A
git commit -m "chore: initial repository setup

- README.md
- .gitignore (Next.js + Node.js)
- .nvmrc (Node 20)
- .env.local.example
- GitHub Actions workflows (CI, deploy-preview, deploy-production)
- Issue templates (bug report, feature request, migration task)
- PR template"

git branch -M main
git push -u origin main

echo "Fichiers initiaux poussés sur main."

# ------------------------------------------------------------------
# 3. Création de la branche dev
# ------------------------------------------------------------------
echo ""
echo "--- 3. Création de la branche dev ---"
git checkout -b dev
git push -u origin dev
echo "Branche dev créée."

# ------------------------------------------------------------------
# 4. Labels
# ------------------------------------------------------------------
echo ""
echo "--- 4. Configuration des labels ---"

# Supprimer les labels par défaut
for label in "bug" "documentation" "duplicate" "enhancement" "good first issue" \
  "help wanted" "invalid" "question" "wontfix"; do
  gh label delete "$label" --repo "$FULL_REPO" --yes 2>/dev/null || true
done

# Type
gh label create "feat"       --repo "$FULL_REPO" --color "0E8A16" --description "Nouvelle fonctionnalité" --force
gh label create "fix"        --repo "$FULL_REPO" --color "D73A4A" --description "Correction de bug" --force
gh label create "refactor"   --repo "$FULL_REPO" --color "6F42C1" --description "Refactoring de code" --force
gh label create "docs"       --repo "$FULL_REPO" --color "0075CA" --description "Documentation" --force
gh label create "test"       --repo "$FULL_REPO" --color "BFD4F2" --description "Tests" --force
gh label create "chore"      --repo "$FULL_REPO" --color "CCCCCC" --description "Maintenance / tâche technique" --force
gh label create "migration"  --repo "$FULL_REPO" --color "F9D0C4" --description "Migration depuis monorepo" --force

# Priorité
gh label create "P0-critical" --repo "$FULL_REPO" --color "B60205" --description "Critique — à traiter immédiatement" --force
gh label create "P1-high"     --repo "$FULL_REPO" --color "D93F0B" --description "Haute priorité" --force
gh label create "P2-medium"   --repo "$FULL_REPO" --color "FBCA04" --description "Priorité moyenne" --force
gh label create "P3-low"      --repo "$FULL_REPO" --color "C2E0C6" --description "Basse priorité" --force

# Domaine
gh label create "auth"            --repo "$FULL_REPO" --color "1D76DB" --description "Authentification et RBAC" --force
gh label create "bilans"          --repo "$FULL_REPO" --color "5319E7" --description "Bilans de compétences" --force
gh label create "questionnaires"  --repo "$FULL_REPO" --color "7057FF" --description "Questionnaires" --force
gh label create "beneficiaires"   --repo "$FULL_REPO" --color "008672" --description "Gestion des bénéficiaires" --force
gh label create "consultants"     --repo "$FULL_REPO" --color "0E8A16" --description "Gestion des consultants" --force
gh label create "dashboard"       --repo "$FULL_REPO" --color "006B75" --description "Tableau de bord" --force
gh label create "rgpd"            --repo "$FULL_REPO" --color "E4E669" --description "Conformité RGPD" --force
gh label create "email"           --repo "$FULL_REPO" --color "D4C5F9" --description "E-mail transactionnel" --force
gh label create "infra"           --repo "$FULL_REPO" --color "C5DEF5" --description "Infrastructure / CI / déploiement" --force

# Statut
gh label create "needs-triage"      --repo "$FULL_REPO" --color "EDEDED" --description "À trier" --force
gh label create "in-progress"       --repo "$FULL_REPO" --color "0052CC" --description "En cours de développement" --force
gh label create "blocked"           --repo "$FULL_REPO" --color "B60205" --description "Bloqué" --force
gh label create "ready-for-review"  --repo "$FULL_REPO" --color "0E8A16" --description "Prêt pour review" --force

echo "Labels configurés."

# ------------------------------------------------------------------
# 5. Issues de migration
# ------------------------------------------------------------------
echo ""
echo "--- 5. Création des issues de migration ---"

gh issue create --repo "$FULL_REPO" \
  --title "Setup projet Next.js 14 + configuration de base" \
  --label "chore,infra,P1-high" \
  --body "## Objectif
Initialiser le projet Next.js 14 (App Router) autonome avec toute la configuration de base.

## Tâches
- [ ] \`pnpm init\` + \`create-next-app\` (App Router, TypeScript strict, Tailwind, ESLint)
- [ ] Configuration TypeScript (\`tsconfig.json\` strict)
- [ ] Configuration ESLint + Prettier
- [ ] Configuration Tailwind CSS + shadcn/ui
- [ ] Configuration Vitest
- [ ] Configuration Playwright
- [ ] Structure des dossiers (\`src/app\`, \`src/lib\`, \`src/components\`, etc.)
- [ ] Script \`package.json\` : dev, build, lint, typecheck, test
- [ ] Vérifier que la CI passe

## Critères de validation
- \`pnpm dev\` démarre sans erreur
- \`pnpm build\` réussit
- \`pnpm lint\` et \`pnpm typecheck\` passent
- CI GitHub Actions verte"

gh issue create --repo "$FULL_REPO" \
  --title "Migration lib/auth (internaliser @unanima/auth)" \
  --label "migration,auth,P1-high" \
  --body "## Source monorepo
\`packages/auth/src/\` — AuthProvider, hooks (useAuth, useRequireRole, useSession), middleware Next.js, moteur RBAC, composants (LoginForm, ResetPasswordForm, ProtectedRoute).

## Cible
\`src/lib/auth/\`

## Tâches
- [ ] Copier les fichiers depuis \`packages/auth/src/\`
- [ ] Adapter les imports (supprimer les refs \`@unanima/auth\`)
- [ ] Configurer le RBAC spécifique Links (beneficiaire, consultant, super_admin)
- [ ] Adapter le middleware Next.js aux routes Links
- [ ] Migrer les tests
- [ ] Vérifier l'intégration avec Supabase Auth

## Dépend de
- #1 (Setup projet)
- #3 (Migration lib/supabase)"

gh issue create --repo "$FULL_REPO" \
  --title "Migration lib/supabase (internaliser @unanima/db)" \
  --label "migration,infra,P1-high" \
  --body "## Source monorepo
\`packages/db/src/\` — createClient, types générés, helpers CRUD, audit logging.
\`packages/db/migrations/\` — Migrations SQL du socle (profiles, audit_logs, RLS).

## Cible
\`src/lib/supabase/\`

## Tâches
- [ ] Copier \`client.ts\`, \`types.ts\`, \`helpers.ts\`, \`audit.ts\`
- [ ] Adapter les imports
- [ ] Copier les migrations pertinentes dans \`supabase/migrations/\`
- [ ] Régénérer les types Supabase
- [ ] Migrer les tests

## Dépend de
- #1 (Setup projet)"

gh issue create --repo "$FULL_REPO" \
  --title "Migration composants UI (internaliser @unanima/core utilisé)" \
  --label "migration,P2-medium" \
  --body "## Source monorepo
\`packages/core/src/\` — Composants UI génériques, hooks, utilitaires.
\`packages/dashboard/src/\` — KPICard, DataTable, StatusBadge, ProgressBar, Layout, etc.

## Cible
\`src/components/ui/\` (core) et \`src/components/dashboard/\` (dashboard)

## Tâches
- [ ] Identifier les composants effectivement utilisés par l'app Links
- [ ] Ne migrer QUE les composants utilisés (pas de dead code)
- [ ] Adapter les imports
- [ ] Vérifier la compatibilité shadcn/ui
- [ ] Migrer les tests des composants utilisés

## Dépend de
- #1 (Setup projet)"

gh issue create --repo "$FULL_REPO" \
  --title "Migration lib/rgpd (internaliser @unanima/rgpd)" \
  --label "migration,rgpd,P2-medium" \
  --body "## Source monorepo
\`packages/rgpd/src/\` — LegalNotice, PrivacyPolicy, CookieBanner, route handlers (export, delete, audit), config RGPD.

## Cible
\`src/lib/rgpd/\`

## Tâches
- [ ] Copier les composants RGPD
- [ ] Adapter la configuration (raison sociale Link's, DPO, finalités)
- [ ] Migrer les route handlers RGPD
- [ ] Adapter les imports
- [ ] Migrer les tests

## Dépend de
- #1 (Setup projet)
- #3 (Migration lib/supabase)"

gh issue create --repo "$FULL_REPO" \
  --title "Migration lib/email (internaliser @unanima/email)" \
  --label "migration,email,P2-medium" \
  --body "## Source monorepo
\`packages/email/src/\` — Client Resend, fonctions d'envoi, templates React Email (reset-password, welcome, notification).

## Cible
\`src/lib/email/\`

## Tâches
- [ ] Copier le client Resend et les fonctions d'envoi
- [ ] Migrer les templates React Email pertinents
- [ ] Adapter la configuration (expéditeur, domaine)
- [ ] Adapter les imports
- [ ] Migrer les tests

## Dépend de
- #1 (Setup projet)"

gh issue create --repo "$FULL_REPO" \
  --title "Migration logique métier (bilans, questionnaires, bénéficiaires)" \
  --label "migration,bilans,questionnaires,beneficiaires,P1-high" \
  --body "## Source monorepo
\`apps/links/src/lib/\` — Logique métier spécifique Link's.

## Cible
\`src/lib/\` (structure à définir selon les modules)

## Tâches
- [ ] Migrer la logique de gestion des bilans de compétences
- [ ] Migrer la logique des questionnaires
- [ ] Migrer la gestion des bénéficiaires
- [ ] Migrer la gestion des consultants
- [ ] Adapter tous les imports (remplacer \`@unanima/*\` par chemins locaux)
- [ ] Migrer les tests métier

## Dépend de
- #1 (Setup projet)
- #2 (Migration lib/auth)
- #3 (Migration lib/supabase)"

gh issue create --repo "$FULL_REPO" \
  --title "Migration routes API" \
  --label "migration,infra,P1-high" \
  --body "## Source monorepo
\`apps/links/src/app/api/\` — Route handlers Next.js (App Router).

## Cible
\`src/app/api/\`

## Tâches
- [ ] Migrer tous les route handlers
- [ ] Adapter les imports vers les libs internalisées
- [ ] Vérifier les middlewares d'authentification
- [ ] Ajouter/conserver le endpoint \`GET /api/health\`
- [ ] Migrer les tests d'intégration API

## Dépend de
- #2 (Migration lib/auth)
- #3 (Migration lib/supabase)
- #7 (Migration logique métier)"

gh issue create --repo "$FULL_REPO" \
  --title "Migration pages et layouts" \
  --label "migration,P1-high" \
  --body "## Source monorepo
\`apps/links/src/app/\` — Pages, layouts, composants de page.

## Cible
\`src/app/\`

## Tâches
- [ ] Migrer le layout racine (\`layout.tsx\`)
- [ ] Migrer les pages (dashboard, bilans, questionnaires, profil, etc.)
- [ ] Migrer les layouts de groupes de routes
- [ ] Adapter les imports
- [ ] Migrer le thème CSS (\`theme.css\`)
- [ ] Vérifier le rendu visuel de chaque page

## Dépend de
- #4 (Migration composants UI)
- #7 (Migration logique métier)
- #8 (Migration routes API)"

gh issue create --repo "$FULL_REPO" \
  --title "Migration et adaptation des tests" \
  --label "test,migration,P2-medium" \
  --body "## Source monorepo
\`apps/links/src/\` (tests unitaires Vitest) et \`apps/links/e2e/\` (tests E2E Playwright).

## Cible
\`src/**/*.test.ts(x)\` et \`e2e/\`

## Tâches
- [ ] Vérifier que tous les tests unitaires migrés passent
- [ ] Adapter les tests E2E Playwright aux nouvelles routes
- [ ] Mettre à jour les fixtures et factories si nécessaire
- [ ] Vérifier la couverture de tests
- [ ] S'assurer que la CI exécute correctement tous les tests

## Dépend de
- Toutes les issues de migration précédentes (#2 à #9)"

gh issue create --repo "$FULL_REPO" \
  --title "Configuration Vercel + déploiement initial" \
  --label "infra,chore,P1-high" \
  --body "## Objectif
Configurer le projet Vercel dédié et réaliser le premier déploiement.

## Tâches
- [ ] Créer le projet Vercel pour links-app
- [ ] Configurer les variables d'environnement sur Vercel (production + preview)
- [ ] Configurer le domaine personnalisé (si applicable)
- [ ] Configurer les GitHub Secrets (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
- [ ] Vérifier le déploiement preview (via PR)
- [ ] Vérifier le déploiement production (via merge sur main)
- [ ] Configurer les notifications de déploiement

## Critères de validation
- Le déploiement production est accessible
- Les previews se créent automatiquement sur chaque PR
- Le endpoint \`/api/health\` répond correctement"

gh issue create --repo "$FULL_REPO" \
  --title "Rédaction CLAUDE.md dédié" \
  --label "docs,chore,P2-medium" \
  --body "## Objectif
Créer le CLAUDE.md spécifique au dépôt links-app, adapté de celui du monorepo.

## Contenu attendu
- Vue d'ensemble du projet (standalone, pas monorepo)
- Structure des dossiers
- Stack technique
- Conventions de code (reprises du monorepo)
- Configuration RBAC spécifique Links
- Schéma de base de données (tables communes + tables métier)
- Variables d'environnement
- Commandes disponibles
- Règles métier Link's Accompagnement
- Configuration MCP Supabase (un seul serveur)

## Note
Sera produit par archicodix — cette issue sert de traceur.

## Dépend de
- Toutes les issues de migration (#1 à #11)"

echo "12 issues créées."

# ------------------------------------------------------------------
# 6. GitHub Project board
# ------------------------------------------------------------------
echo ""
echo "--- 6. Création du GitHub Project ---"

# Créer le projet
PROJECT_URL=$(gh project create \
  --owner "$OWNER" \
  --title "Links v2 — Migration & Développement" \
  --format json 2>/dev/null | jq -r '.url' 2>/dev/null || echo "")

if [ -n "$PROJECT_URL" ] && [ "$PROJECT_URL" != "null" ]; then
  echo "Projet créé : $PROJECT_URL"

  # Récupérer le numéro du projet
  PROJECT_NUM=$(echo "$PROJECT_URL" | grep -oP '\d+$')

  # Ajouter les issues au projet
  for i in $(seq 1 12); do
    gh project item-add "$PROJECT_NUM" \
      --owner "$OWNER" \
      --url "https://github.com/$FULL_REPO/issues/$i" 2>/dev/null || true
  done
  echo "Issues ajoutées au projet."
else
  echo "ATTENTION : Impossible de créer le projet automatiquement."
  echo "Créez-le manuellement : https://github.com/$OWNER?tab=projects"
  echo "Titre : 'Links v2 — Migration & Développement'"
  echo "Colonnes : Backlog, Sprint, In Progress, Review, Done"
fi

# ------------------------------------------------------------------
# 7. Protection des branches
# ------------------------------------------------------------------
echo ""
echo "--- 7. Protection des branches ---"
echo ""
echo "ATTENTION : La protection de branches nécessite GitHub Pro/Team/Enterprise."
echo "Si votre compte est un compte free, les branch protection rules ne sont"
echo "pas disponibles pour les dépôts privés."
echo ""
echo "Si disponible, configurez manuellement :"
echo "  Settings > Branches > Add branch protection rule"
echo ""
echo "  Branch: main"
echo "    - [x] Require a pull request before merging"
echo "    - [x] Require status checks to pass before merging"
echo "    - [x] Require branches to be up to date before merging"
echo "    - [x] Do not allow force pushes"
echo ""
echo "  Branch: dev"
echo "    - [x] Require status checks to pass before merging"

# Tenter la configuration via API (échoue silencieusement si pas le plan)
gh api repos/"$FULL_REPO"/branches/main/protection \
  --method PUT \
  --input - <<'JSON' 2>/dev/null && echo "Protection main configurée." || echo "(Protection main : configuration manuelle requise)"
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["ci"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

gh api repos/"$FULL_REPO"/branches/dev/protection \
  --method PUT \
  --input - <<'JSON' 2>/dev/null && echo "Protection dev configurée." || echo "(Protection dev : configuration manuelle requise)"
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["ci"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
JSON

# ------------------------------------------------------------------
# 8. Résumé
# ------------------------------------------------------------------
echo ""
echo "==========================================="
echo " Setup terminé !"
echo "==========================================="
echo ""
echo "Dépôt : https://github.com/$FULL_REPO"
echo ""
echo "Prochaines étapes manuelles :"
echo "  1. Configurer les secrets GitHub Actions :"
echo "     Settings > Secrets and variables > Actions"
echo "     - VERCEL_TOKEN"
echo "     - VERCEL_ORG_ID"
echo "     - VERCEL_PROJECT_ID"
echo ""
echo "  2. Configurer les environnements GitHub :"
echo "     Settings > Environments"
echo "     - production (secrets: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY)"
echo "     - preview (mêmes secrets, valeurs de staging)"
echo ""
echo "  3. Vérifier la protection des branches (si GitHub Pro)"
echo ""
echo "  4. Cloner le dépôt et commencer le développement :"
echo "     git clone https://github.com/$FULL_REPO.git"
echo "     cd links-app"
echo "     git checkout dev"
echo ""
