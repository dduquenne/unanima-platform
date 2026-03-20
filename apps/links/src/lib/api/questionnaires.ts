import { fetchOne, fetchMany, insertOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { DbResult, DbListResult, FetchManyOptions } from '@unanima/db'
import type { Questionnaire } from '../types'
import { createQuestionnaireSchema, updateQuestionnaireSchema } from '../types'
import type { CreateQuestionnaireInput, UpdateQuestionnaireInput } from '../types'

const TABLE = 'questionnaires'

export async function getQuestionnaires(
  options?: FetchManyOptions,
): Promise<DbListResult<Questionnaire>> {
  return fetchMany<Questionnaire>(TABLE, options)
}

export async function getQuestionnaire(id: string): Promise<DbResult<Questionnaire>> {
  return fetchOne<Questionnaire>(TABLE, id)
}

export async function createQuestionnaire(
  data: CreateQuestionnaireInput,
  userId: string,
): Promise<DbResult<Questionnaire>> {
  const parsed = createQuestionnaireSchema.parse(data)
  const result = await insertOne<Questionnaire>(TABLE, parsed)
  if (result.data) {
    await logAudit(userId, 'create', TABLE, result.data.id)
  }
  return result
}

export async function updateQuestionnaire(
  id: string,
  data: UpdateQuestionnaireInput,
  userId: string,
): Promise<DbResult<Questionnaire>> {
  const parsed = updateQuestionnaireSchema.parse(data)
  const result = await updateOne<Questionnaire>(TABLE, id, parsed)
  if (result.data) {
    await logAudit(userId, 'update', TABLE, id, parsed)
  }
  return result
}

export async function deleteQuestionnaire(
  id: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const result = await deleteOne(TABLE, id)
  if (!result.error) {
    await logAudit(userId, 'delete', TABLE, id)
  }
  return result
}
