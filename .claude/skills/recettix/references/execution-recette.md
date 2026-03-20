# Protocole d'exécution de recette TypeScript — Recettix

## Table des matières

1. [Pré-requis environnement](#1-pré-requis)
2. [Smoke test](#2-smoke-test)
3. [Tests unitaires Vitest](#3-tests-unitaires-vitest)
4. [Tests d'intégration](#4-tests-dintégration)
5. [Tests E2E Playwright](#5-tests-e2e-playwright)
6. [Tests de performance Lighthouse CI](#6-performance)
7. [Tests de sécurité](#7-sécurité)
8. [Tests d'accessibilité](#8-accessibilité)
9. [Rapport consolidé](#9-rapport)

---

## 1. Pré-requis

```bash
# Vérifier les versions
node --version   # >= 20
pnpm --version   # >= 9
npx playwright --version
npx vitest --version

# Installer les dépendances de test
pnpm install

# Variables d'environnement de recette
cp .env.example .env.test
# Renseigner : DATABASE_URL (recette), AUTH_SECRET, etc.
```

---

## 2. Smoke test (15 min)

```bash
# Démarrer l'application en mode test
pnpm build && pnpm start:test

# Vérifier les endpoints critiques
curl -f https://uat.[projet].fr/api/health
curl -f https://uat.[projet].fr/api/version

# Playwright smoke test
npx playwright test --project=smoke
```

**Critère de Go/No-Go** : tous les endpoints health retournent
200, la page d'accueil s'affiche.

---

## 3. Tests unitaires Vitest

```bash
# Lancer tous les tests unitaires avec couverture
pnpm vitest run --coverage

# Voir le rapport de couverture
open coverage/index.html

# Lancer uniquement un module
pnpm vitest run src/modules/auth --coverage

# Lancer en mode watch (développement)
pnpm vitest --watch

# Générer rapport JSON pour le PVR
pnpm vitest run --coverage --reporter=json --outputFile=reports/vitest-results.json
```

### Patterns recommandés (Vitest + TypeScript)

```typescript
// ✅ Test unitaire avec mocks typés
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createUserService } from '../userService'
import type { UserRepository } from '../userRepository'

describe('UserService', () => {
  let mockRepo: UserRepository

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      save: vi.fn(),
    }
  })

  it('devrait retourner une erreur si l\'utilisateur n\'existe pas', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)
    const service = createUserService(mockRepo)

    const result = await service.getUser('unknown-id')

    expect(result.success).toBe(false)
    expect(result.error).toBe('USER_NOT_FOUND')
  })
})
```

---

## 4. Tests d'intégration

```bash
# Tests d'intégration API (avec base de test)
DATABASE_URL=$TEST_DB_URL pnpm vitest run src/**/*.integration.spec.ts

# Réinitialiser la base entre les tests
pnpm db:test:reset && pnpm db:test:seed
```

### Pattern d'intégration API (Hono / Next.js API Routes)

```typescript
// ✅ Test d'intégration avec vrai Supabase de test
import { createClient } from '@supabase/supabase-js'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('POST /api/orders [integration]', () => {
  let supabase: ReturnType<typeof createClient>

  beforeAll(async () => {
    supabase = createClient(
      process.env.SUPABASE_TEST_URL!,
      process.env.SUPABASE_TEST_SERVICE_KEY!
    )
    await supabase.rpc('reset_test_data')
  })

  it('devrait créer une commande et déclencher les RLS', async () => {
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${TEST_USER_TOKEN}` },
      body: JSON.stringify({ items: [{ id: 'prod-1', qty: 2 }] })
    })
    expect(response.status).toBe(201)
    const { data } = await response.json()
    expect(data.orderId).toBeDefined()
  })
})
```

---

## 5. Tests E2E Playwright

```bash
# Lancer tous les tests E2E
npx playwright test

# Avec rapport HTML
npx playwright test --reporter=html
npx playwright show-report

# Générer rapport JSON pour PVR
npx playwright test --reporter=json > reports/playwright-results.json

# Debug interactif
npx playwright test --debug --headed

# Tests d'un seul parcours
npx playwright test e2e/auth/ --headed
```

### Configuration Playwright recommandée

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'reports/playwright-results.json' }]
  ],
  projects: [
    { name: 'smoke', testMatch: '**/*.smoke.spec.ts',
      use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
    { name: 'accessibility',
      testMatch: '**/*.a11y.spec.ts',
      use: { ...devices['Desktop Chrome'] } },
  ],
  use: {
    baseURL: process.env.UAT_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
})
```

---

## 6. Performance (Lighthouse CI)

```bash
# Installer Lighthouse CI
npm install -g @lhci/cli

# Lancer l'audit
lhci autorun

# Rapport JSON
lhci collect --url=https://uat.[projet].fr
lhci assert
```

### Configuration `.lighthouserc.js`

```javascript
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: [
        'https://uat.[projet].fr/',
        'https://uat.[projet].fr/dashboard',
        // Pages critiques
      ],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
      },
    },
  },
}
```

---

## 7. Sécurité

```bash
# Audit dépendances npm
npm audit --audit-level=high
# ou
pnpm audit

# Secrets dans le code source
npx gitleaks detect --source . --verbose

# Scan OWASP ZAP (Docker)
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://uat.[projet].fr \
  -r zap-report.html

# Vérification headers HTTP
npx security-headers https://uat.[projet].fr
```

### Checklist manuelle sécurité

- [ ] Toutes les routes API nécessitent une authentification
  (hors routes publiques explicites)
- [ ] RLS Supabase activée et testée (tenter accès cross-tenant)
- [ ] Validation Zod sur tous les corps de requêtes POST/PUT/PATCH
- [ ] Pas de données sensibles dans les logs
- [ ] CORS configuré strictement (pas de `*` en production)
- [ ] Rate limiting sur les endpoints publics
- [ ] Tokens JWT : expiration courte (15 min access, refresh rotation)
- [ ] Upload fichiers : validation MIME + taille max + scan antivirus

---

## 8. Accessibilité

```bash
# Tests axe-core via Playwright
npx playwright test --project=accessibility

# Rapport accessibilité
npx playwright test --project=accessibility --reporter=html
```

### Pattern test accessibilité Playwright + axe

```typescript
// e2e/accueil.a11y.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibilité - Page d\'accueil', () => {
  test('aucune violation WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('navigation clavier complète possible', async ({ page }) => {
    await page.goto('/')
    // Tab sur tous les éléments interactifs
    await page.keyboard.press('Tab')
    const focusedEl = await page.evaluate(
      () => document.activeElement?.tagName
    )
    expect(focusedEl).not.toBe('BODY')
  })
})
```

---

## 9. Rapport consolidé

```bash
# Générer rapport de synthèse (script Recettix)
node scripts/recettix-report.mjs \
  --vitest reports/vitest-results.json \
  --playwright reports/playwright-results.json \
  --lighthouse reports/lhci/ \
  --output reports/recettix-synthese-YYYY-MM-DD.json
```

Le rapport synthèse alimente automatiquement le PVR (section 2).
