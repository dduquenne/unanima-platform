# Sprint 6 — Tests E2E, sécurité, RGPD et mise en production

**Projet :** Roadmap Unanima Platform
**Période :** 2026-06-01 → 2026-06-14
**Objectif :** Atteindre la qualité production : tests E2E, audit sécurité, conformité RGPD, déploiement final des 3 apps.

---

## Phase 1 — Tests E2E Playwright (parallélisable par app)

Parcours utilisateur complets pour chaque rôle principal.

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| ✅ 1 | Tests E2E Links : parcours consultant (login → créer bénéficiaire → créer bilan → remplir questionnaire → voir résultats) | 🔴 Critique | testix, recettix | Sprint 5 | Fait (2026-03-20) |
| ✅ 2 | Tests E2E Links : parcours bénéficiaire (login → voir mes bilans → remplir questionnaire → voir documents) | 🟠 Haute | testix, recettix | Sprint 5 | Fait (2026-03-20) |
| ✅ 3 | Tests E2E CREAI : parcours coordonnateur (login → créer diagnostic → saisir indicateurs → publier rapport) | 🔴 Critique | testix, recettix | Sprint 5 | Fait (2026-03-20) |
| ✅ 4 | Tests E2E Omega : parcours responsable SAV (login → créer intervention → affecter technicien → clôturer) | 🔴 Critique | testix, recettix | Sprint 5 | Fait (2026-03-20) |

**Détail issue #1 — E2E consultant Links :**
```gherkin
Feature: Parcours consultant Link's
  Scenario: Gestion complète d'un bénéficiaire
    Given je suis connecté en tant que consultant
    When je crée un nouveau bénéficiaire "Jean Dupont"
    And je crée un bilan de compétences pour "Jean Dupont"
    And je lance le questionnaire du bilan
    Then le bilan apparaît dans mon dashboard
    And le bénéficiaire peut voir son bilan
```

**Configuration Playwright :**
- `playwright.config.ts` par app
- Fixtures : utilisateurs de test (1 par rôle) via seed Supabase
- Base URL : `http://localhost:3000` (dev) / URL preview Vercel (CI)
- Screenshots on failure
- Timeout : 30s par test

**Point de contrôle Phase 1 :**
- [ ] 4+ scénarios E2E passent en local
- [ ] Fixtures de test reproductibles
- [ ] CI GitHub Actions exécute les tests E2E
- [ ] Screenshots on failure configurés

---

## Phase 2 — Audit sécurité (séquentiel)

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| ✅ 5 | Audit sécurité applicatif : OWASP Top 10, validation des entrées, XSS, CSRF, injection SQL | 🔴 Critique | securix, auditix | Phase 1 | Fait (2026-03-20) — Rapport: docs/platform/reports/RPT-2026-001-audit-securite.md |
| ✅ 6 | Audit RLS Supabase : vérifier que chaque rôle ne voit que ses données autorisées | 🔴 Critique | securix, databasix | Phase 1 | Fait (2026-03-20) — Inclus dans rapport audit |
| ✅ 7 | Hardening headers HTTP : CSP, HSTS, X-Frame-Options, X-Content-Type-Options | 🟠 Haute | securix, deploix | #5 | Fait (2026-03-20) |
| ✅ 8 | Audit des dépendances : `pnpm audit`, vérification CVE, mise à jour si nécessaire | 🟡 Moyenne | securix | — | Fait (2026-03-20) — 0 HIGH/CRITICAL, 2 moderate |

**Détail issue #5 — Audit OWASP :**
- Checklist OWASP Top 10 pour chaque app :
  - A01 Broken Access Control → vérifier middleware + RLS
  - A02 Cryptographic Failures → vérifier gestion des tokens
  - A03 Injection → vérifier paramètres SQL (Supabase protège, mais vérifier les raw queries)
  - A07 XSS → vérifier les inputs rendus côté client
- Rapport de sécurité : `docs/platform/reports/RPT-XXXX-audit-securite.md`

**Détail issue #6 — Audit RLS :**
- Pour chaque table et chaque rôle, vérifier :
  - SELECT : ne retourne que les données autorisées
  - INSERT : ne permet que les insertions autorisées
  - UPDATE : ne permet que les modifications autorisées
  - DELETE : ne permet que les suppressions autorisées
- Tests pgTAP si possible (via `@supabase/supabase-js` en mode service_role)

**Point de contrôle Phase 2 :**
- [ ] Rapport d'audit sécurité produit et validé
- [ ] Aucune faille critique identifiée
- [ ] RLS testées pour chaque rôle de chaque app
- [ ] Headers de sécurité configurés dans `next.config.js`
- [ ] `pnpm audit` : 0 HIGH/CRITICAL

---

