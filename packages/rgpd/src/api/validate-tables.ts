const TABLE_NAME_PATTERN = /^[a-z][a-z0-9_]{0,62}$/

export function validateTableNames(
  tables: string[],
  allowedTables: string[]
): void {
  const allowedSet = new Set(allowedTables)

  for (const table of tables) {
    if (!TABLE_NAME_PATTERN.test(table)) {
      throw new Error(
        `Invalid table name "${table}": must be lowercase alphanumeric with underscores`
      )
    }

    if (!allowedSet.has(table)) {
      throw new Error(
        `Table "${table}" is not in the allowed list. Allowed: ${allowedTables.join(', ')}`
      )
    }
  }
}
