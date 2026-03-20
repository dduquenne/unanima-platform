# Sprint 6 — Tests E2E, sécurité, RGPD et mise en production

**Projet :** Roadmap Unanima Platform
**Période :** 2026-06-01 → 2026-06-14
**Objectif :** Atteindre la qualité production : tests E2E, audit sécurité, conformité RGPD, déploiement final des 3 apps.
**Vélocité de référence :** Sprint 2 = 12/5j → Sprint 6 cible ~17 issues/10 jours

---

## Pré-requis (vérifier avant démarrage)

- [ ] Sprint 5 mergé dans `master` (au minimum les Must Have)
- [ ] Toutes les features métier critiques opérationnelles
- [ ] API CRUD + features avancées testées unitairement
- [ ] Credentials de production Supabase disponibles (3 projets)
- [ ] Domaines clients configurés et DNS propagés (ou en cours)
- [ ] Clé API Resend de production disponible
- [ ] `pnpm build` et `pnpm test` passent sur `master`

---

## Phase 1 — Tests E2E Playwright (parallélisable par app)

Parcours utilisateur complets pour chaque rôle principal.

| Ordre | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|----------|--------|--------|-----------|--------|
| 1 | Tests E2E Links : parcours consultant | 🔴 Critique | L | testix, recettix | Sprint 5 | — |
| 2 | Tests E2E Links : parcours bénéficiaire | 🟠 Haute | M | testix, recettix | Sprint 5 | — |
| 3 | Tests E2E CREAI : parcours coordonnateur + direction | 🔴 Critique | L | testix, recettix | Sprint 5 | — |
| 4 | Tests E2E Omega : parcours responsable SAV + technicien | 🔴 Critique | L | testix, recettix | Sprint 5 | — |

### Fichiers à créer

**Configuration :**
- `apps/links/playwright.config.ts`
- `apps/links/e2e/fixtures/auth.ts` — Login helpers par rôle
- `apps/links/e2e/fixtures/seed.ts` — Données de test reproductibles
- `apps/creai/playwright.config.ts`
- `apps/creai/e2e/fixtures/auth.ts`
- `apps/omega/playwright.config.ts`
- `apps/omega/e2e/fixtures/auth.ts`

**Tests :**
- `apps/links/e2e/consultant-flow.spec.ts`
- `apps/links/e2e/beneficiaire-flow.spec.ts`
- `apps/creai/e2e/coordonnateur-flow.spec.ts`
- `apps/omega/e2e/responsable-sav-flow.spec.ts`

### Détail tâche #1 — E2E consultant Links

```gherkin
Feature: Parcours consultant Link's Accompagnement
  Background:
    Given je suis connecté en tant que consultant "Marie Dupont"

  Scenario: Gestion complète d'un bénéficiaire
    When je navigue vers /beneficiaires
    And je clique "Nouveau bénéficiaire"
    And je remplis le formulaire (nom: "Jean Martin", email: "jean@test.com")
    And je clique "Sauvegarder"
    Then je vois la fiche de "Jean Martin"
    And un toast "Bénéficiaire créé" est affiché

  Scenario: Création et suivi d'un bilan
    Given un bénéficiaire "Jean Martin" existe
    When je navigue vers /beneficiaires/{id}
    And je clique "Créer un bilan"
    And je sélectionne le type "Bilan de compétences"
    And je valide
    Then un bilan est créé en statut "en_cours"
    And je suis redirigé vers /bilans/{bilan_id}

  Scenario: Dashboard consultant cohérent
    When je navigue vers /dashboard
    Then les KPIs correspondent au nombre réel de bénéficiaires et bilans
    And les alertes affichent les bilans proches de l'échéance
```

### Détail tâche #3 — E2E CREAI

```gherkin
Feature: Parcours coordonnateur CREAI
  Background:
    Given je suis connecté en tant que coordonnateur

  Scenario: Création d'un diagnostic complet
    When je navigue vers /diagnostics/new
    And je sélectionne l'établissement "EHPAD Les Lilas"
    And je complète les 5 étapes du wizard diagnostic
    And je valide le diagnostic
    Then le diagnostic est en statut "validé"
    When je navigue vers /dashboard
    Then le KPI "Diagnostics en cours" est mis à jour
```

### Détail tâche #4 — E2E Omega

