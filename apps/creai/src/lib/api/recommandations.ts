import { fetchOne, fetchMany, insertOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { DbResult, DbListResult, FetchManyOptions } from '@unanima/db'
import type { Recommandation } from '../types'
import { createRecommandationSchema, updateRecommandationSchema } from '../types'
import type { CreateRecommandationInput, UpdateRecommandationInput } from '../types'

const TABLE = 'recommandations'

export async function getRecommandations(
  options?: FetchManyOptions,
): Promise<DbListResult<Recommandation>> {
  return fetchMany<Recommandation>(TABLE, options)
}

export async function getRecommandation(id: string): Promise<DbResult<Recommandation>> {
  return fetchOne<Recommandation>(TABLE, id)
}

export async function createRecommandation(
  data: CreateRecommandationInput,
  userId: string,
): Promise<DbResult<Recommandation>> {
  const parsed = createRecommandationSchema.parse(data)
  const result = await insertOne<Recommandation>(TABLE, parsed)
  if (result.data) {
    await logAudit(userId, 'create', TABLE, result.data.id)
  }
  return result
}

export async function updateRecommandation(
  id: string,
  data: UpdateRecommandationInput,
  userId: string,
): Promise<DbResult<Recommandation>> {
  const parsed = updateRecommandationSchema.parse(data)
  const result = await updateOne<Recommandation>(TABLE, id, parsed)
  if (result.data) {
    await logAudit(userId, 'update', TABLE, id, parsed)
  }
  return result
}

export async function deleteRecommandation(
  id: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const result = await deleteOne(TABLE, id)
  if (!result.error) {
    await logAudit(userId, 'delete', TABLE, id)
  }
  return result
}
