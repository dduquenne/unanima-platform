// Fixtures — Questionnaires et questions par phase
// Issue: #239 — Génération des questions des phases du bilan de compétences

import type { Questionnaire, Question } from '@/lib/types/database'

const PHASE_TITLES: Record<number, string> = {
  1: 'Accueil et définition du projet',
  2: 'Parcours personnel et aptitudes',
  3: 'Parcours professionnel et compétences',
  4: 'Projet professionnel et motivations',
  5: 'Plan d\'action et préparation',
  6: 'Synthèse et suivi à 6 mois',
}

const PHASE_DESCRIPTIONS: Record<number, string> = {
  1: 'Cette première phase permet de clarifier votre demande, définir vos attentes et poser les bases de votre bilan de compétences.',
  2: 'Cette phase d\'investigation explore votre histoire personnelle, vos valeurs, vos centres d\'intérêt et vos aptitudes naturelles.',
  3: 'Cette phase analyse en détail votre parcours professionnel, vos compétences acquises et transférables, et vos réalisations marquantes.',
  4: 'Cette phase vous aide à construire votre projet professionnel en explorant vos motivations profondes, vos aspirations et les opportunités du marché.',
  5: 'Cette phase de conclusion formalise votre plan d\'action concret avec les étapes, les échéances et les moyens pour réaliser votre projet professionnel.',
  6: 'Cette phase de suivi, réalisée 6 mois après la fin du bilan, évalue l\'avancement de votre projet et ajuste le plan d\'action si nécessaire.',
}

