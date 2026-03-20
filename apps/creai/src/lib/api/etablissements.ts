import { fetchOne, fetchMany, insertOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { DbResult, DbListResult, FetchManyOptions } from '@unanima/db'
import type { Etablissement } from '../types'
import { createEtablissementSchema, updateEtablissementSchema } from '../types'
import type { CreateEtablissementInput, UpdateEtablissementInput } from '../types'

const TABLE = 'etablissements'

export async function getEtablissements(
  options?: FetchManyOptions,
): Promise<DbListResult<Etablissement>> {
  return fetchMany<Etablissement>(TABLE, options)
}

export async function getEtablissement(id: string): Promise<DbResult<Etablissement>> {
  return fetchOne<Etablissement>(TABLE, id)
}

export async function createEtablissement(
  data: CreateEtablissementInput,
  userId: string,
): Promise<DbResult<Etablissement>> {
  const parsed = createEtablissementSchema.parse(data)
  const result = await insertOne<Etablissement>(TABLE, parsed)
  if (result.data) {
    await logAudit(userId, 'create', TABLE, result.data.id)
  }
  return result
}

export async function updateEtablissement(
  id: string,
  data: UpdateEtablissementInput,
  userId: string,
): Promise<DbResult<Etablissement>> {
  const parsed = updateEtablissementSchema.parse(data)
  const result = await updateOne<Etablissement>(TABLE, id, parsed)
  if (result.data) {
    await logAudit(userId, 'update', TABLE, id, parsed)
  }
  return result
}

export async function deleteEtablissement(
  id: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const result = await deleteOne(TABLE, id)
  if (!result.error) {
    await logAudit(userId, 'delete', TABLE, id)
  }
  return result
}
