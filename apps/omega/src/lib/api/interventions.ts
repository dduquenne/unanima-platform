import { fetchOne, fetchMany, insertOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { DbResult, DbListResult, FetchManyOptions } from '@unanima/db'
import type { Intervention } from '../types'
import { createInterventionSchema, updateInterventionSchema } from '../types'
import type { CreateInterventionInput, UpdateInterventionInput } from '../types'

const TABLE = 'interventions'

export async function getInterventions(
  options?: FetchManyOptions,
): Promise<DbListResult<Intervention>> {
  return fetchMany<Intervention>(TABLE, options)
}

export async function getIntervention(id: string): Promise<DbResult<Intervention>> {
  return fetchOne<Intervention>(TABLE, id)
}

export async function createIntervention(
  data: CreateInterventionInput,
  userId: string,
): Promise<DbResult<Intervention>> {
  const parsed = createInterventionSchema.parse(data)
  const result = await insertOne<Intervention>(TABLE, parsed)
  if (result.data) {
    await logAudit(userId, 'create', TABLE, result.data.id)
  }
  return result
}

export async function updateIntervention(
  id: string,
  data: UpdateInterventionInput,
  userId: string,
): Promise<DbResult<Intervention>> {
  const parsed = updateInterventionSchema.parse(data)
  const result = await updateOne<Intervention>(TABLE, id, parsed)
  if (result.data) {
    await logAudit(userId, 'update', TABLE, id, parsed)
  }
  return result
}

export async function deleteIntervention(
  id: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const result = await deleteOne(TABLE, id)
  if (!result.error) {
    await logAudit(userId, 'delete', TABLE, id)
  }
  return result
}
