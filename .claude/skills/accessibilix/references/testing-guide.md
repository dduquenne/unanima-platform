# Accessibility Test Patterns — Accessibilix

## Tests axe-core avec Playwright

```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibilite — Dashboard', () => {
  test('page dashboard conforme WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/dashboard')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('formulaire de beneficiaire conforme', async ({ page }) => {
    await page.goto('/beneficiaires/new')

    const results = await new AxeBuilder({ page })
      .include('#beneficiaire-form')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('navigation clavier complete', async ({ page }) => {
    await page.goto('/dashboard')

    // Verifier le skip link
    await page.keyboard.press('Tab')
    const skipLink = page.getByText('Aller au contenu principal')
    await expect(skipLink).toBeFocused()

    // Verifier que tous les elements interactifs sont atteignables
    const interactiveElements = await page.$$('button, a, input, select, textarea, [tabindex="0"]')
    for (const el of interactiveElements) {
      const tabindex = await el.getAttribute('tabindex')
      expect(tabindex).not.toBe('-1')
    }
  })
})
```

## Tests de contraste

```typescript
test('contraste suffisant sur le theme Links', async ({ page }) => {
  await page.goto('/login')

  const results = await new AxeBuilder({ page })
    .withRules(['color-contrast'])
    .analyze()

  // Aucune violation de contraste
  expect(results.violations.filter(v => v.id === 'color-contrast')).toEqual([])
})
```

## Configuration CI

```yaml
# Projet Playwright dedie accessibilite
# playwright.config.ts
{
  projects: [
    { name: 'accessibility', testDir: './tests/a11y' }
  ]
}
```

## Audit Report Template

```markdown
## Rapport d'accessibilite — [App / Page]

**Date :** YYYY-MM-DD
**Standard :** WCAG 2.1 AA
**Score Lighthouse :** XX/100

### Resultats par critere

| Critere | Statut | Detail | Priorite |
|---------|--------|--------|----------|
| Navigation clavier | ✅/⚠️/❌ | [Description] | P1/P2/P3 |
| ... | | | |

### Non-conformites

| # | Page/Composant | Critere WCAG | Description | Correction proposee |
|---|---------------|--------------|-------------|---------------------|
| 1 | LoginForm | 1.3.1 | Input sans label | Ajouter htmlFor + id |
| ... | | | | |

### Recommandations
1. [Recommandation prioritaire]
2. [Recommandation secondaire]
```
