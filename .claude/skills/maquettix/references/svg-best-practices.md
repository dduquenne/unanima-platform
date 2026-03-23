# SVG Best Practices — Maquettix Reference

## Structure d'un fichier SVG maquette

### Template de base obligatoire

```svg
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 1440 900"
     width="1440" height="900"
     font-family="Inter, system-ui, -apple-system, sans-serif">

  <!-- ═══════════════════════════════════════
       MAQUETTE : [NOM DE L'ÉCRAN]
       Module   : [MODULE MÉTIER]
       Version  : v1.0
       Auteur   : Maquettix / UNANIMA
  ══════════════════════════════════════════ -->

  <defs>
    <!-- Ombres portées -->
    <filter id="shadow-sm" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" flood-opacity="0.08"/>
    </filter>
    <filter id="shadow-md" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.10"/>
    </filter>
    <filter id="shadow-lg" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.12"/>
    </filter>

    <!-- Gradients -->
    <linearGradient id="accent-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0EA5E9"/>
      <stop offset="100%" stop-color="#6366F1"/>
    </linearGradient>
    <linearGradient id="sidebar-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>

    <!-- Fond grille subtil (optionnel, pour zones contenu) -->
    <pattern id="grid-subtle" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#F1F5F9" stroke-width="0.5"/>
    </pattern>
  </defs>

  <!-- ── BACKGROUND ─────────────────────── -->
  <rect width="1440" height="900" fill="#F1F5F9"/>

  <!-- ── SHELL : Sidebar ────────────────── -->
  <g id="sidebar">
    <!-- ... -->
  </g>

  <!-- ── SHELL : Header ─────────────────── -->
  <g id="header">
    <!-- ... -->
  </g>

  <!-- ── CONTENT ────────────────────────── -->
  <g id="content">
    <!-- ... -->
  </g>

</svg>
```

---

## Conventions de Nommage SVG

### IDs de groupes (toujours en kebab-case)
```
#shell              → Enveloppe complète de l'app
#sidebar            → Navigation latérale
#sidebar-logo       → Zone logo en haut de sidebar
#sidebar-nav        → Liste des items de navigation
#sidebar-nav-item-{n} → Item n de la navigation
#sidebar-footer     → Bas de sidebar (user info)
#header             → Barre supérieure
#header-breadcrumb  → Fil d'ariane
#header-actions     → Boutons d'action à droite
#content            → Zone principale
#content-toolbar    → Barre d'outils de la zone contenu
#content-body       → Corps du contenu
#modal-overlay      → Fond semi-transparent de modal
#modal              → Fenêtre modale
#drawer             → Panneau latéral
```

---

## Icônes Vectorielles (style Lucide)

Toutes les icônes en 20×20px, stroke-width="1.5", no fill, couleur héritée :

### Icônes fréquentes — paths SVG

```svg
<!-- Home -->
<g transform="translate(0,0)">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round"/>
  <polyline points="9 22 9 12 15 12 15 22"
            fill="none" stroke="currentColor" stroke-width="1.5"/>
</g>

<!-- Search -->
<g>
  <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="21" y1="21" x2="16.65" y2="16.65"
        stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</g>

<!-- Bell (notifications) -->
<g>
  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M13.73 21a2 2 0 0 1-3.46 0"
        fill="none" stroke="currentColor" stroke-width="1.5"/>
</g>

<!-- Settings (Cog) -->
<g>
  <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        fill="none" stroke="currentColor" stroke-width="1.5"/>
</g>

<!-- Users -->
<g>
  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <path d="M23 21v-2a4 4 0 0 0-3-3.87"
        fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M16 3.13a4 4 0 0 1 0 7.75"
        fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</g>

<!-- ChevronRight -->
<polyline points="9 18 15 12 9 6"
          fill="none" stroke="currentColor" stroke-width="1.5"
          stroke-linecap="round" stroke-linejoin="round"/>

<!-- Plus -->
<g>
  <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</g>

<!-- MoreVertical (kebab) -->
<g>
  <circle cx="12" cy="5" r="1" fill="currentColor"/>
  <circle cx="12" cy="12" r="1" fill="currentColor"/>
  <circle cx="12" cy="19" r="1" fill="currentColor"/>
</g>

<!-- Check -->
<polyline points="20 6 9 17 4 12"
          fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>

<!-- X (close) -->
<g>
  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</g>

<!-- AlertTriangle -->
<g>
  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        fill="none" stroke="currentColor" stroke-width="1.5"/>
  <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</g>
```

---

## Palette de Couleurs

### Tokens sémantiques

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-bg-base` | #F1F5F9 | Fond de page |
| `--color-bg-surface` | #FFFFFF | Cartes, panneaux |
| `--color-bg-subtle` | #F8FAFC | Zones secondaires |
| `--color-bg-sidebar` | #0F172A | Sidebar sombre |
| `--color-text-primary` | #0F172A | Texte principal |
| `--color-text-secondary` | #475569 | Texte secondaire |
| `--color-text-muted` | #94A3B8 | Labels, placeholders |
| `--color-text-inverse` | #FFFFFF | Texte sur fond sombre |
| `--color-border` | #E2E8F0 | Bordures subtiles |
| `--color-border-strong` | #CBD5E1 | Bordures inputs |
| `--color-accent` | #0EA5E9 | Couleur principale action |
| `--color-accent-hover` | #0284C7 | Hover sur accent |
| `--color-success` | #16A34A | Succès, états actifs |
| `--color-success-bg` | #DCFCE7 | Fond badge succès |
| `--color-warning` | #D97706 | Avertissements |
| `--color-warning-bg` | #FEF3C7 | Fond badge warning |
| `--color-error` | #DC2626 | Erreurs |
| `--color-error-bg` | #FEE2E2 | Fond badge erreur |
| `--color-info` | #2563EB | Information |
| `--color-info-bg` | #DBEAFE | Fond badge info |

---

## Typographie — Tailles et Poids

| Rôle | Taille | Poids | Couleur défaut |
|------|--------|-------|----------------|
| Page title | 22px | 700 | #0F172A |
| Section title | 16px | 600 | #0F172A |
| Card title | 14px | 600 | #0F172A |
| Body | 14px | 400 | #0F172A |
| Body small | 13px | 400 | #475569 |
| Label | 12px | 500 | #475569 |
| Caption / meta | 11px | 400 | #94A3B8 |
| Données / mono | 13px | 400 | #0F172A (JetBrains Mono) |
| KPI valeur | 28-32px | 700 | #0F172A |

---

## Anti-patterns à éviter

### ❌ Ne JAMAIS faire
- Utiliser `font-family="Arial"` ou fonts génériques
- Mettre du texte blanc sur fond gris clair (contraste insuffisant)
- Empiler plus de 4 niveaux de `<g>` sans ID
- Utiliser des coordonnées non alignées sur la grille 8px
- Mettre du lorem ipsum au lieu de données métier représentatives
- Créer des composants non réutilisables (dupliquer sans `<use>`)
- Oublier les `stroke-linecap="round"` sur les icônes
- Utiliser des `font-size` inférieurs à 11px (illisible)

### ✅ Toujours faire
- Aligner sur grille 8px (positions multiples de 4 ou 8)
- Nommer tous les groupes avec des `id` descriptifs
- Inclure au moins 5 lignes de données "réalistes" dans les tableaux
- Représenter au moins un état d'erreur ou d'alerte par écran
- Ajouter un `title` SVG pour l'accessibilité
- Grouper les éléments répétitifs avec `<use xlink:href>`
