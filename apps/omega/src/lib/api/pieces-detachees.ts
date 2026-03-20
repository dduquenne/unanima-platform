import { fetchOne, fetchMany, insertOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { DbResult, DbListResult, FetchManyOptions } from '@unanima/db'
import type { PieceDetachee } from '../types'
import { createPieceDetacheeSchema, updatePieceDetacheeSchema } from '../types'
import type { CreatePieceDetacheeInput, UpdatePieceDetacheeInput } from '../types'

const TABLE = 'pieces_detachees'

export async function getPiecesDetachees(
  options?: FetchManyOptions,
): Promise<DbListResult<PieceDetachee>> {
  return fetchMany<PieceDetachee>(TABLE, options)
}

export async function getPieceDetachee(id: string): Promise<DbResult<PieceDetachee>> {
  return fetchOne<PieceDetachee>(TABLE, id)
}

export async function createPieceDetachee(
  data: CreatePieceDetacheeInput,
  userId: string,
): Promise<DbResult<PieceDetachee>> {
  const parsed = createPieceDetacheeSchema.parse(data)
  const result = await insertOne<PieceDetachee>(TABLE, parsed)
  if (result.data) {
    await logAudit(userId, 'create', TABLE, result.data.id)
  }
  return result
}

export async function updatePieceDetachee(
  id: string,
  data: UpdatePieceDetacheeInput,
  userId: string,
): Promise<DbResult<PieceDetachee>> {
  const parsed = updatePieceDetacheeSchema.parse(data)
  const result = await updateOne<PieceDetachee>(TABLE, id, parsed)
  if (result.data) {
    await logAudit(userId, 'update', TABLE, id, parsed)
  }
  return result
}

export async function deletePieceDetachee(
  id: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const result = await deleteOne(TABLE, id)
  if (!result.error) {
    await logAudit(userId, 'delete', TABLE, id)
  }
  return result
}
