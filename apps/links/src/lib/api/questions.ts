import { fetchMany } from '@unanima/db'
import type { DbListResult, FetchManyOptions } from '@unanima/db'
import type { Question } from '../types'

const TABLE = 'questions'

export async function getQuestions(
  options?: FetchManyOptions,
): Promise<DbListResult<Question>> {
  return fetchMany<Question>(TABLE, options)
}

export async function getQuestionsByQuestionnaire(
  questionnaireId: string,
): Promise<DbListResult<Question>> {
  return fetchMany<Question>(TABLE, {
    filters: { questionnaire_id: questionnaireId },
    orderBy: 'sort_order',
    ascending: true,
  })
}
