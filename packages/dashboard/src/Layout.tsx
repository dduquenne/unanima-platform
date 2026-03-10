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
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--color-border)] bg-white transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center border-b border-[var(--color-border)] px-6">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-8" />
          ) : (
            <span className="text-lg font-bold text-[var(--color-primary)]">Unanima</span>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="flex flex-col gap-1">
            {sidebar.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    item.active
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'text-[var(--color-text)] hover:bg-[var(--color-background)]',
                  )}
                >
                  {item.icon && <span className="h-5 w-5">{item.icon}</span>}
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-white px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
              aria-label="Menu"
            >
              <svg className="h-6 w-6 text-[var(--color-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-[var(--color-text)]">{header.title}</h1>
          </div>
          {header.actions && <div>{header.actions}</div>}
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
