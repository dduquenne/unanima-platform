# Composants Métier — Référence

Templates de composants critiques pour les applications métier.
Adapter au design system et aux bibliothèques du projet.

---

## StatusBadge — Indicateur de statut accessible

```typescript
import type { FC } from 'react'
import { cn } from '@/lib/utils'

type StatusColor = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

interface StatusBadgeProps {
  label: string
  color: StatusColor
  icon?: FC<{ className?: string }>
  size?: 'sm' | 'md'
  dot?: boolean  // variante point coloré seul
}

const colorClasses: Record<StatusColor, string> = {
  neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  info:    'bg-info-subtle text-info-fg border-info/20',
  success: 'bg-success-subtle text-success-fg border-success/20',
  warning: 'bg-warning-subtle text-warning-fg border-warning/20',
  danger:  'bg-danger-subtle text-danger-fg border-danger/20',
}

const dotClasses: Record<StatusColor, string> = {
  neutral: 'bg-neutral-400',
  info:    'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  danger:  'bg-danger',
}

const StatusBadge: FC<StatusBadgeProps> = ({
  label,
  color,
  icon: Icon,
  size = 'md',
  dot = false,
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
      colorClasses[color]
    )}
  >
    {dot && (
      <span
        className={cn('rounded-full flex-shrink-0', dotClasses[color],
          size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'
        )}
        aria-hidden="true"
      />
    )}
    {Icon && !dot && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden="true" />}
    {label}
  </span>
)

export default StatusBadge
```

---

## EmptyState — État vide contextualisé

```typescript
import type { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: FC<{ className?: string }>
  title: string
  description?: string
  action?: ReactNode
  secondaryAction?: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const EmptyState: FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-center',
      {
        sm: 'py-8 px-4',
        md: 'py-16 px-6',
        lg: 'py-24 px-8',
      }[size],
      className
    )}
    role="status"
    aria-label={title}
  >
    {Icon && (
      <div className="mb-4 rounded-xl bg-neutral-100 p-3">
        <Icon className={cn(
          'text-neutral-400',
          { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-10 w-10' }[size]
        )} />
      </div>
    )}
    <h3 className={cn(
      'font-semibold text-neutral-900',
      { sm: 'text-sm', md: 'text-base', lg: 'text-lg' }[size]
    )}>
      {title}
    </h3>
    {description && (
      <p className={cn(
        'mt-1 text-neutral-500',
        { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }[size]
      )}>
        {description}
      </p>
    )}
    {(action || secondaryAction) && (
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {action}
        {secondaryAction}
      </div>
    )}
  </div>
)

export default EmptyState
```

---

## ActionMenu — Menu contextuel d'actions

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import type { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ActionItem {
  id: string
  label: string
  icon?: FC<{ className?: string }>
  onClick: () => void | Promise<void>
  variant?: 'default' | 'danger'
  disabled?: boolean
  disabledReason?: string
  separator?: never
}

interface SeparatorItem {
  separator: true
  id: string
}

type MenuItem = ActionItem | SeparatorItem

interface ActionMenuProps {
  trigger: ReactNode
  items: MenuItem[]
  align?: 'left' | 'right'
}

const ActionMenu: FC<ActionMenuProps> = ({ trigger, items, align = 'right' }) => {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fermeture sur clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Fermeture sur Échap
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div ref={menuRef} className="relative">
      <div onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open}>
        {trigger}
      </div>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-surface shadow-overlay',
            'py-1 focus:outline-none',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item) => {
            if ('separator' in item) {
              return <div key={item.id} className="my-1 h-px bg-border" role="separator" />
            }

            return (
              <button
                key={item.id}
                role="menuitem"
                disabled={item.disabled}
                title={item.disabled ? item.disabledReason : undefined}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
                  'focus-visible:outline-none focus-visible:bg-neutral-100',
                  item.variant === 'danger'
                    ? 'text-danger hover:bg-danger-subtle'
                    : 'text-neutral-700 hover:bg-neutral-50',
                  item.disabled && 'cursor-not-allowed opacity-40'
                )}
                onClick={async () => {
                  setOpen(false)
                  await item.onClick()
                }}
              >
                {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ActionMenu
```

---

## ConfirmDialog — Confirmation d'action critique

```typescript
'use client'

import type { FC } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

// Utilise @radix-ui/react-dialog pour la gestion du focus trap et de l'ARIA
// import * as Dialog from '@radix-ui/react-dialog'

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'default',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  // RÈGLE : Le bouton Cancel doit être à GAUCHE, Confirmer à DROITE
  // RÈGLE : Focus initial sur "Annuler" pour les actions destructives
  // RÈGLE : Désactiver les deux boutons pendant isLoading

  const confirmClasses = {
    danger:  'bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger',
    warning: 'bg-warning text-white hover:bg-warning/90 focus-visible:ring-warning',
    default: 'bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-primary',
  }[variant]

  return (
    /* Implémenter avec Radix Dialog ou Headless UI pour l'accessibilité */
    /* Structure minimale : */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <h2 id="confirm-title" className="text-base font-semibold text-foreground">
        {title}
      </h2>
      <p id="confirm-desc" className="mt-2 text-sm text-muted-foreground">
        {description}
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={isLoading}
          autoFocus={variant === 'danger'} // Focus sur Annuler pour les actions critiques
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`rounded-md px-4 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${confirmClasses}`}
        >
          {isLoading ? 'En cours...' : confirmLabel}
        </button>
      </div>
    </div>
  )
}

export default ConfirmDialog
```

---

## PageHeader — En-tête de page standardisé

```typescript
import type { FC, ReactNode } from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode      // Boutons primaires/secondaires
  tabs?: ReactNode         // Navigation par onglets si pertinent
  badge?: ReactNode        // Badge de statut du contexte
}

const PageHeader: FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  tabs,
  badge,
}) => (
  <div className="border-b border-border bg-background">
    <div className="mx-auto max-w-[var(--content-max-width)] px-6">
      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 pt-4 pb-2">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-neutral-300" aria-hidden="true">/</span>
              )}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="text-xs text-neutral-500 hover:text-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:rounded focus-visible:outline-primary"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-xs text-neutral-700 font-medium" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Titre + Actions */}
      <div className="flex items-start justify-between gap-4 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-neutral-900 truncate">
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <p className="mt-0.5 text-sm text-neutral-500 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex flex-shrink-0 items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Tabs */}
      {tabs}
    </div>
  </div>
)

export default PageHeader
```

---

## SectionCard — Carte de section de formulaire / fiche

```typescript
import type { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  title?: string
  description?: string
  children: ReactNode
  actions?: ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
  variant?: 'default' | 'subtle' | 'outlined'
}

const SectionCard: FC<SectionCardProps> = ({
  title,
  description,
  children,
  actions,
  className,
  variant = 'default',
}) => (
  <section
    className={cn(
      'rounded-xl',
      {
        default:  'bg-surface border border-border shadow-sm',
        subtle:   'bg-background-subtle border border-border',
        outlined: 'bg-transparent border-2 border-border',
      }[variant],
      className
    )}
  >
    {(title || actions) && (
      <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-border">
        <div>
          {title && (
            <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    )}
    <div className="px-6 py-5">{children}</div>
  </section>
)

export default SectionCard
```
