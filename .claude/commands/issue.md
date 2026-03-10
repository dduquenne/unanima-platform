---
name: issue
description: Corriger un problème (saisie libre), lister les issues GitHub ou résoudre une issue spécifique
disable-model-invocation: true
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Task, TodoWrite, AskUserQuestion
argument-hint: "[continue] #numéro [#numéro...] | list | (vide)"
---

## LANGUE
Tu communiques **exclusivement en français** (sauf mots-clés techniques
anglais : `fix`, `feat`, `scope`, noms de packages, etc.).

## OUTILS MCP
Connecteurs configurés dans `.mcp.json` — utilise-les pour diagnostiquer :
- **`supabase-kairn`** : introspection schéma, requêtes SQL lecture, RLS, Storage
- **`vercel`** : déploiements, logs Serverless, variables d'env, domaines

> **Sécurité MCP :** Pas de requêtes destructrices (`DELETE`, `DROP`) sans
> confirmation. Pas de DDL via MCP — utiliser les migrations Prisma.

### GitHub (via `curl` + `$GITHUB_TOKEN`)
```bash
REPO=$(git remote get-url origin | sed 's|\.git$||' | awk -F'[/:]' '{print $(NF-1)"/"$NF}')
GH_API="https://api.github.com/repos/$REPO"
AUTH=(-H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github+json")
```
Endpoints utiles : `/issues/<n>`, `/pulls`, `/commits/<sha>/check-runs`,
`/actions/runs?per_page=5`. Toujours lier les PR aux issues (`Fixes #<n>`).

## CONTEXTE
Réfère-toi à **CLAUDE.md** pour la stack, la structure monorepo, les conventions
de code, les tests et le déploiement Vercel. Réfère-toi à **DEPLOYMENT.md** pour
les détails QStash et Vercel. Ne pas redupliquer ces informations ici.

## ROUTAGE DE LA COMMANDE

| Invocation | Mode | Comportement |
|---|---|---|
| `/issue` | Saisie libre | Demande une description via `AskUserQuestion` |
| `/issue list` | Liste | Affiche les issues ouvertes puis s'arrête |
| `/issue #N` | Issue spécifique | Traite l'issue #N (étapes 1-6) |
| `/issue continue #N` | Continu | Idem sans points d'arrêt |
| `/issue #N1 #N2 ...` | Multi-issues | Traite chaque issue séquentiellement |
| `/issue continue #N1 #N2 ...` | Multi continu | Toutes sans interaction |

### Données récupérées :
!`ARG=$(echo "$ARGUMENTS" | xargs 2>/dev/null || echo ""); CONTINUE=false; if echo "$ARG" | grep -qiw 'continue'; then CONTINUE=true; ARG=$(echo "$ARG" | sed 's/[Cc][Oo][Nn][Tt][Ii][Nn][Uu][Ee]//g' | xargs 2>/dev/null || echo ""); fi; if [ -z "$ARG" ]; then echo "MODE: SAISIE_LIBRE"; echo "CONTINUE: $CONTINUE"; elif [ "$ARG" = "list" ]; then echo "MODE: LISTE_ISSUES"; REPO=$(git remote get-url origin | sed 's|\.git$||' | awk -F'[/:]' '{print $(NF-1)"/"$NF}'); curl -sf -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$REPO/issues?state=open&per_page=30" | jq -r '.[] | "| #\(.number) | \(.title) | \([.labels[].name] | join(", ")) | \(.created_at[:10]) |"'; else ISSUES=$(echo "$ARG" | grep -oE '[0-9]+'); REPO=$(git remote get-url origin | sed 's|\.git$||' | awk -F'[/:]' '{print $(NF-1)"/"$NF}'); SECOND=$(echo "$ISSUES" | sed -n '2p'); if [ -n "$SECOND" ]; then echo "MODE: ISSUES_MULTIPLES"; echo "CONTINUE: $CONTINUE"; for NUM in $ISSUES; do echo ""; echo "=== ISSUE #$NUM ==="; curl -sf -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$REPO/issues/$NUM" | jq '{number, title, body, labels: [.labels[].name], state}'; done; else echo "MODE: ISSUE_SPECIFIQUE"; echo "CONTINUE: $CONTINUE"; ISSUE_NUM=$(echo "$ISSUES" | head -1); curl -sf -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$REPO/issues/$ISSUE_NUM" | jq '{number, title, body, labels: [.labels[].name], state}'; fi; fi`

### Instructions selon le mode :

**SAISIE_LIBRE** → `AskUserQuestion` : « Décrivez le problème à corriger : »
puis étapes 1-6.

**LISTE_ISSUES** → Affiche le tableau `| # | Titre | Labels | Créée le |`
puis **s'arrête**.

**ISSUE_SPECIFIQUE / ISSUES_MULTIPLES** → Étapes 1-6 par issue, séparateur
`--- Traitement de l'issue #N ---` entre chaque.

### Mode `CONTINUE` (`CONTINUE: true`)
Saute les STOP (étapes 1 et 2). Sélectionne automatiquement la première
approche proposée. Enchaîne 1 → 6 sans interaction.

---

