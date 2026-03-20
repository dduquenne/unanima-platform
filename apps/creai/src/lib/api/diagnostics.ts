import { fetchOne, fetchMany, insertOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { DbResult, DbListResult, FetchManyOptions } from '@unanima/db'
import type { Diagnostic } from '../types'
import { createDiagnosticSchema, updateDiagnosticSchema } from '../types'
import type { CreateDiagnosticInput, UpdateDiagnosticInput } from '../types'

const TABLE = 'diagnostics'

export async function getDiagnostics(
  options?: FetchManyOptions,
): Promise<DbListResult<Diagnostic>> {
  return fetchMany<Diagnostic>(TABLE, options)
}

export async function getDiagnostic(id: string): Promise<DbResult<Diagnostic>> {
  return fetchOne<Diagnostic>(TABLE, id)
}

export async function createDiagnostic(
  data: CreateDiagnosticInput,
  userId: string,
): Promise<DbResult<Diagnostic>> {
  const parsed = createDiagnosticSchema.parse(data)
  const result = await insertOne<Diagnostic>(TABLE, parsed)
  if (result.data) {
    await logAudit(userId, 'create', TABLE, result.data.id)
  }
  return result
}

export async function updateDiagnostic(
  id: string,
  data: UpdateDiagnosticInput,
  userId: string,
): Promise<DbResult<Diagnostic>> {
  const parsed = updateDiagnosticSchema.parse(data)
  const result = await updateOne<Diagnostic>(TABLE, id, parsed)
  if (result.data) {
    await logAudit(userId, 'update', TABLE, id, parsed)
  }
  return result
}

export async function deleteDiagnostic(
  id: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const result = await deleteOne(TABLE, id)
  if (!result.error) {
    await logAudit(userId, 'delete', TABLE, id)
  }
  return result
}
