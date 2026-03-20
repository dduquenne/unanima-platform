# Sprint 5 — Features avancées & intégrations

**Projet :** Roadmap Unanima Platform
**Période :** 2026-05-18 → 2026-05-31
**Objectif :** Implémenter les fonctionnalités métier avancées propres à chaque app et les intégrations avec les systèmes externes.
**Statut :** ✅ Terminé (2026-03-20)
**Issues traitées :** 12/12 (100%)
**Tests :** 254 passés (152 core + 36 links + 29 creai + 29 omega + 8 dashboard)

---

## Phase 1 — Features avancées Links (séquentiel)

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| 1 | Moteur de questionnaire dynamique : affichage des questions, saisie des réponses, progression | 🔴 Critique | ergonomix, archicodix | Sprint 4 #12 | — |
| 2 | Upload de documents : Supabase Storage, preview, téléchargement, suppression | 🟠 Haute | archicodix, securix | Sprint 4 #10 | — |
| 3 | Notifications email : nouveau bénéficiaire, rappel de complétion, fin de bilan | 🟠 Haute | integratix, soclix | Sprint 4 | — |

**Détail issue #1 — Moteur de questionnaire :**
- Page `/bilans/[id]/questionnaire/[questionnaireId]`
- Affichage séquentiel des questions (type : texte, choix unique, choix multiple, échelle)
- `<Stepper>` de `@unanima/core` pour la progression
- Sauvegarde automatique des réponses (debounce via `useDebounce`)
- Résumé des réponses en fin de questionnaire
- Validation des questions obligatoires avant passage à la suite

**Détail issue #2 — Upload documents :**
- Bucket Supabase Storage par app (namespace par bénéficiaire)
- Types acceptés : PDF, DOC, DOCX, JPG, PNG (max 10 Mo)
- Validation côté client + côté serveur
- RLS Storage : le bénéficiaire upload ses propres docs, le consultant les consulte
- Interface : drag & drop + bouton, preview du fichier, actions (télécharger, supprimer)

**Détail issue #3 — Notifications email :**
- Templates React Email dans `@unanima/email/templates/`
- Events déclencheurs :
  - Assignation d'un nouveau bénéficiaire → email au consultant
  - Rappel de complétion de questionnaire (J-3, J-1) → email au bénéficiaire
  - Fin de bilan → email récapitulatif au bénéficiaire + consultant
- Envoi via `sendEmail()` de `@unanima/email`
- Log audit RGPD pour chaque envoi

**Point de contrôle Phase 1 :**
- [ ] Questionnaire fonctionnel de bout en bout
- [ ] Upload et téléchargement de documents opérationnel
- [ ] Emails envoyés correctement (vérifiable en environnement dev)
- [ ] `pnpm build` et `pnpm test` passent

---

## Phase 2 — Features avancées CREAI (séquentiel)

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| 4 | Formulaire de diagnostic : saisie multi-étapes, recommandations associées | 🔴 Critique | ergonomix, archicodix | Sprint 4 #13 | — |
| 5 | Tableau de bord indicateurs : graphiques interactifs, filtres par période/établissement | 🟠 Haute | ergonomix, datanalytix | Sprint 4 #3 | — |
| 6 | Génération et export de rapports : PDF ou extraction JSON/CSV des données | 🟠 Haute | archicodix, datanalytix | #4 | ⚠️ Validation humaine |

**Détail issue #4 — Formulaire de diagnostic CREAI :**
- Wizard multi-étapes : Informations générales → Observations → Indicateurs → Recommandations → Synthèse
- `<Stepper>` pour la progression
- Chaque étape sauvegardée indépendamment (brouillon)
- Recommandations : ajout dynamique (formulaire imbriqué), priorité, échéance
- Statut du diagnostic : brouillon → en_cours → validé → publié

**Détail issue #5 — Indicateurs CREAI :**
- `<ChartWrapper>` avec Recharts : line chart (évolution temporelle), bar chart (comparaison), radar chart (profil)
- Filtres : période (trimestre, année), établissement, catégorie d'indicateur
- Seuils visuels : vert/orange/rouge selon les objectifs définis
- Export des données filtrées en CSV

