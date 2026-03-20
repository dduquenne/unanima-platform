import { test as base, type Page } from '@playwright/test'

/** Test credentials – must match seeded users in the test Supabase project. */
export const TEST_USERS = {
  coordonnateur: {
    email: process.env.E2E_COORDONNATEUR_EMAIL ?? 'coordonnateur@test.creai.local',
    password: process.env.E2E_COORDONNATEUR_PASSWORD ?? 'Test1234!',
  },
  professionnel: {
    email: process.env.E2E_PROFESSIONNEL_EMAIL ?? 'professionnel@test.creai.local',
    password: process.env.E2E_PROFESSIONNEL_PASSWORD ?? 'Test1234!',
  },
  admin_creai: {
    email: process.env.E2E_ADMIN_EMAIL ?? 'admin@test.creai.local',
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
  coordonnateurPage: Page
  professionnelPage: Page
}>({
  coordonnateurPage: async ({ page }, use) => {
    await loginAs(page, 'coordonnateur')
    await use(page)
  },
  professionnelPage: async ({ page }, use) => {
    await loginAs(page, 'professionnel')
    await use(page)
  },
})

export { expect } from '@playwright/test'
