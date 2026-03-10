import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const REQUIRED_CSS_VARIABLES = [
  // Couleurs principales
  '--color-primary',
  '--color-primary-light',
  '--color-primary-dark',
  '--color-secondary',
  '--color-secondary-light',
  '--color-secondary-dark',
  '--color-accent',
  '--color-accent-light',

  // Couleurs semantiques
  '--color-success',
  '--color-success-light',
  '--color-warning',
  '--color-warning-light',
  '--color-danger',
  '--color-danger-light',
  '--color-info',
  '--color-info-light',

  // Surfaces
  '--color-background',
  '--color-surface',
  '--color-surface-hover',
  '--color-surface-active',
  '--color-muted',

  // Texte
  '--color-text',
  '--color-text-secondary',
  '--color-text-muted',
  '--color-text-inverse',

  // Bordures
  '--color-border',
  '--color-border-light',
  '--color-border-focus',

  // Typographie
  '--font-family',
  '--font-family-heading',

  // Rayons
  '--radius-sm',
  '--radius-md',
  '--radius-lg',
  '--radius-xl',
  '--radius-full',

  // Ombres
  '--shadow-sm',
  '--shadow-md',
  '--shadow-lg',
  '--shadow-xl',
  '--shadow-glow',

  // Transitions
  '--transition-fast',
  '--transition-base',
  '--transition-slow',

  // Gradients
  '--gradient-primary',
  '--gradient-surface',
]

const APPS = ['links', 'creai', 'omega']

describe('theme tokens', () => {
  APPS.forEach((app) => {
    describe(`${app} theme.css`, () => {
      const themePath = resolve(__dirname, `../../../../apps/${app}/src/styles/theme.css`)
      const content = readFileSync(themePath, 'utf-8')

      REQUIRED_CSS_VARIABLES.forEach((variable) => {
        it(`defines ${variable}`, () => {
          expect(content).toContain(variable)
        })
      })
    })
  })

  it('apps have distinct primary colors', () => {
    const themes = APPS.map((app) => {
      const path = resolve(__dirname, `../../../../apps/${app}/src/styles/theme.css`)
      return readFileSync(path, 'utf-8')
    })

    const primaryColors = themes.map((content) => {
      const match = content.match(/--color-primary:\s*([^;]+);/)
      return match?.[1]?.trim()
    })

    // Ensure all 3 apps have different primary colors
    const uniqueColors = new Set(primaryColors)
    expect(uniqueColors.size).toBe(3)
  })

  it('apps have distinct font families', () => {
    const themes = APPS.map((app) => {
      const path = resolve(__dirname, `../../../../apps/${app}/src/styles/theme.css`)
      return readFileSync(path, 'utf-8')
    })

    const fonts = themes.map((content) => {
      const match = content.match(/--font-family:\s*([^;]+);/)
      return match?.[1]?.trim()
    })

    const uniqueFonts = new Set(fonts)
    expect(uniqueFonts.size).toBe(3)
  })
})
