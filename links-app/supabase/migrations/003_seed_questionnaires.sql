-- Migration 003: Seed des questionnaires et questions par phase
-- App: Link's Accompagnement
-- Issue: #239 — Génération des questions des phases du bilan de compétences
-- Référence: Art. R6313-4 du Code du travail (cadre légal bilan de compétences)
--
-- Chaque phase comporte 1 questionnaire et 10-15 questions ouvertes
-- conformes aux meilleures pratiques du bilan de compétences.

-- ============================================================
-- Phase 1 : Phase préliminaire — Accueil et définition du projet
-- Objectif : analyser la demande, définir les besoins, présenter la démarche
-- ============================================================
WITH q1 AS (
  INSERT INTO public.questionnaires (phase_number, title, description, sort_order)
  VALUES (
    1,
    'Accueil et définition du projet',
    'Cette première phase permet de clarifier votre demande, définir vos attentes et poser les bases de votre bilan de compétences.',
    1
  )
  RETURNING id
)
INSERT INTO public.questions (questionnaire_id, text, sort_order)
SELECT q1.id, q.text, q.sort_order
FROM q1, (VALUES
  ('Qu''est-ce qui vous a amené(e) à entreprendre un bilan de compétences aujourd''hui ?', 1),
  ('Quels sont les événements récents (professionnels ou personnels) qui ont déclenché cette réflexion ?', 2),
  ('Quelles sont vos attentes principales vis-à-vis de ce bilan de compétences ?', 3),
  ('Avez-vous déjà réalisé un bilan de compétences ou une démarche similaire ? Si oui, qu''en avez-vous retiré ?', 4),
  ('Comment décririez-vous votre situation professionnelle actuelle en quelques phrases ?', 5),
  ('Quelles questions vous posez-vous sur votre avenir professionnel ?', 6),
  ('Quels résultats concrets espérez-vous obtenir à l''issue de ce bilan ?', 7),
  ('Êtes-vous dans une démarche volontaire ou à l''initiative de votre employeur ? Comment vivez-vous cette démarche ?', 8),
  ('De quelles ressources (temps, soutien, finances) disposez-vous pour mener à bien ce bilan ?', 9),
  ('Y a-t-il des contraintes ou des échéances particulières dont nous devrions tenir compte ?', 10),
  ('Comment envisagez-vous votre implication dans cette démarche ? Quel temps pouvez-vous y consacrer ?', 11),
  ('Quels sont, selon vous, les freins qui pourraient limiter l''efficacité de ce bilan ?', 12)
) AS q(text, sort_order);

-- ============================================================
-- Phase 2 : Investigation — Parcours personnel et aptitudes
-- Objectif : explorer l'histoire personnelle, les valeurs, les intérêts
-- ============================================================
WITH q2 AS (
  INSERT INTO public.questionnaires (phase_number, title, description, sort_order)
  VALUES (
    2,
    'Parcours personnel et aptitudes',
    'Cette phase d''investigation explore votre histoire personnelle, vos valeurs, vos centres d''intérêt et vos aptitudes naturelles.',
    1
  )
  RETURNING id
)
INSERT INTO public.questions (questionnaire_id, text, sort_order)
SELECT q2.id, q.text, q.sort_order
FROM q2, (VALUES
  ('Quelles sont les trois valeurs qui comptent le plus pour vous dans la vie (personnelle et professionnelle) ?', 1),
  ('Quels sont vos centres d''intérêt et passions en dehors du travail ? En quoi nourrissent-ils votre vie professionnelle ?', 2),
  ('Quelles qualités personnelles vous reconnaît-on le plus souvent dans votre entourage ?', 3),
  ('Quels sont, selon vous, vos principaux points forts et talents naturels ?', 4),
  ('Quelles sont les situations dans lesquelles vous vous sentez le plus à l''aise et performant(e) ?', 5),
  ('Quels apprentissages importants avez-vous tirés de vos expériences de vie (réussites et échecs) ?', 6),
  ('Comment gérez-vous les situations de stress ou de conflit ? Donnez un exemple concret.', 7),
  ('Quelles activités vous procurent un sentiment de flow (absorption totale et plaisir) ?', 8),
  ('Quel rôle jouez-vous spontanément dans un groupe (leader, médiateur, organisateur, créatif…) ?', 9),
  ('Quels sont les domaines dans lesquels vous aimeriez progresser sur le plan personnel ?', 10),
  ('Comment conciliez-vous votre vie personnelle et votre vie professionnelle ? Quels ajustements souhaiteriez-vous ?', 11),
  ('Si vous pouviez changer un aspect de votre personnalité pour votre vie professionnelle, lequel serait-ce ?', 12),
  ('Quelles expériences de bénévolat, d''engagement associatif ou de projets personnels ont été significatives pour vous ?', 13)
) AS q(text, sort_order);

