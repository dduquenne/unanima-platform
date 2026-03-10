'use client'

import { useState, type ReactNode } from 'react'
import { cn } from './cn'

export interface NavItem {
  label: string
  href: string
  icon?: ReactNode
  active?: boolean
}

export interface LayoutProps {
  sidebar: NavItem[]
  header: {
    title: string
    actions?: ReactNode
  }
  children: ReactNode
  logoUrl?: string
  className?: string
}

export function Layout({ sidebar, header, children, logoUrl, className }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={cn('flex h-screen bg-[var(--color-background)]', className)}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col',
          'border-r border-[var(--color-border-light,var(--color-border))]',
          'bg-[var(--color-surface,#fff)]',
          'shadow-lg lg:shadow-none',
          'transition-transform duration-300 ease-out',
          'lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center border-b border-[var(--color-border-light,var(--color-border))] px-6">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-8" />
          ) : (
            <span className="text-lg font-bold text-[var(--color-primary)]">Unanima</span>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="flex flex-col gap-0.5">
            {sidebar.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3',
                    'rounded-[var(--radius-md,0.5rem)] px-3 py-2.5',
                    'text-sm font-medium',
                    'transition-all duration-150',
                    item.active
                      ? cn(
                          'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
                          'shadow-sm',
                        )
                      : cn(
                          'text-[var(--color-text-secondary,var(--color-text))]',
                          'hover:bg-[var(--color-surface-hover,var(--color-background))]',
                          'hover:text-[var(--color-text)]',
                        ),
                  )}
                >
                  {item.icon && <span className="h-5 w-5 shrink-0">{item.icon}</span>}
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className={cn(
          'flex h-16 items-center justify-between',
          'border-b border-[var(--color-border-light,var(--color-border))]',
          'bg-[var(--color-surface,#fff)] px-6',
          'shadow-sm',
        )}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn(
                'rounded-[var(--radius-md,0.5rem)] p-1.5 lg:hidden',
                'text-[var(--color-text-secondary,var(--color-text))]',
                'hover:bg-[var(--color-muted,#f1f5f9)]',
                'transition-colors duration-150',
              )}
              aria-label="Menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-[var(--color-text)]">{header.title}</h1>
          </div>
          {header.actions && <div className="flex items-center gap-3">{header.actions}</div>}
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
