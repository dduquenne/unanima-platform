import { fetchOne, fetchMany, insertOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { DbResult, DbListResult, FetchManyOptions } from '@unanima/db'
import type { Rapport } from '../types'
import { createRapportSchema, updateRapportSchema } from '../types'
import type { CreateRapportInput, UpdateRapportInput } from '../types'

const TABLE = 'rapports'

export async function getRapports(
  options?: FetchManyOptions,
): Promise<DbListResult<Rapport>> {
  return fetchMany<Rapport>(TABLE, options)
}

export async function getRapport(id: string): Promise<DbResult<Rapport>> {
  return fetchOne<Rapport>(TABLE, id)
}

export async function createRapport(
  data: CreateRapportInput,
  userId: string,
): Promise<DbResult<Rapport>> {
  const parsed = createRapportSchema.parse(data)
  const result = await insertOne<Rapport>(TABLE, parsed)
  if (result.data) {
    await logAudit(userId, 'create', TABLE, result.data.id)
  }
  return result
}

export async function updateRapport(
  id: string,
  data: UpdateRapportInput,
  userId: string,
): Promise<DbResult<Rapport>> {
  const parsed = updateRapportSchema.parse(data)
  const result = await updateOne<Rapport>(TABLE, id, parsed)
  if (result.data) {
    await logAudit(userId, 'update', TABLE, id, parsed)
  }
  return result
}

export async function deleteRapport(
  id: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const result = await deleteOne(TABLE, id)
  if (!result.error) {
    await logAudit(userId, 'delete', TABLE, id)
  }
  return result
}
