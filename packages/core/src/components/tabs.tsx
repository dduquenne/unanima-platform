'use client'

import { useCallback, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '../utils/cn'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

export interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  children: ReactNode
  variant?: 'underline' | 'pills'
  className?: string
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  children,
  variant = 'underline',
  className,
}: TabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const focusTab = useCallback(
    (index: number) => {
      const enabledTabs = tabs.reduce<number[]>((acc, tab, i) => {
        if (!tab.disabled) acc.push(i)
        return acc
      }, [])
      const pos = enabledTabs.indexOf(index)
      if (pos === -1) return
      tabRefs.current[index]?.focus()
    },
    [tabs],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const enabledIndexes = tabs.reduce<number[]>((acc, tab, i) => {
        if (!tab.disabled) acc.push(i)
        return acc
      }, [])
      const currentIndex = tabs.findIndex((t) => t.id === activeTab)
      const currentPos = enabledIndexes.indexOf(currentIndex)
      if (currentPos === -1) return

      let nextPos: number

      switch (e.key) {
        case 'ArrowRight':
          nextPos = (currentPos + 1) % enabledIndexes.length
          break
        case 'ArrowLeft':
          nextPos =
            (currentPos - 1 + enabledIndexes.length) % enabledIndexes.length
          break
        case 'Home':
          nextPos = 0
          break
        case 'End':
          nextPos = enabledIndexes.length - 1
          break
        default:
          return
      }

      e.preventDefault()
      const nextIndex = enabledIndexes[nextPos]
      const nextTab = nextIndex !== undefined ? tabs[nextIndex] : undefined
      if (nextIndex !== undefined && nextTab) {
        onChange(nextTab.id)
        focusTab(nextIndex)
      }
    },
    [tabs, activeTab, onChange, focusTab],
  )

  return (
    <div className={cn('flex flex-col', className)}>
      <div
        role="tablist"
        onKeyDown={handleKeyDown}
        className={cn(
          'flex',
          variant === 'underline' &&
            'border-b border-[var(--color-border-light)] gap-0',
          variant === 'pills' && 'gap-2 flex-wrap',
          'overflow-x-auto scrollbar-hide',
        )}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el
              }}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap text-[var(--font-size-sm)] font-[var(--font-weight-medium)] transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                variant === 'underline' && [
                  'px-4 py-2.5 -mb-px border-b-2',
                  isActive
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]',
                ],
                variant === 'pills' && [
                  'px-4 py-2 rounded-full',
                  isActive
                    ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]',
                ],
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
        className="mt-4 focus-visible:outline-none"
      >
        {children}
      </div>
    </div>
  )
}
