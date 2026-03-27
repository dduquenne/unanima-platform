import { createBrowserClient } from './client'
import type { DbResult, DbListResult, FetchManyOptions } from './types'

function getClient() {
  return createBrowserClient()
}

export async function fetchOne<T>(table: string, id: string): Promise<DbResult<T>> {
  const { data, error } = await getClient()
    .from(table)
    .select('*')
    .eq('id', id)
    .single()

  return {
    data: data as T | null,
    error: error ? new Error(error.message) : null,
  }
}

export async function fetchMany<T>(
  table: string,
  options: FetchManyOptions = {},
): Promise<DbListResult<T>> {
  const {
    page = 1,
    pageSize = 20,
    orderBy = 'created_at',
    ascending = false,
    filters = {},
  } = options

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = getClient()
    .from(table)
    .select('*', { count: 'exact' })
    .order(orderBy, { ascending })
    .range(from, to)

  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value)
  }

  const { data, error, count } = await query

  return {
    data: (data as T[]) ?? [],
    count,
    error: error ? new Error(error.message) : null,
  }
}

export async function insertOne<T>(
  table: string,
  data: Record<string, unknown>,
): Promise<DbResult<T>> {
  const { data: result, error } = await getClient()
    .from(table)
    .insert(data)
    .select()
    .single()

  return {
    data: result as T | null,
    error: error ? new Error(error.message) : null,
  }
}

export async function updateOne<T>(
  table: string,
  id: string,
  data: Record<string, unknown>,
): Promise<DbResult<T>> {
  const { data: result, error } = await getClient()
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single()

  return {
    data: result as T | null,
    error: error ? new Error(error.message) : null,
  }
}

export async function deleteOne(
  table: string,
  id: string,
): Promise<{ error: Error | null }> {
  const { error } = await getClient()
    .from(table)
    .delete()
    .eq('id', id)

  return {
    error: error ? new Error(error.message) : null,
  }
}
