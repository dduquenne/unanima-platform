# Catalogue des templates documentaires

## Index des templates disponibles

| Template            | Préfixe | Usage                                  | Fichier                      |
|--------------------|---------|----------------------------------------|------------------------------|
| Spec fonctionnelle  | `SPEC`  | Spécification d'une feature            | `spec-fonctionnelle.md`      |
| ADR                 | `ADR`   | Décision d'architecture                | `adr.md`                     |
| Guide technique     | `GUIDE` | Tutorial ou how-to                     | `guide-technique.md`         |
| Runbook             | `RUN`   | Procédure opérationnelle               | `runbook.md`                 |
| Rapport de test     | `RPT`   | Rapport de campagne de test            | `rapport-test.md`            |
| Post-mortem         | `RPT`   | Analyse d'incident                     | `post-mortem.md`             |
| Model Card          | `ML`    | Fiche descriptive d'un modèle ML       | `model-card.md`              |
| Charte documentaire | `META`  | Charte du référentiel                  | `charte-documentaire.md`     |
| README service      | -       | README d'un micro-service              | `readme-service.md`          |
| Changelog           | -       | Historique de versions                 | `changelog.md`               |

---

## Template : Spécification Fonctionnelle

```markdown
---
title: "SPEC — [Nom de la feature]"
id: SPEC-[CAT]-[nom-court]
version: 1.0.0
status: draft
author: 
created: YYYY-MM-DD
updated: YYYY-MM-DD
reviewers: []
tags: []
related: []
---

# [Nom de la feature]

## Résumé exécutif
> En 2-3 phrases, ce que fait cette feature et pourquoi elle existe.

## Contexte et motivation
[Problème à résoudre, besoin utilisateur, contraintes business]

## Objectifs
- [ ] Objectif 1 mesurable
- [ ] Objectif 2 mesurable

## Hors périmètre (Out of scope)
- Ce que cette spec ne couvre PAS intentionnellement

## Utilisateurs concernés
| Persona | Besoin principal |
|---------|-----------------|
|         |                 |

## Spécifications fonctionnelles

### [Fonctionnalité 1]
**Comportement attendu :**
**Règles métier :**
**Cas limites :**

## Maquettes / Flux UX
[Lien vers Figma ou description des écrans]

## Critères d'acceptance
- [ ] Critère 1
- [ ] Critère 2

## Dépendances
- Services : 
- APIs : 
- Feature flags : 

## Questions ouvertes
| Question | Responsable | Échéance | Réponse |
|----------|-------------|----------|---------|
|          |             |          |         |

## Historique des révisions
| Version | Date | Auteur | Changements |
|---------|------|--------|-------------|
| 1.0.0   |      |        | Création    |
```

---

## Template : ADR (Architecture Decision Record)

```markdown
---
title: "ADR-[NNN] — [Titre de la décision]"
id: ADR-[CAT]-[nom-court]
version: 1.0.0
status: draft
author: 
created: YYYY-MM-DD
updated: YYYY-MM-DD
reviewers: []
tags: [architecture, decision]
related: []
---

# ADR-[NNN] : [Titre de la décision]

## Statut
`Proposed` | `Accepted` | `Deprecated` | `Superseded by [ADR-XXX]`

## Contexte
[Situation qui nécessite une décision. Quelles forces sont en jeu ? Quelles contraintes ?]

## Décision
[Ce qui a été décidé. Formulé à l'impératif présent : "Nous utilisons...", "Nous adoptons..."]

## Options considérées

### Option A : [Nom]
**Avantages :** 
**Inconvénients :**

### Option B : [Nom]
**Avantages :** 
**Inconvénients :**

### Option retenue : [Nom]
**Justification :**

## Conséquences

### Positives
- 

### Négatives
- 

### Risques et mitigations
| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
|        |             |        |            |

## Références
- 

## Historique des révisions
| Version | Date | Auteur | Changements |
|---------|------|--------|-------------|
| 1.0.0   |      |        | Création    |
```

---

## Template : Runbook

```markdown
---
title: "RUN — [Nom de la procédure]"
id: RUN-[CAT]-[nom-court]
version: 1.0.0
status: draft
author: 
created: YYYY-MM-DD
updated: YYYY-MM-DD
reviewers: []
tags: [ops, runbook]
related: []
---

# Runbook : [Nom de la procédure]

## Objectif
[Ce que ce runbook permet de faire / quel incident il résout]

## Prérequis
- Accès requis : 
- Outils nécessaires : 
- Durée estimée : 

## Déclencheurs
Utiliser ce runbook quand :
- [ ] Condition 1
- [ ] Condition 2

## Procédure

### Étape 1 : [Nom]
```bash
# Commande à exécuter
```
**Résultat attendu :** 
**Si erreur :** → aller à [section de rollback]

### Étape 2 : [Nom]
...

## Vérification post-procédure
- [ ] Vérification 1
- [ ] Vérification 2

## Rollback
[Procédure pour annuler si quelque chose se passe mal]

## Escalade
Si la procédure échoue : contacter [Équipe] via [Canal] avec [informations à fournir]

## Historique des révisions
| Version | Date | Auteur | Changements |
|---------|------|--------|-------------|
| 1.0.0   |      |        | Création    |
```

---

## Template : Post-mortem

```markdown
---
title: "RPT — Post-mortem [Nom incident]"
id: RPT-OPS-postmortem-[date]-[nom-court]
version: 1.0.0
status: draft
author: 
created: YYYY-MM-DD
updated: YYYY-MM-DD
reviewers: []
tags: [incident, post-mortem, ops]
related: []
---

# Post-mortem : [Nom de l'incident]

> 🔴 Incident du [DATE] — Durée : [X]h[Y]min — Sévérité : P[1-4]

## Résumé exécutif
[2-3 phrases : ce qui s'est passé, impact, resolution]

## Timeline

| Heure | Événement |
|-------|-----------|
| HH:MM | Détection de l'anomalie |
| HH:MM | ... |
| HH:MM | Résolution |

## Impact
- Utilisateurs affectés : 
- Services dégradés : 
- Perte de données : Oui / Non
- Impact financier estimé : 

## Cause racine (Root Cause Analysis)
**Cause immédiate :**
**Cause profonde :**
**Facteurs contributifs :**

## Méthode des 5 Pourquoi
1. Pourquoi [symptôme] ? → Parce que [cause 1]
2. Pourquoi [cause 1] ? → ...

## Ce qui a bien fonctionné
- 

## Ce qui n'a pas fonctionné
- 

## Actions correctives
| Action | Responsable | Priorité | Échéance | Statut |
|--------|-------------|----------|----------|--------|
|        |             |          |          | TODO   |

## Historique des révisions
| Version | Date | Auteur | Changements |
|---------|------|--------|-------------|
| 1.0.0   |      |        | Création    |
```
