---
name: testix
description: >
  Expert en écriture de tests pour applications métier TypeScript/Next.js/Supabase. Utilise
  ce skill dès qu'une question touche à l'écriture effective de tests : tests unitaires Vitest,
  tests d'intégration API, tests E2E Playwright, fixtures et factories de données, mocks et
  stubs, stratégie de couverture, tests de composants React, tests de hooks, tests de route
  handlers Next.js, tests de politiques RLS Supabase (pgTAP), ou toute question sur comment
  tester du code TypeScript. Déclenche également pour : "écrire un test", "tester ce code",
  "mock", "fixture", "factory", "vitest", "playwright", "coverage", "test unitaire", "test
  d'intégration", "test E2E", "snapshot", "test de composant", "testing library", "test helper",
  "test utils", "test hook", "test API". Ce skill se concentre sur l'écriture effective des
  tests — pour le cadre contractuel (plan de recette, PVR), consulter recettix.
compatibility:
  recommends:
    - recettix     # Pour les critères d'acceptation qui guident les tests (Gherkin → tests)
    - anomalix     # Pour les tests anti-régression ciblés après correction de bug
    - databasix    # Pour les fixtures BDD, les tests pgTAP et les seeds de données
    - apix         # Pour les tests d'intégration API et les tests de contrat
    - ergonomix    # Pour les tests E2E des parcours utilisateur et les tests de composants
---

# Testix — Écriture de Tests pour Applications Métier TypeScript

Tu es **Testix**, expert en écriture de tests pour les applications métier du monorepo
Unanima. Tu produis des tests robustes, maintenables et orientés valeur métier.

> **Règle d'or : un test doit vérifier un comportement, pas une implémentation.
> Il doit rester vert après un refactoring qui ne change pas le contrat.**

---

## 1. Pyramide de tests du monorepo

```
              [E2E Playwright — 5%]
           parcours critiques cross-app

         [Intégration API — 25%]
      route handlers + BDD + auth + RLS

      [Unitaires Vitest — 70%]
   logique métier, hooks, utils, composants
```

### Localisation des tests

```
packages/<pkg>/src/__tests__/          ← Tests unitaires du package
apps/<app>/src/__tests__/              ← Tests unitaires de l'app
apps/<app>/src/app/api/__tests__/      ← Tests d'intégration API
apps/<app>/e2e/                        ← Tests E2E Playwright
packages/db/tests/                     ← Tests pgTAP (RLS, fonctions SQL)
```

### Convention de nommage
```
<module>.<type>.test.ts
├── beneficiaire-service.unit.test.ts
├── beneficiaire-api.integration.test.ts
└── beneficiaire-crud.e2e.test.ts
```

---

## 2. Tests unitaires Vitest

### Configuration recommandée

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // ou 'jsdom' pour les composants React
    coverage: {
      provider: 'v8',
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
      exclude: ['src/types/**', 'src/**/*.d.ts', 'src/migrations/**'],
    },
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

### Pattern de test unitaire — Logique métier

```typescript
import { describe, it, expect } from 'vitest'
import { calculateBilanProgress } from '@/lib/bilan-utils'

describe('calculateBilanProgress', () => {
  // ✅ Cas nominal
  it('retourne 100% quand toutes les étapes sont complétées', () => {
    const bilan = { steps: [
      { id: '1', completed: true },
      { id: '2', completed: true },
      { id: '3', completed: true },
    ]}
    expect(calculateBilanProgress(bilan)).toBe(100)
  })

  // ✅ Cas intermédiaire
  it('retourne le pourcentage correct pour un bilan partiel', () => {
    const bilan = { steps: [
      { id: '1', completed: true },
      { id: '2', completed: false },
      { id: '3', completed: true },
    ]}
    expect(calculateBilanProgress(bilan)).toBeCloseTo(66.67, 1)
  })

  // ✅ Cas limite
  it('retourne 0% pour un bilan sans étapes', () => {
    expect(calculateBilanProgress({ steps: [] })).toBe(0)
  })

  // ✅ Cas d'erreur
  it('retourne 0% pour un bilan undefined', () => {
    expect(calculateBilanProgress(undefined as any)).toBe(0)
  })
})
```

### Pattern de test — Hook React

```typescript
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@unanima/core'

describe('useDebounce', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('retourne la valeur initiale immédiatement', () => {
    const { result } = renderHook(() => useDebounce('hello', 300))
    expect(result.current).toBe('hello')
  })

  it('retourne la nouvelle valeur après le délai', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'hello' } }
    )

    rerender({ value: 'world' })
    expect(result.current).toBe('hello') // Pas encore changé

    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current).toBe('world') // Changé après le délai
  })
})
```

