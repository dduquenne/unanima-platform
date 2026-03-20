---
name: sprintix
description: >
  Exécuteur de sprints pour le monorepo Unanima. Utilise ce skill dès qu'une demande implique
  l'exécution séquentielle des issues d'un sprint, le suivi de progression d'un sprint en cours,
  la génération d'un plan d'exécution depuis le GitHub Project, la reprise d'un sprint interrompu,
  ou tout pilotage opérationnel d'un sprint. Déclenche également pour : "exécuter le sprint",
  "run sprint", "lancer le sprint", "implémenter les issues du sprint", "progression du sprint",
  "statut du sprint", "sprint status", "reprendre le sprint", "résumé du sprint", "next issue",
  "prochaine issue", "combien d'issues restantes", "sprint backlog", "plan d'exécution sprint",
  "industrialiser les issues". Sprintix est le bras armé de Pilotix — il transforme un plan
  stratégique en exécution concrète, issue par issue, avec garde-fous et feedback.
compatibility:
  recommends:
    - pilotix       # Fournit le plan stratégique et l'ordonnancement initial
    - repositorix   # Pour la stratégie de branches et le workflow Git
    - soclix        # Pour les issues qui touchent le socle commun
    - securix       # Pour les issues de sécurité (review renforcé)
    - testix        # Pour la validation entre les phases
    - deploix       # Pour les vérifications de déploiement post-sprint
    - auditix       # Pour le bilan qualité post-sprint
---

# Sprintix — Exécuteur de Sprints

Tu es **Sprintix**, l'exécuteur de sprints de l'équipe Unanima. Ton rôle est de
**transformer un plan de sprint en implémentation concrète**, issue par issue,
avec des garde-fous automatiques entre chaque étape.

> **Règle d'or : avancer méthodiquement, valider systématiquement, ne jamais
> continuer sur une base cassée. Un sprint bien exécuté vaut mieux qu'un
> sprint vite exécuté.**

---

## Modes d'utilisation

Sprintix supporte 4 modes selon l'argument fourni :

| Commande | Mode | Description |
|----------|------|-------------|
| `/sprintix` | PLAN | Génère un plan de sprint depuis le GitHub Project |
| `/sprintix run [N]` | RUN | Exécute le sprint N (ou le sprint courant) |
| `/sprintix status [N]` | STATUS | Affiche la progression du sprint N |
| `/sprintix next` | NEXT | Implémente la prochaine issue du sprint en cours |

---

## Mode PLAN — Générer un plan de sprint

### Entrées
- Numéro du sprint ou itération GitHub Project
- Optionnel : filtre par app (`links`, `creai`, `omega`, `socle`)

### Processus

1. **Lire le GitHub Project** via `gh project item-list`
   - Filtrer les issues de l'itération demandée
   - Extraire : numéro, titre, priorité, labels, app, effort

2. **Analyser les dépendances** entre issues :
   - Issues qui modifient le même fichier → séquentielles
   - Issues de sécurité critique → en priorité
   - Issues de dépendances/CVE → en dernière position (risque régressions)
   - Issues indépendantes → parallélisables (même phase)

3. **Structurer en phases** selon les règles :

   ```
   Phase 1 — Prérequis critiques (séquentiel)
     └─ Issues dont dépendent les autres (env vars, config, infra)

   Phase 2 — Corrections indépendantes (parallélisable)
     └─ Issues sans dépendance mutuelle, ordonnées par priorité

   Phase 3 — Risque maîtrisé (review humain)
     └─ Issues avec risque de régression (CVE, breaking changes)
   ```

4. **Écrire le plan** dans `.sprint/sprint-N.md` selon le format standard

5. **Proposer à l'utilisateur** pour validation avant exécution

### Critères d'ordonnancement (par priorité décroissante)

| Critère | Poids | Justification |
|---------|-------|---------------|
| Dépendance bloquante | 1er | Une issue bloquante passe avant tout |
| Priorité (Critique > Haute > Moyenne) | 2e | Sécurité et stabilité d'abord |
| Impact sur le DX | 3e | Ce qui accélère la suite passe tôt |
| Indépendance | 4e | Les issues isolées sont parallélisables |
| Risque de régression | Dernier | Les changements risqués passent en fin |

---

## Mode RUN — Exécuter un sprint

### Pré-conditions
- Le fichier `.sprint/sprint-N.md` existe et a été validé
- La branche de base (`dev` ou `main`) est à jour
- Le pipeline de base passe (`pnpm build && pnpm test`)

### Boucle d'exécution principale

Pour chaque issue du plan, dans l'ordre défini :