```gherkin
Feature: Parcours responsable SAV Omega
  Background:
    Given je suis connecté en tant que responsable SAV

  Scenario: Cycle de vie d'une intervention
    When je crée une intervention (client: "Garage Martin", type: "Réparation")
    Then l'intervention est en statut "ouverte"
    When j'affecte le technicien "Pierre Duval"
    Then l'intervention passe en statut "affectée"
    When Pierre Duval marque l'intervention comme terminée
    Then l'intervention passe en statut "terminée"
    And le KPI "Taux de résolution" est mis à jour
```

### Configuration Playwright commune

```typescript
// apps/links/playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
})
```

### Fixtures de test

Chaque app fournit un script de seed Supabase avec :
- 1 utilisateur par rôle (consultant, bénéficiaire, super_admin pour Links, etc.)
- Données minimales pour chaque parcours (1-2 bénéficiaires, 1 bilan, 1 questionnaire avec questions)
- Script reproductible : `pnpm seed --filter=@unanima/links`

### Point de contrôle Phase 1

- [ ] ≥ 4 scénarios E2E passent en local (1 par rôle principal)
- [ ] Fixtures de test reproductibles (seed + teardown)
- [ ] Screenshots on failure configurés
- [ ] `pnpm test:e2e` script ajouté au package.json de chaque app
- [ ] CI GitHub Actions exécute les tests E2E (optionnel si CI pas en place)

---

## Phase 2 — Audit sécurité (séquentiel)

| Ordre | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|----------|--------|--------|-----------|--------|
| 5 | Audit sécurité OWASP Top 10 | 🔴 Critique | L | securix, auditix | Phase 1 | ⚠️ Validation humaine |
| 6 | Audit RLS Supabase (chaque rôle / chaque table) | 🔴 Critique | M | securix, databasix | Phase 1 | ⚠️ Validation humaine |
| 7 | Hardening headers HTTP (CSP, HSTS, X-Frame-Options) | 🟠 Haute | S | securix, deploix | #5 | — |
| 8 | Audit des dépendances (`pnpm audit`) | 🟡 Moyenne | XS | securix | — | — |

### Détail tâche #5 — Audit OWASP Top 10

**Rapport à produire :** `docs/platform/reports/RPT-AUDIT-SECURITE-V1.md`

**Checklist par app :**
- [ ] A01 **Broken Access Control** → middleware auth + RLS + vérification permissions API
- [ ] A02 **Cryptographic Failures** → gestion tokens Supabase, pas de secrets côté client
- [ ] A03 **Injection** → requêtes Supabase paramétrisées (pas de raw SQL), validation Zod des entrées
- [ ] A04 **Insecure Design** → revue des flux d'authentification et d'autorisation
- [ ] A05 **Security Misconfiguration** → variables d'environnement, headers HTTP, CORS
- [ ] A06 **Vulnerable Components** → `pnpm audit`, dépendances à jour
- [ ] A07 **XSS** → pas de `dangerouslySetInnerHTML`, inputs sanitisés
- [ ] A08 **Software Integrity** → vérification des imports, lock file
- [ ] A09 **Logging & Monitoring** → audit_logs en place, pas de données sensibles dans les logs
- [ ] A10 **SSRF** → pas de fetch côté serveur avec URL utilisateur non validée

**Critères d'acceptation :**
```gherkin
Feature: Audit sécurité
  Scenario: Aucune faille critique
    Given l'audit OWASP est terminé
    Then aucune faille de niveau Critique n'est identifiée
    And toutes les failles de niveau Haute ont un plan de correction

  Scenario: RLS correctement appliquées
    Given un utilisateur avec le rôle "beneficiaire"
    When il tente d'accéder aux données d'un autre bénéficiaire via l'API
    Then il reçoit 403 ou une liste vide
```

### Détail tâche #6 — Audit RLS

**Méthode :** Pour chaque table et chaque rôle, vérifier SELECT/INSERT/UPDATE/DELETE :

| Table | beneficiaire | consultant | super_admin |
|-------|-------------|------------|-------------|
| beneficiaires | SELECT own | SELECT assigned | ALL |
| bilans | SELECT own | SELECT assigned | ALL |
| responses | SELECT/INSERT own | SELECT assigned | ALL |
| documents | SELECT/INSERT own | SELECT assigned | ALL |

