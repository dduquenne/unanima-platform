---
name: projetix
description: >
  Spécialiste en rédaction de documents de projet informatique métier : notes de cadrage (analyse des besoins pour proposition commerciale) et spécifications fonctionnelles (User Stories, cas d'utilisation). Utilise ce skill dès qu'une demande touche à la rédaction ou structuration d'une note de cadrage, d'un cahier des charges, de spécifications fonctionnelles, de User Stories, d'épics, de scénarios d'utilisation, de critères d'acceptation (BDD/Gherkin), ou de tout document structurant un projet applicatif métier. Déclenche également si l'utilisateur mentionne "analyse des besoins", "proposition commerciale", "note de cadrage", "spec fonctionnelle", "US", "user story", "use case", "MoSCoW", "MVP", "périmètre fonctionnel", "spécification", "spécifier", "spécifications" ou "cahier des charges". Ce skill s'applique aussi lors de l'analyse d'un brief client, d'un atelier de recueil des besoins, ou de la rédaction d'une roadmap produit.
compatibility:
  recommends:
    - ergonomix       # Pour enrichir les specs avec les contraintes UX et les patterns d'interface métier
    - maquettix # Pour illustrer les User Stories avec des maquettes SVG d'écrans
    - recettix        # Pour générer les critères d'acceptation et le plan de recette dès la phase de spécification
    - documentalix    # Pour intégrer les livrables dans le référentiel documentaire du projet
    - rgpdix          # Pour intégrer les exigences RGPD dans les spécifications fonctionnelles
    - pilotix         # Pour décomposer les specs en sous-tâches séquencées et orchestrer l'implémentation
    - datanalytix     # Pour spécifier les besoins en données analytiques, KPIs et dashboards
---

# Skill : Projetix

Spécialiste en rédaction de documents de projet informatique d'applications métier.
Maîtrise deux grands livrables complémentaires :

1. **La note de cadrage** — analyse des besoins en vue d'une proposition commerciale
2. **Les spécifications fonctionnelles** — basées sur des User Stories structurées

---

## Conventions de performance

Ce skill applique les conventions de `_common/performance-workflow.md` :
- **Feedback continu** : afficher un message avant chaque phase de travail
- **Génération incrémentale** : structure d'abord, puis contenu section par section
- **Lecture conditionnelle** : ne lire que les références nécessaires à la demande
- **Cadrage du scope** : clarifier le périmètre avant de commencer
- **Parallélisation** : utiliser des sous-agents pour les SFD multi-Epics

---

## Étape 0 — Cadrage rapide (TOUJOURS faire cette étape)

Avant toute génération, clarifier avec l'utilisateur en UNE question :

```
Avant de commencer, quelques précisions rapides :
1. **Type de livrable** : note de cadrage ou spécifications fonctionnelles (SFD) ?
2. **Scope** : document complet, ou une section/un Epic spécifique ?
3. **Format** : Markdown inline, fichier .md, ou .docx ?
4. **Inputs disponibles** : brief client, entretien, documents existants ?
```

Si l'utilisateur demande un document complet (SFD ou note de cadrage), annoncer
l'approche incrémentale :

```
Je vais procéder en passes successives :
1. D'abord la structure (plan / arborescence Epics-Features) pour validation
2. Puis le contenu détaillé, section par section
3. Enfin l'assemblage du document final
Cela permet de corriger la direction à chaque étape sans tout régénérer.
```

---

## Étape 1 — Lecture conditionnelle des références

Ne pas lire systématiquement les 4 fichiers de référence. Appliquer cette grille :

| Demande | Fichiers à lire | Fichiers à NE PAS lire |
|---------|----------------|----------------------|
| Une seule User Story | Aucun (templates ci-dessous suffisent) | Tous |
| SFD complète | `references/user-stories.md` | `note-cadrage.md`, `glossaire-methodes.md` |
| Note de cadrage | `references/note-cadrage.md` | `user-stories.md`, `glossaire-methodes.md` |
| Story mapping | `references/story-mapping.md` | Les autres |
| Question sur une méthode | `references/glossaire-methodes.md` | Les autres |

Les templates essentiels sont intégrés ci-dessous (section 3 et 4) pour éviter
des lectures systématiques.

---

## 2. Philosophie générale

Un bon document de spécification est un **outil de dialogue**, pas un monument juridique. Il doit :
- Être **compréhensible** par toutes les parties (métier, développeurs, direction)
- Être **testable** : chaque exigence doit pouvoir être vérifiée
- Être **évolutif** : pensé pour être maintenu dans le temps
- Réduire l'**ambiguïté** au minimum via des exemples concrets et des critères clairs
- Refléter la **valeur métier** à chaque niveau de granularité

---

## 3. Note de cadrage — Template intégré

La note de cadrage transforme une expression de besoin brut en une vision structurée
qui fonde la proposition commerciale.

### Structure CADRE

```
C — Contexte & enjeux métier
A — Acteurs & parties prenantes
D — Domaine fonctionnel & périmètre (avec MoSCoW)
R — Risques & contraintes identifiés
E — Estimation de valeur & orientations techniques
```

### Workflow de génération (par passes)

```
[Phase 1/3] — Structure et périmètre
  Afficher le plan CADRE avec les grandes lignes de chaque section.
  → Attendre validation de l'utilisateur.

[Phase 2/3] — Rédaction section par section
  Pour chaque section C, A, D, R, E :
    Afficher "Rédaction de la section [X]..." puis générer le contenu.
    Afficher le résultat de la section immédiatement.

[Phase 3/3] — Assemblage et écriture
  Compiler le document final et l'écrire dans le fichier cible.
```

### Techniques d'analyse des besoins

**5 Why** — Questionner la racine du besoin avant de spécifier :
> "L'utilisateur veut exporter en Excel." → Pourquoi ? → Solution réelle : un export avec les bons champs.

**Jobs-to-be-Done** — Formuler chaque besoin comme : *"Quand [situation], je veux [action], pour [résultat]."*

**MoSCoW** — Must Have (MVP) / Should Have / Could Have / Won't Have (hors périmètre)

Pour des détails approfondis sur la structure CADRE, consulter `references/note-cadrage.md`.

---

## 4. Spécifications fonctionnelles — Templates intégrés

### Architecture en 3 niveaux

```
EPIC (thème fonctionnel majeur)
  └── FEATURE (fonctionnalité cohérente)
        └── USER STORY (unité de valeur livrable)
              └── CRITÈRES D'ACCEPTATION (BDD/Gherkin)
```

### Template Epic

```
EPIC-[ID] | [NOM COURT EN MAJUSCULES]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Description : [Ce que cet ensemble de fonctionnalités permet d'accomplir]
Valeur métier : [Bénéfice global]
Indicateur de succès : [Comment mesurer le succès]
User Stories : [US-01, US-02, US-03...]
Lot / Release : [MVP / V2 / V3]
```

### Template User Story

```
US-[ID] | [TITRE COURT]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que [PERSONA/RÔLE],
Je veux [ACTION/CAPACITÉ],
Afin de [BÉNÉFICE MÉTIER / VALEUR].
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : [Must/Should/Could]
Estimation : [points ou taille T-shirt]
Epic : [NOM_EPIC]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITÈRES D'ACCEPTATION (BDD/Gherkin)

Scénario 1 : [NOM DU SCÉNARIO NOMINAL]
  ÉTANT DONNÉ [contexte initial]
  QUAND [action déclenchante]
  ALORS [résultat attendu vérifiable]

Scénario 2 : [CAS ALTERNATIF]
  ÉTANT DONNÉ [...]
  QUAND [...]
  ALORS [...]

Scénario 3 : [CAS D'ERREUR / LIMITE]
  ÉTANT DONNÉ [...]
  QUAND [...]
  ALORS [...]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES MÉTIER
  - RG-[ID] : [Description de la règle]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉPENDANCES
  - Dépend de : [US-XX]  |  Bloque : [US-YY]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEFINITION OF DONE (DoD)
  □ Code développé et revu
  □ Tests unitaires écrits et passants
  □ Critères d'acceptation validés
  □ Documentation mise à jour
  □ Validé par le PO/client
```

### Règles INVEST

Chaque US doit être : **I**ndépendante, **N**égociable, **V**aluable, **E**stimable, **S**mall (≤ 5j), **T**estable.

Pour des détails approfondis sur les User Stories, consulter `references/user-stories.md`.

---

## 5. Workflow de génération — SFD complète (document long)

Ce workflow s'applique dès que le livrable dépasse une poignée de User Stories.
L'objectif est d'éliminer les périodes silencieuses et de permettre des corrections
précoces.

### Passe 1 — Structure (rapide, ~30 secondes)

Afficher :
```
[Phase 1/3] — Génération de la structure Epics/Features
```

Puis générer et afficher UNIQUEMENT l'arborescence :

```
EPIC-01 | AUTHENTIFICATION ET GESTION DES ACCÈS
  ├── FEAT-01.1 | Inscription et connexion (3 US)
  └── FEAT-01.2 | Gestion des rôles et permissions (2 US)

EPIC-02 | GESTION DES BÉNÉFICIAIRES
  ├── FEAT-02.1 | Création et modification de fiche (4 US)
  └── FEAT-02.2 | Recherche et filtrage (2 US)
...
```

Demander validation : *"Cette structure vous convient-elle ? Je peux ajuster avant
de détailler les User Stories."*

### Passe 2 — Contenu détaillé (Epic par Epic)

**Pour les SFD avec 3+ Epics**, utiliser des sous-agents parallèles :

```
[Phase 2/3] — Génération du contenu détaillé
  Lancement de la rédaction des Epics en parallèle...
```

Lancer un sous-agent par Epic via l'outil Agent, en fournissant à chacun :
- Le nom et la description de l'Epic
- La liste des Features et US à détailler
- Le template User Story (ci-dessus)
- Les conventions de nommage (IDs séquentiels)
- Le contexte métier minimal nécessaire

Chaque sous-agent génère ses US et renvoie le résultat.

**Pour les SFD avec 1-2 Epics**, générer séquentiellement en affichant la progression :

```
  Epic 1 : Authentification (3 US)... en cours
  Epic 1 : Authentification (3 US)... terminé
  Epic 2 : Gestion des bénéficiaires (5 US)... en cours
```

### Passe 3 — Assemblage

```
[Phase 3/3] — Assemblage du document final
  Compilation dans [chemin/du/fichier.md]...
```

Assembler les résultats de tous les sous-agents (ou des générations séquentielles)
dans le fichier cible. Ajouter le frontmatter documentalix si applicable.

---

## 6. Posture et ton des documents

- **Note de cadrage** : ton professionnel, orienté valeur client, accessible aux décideurs non-techniques
- **Spécifications fonctionnelles** : précis, non ambigu, factuel — chaque phrase a une seule interprétation
- **Toujours** : reprendre le vocabulaire du client, illustrer avec des exemples de son contexte

---

## 7. Formats de sortie

| Livrable | Format conseillé | Référence (si besoin) |
|---|---|---|
| Note de cadrage | `.docx` ou `.md` | `references/note-cadrage.md` |
| Backlog User Stories | `.md` structuré ou `.docx` | `references/user-stories.md` |
| Fiche US unique | Bloc Markdown inline | Templates section 4 |
| Story Map visuelle | Tableau Markdown | `references/story-mapping.md` |
| Glossaire métier | Table Markdown | Inline |

Pour la génération de fichiers `.docx`, consulter le skill `docx` avant de produire le fichier.

---

## Références complémentaires (lecture conditionnelle)

Ces fichiers ne sont à lire que si la demande le justifie (cf. grille de l'étape 1) :

- `references/note-cadrage.md` — Structure CADRE détaillée, exemples de formulation, questions clés
- `references/user-stories.md` — Guide approfondi Epics, Features, US, critères BDD
- `references/story-mapping.md` — Technique de Story Mapping (Jeff Patton)
- `references/glossaire-methodes.md` — Définitions Agile, SAFe, Shape Up, BDD, Scrum, Kanban