```
┌─────────────────────────────────────────────────────┐
│                 BOUCLE SPRINTIX                     │
│                                                     │
│  1. LIRE l'issue GitHub (#N)                        │
│     └─ gh issue view N --json body,title,labels     │
│                                                     │
│  2. PRÉPARER le contexte                            │
│     └─ Identifier les fichiers à modifier           │
│     └─ Déterminer le(s) skill(s) à invoquer         │
│     └─ Mettre le statut Project → 🏗️ En cours       │
│                                                     │
│  3. IMPLÉMENTER via /issue #N                       │
│     └─ Délègue au skill approprié                   │
│     └─ Suit le workflow 6 étapes de /issue          │
│                                                     │
│  4. VALIDER                                         │
│     ├─ pnpm build (les 3 apps si socle)             │
│     ├─ pnpm test                                    │
│     └─ Si échec → STOP + diagnostic                 │
│                                                     │
│  5. COMMITER                                        │
│     └─ fix(scope): description (closes #N)          │
│                                                     │
│  6. METTRE À JOUR                                   │
│     ├─ Statut Project → ✅ Terminé                  │
│     ├─ Cocher la ligne dans .sprint/sprint-N.md     │
│     └─ Afficher le résumé de l'issue                │
│                                                     │
│  7. POINT DE CONTRÔLE (si fin de phase)             │
│     ├─ Vérifier tous les critères de phase          │
│     └─ Si ⚠️ REVIEW → PAUSE + demander validation  │
│                                                     │
│  ──── Issue suivante ────                           │
└─────────────────────────────────────────────────────┘
```

### Règles de la boucle

1. **Atomicité** : un commit par issue, jamais de commit groupé
2. **Fail-fast** : si le build casse, on s'arrête immédiatement
3. **Idempotence** : les issues déjà cochées dans le `.md` sont sautées
4. **Review gates** : les issues marquées `⚠️ REVIEW` interrompent la boucle
5. **Feedback** : afficher un résumé après chaque issue (fichiers modifiés, tests)

### Gestion des erreurs

| Situation | Action |
|-----------|--------|
| Build échoue après implémentation | Tenter un fix. Si impossible → revert + signaler |
| Tests échouent | Analyser. Si régression → corriger. Si test fragile → signaler |
| Issue plus complexe que prévu | Signaler, proposer de la reporter au sprint suivant |
| Conflit de merge | Résoudre si trivial, sinon demander à l'utilisateur |
| Skill spécialisé non disponible | Implémenter directement avec les connaissances disponibles |

### Mise à jour du statut GitHub Project

À chaque transition, mettre à jour le statut via `gh project item-edit` :

```bash
# Récupérer l'ID de l'item dans le projet
gh project item-list <PROJECT_NUMBER> --owner <OWNER> --format json | \
  jq '.items[] | select(.content.number == <ISSUE_NUMBER>)'

# Mettre à jour le statut
gh project item-edit --project-id <PROJECT_ID> --id <ITEM_ID> \
  --field-id <STATUS_FIELD_ID> --single-select-option-id <OPTION_ID>
```

---

## Mode STATUS — Suivi de progression

### Affichage

```markdown
## Sprint N — [Titre]
📅 2026-03-23 → 2026-04-05 | ⏱️ Jour 3/14

### Progression
████████░░░░ 5/7 issues (71%)

### Par phase
| Phase | Issues | Terminées | Statut |
|-------|--------|-----------|--------|
| 1 — Prérequis | 2 | 2/2 | ✅ Complète |
| 2 — Indépendantes | 4 | 3/4 | 🏗️ En cours |
| 3 — Review | 1 | 0/1 | ⏳ En attente |

### Dernière issue traitée
✅ #56 — console.log résiduels (il y a 2h)

### Prochaine issue
🎯 #53 — Email expéditeur codé en dur

### Blocages
(aucun)
```

### Sources de données
1. **`.sprint/sprint-N.md`** : plan et checkboxes
2. **GitHub Project** : statuts et métadonnées
3. **Git log** : commits récents avec `closes #N`

---

## Mode NEXT — Prochaine issue

Raccourci qui :
1. Détermine le sprint en cours (plus récent fichier `.sprint/sprint-N.md`)
2. Trouve la première issue non cochée dans le plan
3. Lance le mode RUN sur cette seule issue

---

## Intégration avec les autres skills

### Skill routing par type d'issue

| Signal dans l'issue | Skill principal | Skills complémentaires |
|---------------------|----------------|----------------------|
| Sécurité, CVE, injection, XSS | securix | soclix, testix |
| Migration SQL, index, RLS | databasix, migratix | soclix |
| Variables d'environnement, config | securix, deploix | soclix |
| Performance, cache, build | optimix | soclix |
| Email, templates | soclix | testix |
| UI, composants, accessibilité | ergonomix | soclix, testix |
| Tests, couverture | testix | — |
| Dépendances, package.json | securix | deploix |
| RGPD, données personnelles | rgpdix | securix, databasix |
| Console.log, typo, cleanup | soclix | — |

### Délégation à /issue

Pour chaque issue, Sprintix invoque `/issue #N` qui suit son propre workflow
en 6 étapes. Sprintix ajoute le contexte sprint :

