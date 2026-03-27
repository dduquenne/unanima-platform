'use client'

import type { ReactNode } from 'react'
import type { AuthPageConfig } from '../types'

interface AuthLayoutProps {
  config: AuthPageConfig
  children: ReactNode
}

function DefaultLogo({ appName }: { appName: string }) {
  const initial = appName.charAt(0).toUpperCase()
  return (
    <div className="relative mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/25">
      <span className="text-3xl font-bold text-[var(--color-text-inverse,#fff)]">
        {initial}
      </span>
      <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[var(--color-surface,#fff)] bg-[var(--color-success)]" />
    </div>
  )
}

export function AuthLayout({ config, children }: AuthLayoutProps) {
  const { appName, tagline, logo, legalLinks } = config

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--color-background)]">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, var(--color-secondary, var(--color-primary)) 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="mb-8 flex flex-col items-center gap-4">
          {logo ?? <DefaultLogo appName={appName} />}
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-primary-dark,var(--color-primary))] sm:text-2xl">
              {appName}
            </h1>
            {tagline && (
              <p className="mt-1 max-w-xs text-sm text-[var(--color-text-muted,var(--color-text-secondary))]">
                {tagline}
              </p>
            )}
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-[420px]">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-surface,#fff)] shadow-xl shadow-black/5">
            <div
              className="h-1"
              style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary, var(--color-primary-light, var(--color-primary))))' }}
            />
            <div className="p-6 sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-4 text-center">
        <p className="text-xs text-[var(--color-text-muted,var(--color-text-secondary))]">
          &copy; {new Date().getFullYear()} {appName}
        </p>
        {legalLinks && legalLinks.length > 0 && (
          <p className="mt-1 text-xs text-[var(--color-text-muted,var(--color-text-secondary))]/70">
            {legalLinks.map((link, i) => (
              <span key={link.href}>
                {i > 0 && ' · '}
                <a href={link.href} className="underline-offset-2 hover:underline">
                  {link.label}
                </a>
              </span>
            ))}
          </p>
        )}
      </footer>
    </main>
  )
}
