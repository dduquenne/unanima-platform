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

## Conventions de performance

Ce skill applique les conventions de `_common/performance-workflow.md` :
- **Feedback continu** : afficher un message avant chaque phase et chaque domaine audité
- **Génération incrémentale** : fiche d'identité d'abord, puis audit domaine par domaine
- **Lecture conditionnelle** : ne charger que les fichiers de référence des domaines demandés
- **Parallélisation** : pour les audits multi-domaines (3+), lancer un sous-agent par domaine via l'outil Agent

### Workflow de génération du rapport

```
[Phase 1/5] — Cadrage : clarifier périmètre et domaines.
[Phase 2/5] — Collecte et inventaire : scanner la structure, fiche d'identité.
[Phase 3/5] — Analyse par domaine (PARALLÉLISABLE) : un sous-agent par domaine.
[Phase 4/5] — Synthèse et scoring : assembler, scores, corrélations.
[Phase 5/5] — Rapport final : compiler et proposer création d'issues GitHub.
```

### Lecture conditionnelle des références

Ne lire que les fichiers `references/*.md` correspondant aux domaines effectivement demandés.

---

## Étape 0 — Cadrage de l'audit

Avant de lancer l'analyse, clarifier avec l'utilisateur :

1. **Périmètre** : toute l'application, un module, une feature, un aspect spécifique ?
2. **Domaines à couvrir** (sélection ou tout) — voir la liste complète ci-dessous
3. **Accès disponibles** : fichiers uploadés, dépôt GitHub, lien vers le code, ou paste direct ?
4. **Contexte métier** : à quoi sert l'app ? Qui l'utilise ? Contraintes connues ?
5. **Urgences** : y a-t-il des incidents en cours ou des points déjà identifiés comme critiques ?

---

## Domaines d'audit

Chaque domaine dispose d'un fichier de référence détaillé dans `references/`. Charge les fichiers
pertinents selon le périmètre demandé.

| Domaine | Fichier référence | Mots-clés déclencheurs |
|---|---|---|
| Architecture | `references/architecture.md` | structure, dépendances, couplage, patterns |
| Sécurité | `references/security.md` | vulnérabilités, OWASP, injections, auth |
| Performances | `references/performance.md` | lenteur, bundle, rendu, mémoire |
| Tests | `references/testing.md` | couverture, TDD, e2e, mocks |
| Qualité de code | `references/code-quality.md` | lisibilité, complexité, duplication, types |
| Ergonomie / UX | `references/ux-ergonomics.md` | utilisabilité, accessibilité, navigation |
| UI / Infographie | `references/ui-design.md` | cohérence visuelle, design system, WCAG |
| Dépendances | `references/dependencies.md` | CVE, outdated, licences, bloat |
| Documentation | `references/documentation.md` | README, JSDoc, ADR, onboarding |
| CI/CD & DevOps | `references/devops.md` | pipeline, déploiement, monitoring, alerting |
| Accessibilité | `references/accessibility.md` | ARIA, contraste, clavier, WCAG 2.2 |
| SEO / Web vitals | `references/seo-webvitals.md` | LCP, FID, CLS, meta, robots |
| Dette technique | `references/tech-debt.md` | TODO, hacks, workarounds, legacy |
| Gestion des données | `references/data-management.md` | state, cache, persistence, RGPD |

---

## Processus d'audit en 5 phases

### Phase 1 — Collecte et inventaire

Explorer la structure du projet : `package.json`, `tsconfig.json`, structure des dossiers,
`.env.example`, README, tests, CI/CD. Construire une **fiche d'identité** du projet.

### Phase 2 — Analyse par domaine

Pour chaque domaine dans le périmètre :
1. Lire le fichier référence correspondant dans `references/`
2. Appliquer les critères et métriques définis
3. Identifier les findings avec leur niveau de sévérité
4. Collecter les preuves (extraits de code, chemins de fichiers, métriques)

**Niveaux de sévérité :**
- **CRITIQUE** — Risque immédiat (sécurité, crash, perte de données)
- **MAJEUR** — Impact fort sur qualité/maintenabilité/performance
- **MINEUR** — Amélioration souhaitable, dette progressive
- **INFO** — Bonne pratique ou observation neutre

### Phase 3 — Scoring par domaine

```
Score = (critères_respectés / critères_applicables) × 10
Pondéré par : sévérité des manquements
```

### Phase 4 — Synthèse et corrélations

Identifier les **patterns transversaux** :
- Un problème d'architecture qui explique plusieurs problèmes de performance
- Une absence de tests qui amplifie les risques sécurité
- Une dette technique qui bloque les évolutions fonctionnelles

### Phase 5 — Rapport final

Générer le rapport selon le template dans `references/report-template.md`, puis proposer la
création d'issues GitHub selon le processus dans `references/github-issues.md`.

---

## Règles de qualité du rapport

- **Toujours illustrer** chaque finding avec une preuve concrète (code, métrique, screenshot)
- **Jamais de vague** : "le code n'est pas clair" est interdit. Préférer "la fonction `processData` (src/utils/processor.ts:47) a une complexité cyclomatique de 23, dépasse le seuil de 10 recommandé par SonarQube"
- **Estimer l'effort** pour chaque préconisation (XS < 1h, S < 4h, M < 1j, L < 3j, XL > 3j)
- **Prioriser ruthlessly** : ne pas noyer l'utilisateur sous des dizaines de mineurs si des critiques existent
- **Croiser les domaines** : signaler explicitement quand un problème dans un domaine en crée d'autres

---

## Références

Fichiers de critères par domaine dans `references/` :
- `references/architecture.md`, `references/security.md`, `references/performance.md`
- `references/testing.md`, `references/code-quality.md`, `references/ux-ergonomics.md`
- `references/ui-design.md`, `references/dependencies.md`, `references/documentation.md`
- `references/devops.md`, `references/accessibility.md`, `references/seo-webvitals.md`
- `references/tech-debt.md`, `references/data-management.md`

Fichiers de templates :
- `references/report-template.md` — Template complet du rapport d'audit
- `references/github-issues.md` — Templates et processus de création d'issues GitHub

## Scripts disponibles

- `scripts/create_github_issues.py` — Création en masse d'issues GitHub via l'API
- `scripts/run_audit_checks.sh` — Lancement automatisé des outils d'analyse statique
- `scripts/score_calculator.py` — Calcul automatique des scores par domaine
