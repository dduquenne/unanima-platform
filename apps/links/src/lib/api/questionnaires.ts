import { fetchOne, fetchMany } from '@unanima/db'
import type { DbResult, DbListResult, FetchManyOptions } from '@unanima/db'
import type { Questionnaire } from '../types'

const TABLE = 'questionnaires'

export async function getQuestionnaires(
  options?: FetchManyOptions,
): Promise<DbListResult<Questionnaire>> {
  return fetchMany<Questionnaire>(TABLE, options)
}

export async function getQuestionnaire(id: string): Promise<DbResult<Questionnaire>> {
  return fetchOne<Questionnaire>(TABLE, id)
}

export async function getQuestionnairesByPhase(
  phaseNumber: number,
): Promise<DbListResult<Questionnaire>> {
  return fetchMany<Questionnaire>(TABLE, {
    filters: { phase_number: String(phaseNumber) },
    orderBy: 'sort_order',
    ascending: true,
  })
}