## Phase 3 — Conformité RGPD (parallélisable par app)

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| ✅ 9 | Pages RGPD Links : mentions légales, politique de confidentialité, bandeau cookies | 🟠 Haute | rgpdix, ergonomix | Phase 2 | Fait (2026-03-20) |
| ✅ 10 | Pages RGPD CREAI : mêmes pages adaptées au contexte CREAI | 🟠 Haute | rgpdix, ergonomix | Phase 2 | Fait (2026-03-20) |
| ✅ 11 | Pages RGPD Omega : mêmes pages adaptées au contexte Omega | 🟠 Haute | rgpdix, ergonomix | Phase 2 | Fait (2026-03-20) |
| ✅ 12 | Fonctionnalités RGPD : export des données personnelles, demande de suppression de compte | 🟠 Haute | rgpdix, archicodix | #9 | Fait (2026-03-20) |

**Détail issues #9/#10/#11 — Pages RGPD :**
- Utilisation des composants `@unanima/rgpd` : `<LegalNotice>`, `<PrivacyPolicy>`, `<CookieBanner>`
- Configuration `RGPDConfig` par app (raison sociale, DPO, finalités des traitements)
- Routes : `/mentions-legales`, `/confidentialite`, `/cookies`
- Bandeau cookies : consentement explicite, stockage dans localStorage, respect du choix

**Détail issue #12 — Export et suppression :**
- Route `/api/rgpd/export` : exporte toutes les données personnelles en JSON (profiles + données métier)
- Route `/api/rgpd/delete` : demande de suppression de compte (soft delete + anonymisation)
- Page `/profil/mes-donnees` : interface pour lancer l'export ou la demande de suppression
- Log audit pour chaque action RGPD

**Point de contrôle Phase 3 :**
- [ ] Pages légales accessibles pour les 3 apps
- [ ] Bandeau cookies fonctionnel
- [ ] Export des données personnelles fonctionnel
- [ ] Suppression de compte fonctionnelle (avec anonymisation)
- [ ] Logs audit RGPD enregistrés

---

## Phase 4 — Mise en production (séquentiel, validation humaine obligatoire)

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| ✅ 13 | Checklist de déploiement : variables d'environnement, domaines, DNS | 🔴 Critique | deploix | Phase 2, Phase 3 | Fait (2026-03-20) — docs/platform/deployment-checklist.md |
| 14 | Déploiement Links en production (Vercel) | 🔴 Critique | deploix | #13 | ⚠️ |
| 15 | Déploiement CREAI en production (Vercel) | 🔴 Critique | deploix | #13 | ⚠️ |
| 16 | Déploiement Omega en production (Vercel) | 🔴 Critique | deploix | #13 | ⚠️ |
| 17 | Smoke tests post-déploiement : health check, login, navigation, API | 🟠 Haute | testix, deploix | #14, #15, #16 | — |

**Détail issue #13 — Checklist déploiement :**
- [ ] Variables d'environnement Vercel configurées pour chaque app (production)
- [ ] Domaines configurés et DNS propagés
- [ ] Supabase : tables et RLS en place sur le projet de production
- [ ] Supabase : Storage buckets créés
- [ ] Resend : domaine vérifié, clé API de production
- [ ] `vercel.json` : `ignoreCommand` en place pour chaque app
- [ ] Monitoring : alertes configurées sur les endpoints `/api/health`

**Détail issue #17 — Smoke tests :**
- Pour chaque app déployée :
  - `GET /api/health` → 200
  - Login avec un compte de test → Dashboard accessible
  - Navigation sidebar → toutes les pages chargent
  - Création d'un enregistrement de test → succès
  - Suppression de l'enregistrement de test → succès

**Point de contrôle Phase 4 :**
- [ ] 3 apps déployées en production
- [ ] Smoke tests passent sur les 3 apps
- [ ] Monitoring opérationnel
- [ ] Documentation de déploiement mise à jour

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Issues totales | 17 |
| Critiques | 7 (#1, #3, #4, #5, #6, #13, #14, #15, #16) |
| Hautes | 7 (#2, #7, #9, #10, #11, #12, #17) |
| Moyennes | 1 (#8) |
| Chemin critique | E2E → Audit sécu → RGPD → Checklist → Déploiement → Smoke tests |
| Parallélisme max | 4 (Phase 1: E2E par app) + 3 (Phase 3: RGPD par app) |
| Effort estimé | ~8-12 jours |

---

## Contraintes d'exécution

- **Base :** `master` (après merge Sprint 5)
- **⚠️ Validation humaine obligatoire** pour l'audit sécurité et chaque déploiement production
- **Build obligatoire** entre chaque phase
- **Tests obligatoires** avant chaque commit
- **Aucun déploiement production sans** : E2E vert + audit sécu validé + RGPD en place
- **Format commit :** `feat(scope): description (closes #XX)` ou `fix(scope): ...`
- **Scopes :** `links`, `creai`, `omega`, `security`, `rgpd`, `deploy`
- **Rollback plan** : chaque déploiement Vercel conserve les versions précédentes, rollback en 1 clic
