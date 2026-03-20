import { fetchOne, fetchMany, insertOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { DbResult, DbListResult, FetchManyOptions } from '@unanima/db'
import type { Indicateur } from '../types'
import { createIndicateurSchema, updateIndicateurSchema } from '../types'
import type { CreateIndicateurInput, UpdateIndicateurInput } from '../types'

const TABLE = 'indicateurs'

export async function getIndicateurs(
  options?: FetchManyOptions,
): Promise<DbListResult<Indicateur>> {
  return fetchMany<Indicateur>(TABLE, options)
}

export async function getIndicateur(id: string): Promise<DbResult<Indicateur>> {
  return fetchOne<Indicateur>(TABLE, id)
}

export async function createIndicateur(
  data: CreateIndicateurInput,
  userId: string,
): Promise<DbResult<Indicateur>> {
  const parsed = createIndicateurSchema.parse(data)
  const result = await insertOne<Indicateur>(TABLE, parsed)
  if (result.data) {
    await logAudit(userId, 'create', TABLE, result.data.id)
  }
  return result
}

export async function updateIndicateur(
  id: string,
  data: UpdateIndicateurInput,
  userId: string,
): Promise<DbResult<Indicateur>> {
  const parsed = updateIndicateurSchema.parse(data)
  const result = await updateOne<Indicateur>(TABLE, id, parsed)
  if (result.data) {
    await logAudit(userId, 'update', TABLE, id, parsed)
  }
  return result
}

export async function deleteIndicateur(
  id: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const result = await deleteOne(TABLE, id)
  if (!result.error) {
    await logAudit(userId, 'delete', TABLE, id)
  }
  return result
}
