---
name: issue
description: Corriger un problème, lister les issues fonctionnelles GitHub ou résoudre une issue spécifique
disable-model-invocation: true
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Task, TodoWrite, AskUserQuestion, Skill
argument-hint: "[continue] #numéro [#numéro...] | liste [links|creai|omega] | (vide)"
---

## LANGUE
Tu communiques **exclusivement en français** (sauf mots-clés techniques
anglais : `fix`, `feat`, `scope`, noms de packages, etc.).

## OUTILS MCP
Connecteurs configurés dans `.mcp.json` — utilise-les pour diagnostiquer :
- **`supabase`** : introspection schéma, requêtes SQL lecture, RLS, Storage
- **`vercel`** : déploiements, logs Serverless, variables d'env, domaines

> **Sécurité MCP :** Pas de requêtes destructrices (`DELETE`, `DROP`) sans
> confirmation. Pas de DDL via MCP — utiliser les fichiers de migration SQL
> dans `packages/db/migrations/`.

### GitHub (via `gh` CLI)
```bash
REPO=$(git remote get-url origin | sed 's|\.git$||' | awk -F'[/:]' '{print $(NF-1)"/"$NF}')
```
Toujours lier les PR aux issues (`Fixes #<n>`).

## CONTEXTE
Réfère-toi à **CLAUDE.md** pour la stack, la structure monorepo, les conventions
de code, les tests et le déploiement Vercel. Ne pas redupliquer ces informations ici.

## APPLICATIONS CIBLES
Ce monorepo héberge trois applications métier. Une issue peut cibler une
application spécifique lorsque son titre commence par `[<nom-application>]` :

| Préfixe titre | Application | Scope git | Package |
|---|---|---|---|
| `[links]` | Link's Accompagnement | `links` | `@unanima/links` |
| `[creai]` | CREAI Île-de-France | `creai` | `@unanima/creai` |
| `[omega]` | Omega Automotive | `omega` | `@unanima/omega` |
| *(aucun)* | Socle commun / transverse | `core`, `auth`, `db`, etc. | `@unanima/*` |

Quand une issue cible une application :
- L'investigation se concentre sur `apps/<nom>/` et ses dépendances
- La branche git utilise le scope de l'app : `fix/<app>-<description>`
- La documentation générée va dans la base documentaire de l'app

---

## SKILLS — COMPÉTENCES SPÉCIALISÉES

Les skills sont des compétences spécialisées qui apportent une **expertise
approfondie** sur des domaines précis. Invoque-les via l'outil `Skill` dès
que le contexte de l'issue le justifie — ne pas les utiliser serait se priver
d'une aide précieuse.

### Matrice de correspondance issue → skills

| Signal dans l'issue | Skill à invoquer | Quand l'invoquer |
|---|---|---|
| Bug, erreur, crash, régression, comportement inattendu | **anomalix** | Étape 1 (investigation) et étape 2 (analyse de cause racine) |
| Décision d'architecture, refactoring structurant, choix de pattern, modélisation | **archicodix** | Étape 2 (analyse des approches) et étape 3 (implémentation) |
| Interface utilisateur, formulaire, tableau, UX, ergonomie, composant UI | **ergonomix** | Étape 3 (implémentation des composants UI) |
| Lenteur, performance, build lent, mémoire, optimisation | **optimix** | Étape 2 (diagnostic perf) et étape 3 (implémentation) |
| Nouvelle fonctionnalité nécessitant spécification, user stories, cadrage | **projetix** | Étape 1 (cadrage du besoin) avant l'implémentation |
| Schéma BDD, migration, RLS, requête SQL, données, audit trail | **databasix** | Étape 2 (conception schéma) et étape 3 (migration + requêtes) |
| Recette, plan de test, validation, critères d'acceptation, couverture | **recettix** | Étape 3 (définition des tests) et étape 4 (validation) |
| Audit qualité, dette technique, revue de code, bilan technique | **auditix** | Étape 1 (diagnostic qualité) et étape 2 (préconisations) |
| CI/CD, GitHub Actions, branching, release, workflow git | **repositorix** | Étape 3 (workflow git) et étape 4 (PR et CI) |
| Document structurant à produire (ADR, guide, spec, rapport) | **documentalix** | Étape 3 (rédaction du document) |
| Faille sécurité, OWASP, injection, secrets, auth, CORS, CSP | **securix** | Étape 2 (audit sécurité) et étape 3 (durcissement) |
| Déploiement, Vercel, env vars, rollback, cold start, monitoring | **deploix** | Étape 2 (diagnostic infra) et étape 5 (post-deploy) |
| Migration BDD, ALTER TABLE, expand/contract, backfill, rollback | **migratix** | Étape 2 (stratégie de migration) et étape 3 (écriture SQL) |
| Endpoint API, route handler, validation Zod, pagination, contrat | **apix** | Étape 2 (conception API) et étape 3 (implémentation) |
| Données personnelles, RGPD, consentement, droit d'accès, PIA | **rgpdix** | Étape 1 (évaluation conformité) et étape 3 (implémentation) |
| Écriture de tests, mock, fixture, factory, vitest, playwright | **testix** | Étape 3 (écriture des tests) et étape 4 (validation) |
| Intégration tierce, webhook, Salesforce, SAP, Resend, circuit breaker | **integratix** | Étape 2 (architecture intégration) et étape 3 (implémentation) |
| Code implémenté à revoir pour qualité et réutilisation | **simplify** | Étape 3 (après implémentation, avant commit) |

