import { describe, it, expect } from 'vitest'
import { validateTableNames } from '../api/validate-tables'

describe('validateTableNames', () => {
  const allowedTables = ['beneficiaires', 'bilans', 'responses', 'documents']

  it('accepts valid tables from the allowed list', () => {
    expect(() =>
      validateTableNames(['beneficiaires', 'bilans'], allowedTables)
    ).not.toThrow()
  })

  it('accepts an empty table list', () => {
    expect(() => validateTableNames([], allowedTables)).not.toThrow()
  })

  it('rejects tables not in the allowed list', () => {
    expect(() =>
      validateTableNames(['auth_users'], allowedTables)
    ).toThrow('Table "auth_users" is not in the allowed list')
  })

  it('rejects SQL injection attempts with special characters', () => {
    expect(() =>
      validateTableNames(['profiles; DROP TABLE users'], allowedTables)
    ).toThrow('Invalid table name')
  })

  it('rejects table names starting with uppercase', () => {
    expect(() =>
      validateTableNames(['Profiles'], allowedTables)
    ).toThrow('Invalid table name')
  })

  it('rejects table names with dots (schema traversal)', () => {
    expect(() =>
      validateTableNames(['auth.users'], allowedTables)
    ).toThrow('Invalid table name')
  })

  it('rejects table names starting with numbers', () => {
    expect(() =>
      validateTableNames(['1_table'], allowedTables)
    ).toThrow('Invalid table name')
  })

  it('rejects empty string table names', () => {
    expect(() =>
      validateTableNames([''], allowedTables)
    ).toThrow('Invalid table name')
  })

  it('rejects table names exceeding 63 chars', () => {
    const longName = 'a' + '_'.repeat(62) + 'b'
    expect(() =>
      validateTableNames([longName], allowedTables)
    ).toThrow('Invalid table name')
  })

  it('validates all tables and stops at first invalid one', () => {
    expect(() =>
      validateTableNames(['beneficiaires', 'EVIL_TABLE'], allowedTables)
    ).toThrow('Invalid table name')
  })
})
