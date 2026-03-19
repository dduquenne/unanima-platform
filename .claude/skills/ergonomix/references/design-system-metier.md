# Design System Métier — Référence

Tokens, palette et typographie optimisés pour les **applications métier** (usage intensif, longues sessions, focus sur la lisibilité et l'efficacité opérationnelle).

> Principe directeur : **clarté fonctionnelle avant esthétique décorative**.

---

## Palette sémantique métier

```css
:root {
  /* ——— Neutres — Base de toute app métier ——— */
  --neutral-0:   0 0% 100%;
  --neutral-50:  210 20% 98%;
  --neutral-100: 210 16% 95%;
  --neutral-200: 210 14% 89%;
  --neutral-300: 210 12% 80%;
  --neutral-400: 210 10% 64%;
  --neutral-500: 210 9%  50%;
  --neutral-600: 210 10% 37%;
  --neutral-700: 210 11% 27%;
  --neutral-800: 210 13% 18%;
  --neutral-900: 210 15% 11%;
  --neutral-950: 210 17%  7%;

  /* ——— Brand (couleur principale de l'application) ——— */
  --brand-50:  214 100% 97%;
  --brand-100: 214 95%  92%;
  --brand-200: 214 90%  84%;
  --brand-300: 214 85%  72%;
  --brand-400: 214 80%  60%;
  --brand-500: 214 75%  50%;  /* Primaire */
  --brand-600: 214 72%  42%;
  --brand-700: 214 68%  34%;
  --brand-800: 214 64%  26%;
  --brand-900: 214 60%  18%;

  /* ——— Sémantique fonctionnelle — CRITIQUE pour apps métier ——— */
  /* Succès */
  --success-50:  142 76% 97%;
  --success-500: 142 71% 40%;
  --success-700: 142 66% 28%;

  /* Avertissement */
  --warning-50:   38 100% 97%;
  --warning-500:  38 92%  50%;
  --warning-700:  38 86%  36%;

  /* Danger / Erreur */
  --danger-50:   0 100% 97%;
  --danger-500:  0 84%  60%;
  --danger-700:  0 76%  44%;

  /* Info */
  --info-50:  199 89% 97%;
  --info-500: 199 89% 45%;
  --info-700: 199 84% 32%;

  /* ——— Tokens sémantiques — ce que le code utilise ——— */
  --color-background:      var(--neutral-0);
  --color-background-subtle: var(--neutral-50);
  --color-surface:         var(--neutral-0);
  --color-surface-raised:  var(--neutral-50);
  --color-surface-overlay: var(--neutral-0);

  --color-border:          var(--neutral-200);
  --color-border-strong:   var(--neutral-300);
  --color-border-focus:    var(--brand-500);

  --color-text-primary:    hsl(var(--neutral-900));
  --color-text-secondary:  hsl(var(--neutral-600));
  --color-text-tertiary:   hsl(var(--neutral-400));
  --color-text-disabled:   hsl(var(--neutral-300));
  --color-text-inverse:    hsl(var(--neutral-0));

  --color-primary:         hsl(var(--brand-500));
  --color-primary-hover:   hsl(var(--brand-600));
  --color-primary-active:  hsl(var(--brand-700));
  --color-primary-subtle:  hsl(var(--brand-50));
  --color-primary-fg:      hsl(var(--neutral-0));

  --color-success:         hsl(var(--success-500));
  --color-success-subtle:  hsl(var(--success-50));
  --color-success-fg:      hsl(var(--success-700));

  --color-warning:         hsl(var(--warning-500));
  --color-warning-subtle:  hsl(var(--warning-50));
  --color-warning-fg:      hsl(var(--warning-700));

  --color-danger:          hsl(var(--danger-500));
  --color-danger-subtle:   hsl(var(--danger-50));
  --color-danger-fg:       hsl(var(--danger-700));

  --color-info:            hsl(var(--info-500));
  --color-info-subtle:     hsl(var(--info-50));
  --color-info-fg:         hsl(var(--info-700));

  /* ——— Typographie — Lisibilité en session longue ——— */
  /* Interdit : polices décoratives, scripts, ultra-condensées */
  /* Recommandé : polices à haute lisibilité, chasses claires */
  --font-ui:   'Inter', 'Geist', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  /* --font-ui-alt: 'IBM Plex Sans', 'DM Sans', sans-serif; */

  /* Échelle typographique — plus petite que le grand public */
  --text-xs:   0.6875rem;  /* 11px — métadonnées, labels discrets */
  --text-sm:   0.75rem;    /* 12px — labels de champs, cellules de tableau */
  --text-base: 0.875rem;   /* 14px — corps de texte par défaut */
  --text-md:   1rem;       /* 16px — titres de section */
  --text-lg:   1.125rem;   /* 18px — titres de page */
  --text-xl:   1.25rem;    /* 20px — titres principaux */
  --text-2xl:  1.5rem;     /* 24px — titres de module */

  --leading-compact:  1.25;  /* Tableaux, listes denses */
  --leading-normal:   1.5;   /* Corps de texte standard */
  --leading-relaxed:  1.75;  /* Texte long, aide, documentation */

  /* ——— Espacement — Densité adaptable ——— */
  /* Mode standard */
  --space-1:   0.25rem;   /* 4px  */
  --space-2:   0.5rem;    /* 8px  */
  --space-3:   0.75rem;   /* 12px */
  --space-4:   1rem;      /* 16px */
  --space-5:   1.25rem;   /* 20px */
  --space-6:   1.5rem;    /* 24px */
  --space-8:   2rem;      /* 32px */
  --space-10:  2.5rem;    /* 40px */
  --space-12:  3rem;      /* 48px */
  --space-16:  4rem;      /* 64px */

  /* ——— Tailles de cibles interactives (Loi de Fitts) ——— */
  --touch-target-min:     44px;  /* Mobile / touch */
  --click-target-compact: 28px;  /* Desktop dense (expert) */
  --click-target-default: 36px;  /* Desktop standard */
  --click-target-large:   44px;  /* Desktop confortable */

  /* ——— Bordures & Rayons — Sobriété ——— */
  --radius-sm:   0.25rem;   /* 4px  — inputs, tags */
  --radius-md:   0.375rem;  /* 6px  — cards légères, dropdowns */
  --radius-lg:   0.5rem;    /* 8px  — panneaux, modales */
  --radius-xl:   0.75rem;   /* 12px — cards principales */
  --radius-full: 9999px;    /* Badges, pills de statut */

  /* ——— Ombres — Élévation subtile ——— */
  --shadow-xs:  0 1px 2px 0 rgb(0 0 0 / 0.04);
  --shadow-sm:  0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07);
  --shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08);
  --shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08);
  --shadow-overlay: 0 20px 60px -10px rgb(0 0 0 / 0.15); /* Modales */

  /* ——— Animations — Fonctionnelles, jamais décoratives ——— */
  --duration-instant: 0ms;
  --duration-fast:    100ms;  /* Hover, focus — doit sembler immédiat */
  --duration-normal:  200ms;  /* Transitions d'état */
  --duration-slow:    350ms;  /* Ouverture de panneaux, modales */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-enter:    cubic-bezier(0, 0, 0.2, 1);
  --ease-exit:     cubic-bezier(0.4, 0, 1, 1);

  /* ——— Layout applicatif ——— */
  --sidebar-width-collapsed: 3.5rem;   /* 56px  — icônes seules */
  --sidebar-width-default:   14rem;    /* 224px — nav standard */
  --sidebar-width-wide:      18rem;    /* 288px — nav avec sous-menus */
  --header-height:           3.5rem;   /* 56px  — barre globale */
  --content-max-width:       80rem;    /* 1280px */
  --form-max-width:          40rem;    /* 640px — formulaires */
  --panel-width:             24rem;    /* 384px — panneaux latéraux */
}

/* ——— Mode sombre ——— */
.dark {
  --color-background:        hsl(var(--neutral-950));
  --color-background-subtle: hsl(var(--neutral-900));
  --color-surface:           hsl(var(--neutral-900));
  --color-surface-raised:    hsl(var(--neutral-800));
  --color-border:            hsl(var(--neutral-800));
  --color-border-strong:     hsl(var(--neutral-700));
  --color-text-primary:      hsl(var(--neutral-50));
  --color-text-secondary:    hsl(var(--neutral-400));
  --color-text-tertiary:     hsl(var(--neutral-600));
  --color-text-disabled:     hsl(var(--neutral-700));
}

/* ——— Mode compact (utilisateurs experts) ——— */
.density-compact {
  --click-target-default: 28px;
  --space-table-row: 0.375rem; /* 6px padding vertical */
}

.density-default {
  --click-target-default: 36px;
  --space-table-row: 0.625rem; /* 10px padding vertical */
}

.density-comfortable {
  --click-target-default: 44px;
  --space-table-row: 0.875rem; /* 14px padding vertical */
}

/* ——— Accessibilité motion ——— */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Statuts métier — Palette des badges

```typescript
// Mapping sémantique statut → couleur (cohérent entre toute l'app)
// NE PAS réutiliser une couleur pour deux statuts différents

const statusConfig = {
  // Neutres / Système
  draft:       { color: 'neutral', label: 'Brouillon' },
  archived:    { color: 'neutral', label: 'Archivé' },

  // En cours / Actif
  active:      { color: 'info',    label: 'Actif' },
  pending:     { color: 'warning', label: 'En attente' },
  processing:  { color: 'info',    label: 'En cours' },

  // Succès / Validé
  approved:    { color: 'success', label: 'Approuvé' },
  completed:   { color: 'success', label: 'Terminé' },
  paid:        { color: 'success', label: 'Payé' },

  // Attention requise
  review:      { color: 'warning', label: 'À réviser' },
  overdue:     { color: 'danger',  label: 'En retard' },

  // Erreur / Critique
  cancelled:   { color: 'danger',  label: 'Annulé' },
  rejected:    { color: 'danger',  label: 'Rejeté' },
  error:       { color: 'danger',  label: 'Erreur' },
} as const

// RÈGLE : Statut = couleur + icône + libellé (jamais couleur seule — daltonisme)
```

---

## Extension Tailwind recommandée

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tokens sémantiques → Tailwind
        background: 'var(--color-background)',
        surface:    'var(--color-surface)',
        border:     'var(--color-border)',
        primary: {
          DEFAULT:    'var(--color-primary)',
          hover:      'var(--color-primary-hover)',
          subtle:     'var(--color-primary-subtle)',
          foreground: 'var(--color-primary-fg)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          subtle:  'var(--color-success-subtle)',
          fg:      'var(--color-success-fg)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          subtle:  'var(--color-warning-subtle)',
          fg:      'var(--color-warning-fg)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          subtle:  'var(--color-danger-subtle)',
          fg:      'var(--color-danger-fg)',
        },
      },
      fontSize: {
        'xs':   ['0.6875rem', { lineHeight: '1rem' }],
        'sm':   ['0.75rem',   { lineHeight: '1.125rem' }],
        'base': ['0.875rem',  { lineHeight: '1.375rem' }],
        'md':   ['1rem',      { lineHeight: '1.5rem' }],
        'lg':   ['1.125rem',  { lineHeight: '1.625rem' }],
        'xl':   ['1.25rem',   { lineHeight: '1.75rem' }],
        '2xl':  ['1.5rem',    { lineHeight: '2rem' }],
      },
      fontFamily: {
        ui:   'var(--font-ui)',
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
      },
      transitionDuration: {
        fast:   '100ms',
        normal: '200ms',
        slow:   '350ms',
      },
    },
  },
}

export default config
```
