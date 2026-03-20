import { fetchOne, fetchMany, insertOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { DbResult, DbListResult, FetchManyOptions } from '@unanima/db'
import type { Bilan } from '../types'
import { createBilanSchema, updateBilanSchema } from '../types'
import type { CreateBilanInput, UpdateBilanInput } from '../types'

const TABLE = 'bilans'

export async function getBilans(
  options?: FetchManyOptions,
): Promise<DbListResult<Bilan>> {
  return fetchMany<Bilan>(TABLE, options)
}

export async function getBilan(id: string): Promise<DbResult<Bilan>> {
  return fetchOne<Bilan>(TABLE, id)
}

export async function createBilan(
  data: CreateBilanInput,
  userId: string,
): Promise<DbResult<Bilan>> {
  const parsed = createBilanSchema.parse(data)
  const result = await insertOne<Bilan>(TABLE, parsed)
  if (result.data) {
    await logAudit(userId, 'create', TABLE, result.data.id)
  }
  return result
}

export async function updateBilan(
  id: string,
  data: UpdateBilanInput,
  userId: string,
): Promise<DbResult<Bilan>> {
  const parsed = updateBilanSchema.parse(data)
  const result = await updateOne<Bilan>(TABLE, id, parsed)
  if (result.data) {
    await logAudit(userId, 'update', TABLE, id, parsed)
  }
  return result
}

export async function deleteBilan(
  id: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const result = await deleteOne(TABLE, id)
  if (!result.error) {
    await logAudit(userId, 'delete', TABLE, id)
  }
  return result
}
