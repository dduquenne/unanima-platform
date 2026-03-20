'use client'

import { useState, useCallback, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '../utils/cn'

interface AccordionItem {
  id: string
  title: string
  content: ReactNode
  defaultOpen?: boolean
}

export interface AccordionProps {
  items: AccordionItem[]
  multiple?: boolean
  className?: string
}

export function Accordion({ items, multiple = false, className }: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const defaults = new Set<string>()
    for (const item of items) {
      if (item.defaultOpen) defaults.add(item.id)
    }
    return defaults
  })

  const headerRefs = useRef<(HTMLButtonElement | null)[]>([])

  const toggle = useCallback(
    (id: string) => {
      setOpenIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          if (!multiple) next.clear()
          next.add(id)
        }
        return next
      })
    },
    [multiple],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      let nextIndex: number | undefined

      switch (e.key) {
        case 'ArrowDown':
          nextIndex = (index + 1) % items.length
          break
        case 'ArrowUp':
          nextIndex = (index - 1 + items.length) % items.length
          break
        case 'Home':
          nextIndex = 0
          break
        case 'End':
          nextIndex = items.length - 1
          break
        default:
          return
      }

      e.preventDefault()
      headerRefs.current[nextIndex]?.focus()
    },
    [items.length],
  )

  return (
    <div className={cn('divide-y divide-[var(--color-border-light)] border border-[var(--color-border-light)] rounded-[var(--radius-lg)]', className)}>
      {items.map((item, index) => {
        const isOpen = openIds.has(item.id)
        return (
          <div key={item.id}>
            <h3>
              <button
                ref={(el) => {
                  headerRefs.current[index] = el
                }}
                id={`accordion-header-${item.id}`}
                aria-expanded={isOpen}
                aria-controls={`accordion-panel-${item.id}`}
                onClick={() => toggle(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3 text-left',
                  'text-[var(--font-size-sm)] font-[var(--font-weight-medium)] text-[var(--color-text)]',
                  'hover:bg-[var(--color-surface-hover)] transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-border-focus)]',
                )}
              >
                <span>{item.title}</span>
                <svg
                  className={cn(
                    'h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform',
                    isOpen && 'rotate-180',
                  )}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </h3>
            <div
              id={`accordion-panel-${item.id}`}
              role="region"
              aria-labelledby={`accordion-header-${item.id}`}
              className={cn(
                'grid transition-all',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-3 pt-0 text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
