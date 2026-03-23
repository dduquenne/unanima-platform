# Scripts d'installation — Onboarding développeur

## Procédure d'installation complète

```bash
# 1. Cloner le monorepo
git clone git@github.com:<org>/unanima-platform.git
cd unanima-platform

# 2. Vérifier la version Node (lit .nvmrc si présent)
nvm use || nvm install

# 3. Installer les dépendances
pnpm install

# 4. Copier les fichiers d'environnement
cp .env.local.example .env.local
cp apps/links/.env.local.example apps/links/.env.local
cp apps/creai/.env.local.example apps/creai/.env.local
cp apps/omega/.env.local.example apps/omega/.env.local

# 5. Vérifier le build
pnpm build

# 6. Lancer les tests
pnpm test

# 7. Démarrer en mode développement
pnpm dev:links    # ou dev:creai, dev:omega
```

## Configuration des variables d'environnement

Pour chaque app, les clés Supabase et Resend doivent être configurées :

```bash
# apps/links/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...     # Secret ! Ne jamais committer
RESEND_API_KEY=re_xxxx                   # Secret !
```

### Comment obtenir les clés

| Clé | Où la trouver | Qui peut la fournir |
|-----|---------------|---------------------|
| `SUPABASE_URL` | Supabase Dashboard > Settings > API | Admin Supabase |
| `SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API | Admin Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Settings > API | Admin Supabase (confidentiel) |
| `RESEND_API_KEY` | Resend Dashboard > API Keys | Admin Resend |

## Vérification post-installation

```bash
# Vérification rapide que tout fonctionne
pnpm build && pnpm test && echo "Installation réussie !"

# Si un build échoue, vérifier :
# 1. Les variables d'environnement sont présentes
# 2. Les types Supabase sont générés : pnpm generate:types --filter=@unanima/links
# 3. Pas de conflit de versions : pnpm why <package>
```

## Arbre de décision — Diagnostic de setup

```
Problème de setup ?
├── Installation échoue ?
│   ├── pnpm install échoue → Vérifier Node version, corepack, lockfile
│   └── Dépendance manquante → pnpm install, vérifier pnpm-workspace.yaml
├── Build échoue ?
│   ├── Type error → pnpm turbo run typecheck, vérifier types générés
│   ├── Module not found → Vérifier les exports du package, index.ts
│   └── Env var manquante → Vérifier .env.local, copier depuis .env.local.example
├── Dev server ne démarre pas ?
│   ├── Port occupé → Changer le port ou tuer le process
│   ├── Erreur Supabase → Vérifier les clés dans .env.local
│   └── Erreur hot reload → Supprimer .next/ et relancer
└── Tests échouent ?
    ├── Timeout → Augmenter le timeout, vérifier les connexions réseau
    ├── Fixture manquante → Seed la base de données
    └── Browser non installé → npx playwright install
```

## Reset complet

```bash
# En dernier recours : reset complet de l'environnement
rm -rf node_modules .turbo apps/*/.next apps/*/node_modules packages/*/node_modules
pnpm install
pnpm build
```

## Premier commit — Workflow

```bash
# 1. Créer une branche
git checkout -b feat/mon-premier-changement

# 2. Faire les modifications...

# 3. Vérifier avant de committer
pnpm lint && pnpm test && pnpm build

# 4. Committer (format conventionnel)
git add <fichiers>
git commit -m "feat(links): add beneficiaire search filter"

# 5. Pousser et créer une PR
git push -u origin feat/mon-premier-changement
gh pr create --fill
```

## Conventions de commit

```
<type>(<scope>): <description>

Types : feat, fix, docs, style, refactor, test, chore
Scopes : core, auth, db, email, rgpd, dashboard, links, creai, omega
```

## Checklist avant PR

- [ ] Le code compile (`pnpm build`)
- [ ] Les tests passent (`pnpm test`)
- [ ] Le lint est propre (`pnpm lint`)
- [ ] Les types sont stricts (pas de `any`)
- [ ] Les imports suivent l'ordre (externes → monorepo → locaux)
- [ ] Les composants sont fonctionnels (pas de classes)
- [ ] Les variables d'environnement sont documentées
- [ ] Si le socle est touché : les 3 apps buildent