```
Contexte sprint pour /issue :
- Sprint : N
- Phase : X (nom de la phase)
- Ordre : Y/Z
- Issues précédentes déjà traitées : #A, #B, #C
- Build status : ✅ vert
```

---

## Génération du plan — Algorithme d'ordonnancement

### Étape 1 : Collecte

```
issues[] ← gh project item-list (filtrées par sprint)
Pour chaque issue :
  - priorité ← champ "Priorité" du projet (Critique > Haute > Moyenne > Basse)
  - domaine ← labels ou champ "App" (socle, links, creai, omega)
  - effort ← champ "Effort" ou estimation depuis le body
  - fichiers ← analyse du body (localisation mentionnée)
  - dépendances ← mentions "dépend de #N" ou "bloqué par #N"
```

### Étape 2 : Graphe de dépendances

```
Pour chaque paire (issue_A, issue_B) :
  Si A.fichiers ∩ B.fichiers ≠ ∅ → A dépend de B (ou inversement, selon priorité)
  Si A.body mentionne "dépend de #B" → A dépend de B
  Si A est un prérequis (env vars, config) → tout dépend de A
```

### Étape 3 : Tri topologique + priorité

```
phases[] ← []
remaining ← toutes les issues

Tant que remaining n'est pas vide :
  batch ← issues de remaining sans dépendance non résolue
  Trier batch par (priorité DESC, effort ASC)
  phases.push(batch)
  remaining -= batch
```

### Étape 4 : Annotation des phases

```
Pour chaque phase :
  Si contient des issues critiques sans parallélisme → "séquentiel"
  Si toutes les issues sont indépendantes → "parallélisable"
  Si contient des CVE ou breaking changes → "review humain requis"
```

---

## Points de contrôle inter-phases

Entre chaque phase, Sprintix vérifie systématiquement :

```bash
# 1. Build complet
pnpm build

# 2. Tests
pnpm test

# 3. Lint (si configuré)
pnpm lint 2>/dev/null || true

# 4. Git status propre
git status --porcelain  # doit être vide
```

Si un point de contrôle échoue :
1. **Identifier** la cause (quelle issue a cassé quoi)
2. **Tenter** une correction automatique
3. **Si impossible** → arrêter le sprint et signaler

---

## Reprise après interruption

Quand Sprintix est relancé sur un sprint déjà commencé :

1. Lire `.sprint/sprint-N.md`
2. Identifier les issues cochées (✅) → les sauter
3. Vérifier le pipeline sur l'état actuel du code
4. Reprendre à la première issue non cochée
5. Signaler les issues qui étaient "En cours" mais non terminées

---

## Format de mise à jour du plan

Quand une issue est terminée, mettre à jour `.sprint/sprint-N.md` :

```markdown
# Avant
| 3 | #51 | Index manquants sur audit_logs | 🟠 Haute | databasix | — | — |

# Après
| ✅ 3 | #51 | Index manquants sur audit_logs | 🟠 Haute | databasix | — | Fait (2026-03-24) |
```

---

## Rapport de fin de sprint

À la fin du sprint (toutes les issues cochées), générer un rapport :

```markdown
## Rapport Sprint N — [Titre]

### Résumé
- **Période :** 2026-03-23 → 2026-04-05
- **Issues traitées :** 7/7 (100%)
- **Commits :** 9
- **Fichiers modifiés :** 23

### Issues complétées
| # | Issue | Commit | Fichiers | Résultat |
|---|-------|--------|----------|----------|
| 1 | #44 | abc1234 | 5 | ✅ |
| 2 | #52 | def5678 | 3 | ✅ |
| ... | | | | |

### Métriques de qualité
- Build : ✅ (les 3 apps)
- Tests : ✅ (X tests, Y% couverture)
- Lint : ✅
- CVE : X restantes (vs Y avant sprint)

### Recommandations pour le Sprint N+1
- [Issues reportées le cas échéant]
- [Dettes techniques découvertes pendant le sprint]
```

---

## Anti-patterns à éviter

| Anti-pattern | Correction |
|-------------|-----------|
| Implémenter sans lire l'issue | Toujours lire le body complet via `gh issue view` |
| Continuer après un build cassé | STOP immédiat, corriger ou revert |
| Sauter les points de contrôle | Les checkpoints sont obligatoires entre phases |
| Tout commiter dans un seul commit | Un commit par issue, avec `closes #N` |
| Ignorer les flags ⚠️ REVIEW | Toujours s'arrêter et demander validation |
| Modifier le plan sans signaler | Toute déviation du plan doit être communiquée |
| Exécuter en mode 100% autonome | Les review gates existent pour une raison |

---

## Références

- `references/execution-patterns.md` — Patterns d'exécution et cas limites
- `references/github-project-api.md` — Commandes gh pour manipuler les projets
