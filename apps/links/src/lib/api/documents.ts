import { fetchOne, fetchMany, insertOne, deleteOne, logAudit } from '@unanima/db'
import type { DbResult, DbListResult, FetchManyOptions } from '@unanima/db'
import type { Document } from '../types'
import { createDocumentSchema } from '../types'
import type { CreateDocumentInput } from '../types'

const TABLE = 'documents'

export async function getDocuments(
  options?: FetchManyOptions,
): Promise<DbListResult<Document>> {
  return fetchMany<Document>(TABLE, options)
}

export async function getDocument(id: string): Promise<DbResult<Document>> {
  return fetchOne<Document>(TABLE, id)
}

export async function createDocument(
  data: CreateDocumentInput,
  userId: string,
): Promise<DbResult<Document>> {
  const parsed = createDocumentSchema.parse(data)
  const result = await insertOne<Document>(TABLE, parsed)
  if (result.data) {
    await logAudit(userId, 'create', TABLE, result.data.id)
  }
  return result
}

export async function deleteDocument(
  id: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const result = await deleteOne(TABLE, id)
  if (!result.error) {
    await logAudit(userId, 'delete', TABLE, id)
  }
  return result
}