(Tables similaires pour CREAI et Omega)

**Tests pgTAP (si disponible)** ou tests manuels via `supabase-js` en mode service_role

### Détail tâche #7 — Headers HTTP

**Fichiers à modifier :**
- `apps/links/next.config.js` — section `headers`
- `apps/creai/next.config.js`
- `apps/omega/next.config.js`

```javascript
// next.config.js
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' *.supabase.co;" },
    ],
  }]
}
```

### Détail tâche #8 — Audit dépendances

```bash
pnpm audit --audit-level=high
```
**Cible :** 0 vulnérabilité HIGH ou CRITICAL. Mettre à jour ou overrider si nécessaire.

### Point de contrôle Phase 2

- [ ] Rapport d'audit sécurité produit et validé par l'humain
- [ ] Aucune faille critique identifiée (ou plan de correction en place)
- [ ] RLS testées pour chaque rôle de chaque app (matrice complète)
- [ ] Headers de sécurité configurés dans `next.config.js` (3 apps)
- [ ] `pnpm audit` : 0 HIGH/CRITICAL

---

## Phase 3 — Conformité RGPD (parallélisable par app)

| Ordre | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|----------|--------|--------|-----------|--------|
| 9 | Pages RGPD Links : mentions légales, confidentialité, cookies | 🟠 Haute | M | rgpdix, ergonomix | Phase 2 | — |
| 10 | Pages RGPD CREAI | 🟠 Haute | S | rgpdix, ergonomix | Phase 2 | — |
| 11 | Pages RGPD Omega | 🟠 Haute | S | rgpdix, ergonomix | Phase 2 | — |
| 12 | Fonctionnalités RGPD : export données personnelles, suppression compte | 🟠 Haute | M | rgpdix, archicodix | #9 | — |

### Fichiers à créer (pattern par app)

**Pages publiques (hors layout protégé) :**
- `apps/links/src/app/mentions-legales/page.tsx` — utilise `<LegalNotice>` de `@unanima/rgpd`
- `apps/links/src/app/confidentialite/page.tsx` — utilise `<PrivacyPolicy>` de `@unanima/rgpd`
- `apps/links/src/app/cookies/page.tsx` — page de gestion des cookies

**Configuration :**
- `apps/links/src/config/rgpd.config.ts` — `RGPDConfig` (raison sociale, DPO, finalités)

**Bandeau cookies :**
- Intégré dans `apps/links/src/app/layout.tsx` — `<CookieBanner>` de `@unanima/rgpd`
- Consentement explicite, stockage dans localStorage, respect du choix

### Détail tâche #12 — Export et suppression données

**Fichiers à créer :**
- `apps/links/src/app/api/rgpd/export/route.ts` — Export JSON de toutes les données personnelles
- `apps/links/src/app/api/rgpd/delete/route.ts` — Demande de suppression (soft delete + anonymisation)
- `apps/links/src/app/(protected)/profile/mes-donnees/page.tsx` — Interface utilisateur

**Flux export :**
1. Utilisateur clique "Exporter mes données" sur `/profile/mes-donnees`
2. Route handler collecte : profil + bénéficiaires/bilans/réponses (selon rôle)
3. Retourne un JSON téléchargeable
4. Log audit : `{ action: 'rgpd_export', user_id }`

**Flux suppression :**
1. Utilisateur clique "Supprimer mon compte" → `<Modal>` de confirmation avec saisie du mot "SUPPRIMER"
2. Route handler : soft delete (is_active=false) + anonymisation (full_name → "Utilisateur supprimé", email → hash)
3. Données métier conservées anonymisées (contrainte légale bilans de compétences)
4. Log audit : `{ action: 'rgpd_delete_request', user_id }`
5. Email de confirmation de suppression

