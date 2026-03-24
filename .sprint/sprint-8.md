# Sprint 8 — Links : Fondations BDD & Infrastructure

**Projet :** Link's Accompagnement — MVP v1
**Période :** Semaine 1 (dès validation prérequis client)
**Objectif :** Mettre en place les fondations techniques bloquantes : schéma BDD complet, RLS, types TypeScript, middleware RBAC et CI/CD pipeline.

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Issues | 5 (#104, #105, #106, #107, #108) |
| Phases | 2 |
| Effort total | M (~1 semaine) |
| Chemin critique | #104 → #105 → #106 → #107 |
| Parallélisme max | #108 (CI/CD) en parallèle dès le début |

---

## Phase 1 — BDD & Sécurité (séquentiel, bloquant pour tout)

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 1 | #104 | [links] Schéma BDD complet + migrations Supabase | 🔴 Critique | M | databasix, migratix | — | ⚠️ Review schéma |
| 2 | #105 | [links] RLS policies + politiques de sécurité BDD | 🔴 Critique | S | databasix, securix | #104 | ⚠️ Review RLS |
| 3 | #106 | [links] Types TypeScript générés + schémas Zod métier | 🔴 Critique | S | archicodix | #105 | — |
| 4 | #107 | [links] Middleware Next.js auth + routing RBAC 3 rôles | 🔴 Critique | S | archicodix, securix | #106 | ⚠️ Review RBAC |

**Point de contrôle Phase 1 :**
- [x] Migrations appliquées sans erreur sur Supabase dev
- [ ] RLS testée manuellement (3 sessions, 3 rôles) — ⚠️ À valider manuellement
- [x] Types TypeScript générés sans erreur
- [ ] Middleware : bénéficiaire → 403 sur /beneficiaires (test manuel) — ⚠️ À valider manuellement
- [x] `pnpm build --filter=@unanima/links` vert (060bd5a)
- [x] 53 tests unitaires Zod passent

---

## Phase 2 — Infrastructure CI/CD (parallèle à Phase 1)

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 5 | #108 | [links] CI/CD pipeline (GitHub Actions + Vercel preview) | 🟡 Moyenne | S | pipelinix, deploix | — | — |

**Point de contrôle Phase 2 :**
- [x] Workflow GitHub Actions configuré (4 jobs : lint → typecheck → test → build)
- [ ] Workflow passe sur PR test — ⚠️ À vérifier via GitHub Actions
- [ ] Déploiement Vercel preview déclenché automatiquement — ⚠️ À configurer
- [ ] Variables d'environnement configurées dans Vercel — ⚠️ À configurer

---

## Contraintes d'exécution

1. **Ne jamais exposer la `SUPABASE_SERVICE_ROLE_KEY`** dans le code frontend
2. **RLS obligatoire** sur toutes les tables avant de passer au Sprint 9
3. Les migrations doivent être **irréversibles** en production (pas de DROP sans migration inverse)
4. Tester la RLS avec des sessions simultanées (bénéficiaire A ≠ bénéficiaire B)
5. Commits : `feat(links): [BDD] description` ou `feat(links): [RBAC] description`
