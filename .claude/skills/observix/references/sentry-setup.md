# Sentry — Installation et Configuration Complete

## Installation et initialisation

```typescript
// packages/core/src/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs'

export function initSentry(config: {
  dsn: string
  environment: string
  app: 'links' | 'creai' | 'omega'
}) {
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: process.env.VERCEL_GIT_COMMIT_SHA,

    // Echantillonnage : 100% des erreurs, 10% des transactions
    tracesSampleRate: config.environment === 'production' ? 0.1 : 1.0,

    // Filtrer le bruit
    ignoreErrors: [
      'ResizeObserver loop',
      'Network request failed',
      'Load failed',
    ],

    // Contexte enrichi
    initialScope: {
      tags: {
        app: config.app,
      },
    },

    // Masquer les donnees sensibles
    beforeSend(event) {
      if (event.request?.cookies) {
        delete event.request.cookies
      }
      return event
    },
  })
}
```

## Error Boundaries React

```typescript
// packages/core/src/components/error-boundary.tsx
'use client'
import * as Sentry from '@sentry/nextjs'
import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback: ReactNode
}

export class ErrorBoundary extends Component<Props, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    })
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
```

## Capture contextuelle

```typescript
// Enrichir les erreurs avec le contexte metier
Sentry.setUser({
  id: user.id,
  email: user.email,   // Attention RGPD : verifier le consentement
  role: user.role,
})

Sentry.setTag('app', 'links')
Sentry.setTag('feature', 'bilan-competences')

// Breadcrumbs pour retracer le parcours
Sentry.addBreadcrumb({
  category: 'navigation',
  message: `Navigue vers ${pathname}`,
  level: 'info',
})

// Capturer une erreur avec contexte enrichi
try {
  await saveBeneficiaire(data)
} catch (error) {
  Sentry.captureException(error, {
    tags: { action: 'save_beneficiaire' },
    extra: { beneficiaireId: data.id },
  })
  throw error
}
```
