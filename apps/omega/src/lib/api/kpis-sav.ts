import { fetchOne, fetchMany, insertOne, updateOne, logAudit } from '@unanima/db'
import type { DbResult, DbListResult, FetchManyOptions } from '@unanima/db'
import type { KpiSav } from '../types'
import { createKpiSavSchema, updateKpiSavSchema } from '../types'
import type { CreateKpiSavInput, UpdateKpiSavInput } from '../types'

const TABLE = 'kpis_sav'

export async function getKpisSav(
  options?: FetchManyOptions,
): Promise<DbListResult<KpiSav>> {
  return fetchMany<KpiSav>(TABLE, options)
}

export async function getKpiSav(id: string): Promise<DbResult<KpiSav>> {
  return fetchOne<KpiSav>(TABLE, id)
}

export async function createKpiSav(
  data: CreateKpiSavInput,
  userId: string,
): Promise<DbResult<KpiSav>> {
  const parsed = createKpiSavSchema.parse(data)
  const result = await insertOne<KpiSav>(TABLE, parsed)
  if (result.data) {
    await logAudit(userId, 'create', TABLE, result.data.id)
  }
  return result
}

export async function updateKpiSav(
  id: string,
  data: UpdateKpiSavInput,
  userId: string,
): Promise<DbResult<KpiSav>> {
  const parsed = updateKpiSavSchema.parse(data)
  const result = await updateOne<KpiSav>(TABLE, id, parsed)
  if (result.data) {
    await logAudit(userId, 'update', TABLE, id, parsed)
  }
  return result
}
