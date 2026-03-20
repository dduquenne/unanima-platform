import { fetchOne, fetchMany, insertOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { DbResult, DbListResult, FetchManyOptions } from '@unanima/db'
import type { Response } from '../types'
import { createResponseSchema, updateResponseSchema } from '../types'
import type { CreateResponseInput, UpdateResponseInput } from '../types'

const TABLE = 'responses'

export async function getResponses(
  options?: FetchManyOptions,
): Promise<DbListResult<Response>> {
  return fetchMany<Response>(TABLE, options)
}

export async function getResponse(id: string): Promise<DbResult<Response>> {
  return fetchOne<Response>(TABLE, id)
}

export async function createResponse(
  data: CreateResponseInput,
  userId: string,
): Promise<DbResult<Response>> {
  const parsed = createResponseSchema.parse(data)
  const result = await insertOne<Response>(TABLE, parsed)
  if (result.data) {
    await logAudit(userId, 'create', TABLE, result.data.id)
  }
  return result
}

export async function updateResponse(
  id: string,
  data: UpdateResponseInput,
  userId: string,
): Promise<DbResult<Response>> {
  const parsed = updateResponseSchema.parse(data)
  const result = await updateOne<Response>(TABLE, id, parsed)
  if (result.data) {
    await logAudit(userId, 'update', TABLE, id, parsed)
  }
  return result
}

export async function deleteResponse(
  id: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const result = await deleteOne(TABLE, id)
  if (!result.error) {
    await logAudit(userId, 'delete', TABLE, id)
  }
  return result
}
