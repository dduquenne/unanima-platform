# Sprint 5 — Features avancées & intégrations

**Projet :** Roadmap Unanima Platform
**Période :** 2026-05-18 → 2026-05-31
**Objectif :** Implémenter les fonctionnalités métier avancées propres à chaque app et les intégrations avec les systèmes externes.
**Vélocité de référence :** Sprint 2 = 12/5j, Sprint 3-4 estimés ~11-16 issues

---

## Pré-requis (vérifier avant démarrage)

- [ ] Sprint 4 mergé dans `master`
- [ ] Dashboards, listes et fiches de détail fonctionnels pour les 3 apps
- [ ] API CRUD complètes et testées (Sprint 3)
- [ ] **Spécifique Omega :** credentials sandbox Salesforce et SAP disponibles
- [ ] `pnpm build` et `pnpm test` passent sur `master`

---

## Priorisation MoSCoW

> ⚠️ Ce sprint a le risque de scope creep le plus élevé (cf. roadmap). La priorisation MoSCoW est stricte.

| Priorité | Tâches | Règle |
|----------|--------|-------|
| **Must Have** | #1, #4, #7, #9 | Livrer impérativement ce sprint |
| **Should Have** | #2, #3, #5, #8, #11 | Livrer si le temps le permet |
| **Could Have** | #6, #10, #12 | Reporter en Sprint 7 si nécessaire |
| **Won't Have** | Export CSV, notifications push | Hors scope v1 |

---

## Phase 1 — Features avancées Links (séquentiel)

| Ordre | Titre | Priorité | Effort | MoSCoW | Skills | Dépend de | Review |
|-------|-------|----------|--------|--------|--------|-----------|--------|
| 1 | Moteur de questionnaire dynamique | 🔴 Critique | L | Must | ergonomix, archicodix | Sprint 4 #12 | — |
| 2 | Upload de documents (Supabase Storage) | 🟠 Haute | M | Should | archicodix, securix | Sprint 4 #10 | — |
| 3 | Notifications email (nouveau bénéficiaire, rappel, fin de bilan) | 🟠 Haute | M | Should | integratix, soclix | Sprint 4 | — |

### Détail tâche #1 — Moteur de questionnaire (MUST HAVE)

**Fichiers à créer :**
- `apps/links/src/app/(protected)/bilans/[id]/questionnaire/[questionnaireId]/page.tsx`
- `apps/links/src/app/(protected)/bilans/[id]/questionnaire/[questionnaireId]/components/question-renderer.tsx`
- `apps/links/src/app/(protected)/bilans/[id]/questionnaire/[questionnaireId]/components/questionnaire-stepper.tsx`
- `apps/links/src/lib/hooks/use-questionnaire.ts`

**Fonctionnement :**
- Affichage séquentiel des questions (types : texte libre, choix unique radio, choix multiple checkbox, échelle 1-10)
- `<Stepper>` de `@unanima/core` pour progression (Question N/Total)
- Sauvegarde automatique (debounce 500ms via `useDebounce` de `@unanima/core`)
- Résumé des réponses en fin de questionnaire avec bouton "Valider"
- Validation des questions `required: true` avant passage à la suivante

**Critères d'acceptation :**
```gherkin
Feature: Moteur de questionnaire
  Scenario: Complétion d'un questionnaire
    Given un bilan avec un questionnaire de 5 questions
    When le bénéficiaire ouvre le questionnaire
    Then il voit la question 1/5
    When il répond et clique "Suivant"
    Then il voit la question 2/5
    And la réponse à la question 1 est sauvegardée en base

  Scenario: Sauvegarde automatique
    Given le bénéficiaire est sur la question 3
    When il tape une réponse et attend 1 seconde
    Then la réponse est sauvegardée automatiquement (sans clic)

  Scenario: Validation des questions obligatoires
    Given une question obligatoire sans réponse
    When le bénéficiaire clique "Suivant"
    Then un message "Cette question est obligatoire" est affiché
    And il ne passe pas à la question suivante

  Scenario: Résumé final
    Given toutes les questions sont répondues
    When le bénéficiaire arrive à la dernière étape
    Then il voit un résumé de toutes ses réponses
    And un bouton "Valider le questionnaire"
```

### Détail tâche #2 — Upload documents (SHOULD HAVE)

