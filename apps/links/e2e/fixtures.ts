import { test as base, type Page } from '@playwright/test'

/** Test credentials – must match seeded users in the test Supabase project. */
export const TEST_USERS = {
  consultant: {
    email: process.env.E2E_CONSULTANT_EMAIL ?? 'consultant@test.links.local',
    password: process.env.E2E_CONSULTANT_PASSWORD ?? 'Test1234!',
  },
  beneficiaire: {
    email: process.env.E2E_BENEFICIAIRE_EMAIL ?? 'beneficiaire@test.links.local',
    password: process.env.E2E_BENEFICIAIRE_PASSWORD ?? 'Test1234!',
  },
  super_admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? 'admin@test.links.local',
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

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 15_000 })
}

/**
 * Extended test fixtures that provide a pre-authenticated page for each role.
 */
export const test = base.extend<{
  consultantPage: Page
  beneficiairePage: Page
}>({
  consultantPage: async ({ page }, use) => {
    await loginAs(page, 'consultant')
    await use(page)
  },
  beneficiairePage: async ({ page }, use) => {
    await loginAs(page, 'beneficiaire')
    await use(page)
  },
})

export { expect } from '@playwright/test'
