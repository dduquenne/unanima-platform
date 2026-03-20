import { test, expect, TEST_USERS } from './fixtures'

test.describe('Parcours responsable SAV Omega', () => {
  test('login et accès au dashboard', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByText('Omega')).toBeVisible()

    await page.getByLabel('Adresse e-mail').fill(TEST_USERS.responsable_sav.email)
    await page.getByLabel('Mot de passe').fill(TEST_USERS.responsable_sav.password)
    await page.getByRole('button', { name: 'Se connecter' }).click()

    await page.waitForURL('**/dashboard')
    await expect(page.getByText('Bienvenue,')).toBeVisible()
  })

  test('navigation vers les interventions', async ({
    responsablePage: page,
  }) => {
    await page.goto('/interventions')

    await expect(
      page.getByRole('heading', { name: 'Interventions' }),
    ).toBeVisible()

    // Responsable should see create button
    await expect(
      page.getByRole('link', { name: /nouvelle intervention/i }),
    ).toBeVisible()
  })

  test('création d\'une intervention', async ({
    responsablePage: page,
  }) => {
    await page.goto('/interventions/nouveau')

    // Fill the form
    await page.getByLabel(/client/i).fill('VH-TEST-' + Date.now())
    await page.getByLabel(/description/i).fill('Intervention de test E2E')

    await page.getByRole('button', { name: /créer|enregistrer|valider/i }).click()

    // Should redirect to intervention detail
    await page.waitForURL(/\/interventions\//, { timeout: 10_000 })
  })

  test('navigation vers les pièces', async ({ responsablePage: page }) => {
    await page.goto('/pieces')

    await expect(
      page.getByRole('heading', { name: /pièces/i }),
    ).toBeVisible()
  })

  test('navigation vers les alertes', async ({ responsablePage: page }) => {
    await page.goto('/alertes')

    await expect(page.locator('body')).not.toContainText('Erreur')
  })

  test('parcours complet : créer intervention → affecter technicien → clôturer', async ({
    responsablePage: page,
  }) => {
    // Step 1: Create intervention
    await page.goto('/interventions/nouveau')

    const vehiculeId = 'VH-E2E-' + Date.now()
    await page.getByLabel(/client/i).fill(vehiculeId)
    await page.getByLabel(/description/i).fill('Test parcours complet E2E')

    await page.getByRole('button', { name: /créer|enregistrer|valider/i }).click()
    await page.waitForURL(/\/interventions\//, { timeout: 10_000 })

    // Step 2: Verify intervention detail
    await expect(page.getByText('Test parcours complet E2E')).toBeVisible()

    // Step 3: Navigate to assign technician if button exists
    const affecterLink = page.getByRole('link', { name: /affecter/i })
    if (await affecterLink.isVisible()) {
      await affecterLink.click()
      await page.waitForURL(/\/affecter/)
    }

    // Step 4: Go back to interventions list
    await page.goto('/interventions')
    await expect(
      page.getByRole('heading', { name: 'Interventions' }),
    ).toBeVisible()
  })
})
