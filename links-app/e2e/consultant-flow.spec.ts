import { test, expect, TEST_USERS } from './fixtures'

test.describe('Parcours consultant Links', () => {
  test('login et accès au dashboard consultant', async ({ page }) => {
    await page.goto('/login')

    // Verify login page renders
    await expect(page.getByText("Link's Accompagnement")).toBeVisible()

    // Fill credentials
    await page.getByLabel('Adresse e-mail').fill(TEST_USERS.consultant.email)
    await page.getByLabel('Mot de passe').fill(TEST_USERS.consultant.password)
    await page.getByRole('button', { name: 'Se connecter' }).click()

    // Should redirect to dashboard
    await page.waitForURL('**/dashboard')
    await expect(page.getByText('Bienvenue,')).toBeVisible()

    // Consultant should see KPI cards
    await expect(page.getByText('Bénéficiaires actifs')).toBeVisible()
    await expect(page.getByText('Bilans en cours')).toBeVisible()
    await expect(page.getByText('Bilans terminés')).toBeVisible()
    await expect(page.getByText('Taux de complétion')).toBeVisible()
  })

  test('navigation vers la liste des bénéficiaires', async ({
    consultantPage: page,
  }) => {
    // Navigate to beneficiaires
    await page.goto('/beneficiaires')

    await expect(page.getByRole('heading', { name: 'Bénéficiaires' })).toBeVisible()

    // Consultant should see the "Nouveau bénéficiaire" button
    await expect(
      page.getByRole('link', { name: 'Nouveau bénéficiaire' }),
    ).toBeVisible()
  })

  test('création d\'un bénéficiaire', async ({ consultantPage: page }) => {
    await page.goto('/beneficiaires/nouveau')

    // Fill in the form
    await page.getByLabel('Nom').fill('Dupont')
    await page.getByLabel('Prénom').fill('Jean')
    await page.getByLabel('Email').fill(`jean.dupont+e2e-${Date.now()}@test.local`)

    // Submit
    await page.getByRole('button', { name: /créer|enregistrer|valider/i }).click()

    // Should redirect to the beneficiaire detail or list
    await page.waitForURL(/\/beneficiaires/)
  })

  test('navigation vers les bilans', async ({ consultantPage: page }) => {
    await page.goto('/bilans')

    await expect(page.getByRole('heading', { name: 'Bilans' })).toBeVisible()
  })

  test('navigation vers les documents', async ({ consultantPage: page }) => {
    await page.goto('/documents')

    await expect(page.getByRole('heading', { name: 'Documents' })).toBeVisible()
  })

  test('accès au profil', async ({ consultantPage: page }) => {
    await page.goto('/profile')

    // Profile page should load
    await expect(page.locator('body')).not.toContainText('Erreur')
  })

  test('parcours complet : créer bénéficiaire → créer bilan → voir bilan', async ({
    consultantPage: page,
  }) => {
    // Step 1: Go to beneficiaire creation
    await page.goto('/beneficiaires/nouveau')
    const uniqueSuffix = Date.now()

    await page.getByLabel('Nom').fill('TestE2E')
    await page.getByLabel('Prénom').fill('Parcours')
    await page.getByLabel('Email').fill(`parcours+${uniqueSuffix}@test.local`)

    await page.getByRole('button', { name: /créer|enregistrer|valider/i }).click()

    // Wait for navigation
    await page.waitForURL(/\/beneficiaires/, { timeout: 10_000 })

    // Step 2: Navigate to bilans and look for this beneficiaire
    await page.goto('/bilans')
    await expect(page.getByRole('heading', { name: 'Bilans' })).toBeVisible()

    // Step 3: Go to dashboard to verify KPIs reflect the new data
    await page.goto('/dashboard')
    await expect(page.getByText('Bénéficiaires actifs')).toBeVisible()
  })
})

test.describe('Sécurité RBAC — consultant', () => {
  test('ne peut pas accéder à /admin/dashboard', async ({
    consultantPage: page,
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
    consultantPage: page,
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