-- ============================================================
-- Phase 3 : Investigation — Parcours professionnel et compétences
-- Objectif : inventaire des compétences, analyse des expériences
-- ============================================================
WITH q3 AS (
  INSERT INTO public.questionnaires (phase_number, title, description, sort_order)
  VALUES (
    3,
    'Parcours professionnel et compétences',
    'Cette phase analyse en détail votre parcours professionnel, vos compétences acquises et transférables, et vos réalisations marquantes.',
    1
  )
  RETURNING id
)
INSERT INTO public.questions (questionnaire_id, text, sort_order)
SELECT q3.id, q.text, q.sort_order
FROM q3, (VALUES
  ('Retracez les grandes étapes de votre parcours professionnel : quels postes avez-vous occupés et dans quels contextes ?', 1),
  ('Pour chaque expérience significative, quelles étaient vos principales missions et responsabilités ?', 2),
  ('Quelles sont vos compétences techniques (savoir-faire) les plus solides ? Classez-les par niveau de maîtrise.', 3),
  ('Quelles compétences relationnelles et comportementales (savoir-être) avez-vous développées au fil de votre carrière ?', 4),
  ('Parmi vos compétences, lesquelles sont transférables à d''autres métiers ou secteurs d''activité ?', 5),
  ('Décrivez une réalisation professionnelle dont vous êtes particulièrement fier(ère). Quel a été votre rôle et quel impact avez-vous eu ?', 6),
  ('Quelles formations, certifications ou diplômes avez-vous obtenus ? Lesquels sont les plus pertinents aujourd''hui ?', 7),
  ('Quels outils, méthodes ou technologies maîtrisez-vous ? Lesquels souhaiteriez-vous approfondir ?', 8),
  ('Quelles responsabilités managériales ou de coordination avez-vous exercées ? Qu''en avez-vous appris ?', 9),
  ('Quels secteurs d''activité connaissez-vous bien ? Quels réseaux professionnels avez-vous développés ?', 10),
  ('Quels aspects de vos expériences passées ne souhaitez-vous absolument pas retrouver dans votre futur poste ?', 11),
  ('Comment vos collègues ou supérieurs décriraient-ils votre manière de travailler ?', 12),
  ('Quelles compétences vous manquent pour atteindre vos objectifs professionnels ? Comment envisagez-vous de les acquérir ?', 13),
  ('Avez-vous vécu des périodes de reconversion, de chômage ou de transition ? Comment les avez-vous traversées et qu''en retenez-vous ?', 14)
) AS q(text, sort_order);

-- ============================================================
-- Phase 4 : Investigation — Projet professionnel et motivations
-- Objectif : définir le projet professionnel, explorer les motivations
-- ============================================================
WITH q4 AS (
  INSERT INTO public.questionnaires (phase_number, title, description, sort_order)
  VALUES (
    4,
    'Projet professionnel et motivations',
    'Cette phase vous aide à construire votre projet professionnel en explorant vos motivations profondes, vos aspirations et les opportunités du marché.',
    1
  )
  RETURNING id
)
INSERT INTO public.questions (questionnaire_id, text, sort_order)
SELECT q4.id, q.text, q.sort_order
FROM q4, (VALUES
  ('Quel(s) métier(s) ou domaine(s) d''activité envisagez-vous pour votre avenir professionnel ?', 1),
  ('Qu''est-ce qui vous motive fondamentalement dans le travail (autonomie, reconnaissance, utilité sociale, créativité, rémunération…) ?', 2),
  ('Décrivez votre poste idéal : missions, environnement, taille d''entreprise, localisation, rémunération.', 3),
  ('En quoi votre projet professionnel s''aligne-t-il avec vos compétences et votre parcours ?', 4),
  ('Quels écarts identifiez-vous entre vos compétences actuelles et celles requises pour votre projet ?', 5),
  ('Avez-vous exploré le marché de l''emploi dans le(s) domaine(s) visé(s) ? Quelles sont les tendances et opportunités ?', 6),
  ('Avez-vous réalisé des enquêtes métier ou rencontré des professionnels du secteur ciblé ? Qu''en avez-vous appris ?', 7),
  ('Quels sont les principaux obstacles ou freins (financiers, géographiques, familiaux, de compétences) à la réalisation de votre projet ?', 8),
  ('Quelles solutions ou alternatives envisagez-vous pour surmonter ces obstacles ?', 9),
  ('Quel niveau de risque êtes-vous prêt(e) à accepter pour réaliser votre projet (changement de région, baisse de salaire, reprise d''études…) ?', 10),
  ('Votre projet inclut-il une dimension entrepreneuriale (création ou reprise d''entreprise, freelance) ? Si oui, détaillez.', 11),
  ('Comment votre entourage (famille, conjoint(e), proches) perçoit-il votre projet ? Bénéficiez-vous de leur soutien ?', 12),
  ('Si vous deviez choisir entre plusieurs pistes, quels critères de décision utiliseriez-vous pour arbitrer ?', 13),
  ('En quoi ce projet donne-t-il du sens à votre parcours et à vos aspirations de vie ?', 14),
  ('Avez-vous identifié un plan B réaliste au cas où votre projet principal ne se concrétiserait pas ?', 15)
) AS q(text, sort_order);

