---
name: projetix
description: >
  Spécialiste en rédaction de documents de projet informatique métier : notes de cadrage (analyse des besoins pour proposition commerciale) et spécifications fonctionnelles (User Stories, cas d'utilisation). Utilise ce skill dès qu'une demande touche à la rédaction ou structuration d'une note de cadrage, d'un cahier des charges, de spécifications fonctionnelles, de User Stories, d'épics, de scénarios d'utilisation, de critères d'acceptation (BDD/Gherkin), ou de tout document structurant un projet applicatif métier. Déclenche également si l'utilisateur mentionne "analyse des besoins", "proposition commerciale", "note de cadrage", "spec fonctionnelle", "US", "user story", "use case", "MoSCoW", "MVP", "périmètre fonctionnel", "spécification", "spécifier", "spécifications" ou "cahier des charges". Ce skill s'applique aussi lors de l'analyse d'un brief client, d'un atelier de recueil des besoins, ou de la rédaction d'une roadmap produit.
compatibility:
  recommends:
    - ergonomix       # Pour enrichir les specs avec les contraintes UX et les patterns d'interface métier
    - maquettix-final # Pour illustrer les User Stories avec des maquettes SVG d'écrans
    - recettix        # Pour générer les critères d'acceptation et le plan de recette dès la phase de spécification
    - documentalix    # Pour intégrer les livrables dans le référentiel documentaire du projet
    - rgpdix          # Pour intégrer les exigences RGPD dans les spécifications fonctionnelles
---

# Skill : Projetix

Spécialiste en rédaction de documents de projet informatique d'applications métier.  
Maîtrise deux grands livrables complémentaires :

1. **La note de cadrage** — analyse des besoins en vue d'une proposition commerciale
2. **Les spécifications fonctionnelles** — basées sur des User Stories structurées

---

## Philosophie générale

Un bon document de spécification est un **outil de dialogue**, pas un monument juridique. Il doit :
- Être **compréhensible** par toutes les parties (métier, développeurs, direction)
- Être **testable** : chaque exigence doit pouvoir être vérifiée
- Être **évolutif** : pensé pour être maintenu dans le temps
- Réduire l'**ambiguïté** au minimum via des exemples concrets et des critères clairs
- Refléter la **valeur métier** à chaque niveau de granularité

---

## 1. Note de cadrage — Analyse des besoins (pré-vente)

La note de cadrage est le premier livrable stratégique. Elle transforme une expression de besoin brut en une vision structurée qui fonde la proposition commerciale.

### Quand la produire

- Après un premier entretien client ou réception d'un brief
- Avant la rédaction d'un devis ou d'une proposition commerciale
- Pour aligner toutes les parties sur la compréhension du projet

### Structure recommandée (CADRE)

```
C — Contexte & enjeux métier
A — Acteurs & parties prenantes
D — Domaine fonctionnel & périmètre
R — Risques & contraintes identifiés
E — Estimation de valeur & orientations techniques
```

Pour chaque section, consulte le fichier de référence : `references/note-cadrage.md`

### Techniques d'analyse des besoins à appliquer

**1. Le modèle des 5 Why (pourquoi récursif)**
Avant de spécifier quoi que ce soit, questionne la racine du besoin :
> "L'utilisateur veut exporter en Excel." → Pourquoi ? → "Pour le donner au comptable." → Pourquoi pas un rapport PDF ? → "La comptable retraite les données." → Solution réelle : un export avec les bons champs, pas forcément Excel.

**2. Jobs-to-be-Done (JTBD)**
Formule chaque besoin comme un job : *"Quand [situation], je veux [action], pour [résultat attendu]."*
Cela évite de spécifier des features inutiles.

**3. Matrice des parties prenantes**
Identifie pour chaque acteur : son rôle, ses attentes, ses contraintes, son niveau d'implication.

**4. MoSCoW priorisé**
- **Must Have** : indispensable au lancement (MVP)
- **Should Have** : important mais pas bloquant
- **Could Have** : valeur ajoutée si temps/budget
- **Won't Have** : explicitement hors périmètre (réduit le scope creep)

**5. Persona utilisateur**
Crée 1 à 3 personas représentatifs pour ancrer les besoins dans la réalité d'usage.

---

## 2. Spécifications fonctionnelles — User Stories

Les spécifications sont la traduction contractuelle des besoins en langage compréhensible par les développeurs ET les métiers.

### Architecture des spécifications (3 niveaux)

```
EPIC (thème fonctionnel majeur)
  └── FEATURE (fonctionnalité cohérente)
        └── USER STORY (unité de valeur livrable)
              └── CRITÈRES D'ACCEPTATION (vérifiables)
```

Pour le détail de chaque niveau, consulte : `references/user-stories.md`

### Format d'une User Story (standard)

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

Scénario 2 : [NOM DU SCÉNARIO ALTERNATIF]
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
MAQUETTES / RÉFÉRENCES
  - [Lien ou description de la maquette]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉPENDANCES
  - Dépend de : [US-XX]
  - Bloque : [US-YY]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEFINITION OF DONE (DoD)
  □ Code développé et revu
  □ Tests unitaires écrits et passants
  □ Critères d'acceptation validés
  □ Documentation mise à jour
  □ Validé par le PO/client
```

### Règles d'or pour les User Stories de qualité

**INVEST** — Chaque US doit être :
- **I**ndépendante : livrable seule si possible
- **N**égociable : le comment est à définir ensemble
- **V**aluable : apporte une valeur métier réelle
- **E**stimable : l'équipe peut l'évaluer
- **S**mall : réalisable en un sprint (≤ 5j)
- **T**estable : les critères d'acceptation sont vérifiables

**Pièges à éviter :**
- US formulée en termes techniques ("stocker en base de données...")
- US sans bénéfice métier explicite ("afin de..." vide)
- US trop large (= Epic non découpé)
- Critères d'acceptation vagues ("le système doit être rapide")
- Oublier les cas d'erreur et les cas limites

---

## 3. Workflow de rédaction recommandé

### Phase 1 — Découverte (avec ou sans brief)
1. Analyser les inputs disponibles (brief, entretien, documents existants)
2. Identifier les acteurs et leurs jobs-to-be-done
3. Cartographier le domaine fonctionnel (story mapping)
4. Lister les hypothèses et risques

### Phase 2 — Cadrage
1. Rédiger la note de cadrage (structure CADRE)
2. Valider la priorisation MoSCoW avec le client
3. Définir le MVP et les lots successifs
4. Estimer la volumétrie fonctionnelle

### Phase 3 — Spécifications
1. Définir les Epics et Features (arborescence)
2. Rédiger les User Stories du MVP en priorité
3. Ajouter les critères d'acceptation en BDD/Gherkin
4. Identifier les règles métier et les dépendances
5. Compléter la DoD et les liens maquettes

### Phase 4 — Révision et livraison
1. Vérifier la complétude (INVEST check)
2. Relecture orientée "développeur" (ambiguïtés ?)
3. Relecture orientée "recette" (testabilité ?)
4. Livraison au format adapté (Markdown, Word, Jira, Notion...)

---

## 4. Formats de sortie disponibles

Selon le besoin exprimé, produis :

| Livrable | Format conseillé | Référence |
|---|---|---|
| Note de cadrage | `.docx` ou `.md` | `references/note-cadrage.md` |
| Backlog User Stories | `.md` structuré ou `.docx` | `references/user-stories.md` |
| Fiche US unique | Bloc Markdown inline | Format section 2 ci-dessus |
| Story Map visuelle | Tableau Markdown | `references/story-mapping.md` |
| Glossaire métier | Table Markdown | Inline |

Pour la génération de fichiers `.docx`, consulte le skill `docx` avant de produire le fichier.

---

## 5. Posture et ton des documents

- **Note de cadrage** : ton professionnel, orienté valeur client, accessible aux décideurs non-techniques. Éviter le jargon technique.
- **Spécifications fonctionnelles** : précis, non ambigu, factuel. Chaque phrase doit avoir une seule interprétation possible.
- **Toujours** : utiliser le vocabulaire du client (reprendre ses termes), illustrer avec des exemples concrets tirés de son contexte.

---

## Références complémentaires

- `references/note-cadrage.md` — Structure détaillée et modèle complet d'une note de cadrage
- `references/user-stories.md` — Guide approfondi User Stories, Epics, Features, BDD
- `references/story-mapping.md` — Technique de User Story Mapping (Jeff Patton)
- `references/glossaire-methodes.md` — Définitions des méthodes (Agile, SAFe, Shape Up...)
