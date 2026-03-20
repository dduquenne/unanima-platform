import { fetchOne, fetchMany, insertOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { DbResult, DbListResult, FetchManyOptions } from '@unanima/db'
import type { Beneficiaire } from '../types'
import { createBeneficiaireSchema, updateBeneficiaireSchema } from '../types'
import type { CreateBeneficiaireInput, UpdateBeneficiaireInput } from '../types'

const TABLE = 'beneficiaires'

export async function getBeneficiaires(
  options?: FetchManyOptions,
): Promise<DbListResult<Beneficiaire>> {
  return fetchMany<Beneficiaire>(TABLE, options)
}

export async function getBeneficiaire(id: string): Promise<DbResult<Beneficiaire>> {
  return fetchOne<Beneficiaire>(TABLE, id)
}

export async function createBeneficiaire(
  data: CreateBeneficiaireInput,
  userId: string,
): Promise<DbResult<Beneficiaire>> {
  const parsed = createBeneficiaireSchema.parse(data)
  const result = await insertOne<Beneficiaire>(TABLE, parsed)
  if (result.data) {
    await logAudit(userId, 'create', TABLE, result.data.id)
  }
  return result
}

export async function updateBeneficiaire(
  id: string,
  data: UpdateBeneficiaireInput,
  userId: string,
): Promise<DbResult<Beneficiaire>> {
  const parsed = updateBeneficiaireSchema.parse(data)
  const result = await updateOne<Beneficiaire>(TABLE, id, parsed)
  if (result.data) {
    await logAudit(userId, 'update', TABLE, id, parsed)
  }
  return result
}

export async function deleteBeneficiaire(
  id: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const result = await deleteOne(TABLE, id)
  if (!result.error) {
    await logAudit(userId, 'delete', TABLE, id)
  }
  return result
}