**Fichiers à créer :**
- `apps/links/src/app/(protected)/beneficiaires/[id]/documents/page.tsx`
- `apps/links/src/lib/api/storage.ts` — helpers upload/download/delete
- `apps/links/src/app/api/documents/upload/route.ts` — route handler upload

**Configuration Supabase Storage :**
- Bucket : `links-documents` (namespace par bénéficiaire : `/{beneficiaire_id}/{filename}`)
- Types acceptés : PDF, DOC, DOCX, JPG, PNG (validation MIME côté serveur)
- Taille max : 10 Mo
- RLS Storage : bénéficiaire upload ses propres docs, consultant consulte

**Interface :**
- Zone drag & drop + bouton "Parcourir"
- Preview inline (image : thumbnail, PDF : icône + nom)
- Actions par document : Télécharger, Supprimer (avec confirmation)

**Critères d'acceptation :**
```gherkin
Feature: Upload de documents
  Scenario: Upload d'un PDF valide
    Given je suis sur la fiche d'un bénéficiaire onglet "Documents"
    When j'uploade un fichier PDF de 2 Mo
    Then le fichier apparaît dans la liste
    And je peux le télécharger

  Scenario: Rejet d'un fichier trop volumineux
    Given je suis sur la fiche d'un bénéficiaire onglet "Documents"
    When j'uploade un fichier de 15 Mo
    Then un message "Le fichier dépasse la taille maximale de 10 Mo" est affiché

  Scenario: Rejet d'un type non autorisé
    When j'uploade un fichier .exe
    Then un message "Type de fichier non autorisé" est affiché
```

### Détail tâche #3 — Notifications email (SHOULD HAVE)

**Fichiers à créer :**
- `packages/email/src/templates/new-beneficiaire.tsx` — Template "Nouveau bénéficiaire assigné"
- `packages/email/src/templates/questionnaire-rappel.tsx` — Template "Rappel complétion"
- `packages/email/src/templates/bilan-termine.tsx` — Template "Bilan terminé"
- `apps/links/src/lib/notifications.ts` — Fonctions d'envoi contextualisées

**Events déclencheurs :**
- Assignation d'un nouveau bénéficiaire → email au consultant
- Rappel complétion questionnaire (J-3, J-1) → email au bénéficiaire (via cron ou Edge Function)
- Fin de bilan → email récapitulatif au bénéficiaire + consultant

**Logging :** Chaque envoi loggé dans `audit_logs` (action: `email_sent`, entity_type: `notification`)

### Point de contrôle Phase 1

- [ ] Questionnaire fonctionnel de bout en bout (saisie + sauvegarde + résumé)
- [ ] Upload et téléchargement de documents opérationnel
- [ ] Emails envoyés correctement (vérifiable en environnement dev via Resend dashboard)
- [ ] `pnpm build` et `pnpm test` passent

---

## Phase 2 — Features avancées CREAI (séquentiel)

| Ordre | Titre | Priorité | Effort | MoSCoW | Skills | Dépend de | Review |
|-------|-------|----------|--------|--------|--------|-----------|--------|
| 4 | Formulaire diagnostic multi-étapes | 🔴 Critique | L | Must | ergonomix, archicodix | Sprint 4 #13 | — |
| 5 | Tableau de bord indicateurs (graphiques interactifs) | 🟠 Haute | M | Should | ergonomix, datanalytix | Sprint 4 #3 | — |
| 6 | Génération et export de rapports (JSON/CSV/PDF) | 🟠 Haute | M | Could | archicodix, datanalytix | #4 | ⚠️ Choix librairie PDF |

### Détail tâche #4 — Formulaire diagnostic CREAI (MUST HAVE)

**Fichiers à créer :**
- `apps/creai/src/app/(protected)/diagnostics/new/page.tsx`
- `apps/creai/src/app/(protected)/diagnostics/[id]/edit/page.tsx`
- `apps/creai/src/app/(protected)/diagnostics/[id]/edit/components/diagnostic-wizard.tsx`
- `apps/creai/src/lib/hooks/use-diagnostic-form.ts`

**Wizard multi-étapes (5 étapes) :**
1. **Informations générales** : établissement (select), date, type de diagnostic
2. **Observations** : textarea riche, points forts/faibles
3. **Indicateurs** : saisie dynamique (ajouter/supprimer des indicateurs, catégorie + valeur + unité)
4. **Recommandations** : formulaire imbriqué (ajout dynamique), priorité (haute/moyenne/basse), échéance
5. **Synthèse** : résumé auto-généré, textarea pour synthèse manuelle, bouton "Valider"

