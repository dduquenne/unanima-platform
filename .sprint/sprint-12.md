# Sprint 12 — Links : Mode Simulation (données fictives)

**Projet :** Link's Accompagnement — Post-MVP
**Période :** Sprint 12
**Objectif :** Intégrer un mode simulation activable par variable d'environnement (`NEXT_PUBLIC_SIMULATION_MODE=true`) permettant d'afficher tous les écrans de l'app Links avec des données fictives, sans connexion Supabase.

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Issues | 9 (#131, #132, #133, #134, #135, #136, #137, #138, #139) |
| Phases | 4 |
| Effort total | M (~2-3 jours) |
| Chemin critique | #131 → #132 → #134/#135/#136 → #139 |
| Parallélisme max | Phase 2 (3 tâches) + Phase 3 (2 tâches) |

---

## Prérequis avant démarrage Sprint 12

- [x] Sprint 11 complet (tous les écrans implémentés)
- [x] Aucune dépendance externe

---

## Phase 1 — Fondations (séquentiel, bloquant)

| Ordre | Issue | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|-----------|--------|
| 1 | #131 | Config env + module simulation | 🔴 Critique | archicodix | — | — |
| 2 | #132 | Fixtures de données fictives réalistes | 🔴 Critique | archicodix | — | — |
| 3 | #133 | Auth bypass + sélecteur de rôle simulation | 🟠 Haute | archicodix | #131 | — |

**Point de contrôle Phase 1 :**
- [x] `NEXT_PUBLIC_SIMULATION_MODE=true` reconnu par l'app
- [x] Fixtures couvrent les 3 rôles et toutes les entités
- [x] Login contourné en mode simulation avec choix du rôle

---

## Phase 2 — Interception API (parallélisable)

| Ordre | Issue | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|-----------|--------|
| 4 | #134 | Mock handlers — APIs bénéficiaire | 🟠 Haute | archicodix | #131, #132 | — |
| 5 | #135 | Mock handlers — APIs consultant | 🟠 Haute | archicodix | #131, #132 | — |
| 6 | #136 | Mock handlers — APIs admin | 🟠 Haute | archicodix | #131, #132 | — |

**Point de contrôle Phase 2 :**
- [x] Tous les écrans bénéficiaire s'affichent avec données fictives
- [x] Tous les écrans consultant s'affichent avec données fictives
- [x] Tous les écrans admin s'affichent avec données fictives
- [x] Aucune erreur Supabase en console

---

## Phase 3 — UX simulation (parallélisable)

| Ordre | Issue | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|-----------|--------|
| 7 | #137 | Bandeau visuel "Mode Simulation" + sélecteur de rôle | 🟡 Moyenne | ergonomix | #133 | — |
| 8 | #138 | Documentation & mise à jour .env.local.example | 🟢 Basse | documentalix | #131-#137 | — |

**Point de contrôle Phase 3 :**
- [x] Bandeau visible sur tous les écrans en mode simulation
- [x] Sélecteur de rôle permet de basculer sans recharger
- [x] .env.local.example documenté

---

## Phase 4 — Qualité

| Ordre | Issue | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|-----------|--------|
| 9 | #139 | Tests unitaires fixtures + handlers mock | 🟡 Moyenne | testix | #134, #135, #136 | — |

**Point de contrôle Phase 4 :**
- [x] `pnpm test --filter=@unanima/links` passe
- [x] `pnpm build --filter=@unanima/links` passe (simulation ON et OFF)
- [x] Aucune régression des tests existants

---

## Détail des issues

### #131 — [PILOTIX-131] Config env + module simulation
**Labels :** `pilotix`, `phase:1`, `skill:archicodix`, `app:links`, `simulation`

#### Objectif
Créer l'infrastructure de configuration du mode simulation : variable d'environnement, helper d'accès, et point d'entrée du module.

#### Livrables
- `apps/links/src/lib/simulation/config.ts` — export `isSimulationMode(): boolean` basé sur `NEXT_PUBLIC_SIMULATION_MODE`
- `apps/links/src/lib/simulation/index.ts` — barrel export
- Mise à jour de `apps/links/.env.local.example` avec `NEXT_PUBLIC_SIMULATION_MODE=false`

#### Critères d'acceptation
- [x] `isSimulationMode()` retourne `true` quand `NEXT_PUBLIC_SIMULATION_MODE=true`
- [x] `isSimulationMode()` retourne `false` par défaut (variable absente ou `false`)
- [x] Utilisable côté client ET serveur (route handlers)
- [x] Aucun impact quand le mode est désactivé

#### Estimation : XS

---

### #132 — [PILOTIX-132] Fixtures de données fictives réalistes
**Labels :** `pilotix`, `phase:1`, `skill:archicodix`, `app:links`, `simulation`

#### Objectif
Créer un jeu complet de données fictives réalistes couvrant toutes les entités de l'app Links pour les 3 rôles.

#### Livrables
- `apps/links/src/lib/simulation/fixtures/profiles.ts` — 1 admin, 2 consultants, 5 bénéficiaires
- `apps/links/src/lib/simulation/fixtures/phases.ts` — 6 phases avec statuts variés par bénéficiaire
- `apps/links/src/lib/simulation/fixtures/questionnaires.ts` — Questionnaires et questions par phase
- `apps/links/src/lib/simulation/fixtures/responses.ts` — Réponses partielles et complètes
- `apps/links/src/lib/simulation/fixtures/sessions.ts` — Sessions planifiées, passées, futures
- `apps/links/src/lib/simulation/fixtures/documents.ts` — Documents de phase (PDF/DOCX fictifs)
- `apps/links/src/lib/simulation/fixtures/stats.ts` — KPIs admin (stats agrégées)
- `apps/links/src/lib/simulation/fixtures/index.ts` — Barrel export

#### Critères d'acceptation
- [x] Données typées avec les interfaces existantes (`Profile`, `PhaseValidation`, `Session`, etc.)
- [x] UUIDs déterministes (pas de `crypto.randomUUID()`)
- [x] Données réalistes (noms français, dates cohérentes, progression logique)
- [x] Couverture de tous les états : phases libre/en_cours/validee, sessions passées/futures
- [x] Au moins 1 bénéficiaire avec bilan terminé, 1 en cours, 1 nouveau

#### Estimation : M

---

### #133 — [PILOTIX-133] Auth bypass + sélecteur de rôle simulation
**Labels :** `pilotix`, `phase:1`, `skill:archicodix`, `app:links`, `simulation`

#### Objectif
Contourner l'authentification Supabase en mode simulation et permettre de choisir le rôle affiché.

#### Dépendances
- Bloqué par : #131

#### Livrables
- `apps/links/src/lib/simulation/auth.ts` — `getSimulationSession(role)` retournant un objet session fictif
- Modification du middleware (`src/middleware.ts`) pour court-circuiter la vérification Supabase quand simulation active
- Stockage du rôle sélectionné dans un cookie ou query param (`?role=consultant`)

#### Critères d'acceptation
- [x] En mode simulation, aucun appel à Supabase Auth
- [x] Le rôle par défaut est `beneficiaire`
- [x] Le rôle peut être changé via le sélecteur (cookie `simulation-role`)
- [x] Les redirections par rôle fonctionnent (bénéficiaire → /dashboard, consultant → /beneficiaires, admin → /admin)
- [x] En mode normal, aucun changement de comportement

#### Estimation : S

---

### #134 — [PILOTIX-134] Mock handlers — APIs bénéficiaire
**Labels :** `pilotix`, `phase:2`, `skill:archicodix`, `app:links`, `simulation`

#### Objectif
Intercepter les route handlers des APIs bénéficiaire pour retourner les fixtures en mode simulation.

#### Dépendances
- Bloqué par : #131, #132

#### APIs concernées
- `GET /api/phase-validations` — Statuts des 6 phases
- `GET /api/phase-responses?phase=N` — Réponses du bénéficiaire
- `POST /api/phase-responses` — Autosave (réponse 200 sans écriture)
- `PATCH /api/phase-validations` — Validation de phase (réponse 200 sans écriture)
- `GET /api/sessions` — 6 sessions du bénéficiaire
- `GET /api/documents?phase_number=N` — Documents par phase
- `GET /api/questionnaires?phase_number=N` — Questions par phase
- `GET /api/auth/ensure-profile` — Profil fictif

#### Pattern d'interception
```typescript
// En tête de chaque route handler :
if (isSimulationMode()) {
  return NextResponse.json({ data: getSimulationPhaseValidations(userId) })
}
// ... code Supabase existant inchangé
```

#### Critères d'acceptation
- [x] Dashboard bénéficiaire affiche progression, phases, sessions
- [x] Page bilans affiche les questionnaires avec réponses pré-remplies
- [x] Autosave retourne succès sans erreur
- [x] Documents listés (téléchargement désactivé en simulation)
- [x] Code existant inchangé quand simulation OFF

#### Estimation : M

---

### #135 — [PILOTIX-135] Mock handlers — APIs consultant
**Labels :** `pilotix`, `phase:2`, `skill:archicodix`, `app:links`, `simulation`

#### Objectif
Intercepter les route handlers des APIs consultant pour retourner les fixtures.

#### Dépendances
- Bloqué par : #131, #132

#### APIs concernées
- `GET /api/consultant/beneficiaires` — Liste des bénéficiaires assignés
- `GET /api/consultant/beneficiaires/[id]` — Dossier bénéficiaire détail
- `POST /api/consultant/beneficiaires/[id]/sessions` — Planification session (réponse 200)
- `GET /api/consultant/beneficiaires/[id]/session-notes` — Notes de session
- `POST /api/consultant/beneficiaires/[id]/session-notes` — Sauvegarde note (réponse 200)

#### Critères d'acceptation
- [x] Dashboard consultant affiche KPIs et liste bénéficiaires
- [x] Dossier bénéficiaire détail affiche phases, sessions, notes
- [x] Écritures (sessions, notes) retournent succès sans erreur
- [x] Code existant inchangé quand simulation OFF

#### Estimation : S

---

### #136 — [PILOTIX-136] Mock handlers — APIs admin
**Labels :** `pilotix`, `phase:2`, `skill:archicodix`, `app:links`, `simulation`

#### Objectif
Intercepter les route handlers des APIs admin pour retourner les fixtures.

#### Dépendances
- Bloqué par : #131, #132

#### APIs concernées
- `GET /api/admin/stats` — KPIs + liste bénéficiaires
- `GET /api/admin/users` — Liste des utilisateurs
- `POST /api/admin/users` — Création utilisateur (réponse 200 simulée)
- `PATCH /api/admin/users/[id]` — Modification utilisateur (réponse 200)
- `DELETE /api/admin/users/[id]` — Suppression utilisateur (réponse 200)
- `POST /api/admin/users/[id]/reset-password` — Reset password (réponse 200)
- `POST /api/documents/upload` — Upload document (réponse 200)

#### Critères d'acceptation
- [x] Dashboard admin affiche 4 KPIs et tableau bénéficiaires
- [x] Page utilisateurs affiche la liste avec recherche/filtres
- [x] CRUD utilisateurs retourne succès sans erreur
- [x] Code existant inchangé quand simulation OFF

#### Estimation : S

---

### #137 — [PILOTIX-137] Bandeau visuel "Mode Simulation" + sélecteur de rôle
**Labels :** `pilotix`, `phase:3`, `skill:ergonomix`, `app:links`, `simulation`

#### Objectif
Afficher un bandeau persistant et un sélecteur de rôle quand le mode simulation est actif.

#### Dépendances
- Bloqué par : #133

#### Livrables
- `apps/links/src/components/simulation-banner.tsx` — Bandeau + sélecteur
- Intégration dans `apps/links/src/app/(protected)/layout.tsx`

#### Spécifications UI
- Bandeau fixe en haut de page (au-dessus du header)
- Fond orange/ambre avec icône ⚠️
- Texte : "Mode Simulation — Données fictives"
- Sélecteur de rôle : dropdown avec 3 options (Bénéficiaire, Consultant, Admin)
- Le changement de rôle recharge la page vers la home du rôle sélectionné

#### Critères d'acceptation
- [x] Bandeau visible sur toutes les pages protégées
- [x] Sélecteur permet de changer de rôle
- [x] Le changement redirige vers la page d'accueil du rôle
- [x] Bandeau absent quand simulation OFF
- [x] Accessible (contraste, focus, aria-label)

#### Estimation : S

---

### #138 — [PILOTIX-138] Documentation mode simulation
**Labels :** `pilotix`, `phase:3`, `skill:documentalix`, `app:links`, `simulation`

#### Objectif
Documenter le mode simulation pour les développeurs et le client.

#### Dépendances
- Bloqué par : #131-#137

#### Livrables
- Mise à jour `apps/links/.env.local.example` avec commentaire explicatif
- Section "Mode Simulation" dans `apps/links/CLAUDE.md`

#### Critères d'acceptation
- [x] Instructions claires pour activer/désactiver le mode
- [x] Liste des limitations (pas de persistance, pas de téléchargement documents)
- [x] Description des données fictives disponibles

#### Estimation : XS

---

### #139 — [PILOTIX-139] Tests unitaires fixtures + handlers mock
**Labels :** `pilotix`, `phase:4`, `skill:testix`, `app:links`, `simulation`

#### Objectif
Valider le bon fonctionnement du mode simulation avec des tests automatisés.

#### Dépendances
- Bloqué par : #134, #135, #136

#### Livrables
- `apps/links/__tests__/simulation/config.test.ts` — Tests de `isSimulationMode()`
- `apps/links/__tests__/simulation/fixtures.test.ts` — Validation de cohérence des fixtures
- `apps/links/__tests__/simulation/handlers.test.ts` — Tests des handlers mock

#### Critères d'acceptation
- [x] `isSimulationMode()` testé (true/false/absent)
- [x] Fixtures valident les types TypeScript
- [x] Fixtures contiennent les données attendues (nb profils, phases, etc.)
- [x] Build passe avec simulation ON et OFF
- [x] Aucune régression des tests existants

#### Estimation : S

---

## Contraintes d'exécution

1. **Aucune modification des composants UI existants** — l'interception se fait au niveau API
2. **Code simulation isolé** dans `src/lib/simulation/` — facilement supprimable
3. **Aucun impact en production** — `NEXT_PUBLIC_SIMULATION_MODE` absent = mode normal
4. **Pattern d'interception uniforme** — `if (isSimulationMode()) return mock` en tête de handler
5. **Pas de tree-shaking nécessaire** — les fixtures sont légères (données JSON statiques)