**Critères d'acceptation :**
```gherkin
Feature: Conformité RGPD
  Scenario: Export des données personnelles
    Given je suis connecté en tant que bénéficiaire
    When j'accède à /profile/mes-donnees
    And je clique "Exporter mes données"
    Then un fichier JSON est téléchargé
    And il contient mon profil, mes bilans et mes réponses
    And un log audit est enregistré

  Scenario: Suppression de compte
    Given je suis connecté en tant que bénéficiaire
    When j'accède à /profile/mes-donnees
    And je clique "Supprimer mon compte"
    And je confirme en tapant "SUPPRIMER"
    Then mon compte est désactivé
    And mon nom est anonymisé en "Utilisateur supprimé"
    And mon email est remplacé par un hash
    And je suis déconnecté

  Scenario: Bandeau cookies
    Given je visite l'application pour la première fois
    Then un bandeau cookies est affiché
    When je clique "Accepter"
    Then le bandeau disparaît
    And mon choix est enregistré
    When je reviens sur le site
    Then le bandeau n'est plus affiché

  Scenario: Pages légales accessibles
    Given je ne suis pas connecté
    When j'accède à /mentions-legales
    Then la page s'affiche avec les mentions légales de Link's Accompagnement
    When j'accède à /confidentialite
    Then la politique de confidentialité s'affiche
```

### Point de contrôle Phase 3

- [ ] Pages mentions légales, confidentialité, cookies accessibles (3 apps)
- [ ] Bandeau cookies fonctionnel (affichage, consentement, persistance)
- [ ] Export données personnelles fonctionnel (JSON téléchargeable)
- [ ] Suppression de compte fonctionnelle (soft delete + anonymisation)
- [ ] Logs audit RGPD enregistrés pour chaque action
- [ ] Footer avec liens vers les pages légales

---

## Phase 4 — Mise en production (séquentiel, validation humaine obligatoire)

| Ordre | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|----------|--------|--------|-----------|--------|
| 13 | Checklist pré-déploiement | 🔴 Critique | M | deploix | Phase 2, Phase 3 | ⚠️ |
| 14 | Déploiement Links en production (Vercel) | 🔴 Critique | S | deploix | #13 | ⚠️ |
| 15 | Déploiement CREAI en production (Vercel) | 🔴 Critique | S | deploix | #13 | ⚠️ |
| 16 | Déploiement Omega en production (Vercel) | 🔴 Critique | S | deploix | #13 | ⚠️ |
| 17 | Smoke tests post-déploiement | 🟠 Haute | S | testix, deploix | #14, #15, #16 | — |

### Détail tâche #13 — Checklist pré-déploiement

**Document à produire :** `docs/platform/reports/RPT-CHECKLIST-DEPLOY-V1.md`

**Checklist par app :**

**Infrastructure Vercel :**
- [ ] Projet Vercel créé et lié au repo GitHub
- [ ] Root Directory configuré (`apps/links`, `apps/creai`, `apps/omega`)
- [ ] Framework Preset : Next.js
- [ ] `vercel.json` en place avec `ignoreCommand`

**Variables d'environnement (Vercel Production) :**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` — URL du projet Supabase de production
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Clé anon de production
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — Clé service_role (Secret)
- [ ] `RESEND_API_KEY` — Clé API Resend de production (Secret)
- [ ] `EMAIL_FROM` — Adresse email expéditeur vérifiée
- [ ] (Omega uniquement) `SALESFORCE_CLIENT_ID`, `SALESFORCE_CLIENT_SECRET`, `SALESFORCE_INSTANCE_URL`
- [ ] (Omega uniquement) `SAP_API_URL`, `SAP_API_KEY`, `SAP_COMPANY_DB`

**Base de données Supabase (Production) :**
- [ ] Toutes les migrations appliquées (001-015)
- [ ] RLS policies en place et testées
- [ ] Storage buckets créés (Links : `links-documents`)
- [ ] Données de seed supprimées (pas de données de test en prod)
- [ ] Backups automatiques activés

**DNS & Domaines :**
- [ ] Domaines configurés dans Vercel
- [ ] DNS propagés et vérifiés
- [ ] Certificats SSL automatiques Vercel

**Monitoring :**
- [ ] Endpoint `/api/health` accessible sur chaque app
- [ ] Alertes configurées (uptime monitoring)

### Détail tâches #14/#15/#16 — Déploiement

**Processus par app :**
1. Merge `master` vers la branche de déploiement (ou déploiement depuis `master`)
2. Vérification build Vercel preview OK
3. Promotion vers production via Vercel dashboard
4. Vérification `/api/health` → 200
5. **Validation humaine** : navigation rapide (login, dashboard, 1 action métier)

**Rollback :** Vercel conserve chaque déploiement. Rollback en 1 clic si problème.