## ÉTAPE 1 — INVESTIGATION (obligatoire)
1. Lire les fichiers mentionnés + leurs dépendances directes
2. Si `packages/` : identifier les consommateurs via `turbo.json`
3. Si bug déploiement : lire `vercel.json`, `next.config.mjs`, `.env.example`,
   consulter MCP Vercel (logs, variables d'env)
4. Si bug données : MCP Supabase (schéma, requêtes SQL lecture, RLS)
5. Si bug CI : API GitHub `/commits/<sha>/check-runs`, `/actions/runs`
6. `CONTINUE: false` → **STOP** (résumé + attente confirmation)
   `CONTINUE: true` → résumé bref puis étape 2

## ÉTAPE 2 — ANALYSE
1. Cause racine (pas le symptôme)
2. Périmètre : app et/ou package(s) impactés
3. Risques de régression
4. Si bug déploiement : diagnostic Serverless (filesystem, timeout, cold start,
   env vars, cache CDN/ISR, CORS/CSP preview, QStash)
5. Si bug données : vérifier cohérence Prisma/DB, RLS, index
6. 2-3 approches avec trade-offs
7. `CONTINUE: false` → **STOP** (présenter options)
   `CONTINUE: true` → choisir la première approche, étape 3

## ÉTAPE 3 — IMPLÉMENTATION

### Git workflow
```bash
git checkout main && git pull origin main
git checkout -b fix/<scope>-<description-courte>
```
> Ne pas push avant l'étape 4.

### Pré-requis
```bash
pnpm install --frozen-lockfile   # ou pnpm install si lockfile désynchronisé
```

### Prisma (si applicable)
```bash
pnpm --filter @kairn/db db:generate
pnpm --filter @kairn/db prisma migrate dev --name <description>
pnpm --filter @kairn/db prisma migrate status
```
Commiter les fichiers de migration. Vérifier `siteId` sur tout nouveau modèle.

### CLAUDE.md
Mettre à jour si : nouvelle commande/script, nouveau package, nouvelle env var,
convention modifiée, pipeline CI modifié, config Vercel modifiée.

### Contraintes
Réfère-toi à **CLAUDE.md** pour les contraintes TypeScript, sécurité,
architecture, compatibilité Vercel et périmètre de diff.

### Tests (obligatoires)
Cas nominal + erreur + edge cases. Si package partagé modifié : test
d'intégration depuis l'app consommatrice. JSDoc sur chaque fonction modifiée.

## ÉTAPE 4 — VALIDATION & PR (obligatoire avant push)

### 4.1 — Pipeline local (dans cet ordre, chaque étape doit réussir)
```bash
pnpm install --frozen-lockfile
pnpm turbo run lint --filter='...[HEAD~1]'
pnpm turbo run type-check --filter='...[HEAD~1]'
pnpm test:coverage
pnpm test:ui
pnpm turbo run build --filter='...[HEAD~1]' --env-mode=loose
```

### 4.2 — Si échec
Analyser → corriger → amender le commit → **relancer tout le pipeline**.
Ne jamais contourner (`@ts-ignore`, `eslint-disable` injustifié, `.skip`,
`--no-verify`).

### 4.3 — Push + PR
```bash
git add <fichiers>
git commit -m "fix(<scope>): <description>"
git push -u origin fix/<scope>-<description-courte>
```

Créer la PR via API GitHub :
```bash
curl -s -X POST "${AUTH[@]}" "$GH_API/pulls" \
  -d "$(jq -n --arg title "fix(<scope>): <desc>" --arg head "$BRANCH" \
    --arg base "main" --arg body "## Résumé\n\n...\n\nFixes #<N>" \
    '{title: $title, head: $head, base: $base, body: $body}')"
```
Contenu obligatoire : titre conventionnel, `Fixes #N`, résumé, tableau
fichiers modifiés, checklist validation.

### 4.4 — CI PR + Merge
Attendre checks verts (`/commits/<sha>/check-runs`), puis :
```bash
curl -s -X PUT "${AUTH[@]}" "$GH_API/pulls/$PR_NUMBER/merge" \
  -d '{"merge_method":"squash","commit_title":"fix(<scope>): <desc> (#'"$PR_NUMBER"')"}'
curl -s -X DELETE "${AUTH[@]}" "$GH_API/git/refs/heads/$BRANCH"
```

## ÉTAPE 5 — POST-MERGE & PRODUCTION

### 5.1 — CI sur main
```bash
MERGE_SHA=$(curl -s "${AUTH[@]}" "$GH_API/pulls/$PR_NUMBER" | jq -r '.merge_commit_sha')
curl -s "${AUTH[@]}" "$GH_API/commits/$MERGE_SHA/check-runs" | \
  jq '.check_runs[] | {name, status, conclusion}'
```
Si échec : diagnostiquer, corriger sur branche `fix/<scope>-hotfix`, nouvelle PR.

### 5.2 — Déploiement Vercel
Via MCP Vercel : vérifier build production réussi + runtime fonctionnel +
logs Serverless sans erreur.

### 5.3 — Rollback (si production cassée)
Rollback immédiat via MCP Vercel (redéploiement du build précédent),
puis corriger via workflow PR standard.

## ÉTAPE 6 — REPORTING FINAL

### Résumé
- **Problème** : issue #N ou description
- **Cause racine** : explication technique
- **Solution** : approche choisie

### Fichiers modifiés
| Fichier | Modification | Justification |
|---|---|---|

### Validation
| Étape | Statut | Détail |
|---|---|---|
| Lint | | |
| Type-check | | |
| Tests | | couverture : X% |
| Build | | |
| CI PR | | |
| CI main | | |
| Deploy Vercel | | |

### Intégration
- **PR** : #N — titre — URL
- **Merge** : squash, SHA, date
- **Vercel** : URL production, runtime OK

### Checklist finale
- [ ] Isolation multi-tenant (`siteId`) vérifiée
- [ ] Aucune donnée sensible exposée côté client
- [ ] Consommateurs packages partagés non régressés
- [ ] CLAUDE.md mis à jour (si applicable)
- [ ] Env vars documentées dans `.env.example` + Vercel (si applicable)
- [ ] Prisma migration commitée (si applicable)