const PHASE_QUESTIONS: Record<number, string[]> = {
  1: [
    'Qu\'est-ce qui vous a amené(e) à entreprendre un bilan de compétences aujourd\'hui ?',
    'Quels sont les événements récents (professionnels ou personnels) qui ont déclenché cette réflexion ?',
    'Quelles sont vos attentes principales vis-à-vis de ce bilan de compétences ?',
    'Avez-vous déjà réalisé un bilan de compétences ou une démarche similaire ? Si oui, qu\'en avez-vous retiré ?',
    'Comment décririez-vous votre situation professionnelle actuelle en quelques phrases ?',
    'Quelles questions vous posez-vous sur votre avenir professionnel ?',
    'Quels résultats concrets espérez-vous obtenir à l\'issue de ce bilan ?',
    'Êtes-vous dans une démarche volontaire ou à l\'initiative de votre employeur ? Comment vivez-vous cette démarche ?',
    'De quelles ressources (temps, soutien, finances) disposez-vous pour mener à bien ce bilan ?',
    'Y a-t-il des contraintes ou des échéances particulières dont nous devrions tenir compte ?',
    'Comment envisagez-vous votre implication dans cette démarche ? Quel temps pouvez-vous y consacrer ?',
    'Quels sont, selon vous, les freins qui pourraient limiter l\'efficacité de ce bilan ?',
  ],
  2: [
    'Quelles sont les trois valeurs qui comptent le plus pour vous dans la vie (personnelle et professionnelle) ?',
    'Quels sont vos centres d\'intérêt et passions en dehors du travail ? En quoi nourrissent-ils votre vie professionnelle ?',
    'Quelles qualités personnelles vous reconnaît-on le plus souvent dans votre entourage ?',
    'Quels sont, selon vous, vos principaux points forts et talents naturels ?',
    'Quelles sont les situations dans lesquelles vous vous sentez le plus à l\'aise et performant(e) ?',
    'Quels apprentissages importants avez-vous tirés de vos expériences de vie (réussites et échecs) ?',
    'Comment gérez-vous les situations de stress ou de conflit ? Donnez un exemple concret.',
    'Quelles activités vous procurent un sentiment de flow (absorption totale et plaisir) ?',
    'Quel rôle jouez-vous spontanément dans un groupe (leader, médiateur, organisateur, créatif…) ?',
    'Quels sont les domaines dans lesquels vous aimeriez progresser sur le plan personnel ?',
    'Comment conciliez-vous votre vie personnelle et votre vie professionnelle ? Quels ajustements souhaiteriez-vous ?',
    'Si vous pouviez changer un aspect de votre personnalité pour votre vie professionnelle, lequel serait-ce ?',
    'Quelles expériences de bénévolat, d\'engagement associatif ou de projets personnels ont été significatives pour vous ?',
  ],
  3: [
    'Retracez les grandes étapes de votre parcours professionnel : quels postes avez-vous occupés et dans quels contextes ?',
    'Pour chaque expérience significative, quelles étaient vos principales missions et responsabilités ?',
    'Quelles sont vos compétences techniques (savoir-faire) les plus solides ? Classez-les par niveau de maîtrise.',
    'Quelles compétences relationnelles et comportementales (savoir-être) avez-vous développées au fil de votre carrière ?',
    'Parmi vos compétences, lesquelles sont transférables à d\'autres métiers ou secteurs d\'activité ?',
    'Décrivez une réalisation professionnelle dont vous êtes particulièrement fier(ère). Quel a été votre rôle et quel impact avez-vous eu ?',
    'Quelles formations, certifications ou diplômes avez-vous obtenus ? Lesquels sont les plus pertinents aujourd\'hui ?',
    'Quels outils, méthodes ou technologies maîtrisez-vous ? Lesquels souhaiteriez-vous approfondir ?',
    'Quelles responsabilités managériales ou de coordination avez-vous exercées ? Qu\'en avez-vous appris ?',
    'Quels secteurs d\'activité connaissez-vous bien ? Quels réseaux professionnels avez-vous développés ?',
    'Quels aspects de vos expériences passées ne souhaitez-vous absolument pas retrouver dans votre futur poste ?',
    'Comment vos collègues ou supérieurs décriraient-ils votre manière de travailler ?',
    'Quelles compétences vous manquent pour atteindre vos objectifs professionnels ? Comment envisagez-vous de les acquérir ?',
    'Avez-vous vécu des périodes de reconversion, de chômage ou de transition ? Comment les avez-vous traversées et qu\'en retenez-vous ?',
  ],
  4: [
    'Quel(s) métier(s) ou domaine(s) d\'activité envisagez-vous pour votre avenir professionnel ?',
    'Qu\'est-ce qui vous motive fondamentalement dans le travail (autonomie, reconnaissance, utilité sociale, créativité, rémunération…) ?',
    'Décrivez votre poste idéal : missions, environnement, taille d\'entreprise, localisation, rémunération.',
    'En quoi votre projet professionnel s\'aligne-t-il avec vos compétences et votre parcours ?',
    'Quels écarts identifiez-vous entre vos compétences actuelles et celles requises pour votre projet ?',
    'Avez-vous exploré le marché de l\'emploi dans le(s) domaine(s) visé(s) ? Quelles sont les tendances et opportunités ?',
    'Avez-vous réalisé des enquêtes métier ou rencontré des professionnels du secteur ciblé ? Qu\'en avez-vous appris ?',
    'Quels sont les principaux obstacles ou freins (financiers, géographiques, familiaux, de compétences) à la réalisation de votre projet ?',
    'Quelles solutions ou alternatives envisagez-vous pour surmonter ces obstacles ?',
    'Quel niveau de risque êtes-vous prêt(e) à accepter pour réaliser votre projet (changement de région, baisse de salaire, reprise d\'études…) ?',
    'Votre projet inclut-il une dimension entrepreneuriale (création ou reprise d\'entreprise, freelance) ? Si oui, détaillez.',
    'Comment votre entourage (famille, conjoint(e), proches) perçoit-il votre projet ? Bénéficiez-vous de leur soutien ?',
    'Si vous deviez choisir entre plusieurs pistes, quels critères de décision utiliseriez-vous pour arbitrer ?',
    'En quoi ce projet donne-t-il du sens à votre parcours et à vos aspirations de vie ?',
    'Avez-vous identifié un plan B réaliste au cas où votre projet principal ne se concrétiserait pas ?',
  ],
  5: [
    'Formulez votre projet professionnel en une à trois phrases claires et synthétiques.',
    'Quelles sont les actions prioritaires à mener dans les 3 prochains mois pour concrétiser votre projet ?',
    'Quelles formations, certifications ou VAE (Validation des Acquis de l\'Expérience) envisagez-vous ? Précisez le calendrier.',
    'Comment allez-vous financer votre projet de transition (CPF, plan de développement des compétences, Transition Pro, fonds propres…) ?',
    'Quelles démarches administratives devez-vous entreprendre (inscription formation, dossier financement, démission/rupture conventionnelle…) ?',
    'Quel réseau professionnel allez-vous mobiliser ou développer pour soutenir votre projet ?',
    'Quels outils de recherche d\'emploi ou de prospection allez-vous utiliser (CV, LinkedIn, candidatures spontanées, cabinets…) ?',
    'Comment allez-vous organiser votre temps entre votre situation actuelle et les actions liées à votre projet ?',
    'Quels indicateurs vous permettront de mesurer l\'avancement de votre projet (nombre d\'entretiens, réponses, candidatures…) ?',
    'Qui peut vous accompagner ou vous soutenir dans cette transition (mentor, coach, réseau, proches) ?',
    'Quelles échéances vous fixez-vous pour les étapes clés de votre plan d\'action (à 1 mois, 3 mois, 6 mois, 1 an) ?',
    'Quels risques anticipez-vous dans la mise en œuvre de votre plan ? Comment comptez-vous les atténuer ?',
    'Quels sont les points de vigilance ou les conditions de réussite essentielles pour votre projet ?',
  ],
  6: [
    'Où en êtes-vous dans la réalisation de votre projet professionnel depuis la fin du bilan ?',
    'Quelles actions de votre plan avez-vous réalisées ? Lesquelles sont encore en cours ou reportées ?',
    'Quels résultats concrets avez-vous obtenus (entretiens, formations suivies, offres reçues, création d\'activité…) ?',
    'Quelles difficultés avez-vous rencontrées dans la mise en œuvre de votre plan d\'action ?',
    'Votre projet initial a-t-il évolué depuis la fin du bilan ? Si oui, comment et pourquoi ?',
    'Quelles nouvelles compétences avez-vous acquises ou développées depuis le bilan ?',
    'Comment évaluez-vous votre confiance en vous et votre motivation par rapport au début du bilan ?',
    'Le bilan de compétences a-t-il changé votre regard sur vous-même et sur votre vie professionnelle ? En quoi ?',
    'Quels ajustements souhaitez-vous apporter à votre plan d\'action au vu de la situation actuelle ?',
    'De quel accompagnement supplémentaire auriez-vous besoin pour poursuivre votre démarche ?',
    'Quels sont les trois apprentissages majeurs que vous retirez de l\'ensemble de ce bilan de compétences ?',
    'Comment résumeriez-vous votre situation professionnelle actuelle et vos perspectives à court terme ?',
  ],
}