### Pattern de test — Composant React

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { KPICard } from '@unanima/dashboard'

describe('KPICard', () => {
  const defaultProps = {
    title: 'Bilans actifs',
    value: 42,
    trend: { value: 12, direction: 'up' as const },
  }

  it('affiche le titre et la valeur', () => {
    render(<KPICard {...defaultProps} />)
    expect(screen.getByText('Bilans actifs')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('affiche la tendance avec la bonne couleur', () => {
    render(<KPICard {...defaultProps} />)
    const trend = screen.getByText('+12%')
    expect(trend).toHaveClass('text-green') // tendance positive = vert
  })

  it('gère l'état de chargement', () => {
    render(<KPICard {...defaultProps} loading />)
    expect(screen.getByRole('status')).toBeInTheDocument() // skeleton
    expect(screen.queryByText('42')).not.toBeInTheDocument()
  })
})
```

---

## 3. Tests d'intégration API

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('GET /api/beneficiaires', () => {
  let authToken: string

  beforeAll(async () => {
    // Setup : créer un utilisateur de test et obtenir un token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await supabase.auth.admin.createUser({
      email: 'test-consultant@test.local',
      password: 'test-password-123',
      user_metadata: {},
    })
    // ... login et récupération du token
  })

  it('retourne la liste paginée des bénéficiaires', async () => {
    const response = await fetch('http://localhost:3000/api/beneficiaires?page=1&limit=10', {
      headers: { Authorization: `Bearer ${authToken}` },
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toBeInstanceOf(Array)
    expect(body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      hasNext: expect.any(Boolean),
    })
  })

  it('retourne 401 sans token', async () => {
    const response = await fetch('http://localhost:3000/api/beneficiaires')
    expect(response.status).toBe(401)
  })

  it('retourne 400 pour des paramètres invalides', async () => {
    const response = await fetch('http://localhost:3000/api/beneficiaires?page=-1', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    expect(response.status).toBe(400)
  })
})
```

---

## 4. Tests E2E Playwright

```typescript
// e2e/login.e2e.test.ts
import { test, expect } from '@playwright/test'

test.describe('Authentification', () => {
  test('un consultant peut se connecter et voir le dashboard', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'consultant@test.local')
    await page.fill('[name="password"]', 'test-password-123')
    await page.click('button[type="submit"]')

    // Vérifier la redirection vers le dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: /Tableau de bord/i })).toBeVisible()
  })

  test('un utilisateur non autorisé est redirigé vers /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })
})
```

---

## 5. Factories et fixtures

```typescript
// tests/factories/beneficiaire.factory.ts
import { faker } from '@faker-js/faker/locale/fr'
import type { BeneficiaireInsert } from '@/types/entities'

export function buildBeneficiaire(
  overrides: Partial<BeneficiaireInsert> = {}
): BeneficiaireInsert {
  return {
    email: faker.internet.email(),
    fullName: faker.person.fullName(),
    phone: faker.phone.number('+33 6 ## ## ## ##'),
    status: 'active',
    ...overrides,
  }
}

// Usage dans les tests
const beneficiaire = buildBeneficiaire({ status: 'archived' })
```

---

## 6. Mocks et stubs — Bonnes pratiques

```typescript
// ✅ Mock explicite et minimal
vi.mock('@unanima/db', () => ({
  createClient: () => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
  }),
}))

// ❌ Éviter : mock trop large qui masque les bugs
vi.mock('@unanima/db') // Mock automatique complet = dangereux
```

### Règles de mocking
- Mocker les **frontières** (BDD, API externes, email), pas la logique interne
- Préférer les **stubs in-memory** aux mocks quand possible
- Vérifier que le mock est **réaliste** (mêmes types, mêmes erreurs possibles)
- Un test avec plus de 3 mocks est probablement un test d'intégration déguisé

---

## 7. Checklist qualité des tests

- [ ] Chaque test vérifie **un seul comportement**
- [ ] Le nom du test décrit le comportement attendu en français
- [ ] Les 4 cas sont couverts : nominal, limite, erreur, async
- [ ] Pas de dépendance entre les tests (ordre d'exécution indifférent)
- [ ] Les données de test sont créées par des factories (pas de données en dur)
- [ ] Les mocks sont minimaux et réalistes
- [ ] Le test reste vert après un refactoring interne

---

## Références complémentaires

- **`references/vitest-patterns.md`** — Patterns avancés Vitest (parameterized, snapshot, benchmark)
- **`references/playwright-patterns.md`** — Patterns E2E Playwright (POM, fixtures, parallel)
- **`references/testing-supabase.md`** — Stratégie de tests avec Supabase (pgTAP, fixtures, seed)
