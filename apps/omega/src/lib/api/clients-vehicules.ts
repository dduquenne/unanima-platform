import { fetchOne, fetchMany, insertOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { DbResult, DbListResult, FetchManyOptions } from '@unanima/db'
import type { ClientVehicule } from '../types'
import { createClientVehiculeSchema, updateClientVehiculeSchema } from '../types'
import type { CreateClientVehiculeInput, UpdateClientVehiculeInput } from '../types'

const TABLE = 'clients_vehicules'

export async function getClientsVehicules(
  options?: FetchManyOptions,
): Promise<DbListResult<ClientVehicule>> {
  return fetchMany<ClientVehicule>(TABLE, options)
}

export async function getClientVehicule(id: string): Promise<DbResult<ClientVehicule>> {
  return fetchOne<ClientVehicule>(TABLE, id)
}

export async function createClientVehicule(
  data: CreateClientVehiculeInput,
  userId: string,
): Promise<DbResult<ClientVehicule>> {
  const parsed = createClientVehiculeSchema.parse(data)
  const result = await insertOne<ClientVehicule>(TABLE, parsed)
  if (result.data) {
    await logAudit(userId, 'create', TABLE, result.data.id)
  }
  return result
}

export async function updateClientVehicule(
  id: string,
  data: UpdateClientVehiculeInput,
  userId: string,
): Promise<DbResult<ClientVehicule>> {
  const parsed = updateClientVehiculeSchema.parse(data)
  const result = await updateOne<ClientVehicule>(TABLE, id, parsed)
  if (result.data) {
    await logAudit(userId, 'update', TABLE, id, parsed)
  }
  return result
}

export async function deleteClientVehicule(
  id: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const result = await deleteOne(TABLE, id)
  if (!result.error) {
    await logAudit(userId, 'delete', TABLE, id)
  }
  return result
}
