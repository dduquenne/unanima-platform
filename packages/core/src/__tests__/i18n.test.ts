import { describe, it, expect } from 'vitest'
import { fr, type Labels } from '../i18n/index'

describe('fr labels', () => {
  it('has all required string keys', () => {
    const stringKeys: (keyof Labels)[] = [
      'loading', 'close', 'search', 'searchPlaceholder', 'clearSearch',
      'noData', 'previous', 'next', 'sortAscending', 'sortDescending',
      'required', 'showPassword', 'hidePassword', 'retry', 'error',
      'unauthorized', 'backToHome', 'login', 'loginAction', 'email',
      'password', 'forgotPassword', 'resetPassword', 'resetPasswordSuccess',
      'cookieMessage', 'cookieAccept', 'cookieReject',
    ]

    for (const key of stringKeys) {
      expect(typeof fr[key]).toBe('string')
      expect((fr[key] as string).length).toBeGreaterThan(0)
    }
  })

  it('has a working pageOf function', () => {
    expect(fr.pageOf(1, 5)).toBe('Page 1 sur 5')
    expect(fr.pageOf(3, 10)).toBe('Page 3 sur 10')
  })

  it('labels are in French', () => {
    expect(fr.loading).toBe('Chargement')
    expect(fr.close).toBe('Fermer')
    expect(fr.login).toBe('Connexion')
  })
})
