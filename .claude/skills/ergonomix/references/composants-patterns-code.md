# Composants Critiques — Patterns de Code Metier

Reference extraite de SKILL.md — Implementations detaillees des patterns composants.

---

## Tableaux de donnees (DataTable)

```typescript
// Fonctionnalites obligatoires pour un tableau metier :
interface DataTableFeatures {
  sorting: boolean          // Tri multi-colonnes
  filtering: boolean        // Filtres par colonne + recherche globale
  pagination: boolean       // Ou scroll infini selon le volume
  selection: boolean        // Selection multiple + bulk actions
  columnVisibility: boolean // L utilisateur choisit ses colonnes
  export: boolean           // CSV/Excel si pertinent
  rowActions: 'inline' | 'menu'  // Actions rapides sur chaque ligne
  emptyState: ReactNode     // Etat vide explicite avec action
  loadingState: ReactNode   // Skeleton coherent avec la structure
  errorState: ReactNode     // Etat erreur avec retry
}

// Pattern : actions inline sur hover (desktop)
// <tr className="group">
//   <td className="opacity-0 group-hover:opacity-100 transition-opacity">
//     <RowActions />
//   </td>
// </tr>
```

---

## Formulaires metier

```typescript
// Architecture d un formulaire metier robuste :
// 1. Schema de validation separe (Zod recommande)
// 2. Etat : pristine / dirty / submitting / submitted
// 3. Validation : onBlur pour les champs, onSubmit pour la coherence globale
// 4. Sauvegarde auto brouillon (localStorage ou API) si > 5 champs
// 5. Indicateur "Modifications non sauvegardees" (beforeunload)
// 6. Retour utilisateur : succes inline, erreurs inline ET resume en haut

// Groupement des champs : sections nommees avec legende
// <fieldset>
//   <legend className="text-sm font-semibold text-foreground mb-4">
//     Coordonnees
//   </legend>
//   <div className="grid grid-cols-2 gap-4">
//     <FormField name="firstName" ... />
//     <FormField name="lastName" ... />
//   </div>
// </fieldset>
```

---

## Etats vides, chargement et erreur

```typescript
// REGLE : Tout composant qui charge des donnees DOIT implementer les 4 etats :
// 1. Loading  -> Skeleton (pas de spinner global sauf exception)
// 2. Empty    -> Illustration + message contextuel + action
// 3. Error    -> Message explicite + bouton "Reessayer" + code erreur discret
// 4. Data     -> Contenu reel

// Etat vide — Jamais "Aucun resultat" seul :
// <EmptyState
//   icon={<FileTextIcon />}
//   title="Aucune facture pour ce client"
//   description="Les factures apparaitront ici des qu une commande sera validee."
//   action={<Button>Creer une facture</Button>}
// />
```

---

## Notifications & Feedback

```typescript
// Hierarchie des feedbacks selon l urgence :
type FeedbackLevel =
  | 'toast'    // Info/succes transitoire — 3-5s, coin bas-droite
  | 'banner'   // Avertissement persistant — en haut de zone contenu
  | 'inline'   // Erreur de champ — sous le champ concerne
  | 'modal'    // Confirmation action critique — bloque l interface
  | 'badge'    // Compteur statut — dans la nav/sidebar

// JAMAIS : alert() natif du navigateur
// JAMAIS : toast d erreur seul sans log ni code de reference
// TOUJOURS : les toasts de succes peuvent etre fermes manuellement
```

---

## Structure de composant metier TypeScript

```typescript
import type { FC } from 'react'
import { cn } from '@/lib/utils'

// 1. Types d abord
interface InvoiceRowProps {
  invoice: Invoice
  onEdit: (id: InvoiceId) => void
  onDelete: (id: InvoiceId) => Promise<void>
  isSelected: boolean
  onToggleSelect: (id: InvoiceId) => void
}

// 2. Composant
const InvoiceRow: FC<InvoiceRowProps> = ({
  invoice,
  onEdit,
  onDelete,
  isSelected,
  onToggleSelect,
}) => {
  // hooks
  // derived state (memorisation si calcul couteux)
  // handlers (useCallback si passe en prop)
  // render
}

export default InvoiceRow
```

---

## Typage strict oriente domaine metier

```typescript
// Types domaine explicites — eviter les primitives seules
type UserId = string & { readonly __brand: 'UserId' }
type InvoiceId = string & { readonly __brand: 'InvoiceId' }
type Amount = number & { readonly __brand: 'Amount' } // en centimes

// Etats metier exhaustifs
type InvoiceStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'sent'
  | 'paid'
  | 'overdue'
  | 'cancelled'

// Resultats avec discriminant — pas d exceptions pour le controle de flux
type Result<T, E = Error> =
  | { ok: true;  data: T }
  | { ok: false; error: E }
```

---

## Patterns de performance metier

```typescript
// Optimistic UI pour les actions frequentes
const handleToggleStatus = async (id: InvoiceId) => {
  // 1. Mise a jour optimiste immediate
  updateLocalState(id, 'processing')
  // 2. Requete async
  const result = await invoiceService.toggle(id)
  // 3. Correction si erreur
  if (!result.ok) revertLocalState(id)
}

// Virtualisation pour les longues listes (> 100 items)
// TanStack Virtual ou react-window
import { useVirtualizer } from '@tanstack/react-virtual'

// Debounce pour la recherche — 300ms
// Memorisation des resultats de requete — React Query / SWR
// Pagination cote serveur — jamais charger toute la base
```