**Détail issue #6 — Export rapports :**
- Génération côté serveur (route handler `/api/rapports/[id]/export`)
- Format JSON structuré pour export data
- Format CSV pour tableaux d'indicateurs
- PDF : utilisation d'une librairie légère (ex: `@react-pdf/renderer`) — **validation humaine requise sur le choix de librairie**

**Point de contrôle Phase 2 :**
- [ ] Diagnostic complet créable de bout en bout
- [ ] Indicateurs visuels avec graphiques interactifs
- [ ] Export données fonctionnel
- [ ] `pnpm build` et `pnpm test` passent

---

## Phase 3 — Features avancées Omega + intégrations (séquentiel, risque élevé)

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| 7 | POC connecteur Salesforce : lecture des clients/véhicules | 🔴 Critique | integratix, securix | Sprint 4 | ⚠️ Validation humaine |
| 8 | POC connecteur SAP : lecture des pièces détachées et stocks | 🟠 Haute | integratix, securix | Sprint 4 | ⚠️ Validation humaine |
| 9 | Workflow d'affectation : responsable assigne un technicien, notification, validation | 🟠 Haute | ergonomix, archicodix | Sprint 4 #15 | — |
| 10 | Alertes stock pièces : seuil d'alerte, notification email, tableau récapitulatif | 🟡 Moyenne | ergonomix, integratix | #8 | — |

**Détail issue #7 — Connecteur Salesforce :**
- API REST Salesforce : authentification OAuth 2.0 (client credentials)
- Lecture seule : comptes clients, contacts, véhicules (objets custom)
- Synchronisation : import initial + refresh périodique (cron ou webhook)
- Mapping Salesforce → table `clients_vehicules`
- **Sécurité** : credentials dans variables d'environnement Vercel, jamais dans le code
- **Risque élevé** : dépend de la disponibilité du sandbox Salesforce

**Détail issue #8 — Connecteur SAP :**
- API REST SAP Business One ou RFC selon configuration client
- Lecture seule : catalogue pièces, niveaux de stock
- Mapping SAP → table `pieces_detachees`
- Circuit breaker + retry pour résilience
- **Risque élevé** : dépend de la disponibilité du sandbox SAP

**Détail issue #9 — Workflow affectation :**
- Page `/interventions/[id]/affecter` pour le responsable SAV
- Sélection d'un technicien (liste filtrée par disponibilité)
- Commentaire d'affectation
- Notification email au technicien (`@unanima/email`)
- Mise à jour du statut intervention : `ouverte` → `affectee`
- Log audit

**Point de contrôle Phase 3 :**
- [ ] POC Salesforce : connexion + lecture de données OK
- [ ] POC SAP : connexion + lecture de données OK
- [ ] Workflow affectation fonctionnel de bout en bout
- [ ] Alertes stock affichées correctement
- [ ] `pnpm build` et `pnpm test` passent

---

## Phase 4 — Tests transversaux

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| 11 | Tests unitaires des features avancées — 3 apps | 🟠 Haute | testix | #1-#10 | — |
| 12 | Tests d'intégration API (création bénéficiaire → bilan → questionnaire → réponses) | 🟡 Moyenne | testix | #11 | — |

**Point de contrôle Phase 4 :**
- [ ] Couverture tests > 60% sur les nouvelles features
- [ ] Tests d'intégration couvrent les parcours métier principaux
- [ ] `pnpm test` : tous les tests passent

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Issues totales | 12 |
| Critiques | 3 (#1, #4, #7) |
| Hautes | 6 (#2, #3, #5, #6, #8, #9, #11) |
| Moyennes | 2 (#10, #12) |
| Chemin critique | Sprint 4 → #1 → #3 (Links) / #4 → #6 (CREAI) / #7 → #9 (Omega) |
| Parallélisme max | 3 apps en parallèle (Phase 1/2/3 indépendants) |
| Effort estimé | ~10-14 jours |

---

## Contraintes d'exécution

- **Base :** `master` (après merge Sprint 4)
- **POC intégrations (Salesforce/SAP)** : nécessitent des credentials de sandbox — valider la disponibilité avant le sprint
- **Build obligatoire** entre chaque phase
- **Tests obligatoires** avant chaque commit
- **⚠️ Validation humaine** requise pour les choix de librairies et les POC d'intégration
- **Format commit :** `feat(scope): description (closes #XX)`
- **Scopes :** `links`, `creai`, `omega`, `email`, `integrations`