-- ============================================================
-- Phase 5 : Conclusion — Plan d'action et préparation
-- Objectif : formaliser le plan d'action, planifier les étapes
-- ============================================================
WITH q5 AS (
  INSERT INTO public.questionnaires (phase_number, title, description, sort_order)
  VALUES (
    5,
    'Plan d''action et préparation',
    'Cette phase de conclusion formalise votre plan d''action concret avec les étapes, les échéances et les moyens pour réaliser votre projet professionnel.',
    1
  )
  RETURNING id
)
INSERT INTO public.questions (questionnaire_id, text, sort_order)
SELECT q5.id, q.text, q.sort_order
FROM q5, (VALUES
  ('Formulez votre projet professionnel en une à trois phrases claires et synthétiques.', 1),
  ('Quelles sont les actions prioritaires à mener dans les 3 prochains mois pour concrétiser votre projet ?', 2),
  ('Quelles formations, certifications ou VAE (Validation des Acquis de l''Expérience) envisagez-vous ? Précisez le calendrier.', 3),
  ('Comment allez-vous financer votre projet de transition (CPF, plan de développement des compétences, Transition Pro, fonds propres…) ?', 4),
  ('Quelles démarches administratives devez-vous entreprendre (inscription formation, dossier financement, démission/rupture conventionnelle…) ?', 5),
  ('Quel réseau professionnel allez-vous mobiliser ou développer pour soutenir votre projet ?', 6),
  ('Quels outils de recherche d''emploi ou de prospection allez-vous utiliser (CV, LinkedIn, candidatures spontanées, cabinets…) ?', 7),
  ('Comment allez-vous organiser votre temps entre votre situation actuelle et les actions liées à votre projet ?', 8),
  ('Quels indicateurs vous permettront de mesurer l''avancement de votre projet (nombre d''entretiens, réponses, candidatures…) ?', 9),
  ('Qui peut vous accompagner ou vous soutenir dans cette transition (mentor, coach, réseau, proches) ?', 10),
  ('Quelles échéances vous fixez-vous pour les étapes clés de votre plan d''action (à 1 mois, 3 mois, 6 mois, 1 an) ?', 11),
  ('Quels risques anticipez-vous dans la mise en œuvre de votre plan ? Comment comptez-vous les atténuer ?', 12),
  ('Quels sont les points de vigilance ou les conditions de réussite essentielles pour votre projet ?', 13)
) AS q(text, sort_order);

-- ============================================================
-- Phase 6 : Suivi à 6 mois — Synthèse finale
-- Objectif : faire le point 6 mois après, évaluer l'avancement
-- ============================================================
WITH q6 AS (
  INSERT INTO public.questionnaires (phase_number, title, description, sort_order)
  VALUES (
    6,
    'Synthèse et suivi à 6 mois',
    'Cette phase de suivi, réalisée 6 mois après la fin du bilan, évalue l''avancement de votre projet et ajuste le plan d''action si nécessaire.',
    1
  )
  RETURNING id
)
INSERT INTO public.questions (questionnaire_id, text, sort_order)
SELECT q6.id, q.text, q.sort_order
FROM q6, (VALUES
  ('Où en êtes-vous dans la réalisation de votre projet professionnel depuis la fin du bilan ?', 1),
  ('Quelles actions de votre plan avez-vous réalisées ? Lesquelles sont encore en cours ou reportées ?', 2),
  ('Quels résultats concrets avez-vous obtenus (entretiens, formations suivies, offres reçues, création d''activité…) ?', 3),
  ('Quelles difficultés avez-vous rencontrées dans la mise en œuvre de votre plan d''action ?', 4),
  ('Votre projet initial a-t-il évolué depuis la fin du bilan ? Si oui, comment et pourquoi ?', 5),
  ('Quelles nouvelles compétences avez-vous acquises ou développées depuis le bilan ?', 6),
  ('Comment évaluez-vous votre confiance en vous et votre motivation par rapport au début du bilan ?', 7),
  ('Le bilan de compétences a-t-il changé votre regard sur vous-même et sur votre vie professionnelle ? En quoi ?', 8),
  ('Quels ajustements souhaitez-vous apporter à votre plan d''action au vu de la situation actuelle ?', 9),
  ('De quel accompagnement supplémentaire auriez-vous besoin pour poursuivre votre démarche ?', 10),
  ('Quels sont les trois apprentissages majeurs que vous retirez de l''ensemble de ce bilan de compétences ?', 11),
  ('Comment résumeriez-vous votre situation professionnelle actuelle et vos perspectives à court terme ?', 12)
) AS q(text, sort_order);