export const simulationQuestionnaires: Questionnaire[] = Object.entries(PHASE_TITLES).map(
  ([phase, title]) => ({
    id: `q-phase-${phase}`,
    phase_number: Number(phase),
    title,
    description: PHASE_DESCRIPTIONS[Number(phase)] ?? null,
    sort_order: Number(phase),
    created_at: '2025-09-01T09:00:00.000Z',
  }),
)

export const simulationQuestions: Question[] = Object.entries(PHASE_QUESTIONS).flatMap(
  ([phase, questions]) =>
    questions.map((text, idx) => ({
      id: `q-${phase}-${idx + 1}`,
      questionnaire_id: `q-phase-${phase}`,
      text,
      sort_order: idx + 1,
      created_at: '2025-09-01T09:00:00.000Z',
    })),
)

/** Retourne les questionnaires pour une phase donnée */
export function getQuestionnairesByPhase(phaseNumber: number): Questionnaire[] {
  return simulationQuestionnaires.filter((q) => q.phase_number === phaseNumber)
}

/** Retourne les questions pour un questionnaire */
export function getQuestionsForQuestionnaire(questionnaireId: string): Question[] {
  return simulationQuestions.filter((q) => q.questionnaire_id === questionnaireId)
}

/** Retourne les questions pour une phase */
export function getQuestionsForPhase(phaseNumber: number): Question[] {
  return simulationQuestions.filter((q) => q.questionnaire_id === `q-phase-${phaseNumber}`)
}
