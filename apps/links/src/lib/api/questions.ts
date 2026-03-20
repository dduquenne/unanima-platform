import { fetchMany, insertOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { DbResult, DbListResult, FetchManyOptions } from '@unanima/db'
import type { Question } from '../types'
import { createQuestionSchema, updateQuestionSchema } from '../types'
import type { CreateQuestionInput, UpdateQuestionInput } from '../types'

const TABLE = 'questions'

export async function getQuestions(
  options?: FetchManyOptions,
): Promise<DbListResult<Question>> {
  return fetchMany<Question>(TABLE, options)
}

export async function createQuestion(
  data: CreateQuestionInput,
  userId: string,
): Promise<DbResult<Question>> {
  const parsed = createQuestionSchema.parse(data)
  const result = await insertOne<Question>(TABLE, parsed)
  if (result.data) {
    await logAudit(userId, 'create', TABLE, result.data.id)
  }
  return result
}

export async function updateQuestion(
  id: string,
  data: UpdateQuestionInput,
  userId: string,
): Promise<DbResult<Question>> {
  const parsed = updateQuestionSchema.parse(data)
  const result = await updateOne<Question>(TABLE, id, parsed)
  if (result.data) {
    await logAudit(userId, 'update', TABLE, id, parsed)
  }
  return result
}

export async function deleteQuestion(
  id: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const result = await deleteOne(TABLE, id)
  if (!result.error) {
    await logAudit(userId, 'delete', TABLE, id)
  }
  return result
}
