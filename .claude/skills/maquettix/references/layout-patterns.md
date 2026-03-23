# Patterns de Layout — Maquettix Reference

## T01 — App Shell Full (Base universelle)

Structure fondamentale de toute application métier. Sidebar fixe gauche + Header top + Zone contenu principale.

### Structure SVG
```
┌─────────────────────────────────────┐
│           HEADER (64px)             │
├──────────┬──────────────────────────┤
│          │                          │
│ SIDEBAR  │    CONTENT AREA          │
│ (240px)  │    (flex-grow)           │
│          │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

### Sidebar — Éléments clés
- Logo + nom app (en haut, 64px height)
- Navigation principale : icône + label, groupes avec séparateurs
- Item actif : fond accent avec barre gauche 3px
- Avatar utilisateur + rôle (en bas)
- Version collapse possible (icônes seules, 64px wide)

### Header — Éléments clés
- Breadcrumb ou titre de page (gauche)
- Barre de recherche globale (centre, optionnel)
- Actions contextuelles (droite) : notifications, aide, profil

### Variations thème
- **Clair** : Sidebar #F8FAFC, Header white, Content #F1F5F9
- **Sombre** : Sidebar #0F172A, Header #1E293B, Content #0F172A
- **Accent** : Sidebar couleur brand (#0EA5E9), texte blanc

---

## T02 — Dashboard Analytics

Vue synthèse avec métriques clés, graphiques et alertes.

### Structure
```
┌─────────────────────────────────────┐
│ PAGE TITLE + DATE RANGE PICKER      │
├──────┬──────┬──────┬────────────────┤
│ KPI  │ KPI  │ KPI  │ KPI            │  ← Row 1 : 4 cards
├──────┴──────┴──────┴────────────────┤
│ CHART PRINCIPAL (60%)│ CHART SEC    │  ← Row 2 : 2 cols
│ (line chart, bars)   │ (donut/pie)  │
├─────────────────────────────────────┤
│ TABLE RÉSUMÉ (top N items)          │  ← Row 3 : table
└─────────────────────────────────────┘
```

### KPI Card — Contenu type
- Icône (24px, couleur thématique)
- Label métrique (12px, slate-500)
- Valeur principale (28-32px, bold)
- Variation vs période précédente (11px, vert/rouge avec flèche)
- Sparkline optionnel (mini graphique 60x30px)

### Graphiques SVG simplifiés
Pour les maquettes, représenter les graphiques comme :
- **Line chart** : polyline + axes + quelques labels
- **Bar chart** : rects + axes + labels
- **Donut** : cercles SVG avec stroke-dasharray
- **Table** : grille simple avec données représentatives

---

## T03 — Data Grid Pro

Tableau de données professionnel avec filtres, tri et actions.

### Structure
```
┌─────────────────────────────────────┐
│ TITRE + [+ Nouveau] [Export]        │
├─────────────────────────────────────┤
│ 🔍 Recherche │ Filtres ▼ │ Colonnes │
├─────────────────────────────────────┤
│ ☐ │ Col1 ↕ │ Col2 ↕ │ Col3 │Actions│  ← Header
├─────────────────────────────────────┤
│ ☑ │ Valeur  │ Valeur  │ Badge│ ⋮   │  ← Row (selected)
│ ☐ │ Valeur  │ Valeur  │ Badge│ ⋮   │
│ ☐ │ Valeur  │ Valeur  │ Badge│ ⋮   │
│ ☐ │ Valeur  │ Valeur  │ Badge│ ⋮   │
├─────────────────────────────────────┤
│ 1-10 sur 247 │ ← 1 2 3 ... 25 →   │  ← Pagination
└─────────────────────────────────────┘
```

### Colonnes types
- **Texte** : aligné gauche, tronqué avec tooltip
- **Numérique** : aligné droite, formaté (séparateur milliers)
- **Date** : format relatif ("il y a 2h") ou absolu
- **Badge statut** : pill coloré (voir composants)
- **Actions** : kebab menu (⋮) ou boutons inline si < 3 actions

### États de ligne
- Normal : fond white
- Hover : fond slate-50
- Sélectionnée : fond sky-50 + bordure gauche sky-400

---

## T04 — Form Wizard

Formulaire multi-étapes pour saisies complexes.

### Structure
```
┌─────────────────────────────────────┐
│ STEPPER : ●─────○─────○─────○      │
│         Infos  Détails Config Valid  │
├─────────────────────────────────────┤
│                                     │
│  TITRE ÉTAPE                        │
│  Description courte de l'étape      │
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │ Label       │  │ Label       │  │
│  │ [Input    ] │  │ [Input    ] │  │
│  └─────────────┘  └─────────────┘  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Label textarea              │   │
│  │ [                         ] │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│         [Annuler]   [Suivant →]    │
└─────────────────────────────────────┘
```

### Stepper — États
- **Complété** : cercle rempli + check, ligne connectrice colorée
- **Actif** : cercle accent + numéro, label bold
- **À venir** : cercle vide gris + label normal

### Validation inline
- Label rouge + icône ⚠ sous le champ en erreur
- Champ avec bordure rouge `stroke="#EF4444"`
- Message d'aide en vert sous champ valide (optionnel)

---

## T05 — Master-Detail

Navigation list à gauche, détail à droite.

### Structure
```
┌─────────────────────────────────────┐
│ TITRE + [+ Nouveau]                 │
├────────────┬────────────────────────┤
│ 🔍 Filtre  │  Nom de l'entité      │
├────────────┤  Sous-titre / statut   │
│ > Item 1   ├────────────────────────┤
│   Item 2   │  Section 1             │
│   Item 3   │  ───────────────────── │
│ > Item 4 ◀ │  Champ : Valeur        │
│   Item 5   │  Champ : Valeur        │
│            ├────────────────────────┤
│            │  Section 2             │
│            │  ...                   │
└────────────┴────────────────────────┘
```

### Ratios typiques
- Liste : 30% largeur (min 280px)
- Détail : 70% largeur

---

## T06 — Fiche Entité

Vue complète d'un objet métier avec onglets thématiques.

### Structure
```
┌─────────────────────────────────────┐
│ ← Retour │ Nom Entité   [Modifier] │
│           Statut: ● Actif          │
├─────────────────────────────────────┤
│ Infos générales │ Historique │ Docs │  ← Onglets
├─────────────────────────────────────┤
│ ┌────────────┐  ┌──────────────────┐│
│ │ Section    │  │ Section latérale ││
│ │ principale │  │ (actions,        ││
│ │            │  │  métadonnées,    ││
│ │            │  │  liens)          ││
│ └────────────┘  └──────────────────┘│
└─────────────────────────────────────┘
```

---

## T07 — Modal / Drawer

### Modal de confirmation
```
┌─────────────────────────┐
│ ✕   Titre action        │
├─────────────────────────┤
│                         │
│  Texte explicatif de    │
│  la conséquence de      │
│  l'action.              │
│                         │
├─────────────────────────┤
│     [Annuler] [Confirmer]│
└─────────────────────────┘
```
Largeur : 400-480px, centré, backdrop semi-transparent

### Drawer latéral (édition rapide)
- Glisse depuis la droite
- Largeur 480-560px
- Header avec titre + fermeture
- Formulaire scrollable
- Footer sticky avec actions

---

## T08 — Settings Panel

Configuration structurée par catégories.

### Structure
```
┌─────────────────────────────────────┐
│ Paramètres                          │
├────────────┬────────────────────────┤
│ Général    │  Section active        │
│ Sécurité   │  ─────────────────     │
│ Notifs     │  Option 1              │
│ Intégrats  │  [Toggle] Description  │
│ Avancé     │                        │
│            │  Option 2              │
│            │  [Select ▼] Label      │
│            ├────────────────────────┤
│            │         [Enregistrer]  │
└────────────┴────────────────────────┘
```
