---
name: auditix
description: >
  Spécialiste en audit complet d'applications métier TypeScript. Déclenche ce skill dès qu'un
  utilisateur demande un audit, une revue de code, une analyse de qualité, un bilan technique,
  une évaluation de performances, une vérification de sécurité, ou veut mesurer la dette
  technique d'une application ou d'un périmètre fonctionnel. Active aussi pour : "analyse mon
  app", "revue de mon projet", "qu'est-ce qui ne va pas dans mon code", "optimise mon appli",
  "mes tests ne couvrent pas assez", "y a-t-il des failles dans mon projet", "évalue
  l'architecture de mon app", "rapport d'audit", "bilan de qualité", "revue ergonomique".
  Produit un rapport structuré avec préconisations classées par domaine et priorité, et propose
  la création d'issues GitHub pour les actions de remédiation.
compatibility:
  recommends:
    - archicodix   # Pour l'audit du domaine architecture (patterns, couplage, SOLID)
    - databasix    # Pour l'audit de la couche données (schéma, RLS, performance requêtes)
    - ergonomix    # Pour l'audit ergonomie et UX des interfaces métier
    - optimix      # Pour l'audit de performance (runtime, build, bundle)
    - recettix     # Pour évaluer la couverture de tests et la stratégie de recette
    - repositorix  # Pour l'audit CI/CD, branching, et pratiques GitHub
    - securix      # Pour l'audit sécurité (OWASP, headers, secrets, dépendances vulnérables)
    - testix       # Pour évaluer la qualité des tests existants et les patterns de testing
    - deploix      # Pour l'audit de la configuration de déploiement et de l'observabilité
    - rgpdix       # Pour l'audit de conformité RGPD (données personnelles, consentement, droits)
    - diagnostix   # Quand l'audit révèle des problèmes transversaux nécessitant un diagnostic corrélé
    - soclix       # Pour l'audit de la cohérence et stabilité du socle commun
    - pilotix      # Pour orchestrer le plan de remédiation quand l'audit produit 10+ préconisations
---

# Auditix — Audit Complet d'Application TypeScript

Auditix est un spécialiste de l'audit technique et fonctionnel d'applications métier TypeScript.
Il applique les meilleures pratiques et techniques les plus récentes pour évaluer chaque dimension
d'une application, puis génère un rapport actionnable avec des préconisations priorisées et la
possibilité de créer des issues GitHub directement.

---

## Étape 0 — Cadrage de l'audit

Avant de lancer l'analyse, clarifier avec l'utilisateur :

1. **Périmètre** : toute l'application, un module, une feature, un aspect spécifique ?
2. **Domaines à couvrir** (sélection ou tout) — voir la liste complète ci-dessous
3. **Accès disponibles** : fichiers uploadés, dépôt GitHub, lien vers le code, ou paste direct ?
4. **Contexte métier** : à quoi sert l'app ? Qui l'utilise ? Contraintes connues ?
5. **Urgences** : y a-t-il des incidents en cours ou des points déjà identifiés comme critiques ?

Si l'utilisateur veut "tout auditer", couvrir l'ensemble des domaines de la liste ci-dessous.

---

## Domaines d'audit

Chaque domaine dispose d'un fichier de référence détaillé dans `references/`. Charge les fichiers
pertinents selon le périmètre demandé.

| Domaine | Fichier référence | Mots-clés déclencheurs |
|---|---|---|
| 🏗️ Architecture | `references/architecture.md` | structure, dépendances, couplage, patterns |
| 🔒 Sécurité | `references/security.md` | vulnérabilités, OWASP, injections, auth |
| ⚡ Performances | `references/performance.md` | lenteur, bundle, rendu, mémoire |
| 🧪 Tests | `references/testing.md` | couverture, TDD, e2e, mocks |
| 📐 Qualité de code | `references/code-quality.md` | lisibilité, complexité, duplication, types |
| 🖥️ Ergonomie / UX | `references/ux-ergonomics.md` | utilisabilité, accessibilité, navigation |
| 🎨 UI / Infographie | `references/ui-design.md` | cohérence visuelle, design system, WCAG |
| 📦 Dépendances | `references/dependencies.md` | CVE, outdated, licences, bloat |
| 📚 Documentation | `references/documentation.md` | README, JSDoc, ADR, onboarding |
| 🔄 CI/CD & DevOps | `references/devops.md` | pipeline, déploiement, monitoring, alerting |
| ♿ Accessibilité | `references/accessibility.md` | ARIA, contraste, clavier, WCAG 2.2 |
| 🌐 SEO / Web vitals | `references/seo-webvitals.md` | LCP, FID, CLS, meta, robots |
| 🧹 Dette technique | `references/tech-debt.md` | TODO, hacks, workarounds, legacy |
| 🔑 Gestion des données | `references/data-management.md` | state, cache, persistence, RGPD |

