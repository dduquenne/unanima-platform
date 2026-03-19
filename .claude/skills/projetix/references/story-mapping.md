# User Story Mapping — Référence

## Concept (Jeff Patton)

Le Story Mapping est une technique de visualisation qui organise les User Stories en **2 dimensions** :
- **Axe horizontal** : le parcours utilisateur (chronologique, de gauche à droite)
- **Axe vertical** : la profondeur de détail (du plus important en haut, au plus optionnel en bas)

Cela crée une **carte visuelle** du produit qui permet de :
- Comprendre l'ensemble du système d'un coup d'œil
- Définir des releases cohérentes (coupes horizontales)
- Éviter les "orphelines" (US sans contexte)

---

## Structure d'une Story Map

```
ACTIVITÉS (niveau 1 — blocs majeurs du parcours)
  ┌─────────────┬─────────────┬─────────────┬─────────────┐
  │  S'inscrire │  Se connecter│ Gérer profil│  Utiliser app│
  └─────────────┴─────────────┴─────────────┴─────────────┘

TÂCHES (niveau 2 — étapes clés dans chaque activité)
  ┌──────┬──────┐  ┌──────┬──────┐  ┌──────────────────┐
  │Saisir│Valider│  │Email │OAuth │  │Modifier│Supprimer│
  │email │email  │  │/MDP  │Goog. │  │profil  │compte   │
  └──────┴──────┘  └──────┴──────┘  └──────────────────┘

USER STORIES (niveau 3+ — détail par release)
  ══════════════════════════════════════ MVP / Release 1 ══
  [US-01]    [US-02]         [US-06]    [US-08]  [US-09]
  ══════════════════════════════════════ Release 2 ═══════
  [US-03]    [US-07]         [US-10]
  ══════════════════════════════════════ Release 3 ═══════
  [US-04]    [US-05]
```

---

## Représentation en Markdown

```markdown
## Story Map — [NOM DU PROJET]

| Activité → | 🔐 Accès | 📋 Tableau de bord | 📦 Commandes | 📊 Reporting |
|------------|---------|-------------------|-------------|-------------|
| **Tâches** | Connexion / Inscription | Visualisation KPIs | Créer / Modifier / Annuler | Générer / Exporter |
| **MVP** | US-01 Connexion email | US-10 Vue résumé | US-20 Créer commande | — |
| **V1.1** | US-02 SSO entreprise | US-11 Filtres KPIs | US-21 Modifier commande | US-30 Export CSV |
| **V2** | US-03 2FA | US-12 Dashboard custom | US-22 Commande récurrente | US-31 Rapport PDF |
```

---

## Atelier Story Mapping — Guide de facilitation

### Durée recommandée : 2 à 4 heures

### Participants
- Product Owner / Chef de projet
- 1-2 représentants métier (utilisateurs finaux)
- 1 développeur senior (optionnel mais recommandé)

### Déroulé

**Étape 1 : Le fil narratif (30 min)**
> "Racontez-moi une journée type de [persona principal] avec le futur système."
Coller des post-its horizontaux pour chaque grande étape du parcours.

**Étape 2 : Les tâches (30 min)**
Pour chaque grande étape, détailler les sous-tâches. Disposer verticalement sous chaque étape.

**Étape 3 : Les User Stories (60 min)**
Pour chaque tâche, écrire les US correspondantes sur des post-its de couleur différente.

**Étape 4 : La découpe en releases (30 min)**
Tirer des lignes horizontales pour définir les releases. La première ligne = MVP minimum viable.

**Étape 5 : Validation (30 min)**
Vérifier avec le client : "Avec uniquement la ligne MVP, le système a-t-il une valeur pour vous ?"

---

## Formats de sortie Story Map

La story map peut être livrée sous forme :
- **Markdown table** (rapide, versionnable, dans la doc)
- **Miro / FigJam** (collaboratif, visuel, pour les ateliers)
- **Notion database** (avec propriétés Epic/Feature/Priority)
- **Jira / Linear roadmap** (si outil de gestion de projet déjà en place)