### Détail tâche #17 — Smoke tests post-déploiement

Pour chaque app déployée en production :

```gherkin
Feature: Smoke tests production
  Scenario: Health check
    When j'appelle GET {production_url}/api/health
    Then je reçois 200 avec { status: "ok" }

  Scenario: Login fonctionnel
    When je me connecte avec un compte de test
    Then j'accède au dashboard
    And la sidebar s'affiche correctement

  Scenario: Navigation complète
    Given je suis connecté
    When je navigue vers chaque entrée de la sidebar
    Then chaque page charge sans erreur 500

  Scenario: Action métier minimale
    Given je suis connecté (Links: consultant, CREAI: coordonnateur, Omega: responsable)
    When je crée un enregistrement de test
    Then la création réussit
    When je supprime l'enregistrement de test
    Then la suppression réussit
```

### Point de contrôle Phase 4

- [ ] 3 apps déployées en production
- [ ] Smoke tests passent sur les 3 apps (health, login, navigation, CRUD)
- [ ] Monitoring opérationnel (alertes en place)
- [ ] Documentation de déploiement produite
- [ ] **Aucune donnée de test en production**

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Issues totales | 17 |
| Critiques | 8 (#1, #3, #4, #5, #6, #13, #14, #15, #16) |
| Hautes | 7 (#2, #7, #9, #10, #11, #12, #17) |
| Moyennes | 1 (#8) |
| Effort total | M-L (8-12 jours) |
| Chemin critique | E2E (#1) → Audit sécu (#5) → RGPD (#9) → Checklist (#13) → Déploiement (#14) → Smoke (#17) |
| Parallélisme max | 4 (Phase 1: E2E/app) + 3 (Phase 3: RGPD/app) + 3 (Phase 4: déploiements) |

### Estimations par tâche

| Effort | Tâches | Nb |
|--------|--------|----|
| XS (< 2h) | #8 | 1 |
| S (< 0.5j) | #7, #10, #11, #14, #15, #16, #17 | 7 |
| M (0.5-1j) | #2, #6, #9, #12, #13 | 5 |
| L (1-2j) | #1, #3, #4, #5 | 4 |

---

## Contraintes d'exécution

- **Base :** `master` (après merge Sprint 5)
- **⚠️ Validation humaine obligatoire** pour :
  - Audit sécurité (#5, #6)
  - Chaque déploiement production (#14, #15, #16)
- **Build obligatoire** entre chaque phase
- **Tests obligatoires** avant chaque commit
- **Aucun déploiement production sans** : E2E vert + audit sécu validé + RGPD en place
- **Format commit :** `feat(scope): description` ou `fix(scope): ...`
- **Scopes :** `links`, `creai`, `omega`, `security`, `rgpd`, `deploy`, `e2e`
- **Rollback plan :** chaque déploiement Vercel conserve les versions précédentes, rollback en 1 clic

---

## Risques et mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Fixtures E2E fragiles | Moyenne | Moyen | Scripts de seed reproductibles, cleanup after each test |
| Faille sécurité découverte lors de l'audit | Moyenne | Fort | Prévoir 2 jours de buffer pour corrections |
| Retard Sprint 5 impactant Sprint 6 | Moyenne | Fort | Sprint 6 démarre avec les Must Have Sprint 5, les Could Have reportés n'impactent pas |
| DNS pas propagés à temps | Faible | Moyen | Déployer d'abord sur URL Vercel par défaut, basculer le domaine ensuite |
| Données de test en production | Faible | Fort | Checklist explicite, vérification manuelle post-déploiement |
| Performance production vs dev | Moyenne | Moyen | Smoke tests incluent vérification temps de réponse < 2s |

---

## Livrables finaux Sprint 6

À la fin de ce sprint, le projet Unanima v1 est en production :

| Livrable | Description |
|----------|-------------|
| 3 apps en production | Links, CREAI, Omega déployées sur Vercel |
| Tests E2E | ≥ 4 parcours automatisés (1 par rôle principal) |
| Rapport d'audit sécurité | OWASP Top 10 + audit RLS |
| Conformité RGPD | Pages légales + bandeau cookies + export/suppression |
| Documentation | Checklist déploiement + rapport audit |
| Monitoring | Health checks + alertes |