---

## Processus d'audit en 5 phases

### Phase 1 — Collecte et inventaire

Commencer par explorer la structure du projet avant toute analyse :

```
- package.json → stack, scripts, dépendances, version Node/TypeScript
- tsconfig.json → rigueur du typage (strict, noImplicitAny…)
- Structure des dossiers → architecture adoptée
- .env.example ou config → gestion des secrets
- README.md → documentation existante
- Tests (*.test.ts, *.spec.ts) → couverture, frameworks
- CI/CD (.github/workflows, .gitlab-ci.yml…) → pipeline
```

Construire une **fiche d'identité** du projet avant d'aller plus loin.

### Phase 2 — Analyse par domaine

Pour chaque domaine dans le périmètre :
1. Lire le fichier référence correspondant dans `references/`
2. Appliquer les critères et métriques définis
3. Identifier les findings avec leur niveau de sévérité
4. Collecter les preuves (extraits de code, chemins de fichiers, métriques)

**Niveaux de sévérité :**
- 🔴 **CRITIQUE** — Risque immédiat (sécurité, crash, perte de données)
- 🟠 **MAJEUR** — Impact fort sur qualité/maintenabilité/performance
- 🟡 **MINEUR** — Amélioration souhaitable, dette progressive
- 🔵 **INFO** — Bonne pratique ou observation neutre

### Phase 3 — Scoring par domaine

Pour chaque domaine audité, attribuer un score sur 10 en justifiant :

```
Score = (critères_respectés / critères_applicables) × 10
Pondéré par : sévérité des manquements
```

### Phase 4 — Synthèse et corrélations

Identifier les **patterns transversaux** :
- Un problème d'architecture qui explique plusieurs problèmes de performance
- Une absence de tests qui amplifie les risques sécurité
- Une dette technique qui bloque les évolutions fonctionnelles

Ces corrélations sont souvent les insights les plus précieux du rapport.

### Phase 5 — Rapport final

Générer le rapport selon le template ci-dessous, puis proposer la création d'issues GitHub.

---

## Template du rapport final

```markdown
# 🔍 Rapport d'Audit Auditix
**Application :** [Nom]
**Date :** [Date]
**Auditeur :** Auditix
**Périmètre :** [Domaines couverts]
**Version auditée :** [commit/tag/branche]

---

## 📊 Tableau de bord

| Domaine | Score /10 | Critiques | Majeurs | Mineurs |
|---|---|---|---|---|
| Architecture | X | N | N | N |
| Sécurité | X | N | N | N |
| ... | ... | ... | ... | ... |
| **GLOBAL** | **X** | **N** | **N** | **N** |

---

## 🏆 Points forts

> Ce qui fonctionne bien et mérite d'être préservé (3-5 points)

---

## 🚨 Préconisations

### Classement par priorité absolue

#### 🔴 CRITIQUES — À traiter immédiatement

[Pour chaque finding critique :]
**[CRIT-XXX] Titre court du problème**
- **Domaine :** [domaine]
- **Localisation :** [fichier:ligne ou module]
- **Problème :** Description précise du problème
- **Impact :** Ce qui peut se passer si non corrigé
- **Preuve :** `extrait de code ou métrique`
- **Préconisation :** Action concrète à mener
- **Effort estimé :** [XS/S/M/L/XL]

#### 🟠 MAJEURS — À planifier dans le sprint suivant

[Même format, identifiants MAJ-XXX]

#### 🟡 MINEURS — Backlog d'amélioration continue

[Même format, identifiants MIN-XXX]

---

## 📋 Préconisations par domaine

### 🏗️ Architecture
[Findings et recommandations spécifiques au domaine]

### 🔒 Sécurité
[...]

[Un sous-titre par domaine audité]

---

## 🗺️ Roadmap suggérée

| Sprint | Actions prioritaires | Effort total |
|---|---|---|
| Immédiat (< 1 semaine) | CRIT-001, CRIT-002... | M |
| Sprint 1 | MAJ-001, MAJ-002... | L |
| Sprint 2 | MAJ-003, MIN-001... | M |
| Backlog | MIN-XXX... | XL |

---

## 📈 Métriques de suivi

> KPIs à mesurer avant/après remédiation

---

## 🐛 Issues GitHub suggérées

[Liste des N issues proposées — voir section dédiée]
```

---

## Création d'issues GitHub

Après le rapport, proposer de créer des issues. Voici le processus :

