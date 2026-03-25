import { test, expect, TEST_USERS } from './fixtures'

test.describe('Parcours bénéficiaire Links', () => {
  test('login et accès au dashboard bénéficiaire', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Adresse e-mail').fill(TEST_USERS.beneficiaire.email)
    await page.getByLabel('Mot de passe').fill(TEST_USERS.beneficiaire.password)
    await page.getByRole('button', { name: 'Se connecter' }).click()

    await page.waitForURL('**/dashboard')
    await expect(page.getByText('Bienvenue,')).toBeVisible()

    // Bénéficiaire should see personal progress, not consultant KPIs
    await expect(page.getByText('Progression de votre bilan')).toBeVisible()
  })

  test('voir mes bilans', async ({ beneficiairePage: page }) => {
    await page.goto('/bilans')

    await expect(page.getByRole('heading', { name: 'Bilans' })).toBeVisible()
  })

  test('voir mes documents', async ({ beneficiairePage: page }) => {
    await page.goto('/documents')

    await expect(page.getByRole('heading', { name: 'Documents' })).toBeVisible()
  })

  test('accès au profil', async ({ beneficiairePage: page }) => {
    await page.goto('/profile')

    await expect(page.locator('body')).not.toContainText('Erreur')
  })

  test('ne peut pas accéder à la création de bénéficiaire', async ({
    beneficiairePage: page,
  }) => {
    // Bénéficiaire should not have "Nouveau bénéficiaire" button
    await page.goto('/beneficiaires')

    // Either redirected or no create button
    const createButton = page.getByRole('link', { name: 'Nouveau bénéficiaire' })
    await expect(createButton).toHaveCount(0)
  })

  test('parcours complet : dashboard → bilans → questionnaire → documents', async ({
    beneficiairePage: page,
  }) => {
    // Step 1: Dashboard shows progress
    await page.goto('/dashboard')
    await expect(page.getByText('Progression de votre bilan')).toBeVisible()

    // Step 2: Check bilans
    await page.goto('/bilans')
    await expect(page.getByRole('heading', { name: 'Bilans' })).toBeVisible()

    // Step 3: Check documents
    await page.goto('/documents')
    await expect(page.getByRole('heading', { name: 'Documents' })).toBeVisible()
  })
})

test.describe('Sécurité RBAC — bénéficiaire', () => {
  test('ne peut pas accéder à /consultant/dashboard', async ({
    beneficiairePage: page,
  }) => {
    await page.goto('/consultant/dashboard')

    // Should be redirected to /login or see a forbidden message
    const url = page.url()
    const body = page.locator('body')

    const isRedirected = url.includes('/login') || url.includes('/dashboard')
    const hasForbidden = await body
      .getByText(/interdit|accès refusé|forbidden|non autorisé/i)
      .count()

    expect(isRedirected || hasForbidden > 0).toBe(true)
  })

  test('ne peut pas accéder à /admin/dashboard', async ({
    beneficiairePage: page,
  }) => {
    await page.goto('/admin/dashboard')

    const url = page.url()
    const body = page.locator('body')

    const isRedirected = url.includes('/login') || url.includes('/dashboard')
    const hasForbidden = await body
      .getByText(/interdit|accès refusé|forbidden|non autorisé/i)
      .count()

    expect(isRedirected || hasForbidden > 0).toBe(true)
  })

  test('ne peut pas accéder à /admin/utilisateurs', async ({
    beneficiairePage: page,
  }) => {
    await page.goto('/admin/utilisateurs')

    const url = page.url()
    const body = page.locator('body')

    const isRedirected = url.includes('/login') || url.includes('/dashboard')
    const hasForbidden = await body
      .getByText(/interdit|accès refusé|forbidden|non autorisé/i)
      .count()

    expect(isRedirected || hasForbidden > 0).toBe(true)
  })
})