**Statuts :** brouillon → en_cours → validé → publié
**Sauvegarde :** chaque étape sauvegardée indépendamment (statut "brouillon")

**Critères d'acceptation :**
```gherkin
Feature: Formulaire diagnostic CREAI
  Scenario: Création d'un diagnostic complet
    Given je suis connecté en tant que coordonnateur
    When je crée un diagnostic pour l'établissement "EHPAD Les Lilas"
    And je remplis les 5 étapes du wizard
    And je valide
    Then le diagnostic est en statut "validé"
    And il apparaît sur le dashboard direction

  Scenario: Sauvegarde brouillon
    Given je suis à l'étape 2 du wizard
    When je quitte la page
    And je reviens plus tard
    Then mes données de l'étape 1 et 2 sont conservées
    And le diagnostic est en statut "brouillon"

  Scenario: Ajout dynamique de recommandations
    Given je suis à l'étape 4 "Recommandations"
    When je clique "Ajouter une recommandation"
    Then un nouveau formulaire de recommandation apparaît
    When je remplis description, priorité et échéance
    And je clique "Ajouter une recommandation" à nouveau
    Then j'ai 2 recommandations dans la liste
```

### Détail tâche #5 — Indicateurs graphiques (SHOULD HAVE)

**Fichier :** `apps/creai/src/app/(protected)/indicateurs/page.tsx`

**Graphiques Recharts :**
- Line chart : évolution temporelle des indicateurs (filtrable par période : trimestre, année)
- Bar chart : comparaison entre établissements
- Radar chart : profil d'un établissement (toutes catégories)

**Filtres :** période, établissement (multi-select), catégorie d'indicateur
**Seuils visuels :** vert (≥ objectif), orange (entre 70-100% objectif), rouge (< 70%)

### Détail tâche #6 — Export rapports (COULD HAVE)

**Route :** `apps/creai/src/app/api/rapports/[id]/export/route.ts`
**Formats :** JSON (données structurées), CSV (indicateurs tabulaires)
**PDF :** utilisation de `@react-pdf/renderer` — **⚠️ validation humaine requise sur le choix de librairie** (alternatives : `jspdf`, `puppeteer`)

> Si le temps manque, reporter le PDF en Sprint 7. Le JSON/CSV est suffisant pour la v1.

### Point de contrôle Phase 2

- [ ] Diagnostic complet créable de bout en bout (5 étapes)
- [ ] Indicateurs visuels avec graphiques Recharts interactifs
- [ ] Export JSON/CSV fonctionnel (PDF optionnel)
- [ ] `pnpm build` et `pnpm test` passent

---

## Phase 3 — Features avancées Omega + intégrations (séquentiel, risque élevé)

| Ordre | Titre | Priorité | Effort | MoSCoW | Skills | Dépend de | Review |
|-------|-------|----------|--------|--------|--------|-----------|--------|
| 7 | POC connecteur Salesforce : lecture clients/véhicules | 🔴 Critique | L | Must | integratix, securix | Sprint 4 | ⚠️ Validation humaine |
| 8 | POC connecteur SAP : lecture pièces/stocks | 🟠 Haute | L | Should | integratix, securix | Sprint 4 | ⚠️ Validation humaine |
| 9 | Workflow d'affectation technicien | 🟠 Haute | M | Must | ergonomix, archicodix | Sprint 4 #15 | — |
| 10 | Alertes stock pièces + notification email | 🟡 Moyenne | S | Could | ergonomix, integratix | #8 | — |

### Détail tâche #7 — Connecteur Salesforce (MUST HAVE)

**Fichiers à créer :**
- `apps/omega/src/lib/integrations/salesforce/client.ts` — Client OAuth 2.0
- `apps/omega/src/lib/integrations/salesforce/sync.ts` — Logique de synchronisation
- `apps/omega/src/lib/integrations/salesforce/mapping.ts` — Mapping Salesforce → `clients_vehicules`
- `apps/omega/src/app/api/integrations/salesforce/sync/route.ts` — Route handler de synchro