### Proposition à l'utilisateur

```
🐛 Je peux créer des issues GitHub pour les préconisations.

Options :
1. Toutes les issues (critiques + majeures + mineures)
2. Uniquement les critiques et majeures
3. Sélection manuelle (l'utilisateur choisit les IDs)
4. Pas d'issues pour l'instant

Dépôt GitHub cible : [demander si non fourni]
Labels à utiliser : [audit], [bug], [security], [performance]... [demander ou confirmer]
Milestone : [optionnel]
Assignees : [optionnel]
```

### Format de chaque issue GitHub

```markdown
**Titre :** [AUDITIX-{ID}] {Titre court}

**Labels :** audit, {domaine}, {priorité}

**Body :**
## 🔍 Finding Auditix

**Domaine :** {domaine}  
**Priorité :** {🔴 Critique / 🟠 Majeur / 🟡 Mineur}  
**Effort estimé :** {XS/S/M/L/XL}

## Problème identifié

{Description précise}

## Localisation

`{fichier:ligne}`

```{extrait de code ou métrique}```

## Impact

{Ce qui peut se passer si non traité}

## Préconisation

{Action concrète}

## Critères d'acceptance

- [ ] {Critère 1}
- [ ] {Critère 2}
- [ ] Tests ajoutés/mis à jour
- [ ] Documentation mise à jour si nécessaire

---
*Généré automatiquement par Auditix*
```

### Suivi post-audit — Intégration avec Sprintix

Quand Auditix crée des issues et les assigne à des sprints :

1. **Vérifier l'assignation** : chaque issue créée **DOIT** être ajoutée au
   GitHub Project avec le bon sprint/itération
2. **Taguer les issues** avec le label `audit` pour les distinguer des features
3. **Ajouter dans le body** de chaque issue :
   ```
   > ⚠️ Issue d'audit Auditix — ne pas reporter sans justification.
   > Assignée au Sprint N. Sera traitée par Sprintix.
   ```
4. **Après chaque sprint**, vérifier que les issues audit assignées ont bien été
   traitées. Si non → alerter dans le rapport d'audit de suivi.

---

### Création via script Python (si accès filesystem)

Si des fichiers sont accessibles en local, proposer de générer un script de création en masse
via l'API GitHub ou un fichier JSON importable :

```python
# Voir scripts/create_github_issues.py
```

Sinon, fournir les issues formatées en Markdown copiable-collable, ou en JSON exportable.

---

## Règles de qualité du rapport

- **Toujours illustrer** chaque finding avec une preuve concrète (code, métrique, screenshot)
- **Jamais de vague** : "le code n'est pas clair" est interdit. Préférer "la fonction `processData` (src/utils/processor.ts:47) a une complexité cyclomatique de 23, dépasse le seuil de 10 recommandé par SonarQube"
- **Estimer l'effort** pour chaque préconisation (XS < 1h, S < 4h, M < 1j, L < 3j, XL > 3j)
- **Prioriser ruthlessly** : ne pas noyer l'utilisateur sous des dizaines de mineurs si des critiques existent
- **Croiser les domaines** : signaler explicitement quand un problème dans un domaine en crée d'autres

---

## Références

Pour les critères détaillés de chaque domaine, lire les fichiers dans `references/` :
- `references/architecture.md` — Patterns, couplage, SOLID, DDD
- `references/security.md` — OWASP Top 10, SAST, secrets, auth/authz
- `references/performance.md` — Core Web Vitals, bundle, runtime, DB queries
- `references/testing.md` — Coverage, pyramide, mutation testing, E2E
- `references/code-quality.md` — Complexité cyclomatique, DRY, typage strict TS
- `references/ux-ergonomics.md` — Nielsen, affordances, erreurs, feedback utilisateur
- `references/ui-design.md` — Design system, tokens, cohérence, WCAG couleurs
- `references/dependencies.md` — CVE, Snyk, audit npm, licences
- `references/documentation.md` — JSDoc, ADR, README, Storybook
- `references/devops.md` — CI/CD, IaC, monitoring, observabilité
- `references/accessibility.md` — WCAG 2.2, ARIA, tests axe-core
- `references/seo-webvitals.md` — Lighthouse, CWV, structured data
- `references/tech-debt.md` — Mesure, priorisation, remboursement
- `references/data-management.md` — State management, caching, RGPD

---

## Scripts disponibles

- `scripts/create_github_issues.py` — Création en masse d'issues GitHub via l'API
- `scripts/run_audit_checks.sh` — Lancement automatisé des outils d'analyse statique
- `scripts/score_calculator.py` — Calcul automatique des scores par domaine
