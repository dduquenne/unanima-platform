import { test, expect, TEST_USERS } from './fixtures'

test.describe('Parcours coordonnateur CREAI', () => {
  test('login et accès au dashboard', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByText('CREAI')).toBeVisible()

    await page.getByLabel('Adresse e-mail').fill(TEST_USERS.coordonnateur.email)
    await page.getByLabel('Mot de passe').fill(TEST_USERS.coordonnateur.password)
    await page.getByRole('button', { name: 'Se connecter' }).click()

    await page.waitForURL('**/dashboard')
    await expect(page.getByText('Bienvenue,')).toBeVisible()

    // Coordonnateur should see KPIs
    await expect(page.getByText('Établissements actifs')).toBeVisible()
    await expect(page.getByText('Diagnostics en cours')).toBeVisible()
  })

  test('navigation vers les établissements', async ({
    coordonnateurPage: page,
  }) => {
    await page.goto('/etablissements')

    await expect(
      page.getByRole('heading', { name: 'Établissements' }),
    ).toBeVisible()

    // Coordonnateur should see create button
    await expect(
      page.getByRole('link', { name: /nouvel/i }),
    ).toBeVisible()
  })

  test('création d\'un diagnostic (étape 1 - informations)', async ({
    coordonnateurPage: page,
  }) => {
    await page.goto('/diagnostics/nouveau')

    // Step 1: Informations générales should be visible
    await expect(page.getByText('Informations générales')).toBeVisible()
  })

  test('navigation vers les diagnostics', async ({
    coordonnateurPage: page,
  }) => {
    await page.goto('/diagnostics')

    await expect(
      page.getByRole('heading', { name: 'Diagnostics' }),
    ).toBeVisible()
  })

  test('navigation vers les indicateurs', async ({
    coordonnateurPage: page,
  }) => {
    await page.goto('/indicateurs')

    await expect(
      page.getByRole('heading', { name: 'Indicateurs' }),
    ).toBeVisible()
  })

  test('navigation vers les rapports', async ({
    coordonnateurPage: page,
  }) => {
    await page.goto('/rapports')

    await expect(
      page.getByRole('heading', { name: 'Rapports' }),
    ).toBeVisible()
  })

  test('parcours complet : dashboard → créer diagnostic → indicateurs → rapport', async ({
    coordonnateurPage: page,
  }) => {
    // Step 1: Dashboard KPIs
    await page.goto('/dashboard')
    await expect(page.getByText('Établissements actifs')).toBeVisible()

    // Step 2: Access diagnostic creation
    await page.goto('/diagnostics/nouveau')
    await expect(page.getByText('Informations générales')).toBeVisible()

    // Step 3: Check indicators
    await page.goto('/indicateurs')
    await expect(page.getByRole('heading', { name: 'Indicateurs' })).toBeVisible()

    // Step 4: Check reports
    await page.goto('/rapports')
    await expect(page.getByRole('heading', { name: 'Rapports' })).toBeVisible()
  })
})