**Architecture :**
```
Salesforce API (OAuth 2.0 client_credentials)
    ↓ GET /services/data/vXX.0/query?q=SELECT...
    ↓ Lecture seule : Account, Contact, Vehicle__c (custom object)
    ↓
Mapping → clients_vehicules (upsert sur VIN)
    ↓
Log audit (action: 'salesforce_sync')
```

**Sécurité :**
- Variables d'environnement : `SALESFORCE_CLIENT_ID`, `SALESFORCE_CLIENT_SECRET`, `SALESFORCE_INSTANCE_URL`
- Jamais dans le code — Vercel env vars uniquement
- Token refresh automatique

**Résilience :**
- Timeout : 30s par requête
- Retry : 3 tentatives avec backoff exponentiel
- Circuit breaker si 5 erreurs consécutives → alerte + mode dégradé (données locales)

**Critères d'acceptation :**
```gherkin
Feature: Connecteur Salesforce
  Scenario: Synchronisation initiale
    Given les credentials Salesforce sont configurés
    When j'appelle POST /api/integrations/salesforce/sync
    Then les comptes clients et véhicules sont importés dans clients_vehicules
    And un log audit est enregistré

  Scenario: Synchronisation incrémentale
    Given une synchro initiale a été faite
    When un nouveau véhicule est ajouté dans Salesforce
    And j'appelle POST /api/integrations/salesforce/sync
    Then seul le nouveau véhicule est ajouté (upsert sur VIN)

  Scenario: Sandbox indisponible
    Given le sandbox Salesforce est en erreur
    When j'appelle POST /api/integrations/salesforce/sync
    Then une erreur 503 est retournée
    And les données locales restent inchangées
```

### Détail tâche #8 — Connecteur SAP (SHOULD HAVE)

**Fichiers à créer :**
- `apps/omega/src/lib/integrations/sap/client.ts`
- `apps/omega/src/lib/integrations/sap/sync.ts`
- `apps/omega/src/lib/integrations/sap/mapping.ts`
- `apps/omega/src/app/api/integrations/sap/sync/route.ts`

**Architecture similaire à Salesforce** : lecture seule, catalogue pièces + niveaux de stock → `pieces_detachees`
**Variables :** `SAP_API_URL`, `SAP_API_KEY`, `SAP_COMPANY_DB`
**Résilience :** circuit breaker + retry (même pattern que Salesforce)

### Détail tâche #9 — Workflow affectation (MUST HAVE)

**Fichiers à créer :**
- `apps/omega/src/app/(protected)/interventions/[id]/affecter/page.tsx`
- `apps/omega/src/app/api/interventions/[id]/affecter/route.ts`
- `apps/omega/src/lib/hooks/use-affectation.ts`

**Flux :**
1. Responsable SAV ouvre `/interventions/{id}/affecter`
2. Sélection d'un technicien (dropdown filtré par disponibilité)
3. Commentaire d'affectation (optionnel)
4. Submit → création dans `affectations` + mise à jour intervention statut `ouverte` → `affectee`
5. Notification email au technicien (`@unanima/email`)
6. Log audit

**Critères d'acceptation :**
```gherkin
Feature: Workflow affectation
  Scenario: Affectation d'un technicien
    Given une intervention en statut "ouverte"
    When le responsable SAV affecte le technicien "Pierre Martin"
    Then l'intervention passe en statut "affectée"
    And une entrée est créée dans la table affectations
    And un email est envoyé à "Pierre Martin"

  Scenario: Tentative d'affectation sans permission
    Given je suis connecté en tant que technicien
    When j'accède à /interventions/{id}/affecter
    Then je suis redirigé vers /interventions/{id} (lecture seule)
```

### Détail tâche #10 — Alertes stock (COULD HAVE)

**Fichier :** `apps/omega/src/app/(protected)/pieces/alertes/page.tsx`
- Tableau récapitulatif des pièces avec `stock_actuel < seuil_alerte`
- Badge rouge sur l'entrée "Pièces" de la sidebar quand il y a des alertes
- Email quotidien récapitulatif (Edge Function Supabase + cron) — optionnel v1

### Point de contrôle Phase 3

- [ ] POC Salesforce : connexion OAuth + lecture données → insertion `clients_vehicules` OK
- [ ] POC SAP : connexion + lecture données → insertion `pieces_detachees` OK (ou reporté si sandbox indispo)
- [ ] Workflow affectation fonctionnel (affectation + changement statut + email)
- [ ] Alertes stock affichées (si temps disponible)
- [ ] `pnpm build` et `pnpm test` passent

