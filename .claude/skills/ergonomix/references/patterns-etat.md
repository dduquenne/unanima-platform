# Patterns État — Référence

Gestion de l'état asynchrone, des formulaires et des mises à jour optimistes pour applications métier TypeScript.

---

## 1. État asynchrone avec TanStack Query (React Query)

### Pattern de base — Liste paginée

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Clés de requête — typage strict
const invoiceKeys = {
  all:     ['invoices'] as const,
  lists:   () => [...invoiceKeys.all, 'list'] as const,
  list:    (filters: InvoiceFilters) => [...invoiceKeys.lists(), filters] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail:  (id: InvoiceId) => [...invoiceKeys.details(), id] as const,
}

// Hook de liste avec pagination
function useInvoices(filters: InvoiceFilters) {
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn:  () => invoiceService.list(filters),
    staleTime: 30_000, // 30s — données métier changent peu souvent
    placeholderData: keepPreviousData, // Évite le flash vide lors du changement de page
  })
}

// Hook de détail
function useInvoice(id: InvoiceId) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn:  () => invoiceService.get(id),
    enabled: !!id,
  })
}
```

### Pattern mutation avec optimistic update

```typescript
function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: InvoiceId; status: InvoiceStatus }) =>
      invoiceService.updateStatus(id, status),

    // Mise à jour optimiste immédiate
    onMutate: async ({ id, status }) => {
      // Annuler les requêtes en cours (évite les conflits)
      await queryClient.cancelQueries({ queryKey: invoiceKeys.detail(id) })

      // Snapshot de l'état précédent (pour rollback)
      const previous = queryClient.getQueryData(invoiceKeys.detail(id))

      // Mise à jour optimiste
      queryClient.setQueryData(invoiceKeys.detail(id), (old: Invoice) => ({
        ...old,
        status,
      }))

      return { previous }
    },

    // Rollback en cas d'erreur
    onError: (err, { id }, context) => {
      queryClient.setQueryData(invoiceKeys.detail(id), context?.previous)
      toast.error(`Échec de la mise à jour : ${err.message}`)
    },

    // Invalidation post-succès
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      toast.success('Statut mis à jour')
    },
  })
}
```

---

## 2. Formulaires métier avec React Hook Form + Zod

### Schéma de validation

```typescript
import { z } from 'zod'

// Schéma séparé du composant — réutilisable et testable
export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client requis'),
  issueDate: z.string().min(1, 'Date d\'émission requise'),
  dueDate: z.string().min(1, 'Date d\'échéance requise'),
  lineItems: z.array(z.object({
    description: z.string().min(1, 'Description requise'),
    quantity:    z.number().positive('Quantité doit être positive'),
    unitPrice:   z.number().min(0, 'Prix unitaire ne peut être négatif'),
  })).min(1, 'Au moins une ligne requise'),
  notes: z.string().optional(),
}).refine(
  (data) => new Date(data.dueDate) >= new Date(data.issueDate),
  { message: 'La date d\'échéance doit être postérieure à la date d\'émission', path: ['dueDate'] }
)

export type InvoiceFormData = z.infer<typeof invoiceSchema>
```

### Composant formulaire

```typescript
'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'

interface InvoiceFormProps {
  defaultValues?: Partial<InvoiceFormData>
  onSubmit: (data: InvoiceFormData) => Promise<void>
  onDirtyChange?: (isDirty: boolean) => void
}

function InvoiceForm({ defaultValues, onSubmit, onDirtyChange }: InvoiceFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isSubmitSuccessful },
    watch,
    reset,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      lineItems: [{ description: '', quantity: 1, unitPrice: 0 }],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' })

  // Avertir le parent des modifications non sauvegardées
  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  // Prévenir la navigation si formulaire modifié
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSubmitSuccessful) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty, isSubmitSuccessful])

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Résumé des erreurs en haut si plusieurs erreurs */}
      {Object.keys(errors).length > 2 && (
        <div role="alert" className="mb-6 rounded-lg border border-danger/30 bg-danger-subtle p-4">
          <p className="text-sm font-medium text-danger-fg">
            {Object.keys(errors).length} erreurs à corriger avant d'enregistrer
          </p>
        </div>
      )}

      {/* ... champs du formulaire ... */}

      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <button
          type="button"
          onClick={() => reset()}
          disabled={!isDirty || isSubmitting}
          className="btn-secondary"
        >
          Annuler les modifications
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
```

---

## 3. Gestion des filtres avec persistance URL

```typescript
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'

