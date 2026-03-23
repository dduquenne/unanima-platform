# Accessible Component Patterns — Accessibilix

## Boutons

```typescript
// ✅ Bouton accessible
<button
  type="button"
  onClick={handleAction}
  aria-label="Supprimer le beneficiaire Jean Dupont"  // Si le texte visible ne suffit pas
  aria-disabled={isLoading}
  disabled={isLoading}
>
  <TrashIcon aria-hidden="true" />  {/* Icone decorative masquee */}
  <span>Supprimer</span>
</button>

// ❌ Bouton inaccessible
<div onClick={handleAction} className="btn">Supprimer</div>
// Problemes : pas focusable, pas de role, pas de gestion clavier
```

## Formulaires

```typescript
// ✅ Formulaire accessible
<div role="group" aria-labelledby="section-identity">
  <h2 id="section-identity">Identite du beneficiaire</h2>

  <div>
    <label htmlFor="fullname">
      Nom complet <span aria-hidden="true">*</span>
      <span className="sr-only">(obligatoire)</span>
    </label>
    <input
      id="fullname"
      type="text"
      required
      aria-required="true"
      aria-invalid={errors.fullname ? "true" : undefined}
      aria-describedby={errors.fullname ? "fullname-error" : "fullname-hint"}
    />
    <p id="fullname-hint" className="text-sm text-muted">
      Prenom et nom de famille
    </p>
    {errors.fullname && (
      <p id="fullname-error" role="alert" className="text-sm text-destructive">
        {errors.fullname.message}
      </p>
    )}
  </div>
</div>
```

## Tableaux de donnees

```typescript
// ✅ Tableau de donnees accessible (DataTable du socle)
<table aria-label="Liste des beneficiaires">
  <caption className="sr-only">
    Liste des 42 beneficiaires, triee par nom. Page 1 sur 5.
  </caption>
  <thead>
    <tr>
      <th scope="col" aria-sort={sortDir}>
        <button onClick={toggleSort} aria-label="Trier par nom">
          Nom {sortDir === 'ascending' ? '↑' : '↓'}
        </button>
      </th>
      <th scope="col">Email</th>
      <th scope="col">Statut</th>
      <th scope="col">
        <span className="sr-only">Actions</span>
      </th>
    </tr>
  </thead>
  <tbody>
    {data.map(row => (
      <tr key={row.id}>
        <td>{row.name}</td>
        <td>{row.email}</td>
        <td>
          <StatusBadge status={row.status} />
          {/* Le StatusBadge doit rendre le texte lisible, pas juste une couleur */}
        </td>
        <td>
          <button aria-label={`Modifier ${row.name}`}>Modifier</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

## Modales

```typescript
// ✅ Modale accessible avec focus trap
function AccessibleModal({ isOpen, onClose, title, children }) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Capturer le focus dans la modale
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
    }
  }, [isOpen])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
        // Focus trap logic...
      }}
    >
      <h2 id="modal-title">{title}</h2>
      {children}
      <button onClick={onClose}>Fermer</button>
    </div>
  )
}
```

## Classe utilitaire sr-only

```css
/* Texte visible uniquement par les lecteurs d'ecran */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

Tailwind CSS fournit cette classe nativement : `className="sr-only"`.

## Regions live

```typescript
// Notification de succes
<div role="status" aria-live="polite">
  {saveSuccess && "Les modifications ont ete enregistrees."}
</div>

// Alerte d'erreur (interrompt le lecteur)
<div role="alert" aria-live="assertive">
  {criticalError && `Erreur : ${criticalError.message}`}
</div>

// Compteur de resultats (mise a jour discrete)
<div aria-live="polite" aria-atomic="true">
  {`${results.length} resultats trouves`}
</div>
```

## Chargement

```typescript
// Skeleton accessible
<div aria-busy="true" aria-label="Chargement des donnees...">
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-12 w-full" />
</div>

// Spinner avec annonce
<div role="status">
  <Spinner aria-hidden="true" />
  <span className="sr-only">Chargement en cours...</span>
</div>
```

## Landmarks

```html
<body>
  <a href="#main-content" className="sr-only focus:not-sr-only">
    Aller au contenu principal
  </a>

  <header role="banner">
    <nav aria-label="Navigation principale">...</nav>
  </header>

  <aside role="complementary" aria-label="Barre laterale">
    <nav aria-label="Navigation secondaire">...</nav>
  </aside>

  <main id="main-content" role="main">
    <h1>Titre de la page</h1>
    ...
  </main>

  <footer role="contentinfo">...</footer>
</body>
```

## Focus management (Next.js App Router)

```typescript
'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function RouteAnnouncer() {
  const pathname = usePathname()

  useEffect(() => {
    const title = document.title
    const announcer = document.getElementById('route-announcer')
    if (announcer) {
      announcer.textContent = title
    }
    document.getElementById('main-content')?.focus()
  }, [pathname])

  return (
    <div
      id="route-announcer"
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      className="sr-only"
    />
  )
}
```