---

## Phase 4 — Tests transversaux

| Ordre | Titre | Priorité | Effort | MoSCoW | Skills | Dépend de | Review |
|-------|-------|----------|--------|--------|--------|-----------|--------|
| 11 | Tests unitaires des features avancées — 3 apps | 🟠 Haute | M | Should | testix | #1-#10 | — |
| 12 | Tests d'intégration API (parcours métier complet) | 🟡 Moyenne | M | Could | testix | #11 | — |

### Détail tâche #11 — Tests unitaires

**Fichiers à créer :**
- `apps/links/src/lib/hooks/__tests__/use-questionnaire.test.ts`
- `apps/links/src/lib/api/__tests__/storage.test.ts`
- `apps/creai/src/lib/hooks/__tests__/use-diagnostic-form.test.ts`
- `apps/omega/src/lib/integrations/salesforce/__tests__/sync.test.ts`
- `apps/omega/src/lib/integrations/sap/__tests__/sync.test.ts`

**Couverture cible :** ≥ 60% sur les nouvelles features

### Détail tâche #12 — Tests d'intégration (COULD HAVE)

Parcours métier complets testés via les API :
- Links : créer bénéficiaire → créer bilan → lancer questionnaire → répondre → valider
- CREAI : créer diagnostic → saisir indicateurs → ajouter recommandations → publier
- Omega : créer intervention → affecter → clôturer

### Point de contrôle Phase 4

- [ ] Couverture tests > 60% sur les nouvelles features
- [ ] Tests d'intégration couvrent les 3 parcours principaux (si temps)
- [ ] `pnpm test` : tous les tests passent

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Issues totales | 12 |
| Must Have | 4 (#1, #4, #7, #9) |
| Should Have | 5 (#2, #3, #5, #8, #11) |
| Could Have | 3 (#6, #10, #12) |
| Effort total | L-XL (10-14 jours) |
| Chemin critique par app | Links: #1 → #2 → #3 / CREAI: #4 → #5 → #6 / Omega: #7 → #9 |
| Parallélisme max | 3 apps indépendantes (Phase 1/2/3) |

### Estimations par tâche

| Effort | Tâches | Nb |
|--------|--------|----|
| S (< 0.5j) | #10 | 1 |
| M (0.5-1j) | #2, #3, #5, #6, #9, #11, #12 | 7 |
| L (1-2j) | #1, #4, #7, #8 | 4 |

### Scénario si retard

Si le sprint prend du retard, reporter par ordre inverse de MoSCoW :
1. Reporter #6 (export PDF), #10 (alertes stock), #12 (tests intégration)
2. Si toujours en retard, reporter #8 (SAP) — Salesforce suffit pour la v1
3. Ne jamais reporter #1, #4, #7, #9 (Must Have)

---

## Contraintes d'exécution

- **Base :** `master` (après merge Sprint 4)
- **POC intégrations (Salesforce/SAP)** : nécessitent des credentials sandbox — **vérifier disponibilité 1 semaine avant le sprint**
- **Build obligatoire** entre chaque phase
- **Tests obligatoires** avant chaque commit
- **⚠️ Validation humaine** requise pour les choix de librairies (#6 PDF) et les POC d'intégration (#7, #8)
- **Format commit :** `feat(scope): description`
- **Scopes :** `links`, `creai`, `omega`, `email`, `integrations`
- **Credentials** : jamais dans le code, uniquement Vercel env vars + `.env.local`

---

## Risques et mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Sandbox Salesforce indisponible | Haute | Fort | Préparer des mocks pour dev/test, valider credentials 1 semaine avant |
| Sandbox SAP indisponible | Haute | Fort | Reporter SAP en Sprint 7, se concentrer sur Salesforce |
| Scope creep features avancées | Moyenne | Moyen | MoSCoW strict, time-box chaque tâche, reporter les Could Have |
| Moteur de questionnaire sous-estimé | Moyenne | Fort | Commencer par les types simples (texte, choix), ajouter échelle/matrice si temps |
| Librairie PDF trop lourde | Faible | Moyen | Privilégier JSON/CSV en v1, PDF optionnel |