interface InvoiceFilters {
  status?:   InvoiceStatus
  clientId?: string
  dateFrom?: string
  dateTo?:   string
  search?:   string
  page?:     number
  pageSize?: number
  sortBy?:   string
  sortOrder?: 'asc' | 'desc'
}

// Hook de filtres persistés dans l'URL — rechargeable, partageable
function useInvoiceFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = useMemo<InvoiceFilters>(() => ({
    status:    searchParams.get('status') as InvoiceStatus | undefined,
    clientId:  searchParams.get('clientId') ?? undefined,
    dateFrom:  searchParams.get('dateFrom') ?? undefined,
    dateTo:    searchParams.get('dateTo') ?? undefined,
    search:    searchParams.get('search') ?? undefined,
    page:      Number(searchParams.get('page') ?? 1),
    pageSize:  Number(searchParams.get('pageSize') ?? 20),
    sortBy:    searchParams.get('sortBy') ?? 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'desc',
  }), [searchParams])

  const setFilter = useCallback(<K extends keyof InvoiceFilters>(
    key: K,
    value: InvoiceFilters[K]
  ) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === undefined || value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, String(value))
    }
    // Remettre à la page 1 lors d'un changement de filtre
    if (key !== 'page') params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  const resetFilters = useCallback(() => {
    router.push(pathname, { scroll: false })
  }, [router, pathname])

  const hasActiveFilters = useMemo(
    () => ['status', 'clientId', 'dateFrom', 'dateTo', 'search']
      .some(key => searchParams.has(key)),
    [searchParams]
  )

  return { filters, setFilter, resetFilters, hasActiveFilters }
}
```

---

## 4. Pattern Toast / Notifications métier

```typescript
// Utiliser une lib comme sonner, react-hot-toast, ou @radix-ui/react-toast

// Wrapper applicatif — API cohérente dans toute l'app
export const notify = {
  success: (message: string, options?: { description?: string; duration?: number }) =>
    toast.success(message, { description: options?.description, duration: options?.duration ?? 4000 }),

  error: (message: string, options?: { description?: string; action?: { label: string; onClick: () => void } }) =>
    toast.error(message, {
      description: options?.description,
      action: options?.action,
      duration: 8000, // Erreurs plus longues
    }),

  warning: (message: string, options?: { description?: string }) =>
    toast.warning(message, { description: options?.description, duration: 6000 }),

  info: (message: string, options?: { description?: string }) =>
    toast.info(message, { description: options?.description, duration: 4000 }),

  // Toast avec action d'annulation (5s de délai)
  withUndo: (message: string, onUndo: () => void) =>
    toast(message, {
      duration: 5000,
      action: { label: 'Annuler', onClick: onUndo },
    }),

  // Toast de chargement avec mise à jour
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => toast.promise(promise, messages),
}

// Usage :
// notify.success('Facture créée', { description: 'N° FAC-2024-0087' })
// notify.withUndo('Client archivé', () => clientService.unarchive(id))
// notify.promise(save(), { loading: 'Enregistrement...', success: 'Sauvegardé', error: 'Échec' })
```

---

## 5. Sauvegarde automatique brouillon

```typescript
import { useEffect, useRef } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

interface UseAutosaveOptions<T> {
  data: T
  onSave: (data: T) => Promise<void>
  delay?: number
  enabled?: boolean
}

function useAutosave<T>({ data, onSave, delay = 2000, enabled = true }: UseAutosaveOptions<T>) {
  const debouncedData = useDebounce(data, delay)
  const isFirstRender = useRef(true)
  const isSaving = useRef(false)

  useEffect(() => {
    // Ne pas sauvegarder au premier rendu
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!enabled || isSaving.current) return

    const save = async () => {
      isSaving.current = true
      try {
        await onSave(debouncedData)
      } catch (err) {
        console.error('Autosave failed:', err)
      } finally {
        isSaving.current = false
      }
    }

    save()
  }, [debouncedData]) // eslint-disable-line react-hooks/exhaustive-deps — intentionnel

  // Pour afficher un indicateur "Sauvegarde auto..."
  // Combiner avec un état local isSaving exposé si nécessaire
}
```