### Règles d'invocation

1. **Analyser le contenu de l'issue** (titre, body, labels) pour identifier
   les skills pertinents — plusieurs skills peuvent être invoqués sur une
   même issue (ex : `anomalix` pour le diagnostic + `archicodix` pour la
   solution architecturale).
2. **Invoquer le skill au bon moment** — voir la colonne « Quand l'invoquer »
   dans la matrice ci-dessus. L'invocation doit se faire à l'étape où le
   skill apporte le plus de valeur.
3. **Ne pas invoquer un skill par défaut** — uniquement quand le contenu de
   l'issue correspond réellement aux signaux listés. L'objectif est un
   bénéfice concret, pas une invocation systématique.
4. **Exploiter les chaînes de collaboration entre skills.** Chaque skill
   déclare ses recommandations de collaboration via `compatibility.recommends`
   dans son YAML frontmatter. Quand un skill est invoqué, vérifier ses
   recommandations et invoquer les skills complémentaires si le contexte
   de l'issue le justifie. Exemples courants :
   - Bug UI → `anomalix` (diagnostic) → recommande `archicodix` si problème structurel + `ergonomix` (correction UI) + `testix` (tests anti-régression)
   - Feature complexe → `projetix` (spécification) → recommande `ergonomix` + `maquettix-final` + `recettix` (critères d'acceptation) + `archicodix` (architecture) + `rgpdix` si données personnelles
   - Problème de perf → `anomalix` (investigation) → recommande `optimix` (optimisation) → recommande `databasix` si goulot BDD + `deploix` si cache/CDN
   - Nouvelle table / migration → `databasix` (schéma + RLS) → recommande `migratix` (stratégie de migration) + `archicodix` (modèle de domaine)
   - Refactoring → `archicodix` (design) + `simplify` (revue qualité)
   - Feature avec BDD → `archicodix` (architecture) + `databasix` (schéma) + `apix` (endpoints) + `ergonomix` (UI) + `testix` (tests)
   - Audit de code → `auditix` (rapport) → recommande `securix` (sécurité) + `rgpdix` (RGPD) + les skills spécialisés selon les domaines identifiés
   - Faille de sécurité → `securix` (audit + durcissement) → recommande `databasix` si RLS + `deploix` si headers/env + `rgpdix` si données personnelles
   - Nouvel endpoint API → `apix` (conception + validation) → recommande `archicodix` (patterns) + `securix` (protection) + `testix` (tests de contrat)
   - Intégration tierce → `integratix` (adapter + résilience) → recommande `apix` (webhook endpoint) + `securix` (signature, secrets) + `databasix` (persistence)
   - Incident production → `deploix` (diagnostic + rollback) → recommande `anomalix` (cause racine) + `optimix` si performance

---

## BASE DOCUMENTAIRE

Chaque entité (plateforme + applications) possède sa propre base documentaire.
Tout document créé dans le cadre d'une issue **DOIT** respecter ces règles.

### Arborescence

```
docs/
├── platform/                         ← Base documentaire du socle commun
│   ├── ADR/                          ← Architecture Decision Records
│   │   └── ADR-NNNN-titre.md        ← Ex : ADR-0001-choix-supabase.md
│   ├── guides/                       ← Guides techniques et procédures
│   │   └── GDE-NNNN-titre.md
│   ├── specs/                        ← Spécifications fonctionnelles/techniques
│   │   └── SPC-NNNN-titre.md
│   ├── reports/                      ← Rapports d'investigation et post-mortems
│   │   └── RPT-NNNN-titre.md
│   └── INDEX.md                      ← Index de tous les documents plateforme
│
├── links/                            ← Base documentaire Link's Accompagnement
│   ├── ADR/
│   ├── guides/
│   ├── specs/
│   ├── reports/
│   └── INDEX.md
│
├── creai/                            ← Base documentaire CREAI Île-de-France
│   ├── ADR/
│   ├── guides/
│   ├── specs/
│   └── INDEX.md
│
└── omega/                            ← Base documentaire Omega Automotive
    ├── ADR/
    ├── guides/
    ├── specs/
    └── INDEX.md
```

### Convention de nommage des documents

| Élément | Format | Exemple |
|---|---|---|
| Préfixe type | 3 lettres majuscules | `ADR`, `GDE`, `SPC`, `RPT` |
| Numéro séquentiel | 4 chiffres, zéro-paddé | `0001`, `0042` |
| Titre | kebab-case, descriptif | `choix-supabase`, `flux-authentification` |
| Extension | `.md` | |
| Nom complet | `{TYPE}-{NNNN}-{titre}.md` | `ADR-0003-strategie-cache.md` |

### Types de documents

| Type | Préfixe | Usage |
|---|---|---|
| Architecture Decision Record | `ADR` | Décision technique avec contexte, options et justification |
| Guide | `GDE` | Procédure opérationnelle, tutoriel technique |
| Spécification | `SPC` | Spécification fonctionnelle ou technique d'une feature |
| Rapport | `RPT` | Rapport d'investigation, analyse d'incident, post-mortem |

### Versioning des documents

Chaque document inclut un en-tête YAML front matter :

```yaml
---
ref: ADR-0003
title: Stratégie de cache pour les requêtes Supabase
type: ADR
scope: platform           # platform | links | creai | omega
status: accepted           # draft | review | accepted | superseded | deprecated
version: "1.0"
created: 2026-03-10
updated: 2026-03-10
author: Claude
related-issues: ["#42"]
supersedes: null            # ref du document remplacé (si applicable)
superseded-by: null         # ref du document remplaçant (si applicable)
---
```

- **Numérotation** : séquentielle par type et par scope. Pour connaître le
  prochain numéro, lister les fichiers existants dans le répertoire cible.
- **Statut `superseded`** : quand un document est remplacé, mettre à jour
  son front matter avec `superseded-by` et le statut `superseded`.
- **INDEX.md** : après création ou modification d'un document, mettre à jour
  le fichier `INDEX.md` du scope concerné avec une ligne :
  `| {ref} | {title} | {status} | {version} | {updated} |`

### Règles obligatoires

1. **Tout document créé** dans le cadre d'une issue doit être placé dans la
   base documentaire appropriée (scope de l'app ou `platform`).
2. **Le nommage** doit strictement suivre la convention `{TYPE}-{NNNN}-{titre}.md`.
3. **L'en-tête YAML** est obligatoire et complet.
4. **L'INDEX.md** doit être créé s'il n'existe pas, puis mis à jour.
5. **Pas de document orphelin** : tout document doit être référencé dans l'INDEX.

---

## ROUTAGE DE LA COMMANDE

| Invocation | Mode | Comportement |
|---|---|---|
| `/issue` | Saisie libre | Demande une description via `AskUserQuestion` |
| `/issue liste` | Liste | Affiche toutes les issues fonctionnelles ouvertes |
| `/issue liste links` | Liste filtrée | Issues fonctionnelles de l'app Link's |
| `/issue liste creai` | Liste filtrée | Issues fonctionnelles de l'app CREAI |
| `/issue liste omega` | Liste filtrée | Issues fonctionnelles de l'app Omega |
| `/issue #N` | Issue spécifique | Traite l'issue #N (étapes 1-6) |
| `/issue continue #N` | Continu | Idem sans points d'arrêt |
| `/issue #N1 #N2 ...` | Multi-issues | Traite chaque issue séquentiellement |
| `/issue continue #N1 #N2 ...` | Multi continu | Toutes sans interaction |

### Données récupérées :
!`ARG=$(echo "$ARGUMENTS" | xargs 2>/dev/null || echo ""); CONTINUE=false; if echo "$ARG" | grep -qiw 'continue'; then CONTINUE=true; ARG=$(echo "$ARG" | sed 's/[Cc][Oo][Nn][Tt][Ii][Nn][Uu][Ee]//g' | xargs 2>/dev/null || echo ""); fi; if [ -z "$ARG" ]; then echo "MODE: SAISIE_LIBRE"; echo "CONTINUE: $CONTINUE"; elif echo "$ARG" | grep -qi '^liste'; then FILTER=$(echo "$ARG" | sed 's/^[Ll][Ii][Ss][Tt][Ee]\s*//;s/^[Ll][Ii][Ss][Tt]\s*//' | xargs 2>/dev/null || echo ""); REPO=$(git remote get-url origin | sed 's|\.git$||' | awk -F'[/:]' '{print $(NF-1)"/"$NF}'); echo "MODE: LISTE_ISSUES"; echo "FILTER_APP: $FILTER"; echo ""; echo "| # | Titre | Labels | Créée le |"; echo "|---|---|---|---|"; if [ -n "$FILTER" ]; then curl -sf -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$REPO/issues?state=open&per_page=100" | jq -r --arg app "$FILTER" '[.[] | select(.pull_request == null) | select(.title | test("^\\[" + $app + "\\]"; "i"))] | .[] | "| #\(.number) | \(.title) | \([.labels[].name] | join(", ")) | \(.created_at[:10]) |"'; else curl -sf -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$REPO/issues?state=open&per_page=100" | jq -r '[.[] | select(.pull_request == null)] | .[] | "| #\(.number) | \(.title) | \([.labels[].name] | join(", ")) | \(.created_at[:10]) |"'; fi; elif echo "$ARG" | grep -qi '^list'; then FILTER=$(echo "$ARG" | sed 's/^[Ll][Ii][Ss][Tt][Ee]\s*//;s/^[Ll][Ii][Ss][Tt]\s*//' | xargs 2>/dev/null || echo ""); REPO=$(git remote get-url origin | sed 's|\.git$||' | awk -F'[/:]' '{print $(NF-1)"/"$NF}'); echo "MODE: LISTE_ISSUES"; echo "FILTER_APP: $FILTER"; echo ""; echo "| # | Titre | Labels | Créée le |"; echo "|---|---|---|---|"; if [ -n "$FILTER" ]; then curl -sf -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$REPO/issues?state=open&per_page=100" | jq -r --arg app "$FILTER" '[.[] | select(.pull_request == null) | select(.title | test("^\\[" + $app + "\\]"; "i"))] | .[] | "| #\(.number) | \(.title) | \([.labels[].name] | join(", ")) | \(.created_at[:10]) |"'; else curl -sf -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$REPO/issues?state=open&per_page=100" | jq -r '[.[] | select(.pull_request == null)] | .[] | "| #\(.number) | \(.title) | \([.labels[].name] | join(", ")) | \(.created_at[:10]) |"'; fi; else ISSUES=$(echo "$ARG" | grep -oE '[0-9]+'); REPO=$(git remote get-url origin | sed 's|\.git$||' | awk -F'[/:]' '{print $(NF-1)"/"$NF}'); SECOND=$(echo "$ISSUES" | sed -n '2p'); if [ -n "$SECOND" ]; then echo "MODE: ISSUES_MULTIPLES"; echo "CONTINUE: $CONTINUE"; for NUM in $ISSUES; do echo ""; echo "=== ISSUE #$NUM ==="; curl -sf -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$REPO/issues/$NUM" | jq '{number, title, body, labels: [.labels[].name], state}'; done; else echo "MODE: ISSUE_SPECIFIQUE"; echo "CONTINUE: $CONTINUE"; ISSUE_NUM=$(echo "$ISSUES" | head -1); curl -sf -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$REPO/issues/$ISSUE_NUM" | jq '{number, title, body, labels: [.labels[].name], state}'; fi; fi`

### Instructions selon le mode :

**SAISIE_LIBRE** → `AskUserQuestion` : « Décrivez le problème à corriger : »
puis étapes 1-6.

**LISTE_ISSUES** → Affiche le tableau `| # | Titre | Labels | Créée le |`
puis **s'arrête**. Si `FILTER_APP` est renseigné, seules les issues dont le
titre commence par `[<app>]` sont affichées. Les issues liées aux pull requests
(détectées par le champ `pull_request`) sont **exclues**.

**ISSUE_SPECIFIQUE / ISSUES_MULTIPLES** → Détermine l'application cible à
partir du préfixe `[<app>]` dans le titre de l'issue (si présent).
Étapes 1-6 par issue, séparateur `--- Traitement de l'issue #N ---` entre chaque.

### Mode `CONTINUE` (`CONTINUE: true`)
Saute les STOP (étapes 1 et 2). Sélectionne automatiquement la première
approche proposée. Enchaîne 1 → 6 sans interaction.

---

## ÉTAPE 1 — INVESTIGATION (obligatoire)

1. Déterminer le **scope** : si le titre de l'issue commence par `[links]`,
   `[creai]` ou `[omega]`, l'investigation se concentre sur `apps/<app>/`
   et les packages du socle dont elle dépend. Sinon, scope plateforme.
2. **Identifier les skills pertinents** : analyser le titre, le body et les
   labels de l'issue en les confrontant à la matrice skills (section ci-dessus).
   Noter les skills à invoquer et à quelle étape. Vérifier aussi les
   `compatibility.recommends` de chaque skill identifié pour détecter des
   collaborations bénéfiques.
   - Bug / anomalie / régression → invoquer **anomalix** dès maintenant pour
     bénéficier de sa méthodologie de diagnostic
   - Nouvelle fonctionnalité nécessitant cadrage → invoquer **projetix**
   - Bug ou feature impliquant la BDD (tables, requêtes, RLS, migrations) →
     invoquer **databasix** pour le diagnostic de la couche données
   - Audit qualité ou dette technique demandé → invoquer **auditix**
   - Suspicion de faille de sécurité, secret exposé, auth bypass →
     invoquer **securix** pour l'audit sécurité
   - Problème de déploiement, production cassée, env vars, timeout →
     invoquer **deploix** pour le diagnostic infra
   - Données personnelles concernées (RGPD, consentement, export) →
     invoquer **rgpdix** pour l'évaluation de conformité
   - Intégration tierce impliquée (Salesforce, SAP, webhook, Resend) →
     invoquer **integratix** pour l'expertise d'intégration
3. Lire les fichiers mentionnés + leurs dépendances directes
4. Si `packages/` : identifier les consommateurs via `turbo.json`
5. Si bug déploiement : lire `vercel.json`, `next.config.js`, `.env.example`,
   consulter MCP Vercel (logs, variables d'env)
6. Si bug données : MCP Supabase (schéma, requêtes SQL lecture, RLS)
7. Si bug CI : API GitHub `/commits/<sha>/check-runs`, `/actions/runs`
8. `CONTINUE: false` → **STOP** (résumé + attente confirmation)
   `CONTINUE: true` → résumé bref puis étape 2

## ÉTAPE 2 — ANALYSE

1. Cause racine (pas le symptôme)
2. Périmètre : app cible et/ou package(s) impactés
3. Risques de régression — si package partagé modifié, vérifier impact sur
   les 3 apps
4. Si bug déploiement : diagnostic Serverless (filesystem, timeout, cold start,
   env vars, cache CDN/ISR, CORS/CSP)
5. Si bug données : vérifier cohérence schéma/DB, RLS, index, migrations
6. **Invoquer les skills d'analyse pertinents** :
   - Solution impliquant un choix d'architecture, un pattern, ou du refactoring
     structurant → invoquer **archicodix** pour évaluer les approches
   - Problème de performance identifié → invoquer **optimix** pour le diagnostic
   - Solution impliquant un changement de schéma BDD, de RLS, ou d'accès données
     → invoquer **databasix** pour la conception et la validation
   - Issue nécessitant un audit transversal (qualité, dette, sécurité)
     → invoquer **auditix** pour un diagnostic structuré
   - Migration de schéma nécessaire → invoquer **migratix** pour la stratégie
     (expand/contract, backfill, rollback)
   - Conception ou modification d'endpoints API → invoquer **apix** pour les
     patterns de route handlers, validation Zod, format de réponse
   - Risque de sécurité identifié → invoquer **securix** pour l'analyse
     des vulnérabilités et le plan de durcissement
   - Intégration avec un service externe → invoquer **integratix** pour
     l'architecture d'intégration (adapter, retry, circuit breaker)
7. 2-3 approches avec trade-offs
8. `CONTINUE: false` → **STOP** (présenter options)
   `CONTINUE: true` → choisir la première approche, étape 3

## ÉTAPE 3 — IMPLÉMENTATION

### Git workflow
```bash
git checkout main && git pull origin main
# Si issue ciblant une app :
git checkout -b fix/<app>-<description-courte>
# Si issue socle / transverse :
git checkout -b fix/<scope>-<description-courte>
```
> Ne pas push avant l'étape 4.

### Pré-requis
```bash
pnpm install --frozen-lockfile   # ou pnpm install si lockfile désynchronisé
```

### Migrations Supabase (si applicable)
Créer un nouveau fichier SQL dans `packages/db/migrations/` avec un numéro
séquentiel incrémenté. Ne **jamais modifier** une migration existante déjà
déployée.

### Documentation (uniquement si à forte valeur ajoutée)
Par défaut, **ne pas générer de document** dans la base documentaire.
Un document ne doit être créé que si le traitement de l'issue produit un
contenu à forte valeur ajoutée pour la documentation ou la maintenance du
projet. La majorité des issues (corrections de bugs, ajustements mineurs,
petites fonctionnalités) **ne nécessitent pas** de document.

Cas justifiant la création d'un document :
- Décision architecturale **structurante** qui impacte durablement le projet → `ADR`
- Investigation complexe dont les conclusions sont réutilisables (post-mortem, analyse de performance) → `RPT`
- Nouvelle procédure ou workflow que d'autres développeurs devront suivre → `GDE`
- Spécification d'une fonctionnalité majeure nécessitant une référence pérenne → `SPC`

Si un document est jugé pertinent :

1. Déterminer le **scope** (plateforme ou app cible)
2. Déterminer le **type** de document (`ADR`, `GDE`, `SPC`, `RPT`)
3. Trouver le prochain numéro séquentiel dans `docs/<scope>/<TYPE>/`
4. Créer le document avec l'en-tête YAML complet
5. Mettre à jour `docs/<scope>/INDEX.md`

### CLAUDE.md
Mettre à jour si : nouvelle commande/script, nouveau package, nouvelle env var,
convention modifiée, pipeline CI modifié, config Vercel modifiée.

### Contraintes
Réfère-toi à **CLAUDE.md** pour les contraintes TypeScript, sécurité,
architecture et périmètre de diff.

### Invocation des skills d'implémentation

Avant de coder, invoquer les skills pertinents identifiés à l'étape 1 :
- Composants UI / formulaires / tableaux / ergonomie → invoquer **ergonomix**
  pour appliquer les meilleures pratiques IHM
- Optimisation de performance → invoquer **optimix** pour les patterns
  d'optimisation adaptés
- Migration SQL, schéma BDD, RLS, types générés → invoquer **databasix**
  pour les conventions et la sécurité de la couche données
- Migration de schéma en production → invoquer **migratix** pour la stratégie
  expand/contract et le script de migration
- Nouvelle feature significative nécessitant des critères de recette →
  invoquer **recettix** pour définir les tests d'acceptation
- Écriture effective des tests (unitaires, intégration, E2E) → invoquer
  **testix** pour les patterns de testing Vitest/Playwright
- Endpoints API (route handlers, validation, pagination) → invoquer **apix**
  pour la conformité des contrats d'interface
- Sécurisation (headers, auth, validation, secrets) → invoquer **securix**
  pour le durcissement applicatif
- Conformité RGPD (données personnelles, consentement, droits) → invoquer
  **rgpdix** pour l'implémentation technique de la conformité
- Intégration avec service externe (Salesforce, SAP, Resend, webhook) →
  invoquer **integratix** pour les patterns d'intégration résilients
- Document structurant à produire (ADR, guide, spec, rapport) → invoquer
  **documentalix** pour garantir la conformité documentaire
- Workflow GitHub Actions, CI/CD, release → invoquer **repositorix**
  pour les meilleures pratiques
- Configuration de déploiement Vercel, env vars, monitoring → invoquer
  **deploix** pour les bonnes pratiques d'infrastructure

### Revue qualité pré-commit

Après l'implémentation et avant de committer, invoquer **simplify** pour
vérifier la qualité, la réutilisabilité et l'efficacité du code modifié.
Corriger les problèmes identifiés avant de passer à l'étape 4.

### Tests (obligatoires)
Cas nominal + erreur + edge cases. Si package partagé modifié : test
d'intégration depuis les apps consommatrices.

## ÉTAPE 4 — VALIDATION & PR (obligatoire avant push)

### 4.1 — Pipeline local (dans cet ordre, chaque étape doit réussir)
```bash
pnpm install --frozen-lockfile
pnpm turbo run lint --filter='...[HEAD~1]'
pnpm turbo run type-check --filter='...[HEAD~1]'
pnpm test
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

Créer la PR via `gh` CLI :
```bash
gh pr create --title "fix(<scope>): <description>" \
  --body "## Résumé\n\n...\n\nFixes #<N>"
```
Contenu obligatoire : titre conventionnel, `Fixes #N`, résumé, tableau
fichiers modifiés, checklist validation.

### 4.4 — CI PR + Merge
Attendre checks verts, puis merge squash via `gh pr merge --squash`.

## ÉTAPE 5 — POST-MERGE & PRODUCTION

### 5.1 — CI sur main
Vérifier les checks du commit de merge via GitHub API.
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
- **Application cible** : `[<app>]` ou socle commun
- **Cause racine** : explication technique
- **Solution** : approche choisie

### Fichiers modifiés
| Fichier | Modification | Justification |
|---|---|---|

### Documentation produite
*(Uniquement si un document a été créé/modifié dans la base documentaire)*

| Réf. | Titre | Scope | Type |
|---|---|---|---|

### Validation
| Étape | Statut | Détail |
|---|---|---|
| Lint | | |
| Type-check | | |
| Tests | | |
| Build | | |
| CI PR | | |
| CI main | | |
| Deploy Vercel | | |

### Intégration
- **PR** : #N — titre — URL
- **Merge** : squash, SHA, date
- **Vercel** : URL production, runtime OK

### Skills utilisés
*(Lister les skills invoqués pendant le traitement et leur apport)*

| Skill | Étape | Apport |
|---|---|---|
| *(ex : anomalix)* | *(ex : Étape 1)* | *(ex : méthodologie de diagnostic structurée)* |

### Checklist finale
- [ ] Scope de l'issue correctement identifié (app ou plateforme)
- [ ] Skills pertinents identifiés et invoqués aux bonnes étapes
- [ ] Aucune donnée sensible exposée côté client
- [ ] Consommateurs packages partagés non régressés
- [ ] Base documentaire mise à jour (si documents produits)
- [ ] CLAUDE.md mis à jour (si applicable)
- [ ] Env vars documentées dans `.env.example` + Vercel (si applicable)
- [ ] Migration SQL commitée (si applicable)
