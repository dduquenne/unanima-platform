# Accessibilité Métier — Référence WCAG AA

Checklist complète et patterns ARIA pour les applications métier TypeScript.
Niveau cible : **WCAG 2.1 AA** (obligatoire) + bonnes pratiques WCAG 2.2.

---

## Checklist par type de composant

### Formulaires

- [ ] Chaque `<input>`, `<select>`, `<textarea>` a un `<label>` associé (`htmlFor`)
- [ ] Champs obligatoires : `required` + indication visuelle non basée sur la couleur seule
- [ ] Messages d'erreur liés au champ : `aria-describedby="field-error-id"`
- [ ] `aria-invalid="true"` sur le champ en erreur
- [ ] `aria-required="true"` si l'attribut HTML `required` n'est pas suffisant
- [ ] Contraintes de format affichées avant la saisie (pas seulement en erreur)
- [ ] Groupes logiques encadrés par `<fieldset>` + `<legend>`
- [ ] Ordre de tabulation suit l'ordre visuel de haut en bas, gauche à droite

```typescript
// ✅ Pattern champ avec erreur accessible
<div>
  <label htmlFor="email" className="...">
    Adresse e-mail
    <span aria-hidden="true" className="text-danger ml-1">*</span>
    <span className="sr-only">(obligatoire)</span>
  </label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-invalid={!!error}
    aria-describedby={cn(error && 'email-error', hint && 'email-hint')}
  />
  {hint && <p id="email-hint" className="text-xs text-neutral-500">{hint}</p>}
  {error && (
    <p id="email-error" role="alert" className="text-xs text-danger">
      {error}
    </p>
  )}
</div>
```

---

### Tableaux de données

- [ ] `<table>` avec `<caption>` descriptif (ou `aria-label`)
- [ ] `<th>` avec `scope="col"` pour les en-têtes de colonne
- [ ] `<th>` avec `scope="row"` pour les en-têtes de ligne
- [ ] Tri de colonne : `aria-sort="ascending|descending|none"` sur le `<th>`
- [ ] Lignes sélectionnables : `role="row"` + `aria-selected="true|false"`
- [ ] Checkbox de sélection : `aria-label="Sélectionner la facture FAC-001"`
- [ ] Checkbox "sélectionner tout" : `aria-label="Sélectionner toutes les factures"`
- [ ] Actions inline : `aria-label` explicite sur chaque bouton icône

```typescript
// ✅ En-tête de colonne triable accessible
<th
  scope="col"
  aria-sort={sortBy === 'amount' ? sortOrder === 'asc' ? 'ascending' : 'descending' : 'none'}
>
  <button
    onClick={() => handleSort('amount')}
    className="flex items-center gap-1"
    aria-label={`Trier par montant ${sortBy === 'amount' && sortOrder === 'asc' ? '(descendant)' : '(ascendant)'}`}
  >
    Montant
    <SortIcon className="h-3 w-3" aria-hidden="true" />
  </button>
</th>
```

---

### Modales & Dialogues

