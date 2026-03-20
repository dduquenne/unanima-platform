import { fetchOne, fetchMany, insertOne, deleteOne, logAudit } from '@unanima/db'
import type { DbResult, DbListResult, FetchManyOptions } from '@unanima/db'
import type { Affectation } from '../types'
import { createAffectationSchema } from '../types'
import type { CreateAffectationInput } from '../types'

const TABLE = 'affectations'

export async function getAffectations(
  options?: FetchManyOptions,
): Promise<DbListResult<Affectation>> {
  return fetchMany<Affectation>(TABLE, options)
}

export async function getAffectation(id: string): Promise<DbResult<Affectation>> {
  return fetchOne<Affectation>(TABLE, id)
}

export async function createAffectation(
  data: CreateAffectationInput,
  userId: string,
): Promise<DbResult<Affectation>> {
  const parsed = createAffectationSchema.parse(data)
  const result = await insertOne<Affectation>(TABLE, parsed)
  if (result.data) {
    await logAudit(userId, 'create', TABLE, result.data.id)
  }
  return result
}

export async function deleteAffectation(
  id: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const result = await deleteOne(TABLE, id)
  if (!result.error) {
    await logAudit(userId, 'delete', TABLE, id)
  }
  return result
}
