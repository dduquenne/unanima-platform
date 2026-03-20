import { test as base, type Page } from '@playwright/test'

/** Test credentials – must match seeded users in the test Supabase project. */
export const TEST_USERS = {
  responsable_sav: {
    email: process.env.E2E_RESPONSABLE_EMAIL ?? 'responsable@test.omega.local',
    password: process.env.E2E_RESPONSABLE_PASSWORD ?? 'Test1234!',
  },
  technicien: {
    email: process.env.E2E_TECHNICIEN_EMAIL ?? 'technicien@test.omega.local',
    password: process.env.E2E_TECHNICIEN_PASSWORD ?? 'Test1234!',
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? 'admin@test.omega.local',
    password: process.env.E2E_ADMIN_PASSWORD ?? 'Test1234!',
  },
} as const

/** Helper: fill in the login form and submit. */
async function loginAs(
  page: Page,
  role: keyof typeof TEST_USERS,
) {
  const { email, password } = TEST_USERS[role]

  await page.goto('/login')
  await page.getByLabel('Adresse e-mail').fill(email)
  await page.getByLabel('Mot de passe').fill(password)
  await page.getByRole('button', { name: 'Se connecter' }).click()

  await page.waitForURL('**/dashboard', { timeout: 15_000 })
}

/**
 * Extended test fixtures providing pre-authenticated pages.
 */
export const test = base.extend<{
  responsablePage: Page
  technicienPage: Page
}>({
  responsablePage: async ({ page }, use) => {
    await loginAs(page, 'responsable_sav')
    await use(page)
  },
  technicienPage: async ({ page }, use) => {
    await loginAs(page, 'technicien')
    await use(page)
  },
})

export { expect } from '@playwright/test'