- [ ] `role="dialog"` + `aria-modal="true"`
- [ ] `aria-labelledby` pointant vers le titre de la modale
- [ ] `aria-describedby` pointant vers la description si présente
- [ ] **Focus trap** : la tabulation ne sort pas de la modale tant qu'elle est ouverte
- [ ] Focus initial sur le premier élément focusable (ou le titre si pas d'action immédiate)
- [ ] Fermeture avec la touche **Échap**
- [ ] Restauration du focus sur l'élément déclencheur à la fermeture
- [ ] Fond obscurci : `aria-hidden="true"` sur l'overlay

```typescript
// ✅ Utiliser @radix-ui/react-dialog (gère tout automatiquement)
import * as Dialog from '@radix-ui/react-dialog'

<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Trigger asChild>
    <button>Ouvrir</button>
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/50" />
    <Dialog.Content
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ..."
      onEscapeKeyDown={() => setOpen(false)}
    >
      <Dialog.Title>Titre de la modale</Dialog.Title>
      <Dialog.Description>Description optionnelle</Dialog.Description>
      {/* contenu */}
      <Dialog.Close asChild>
        <button aria-label="Fermer la modale">×</button>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

---

### Menus déroulants & Select

- [ ] `role="combobox"` + `aria-expanded` + `aria-haspopup="listbox"` pour les selects custom
- [ ] Liste : `role="listbox"` + `aria-label`
- [ ] Options : `role="option"` + `aria-selected`
- [ ] Navigation clavier : flèches haut/bas, Entrée pour sélectionner, Échap pour fermer
- [ ] Utiliser `@radix-ui/react-select` ou `@headlessui/react` — ne pas réimplémenter

---

### Navigation

- [ ] `<nav>` avec `aria-label` distinct pour chaque zone de navigation (globale, locale, breadcrumb)
- [ ] Page courante : `aria-current="page"` sur le lien actif
- [ ] Breadcrumb : `<nav aria-label="Fil d'Ariane">` + `aria-current="page"` sur le dernier élément
- [ ] Sidebar collapsible : `aria-expanded` + `aria-controls`
- [ ] Skip link : `<a href="#main-content" className="sr-only focus:not-sr-only">Aller au contenu</a>`

```typescript
// ✅ Skip link — toujours en premier dans le <body>
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
>
  Aller au contenu principal
</a>
```

---

### Notifications & Alertes dynamiques

- [ ] Succès / info transitoires : `aria-live="polite"` (ne coupe pas la lecture en cours)
- [ ] Erreurs critiques : `aria-live="assertive"` (interrompt la lecture)
- [ ] `role="status"` pour les messages de statut non urgents
- [ ] `role="alert"` pour les erreurs (implique `aria-live="assertive"`)
- [ ] Zone live toujours présente dans le DOM, contenu mis à jour dynamiquement

```typescript
// ✅ Zone d'annonces — dans le layout racine
const [announcement, setAnnouncement] = useState('')

// Région polite (succès, info)
<div
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {announcement}
</div>

// Région assertive (erreurs critiques) — séparée
<div
  aria-live="assertive"
  aria-atomic="true"
  className="sr-only"
>
  {criticalError}
</div>
```

---

### Chargement & États asynchrones

- [ ] Skeleton : `aria-hidden="true"` + `aria-busy="true"` sur le conteneur parent
- [ ] Spinner : `role="status"` + `aria-label="Chargement en cours"` + texte visible ou sr-only
- [ ] Bouton en cours : `aria-busy="true"` + texte mis à jour ("Enregistrement...")
- [ ] Tableaux en chargement : `aria-busy="true"` sur `<table>`

```typescript
// ✅ Bouton avec état de chargement accessible
<button
  type="submit"
  disabled={isLoading}
  aria-busy={isLoading}
  aria-label={isLoading ? 'Enregistrement en cours' : 'Enregistrer'}
>
  {isLoading ? (
    <>
      <Spinner className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>Enregistrement...</span>
    </>
  ) : (
    'Enregistrer'
  )}
</button>
```

---

## Contrastes — Ratios minimaux WCAG AA

| Contexte | Ratio minimum | Notes |
|---------|--------------|-------|
| Texte normal (< 18pt) | **4.5:1** | Corps de texte, labels |
| Texte large (≥ 18pt bold ou ≥ 24pt) | **3:1** | Titres de section |
| Composants UI (bordures, icônes) | **3:1** | Champs de saisie, boutons |
| Texte désactivé | Exemption | Mais rester raisonnable |
| Texte décoratif | Exemption | Logos, texte sur image complexe |

**Outils de vérification :**
- `npx @accessibility-checker/cli <url>` — audit automatisé
- Extension navigateur "axe DevTools"
- Figma plugin "Contrast" pour le design
- `color-contrast` dans Chrome DevTools (CSS Overview)

---

## Raccourcis clavier standards à respecter

```typescript
// Convention : raccourcis globaux cohérents dans toute l'app
const GLOBAL_SHORTCUTS = {
  'Ctrl+S' / 'Cmd+S':  'Sauvegarder le formulaire en cours',
  'Escape':             'Fermer modale / annuler / désélectionner',
  'Enter':              'Confirmer / soumettre (dans les modales)',
  'Ctrl+K' / 'Cmd+K':  'Ouvrir la recherche globale (command palette)',
  'Ctrl+Z' / 'Cmd+Z':  'Annuler la dernière action',
  '?':                  'Afficher l\'aide des raccourcis (si hors champ de saisie)',
} as const

// Dans les tableaux :
const TABLE_SHORTCUTS = {
  'Space':       'Sélectionner / désélectionner la ligne courante',
  'Ctrl+A':      'Sélectionner toutes les lignes visibles',
  'Delete':      'Supprimer la sélection (avec confirmation)',
  'ArrowUp/Down':'Naviguer entre les lignes',
  'Enter':       'Ouvrir la ligne (vue détail)',
} as const
```

---

## Annonces de navigation SPA (Single Page Application)

```typescript
// Dans Next.js App Router — annoncer les changements de page
'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

function RouteAnnouncer() {
  const pathname = usePathname()
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    // Récupérer le titre de la page courante
    const pageTitle = document.title.split(' — ')[0] ?? 'Page chargée'
    setAnnouncement(`Navigation vers ${pageTitle}`)
  }, [pathname])

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  )
}

// Ajouter dans le layout racine :
// <RouteAnnouncer />
```

---

## Tests d'accessibilité automatisés

```typescript
// vitest + @testing-library/react + jest-axe
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('DataTable est accessible', async () => {
  const { container } = render(<DataTable data={mockData} columns={columns} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})

// Cypress + cypress-axe (tests E2E)
// cy.injectAxe()
// cy.checkA11y('#main-content', { runOnly: ['wcag2a', 'wcag2aa'] })
```
