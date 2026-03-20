# Roadmap Sprints 2 à 6 — Unanima Platform

**Projet :** Monorepo Unanima (Links + CREAI + Omega)
**Date de planification initiale :** 2026-03-20
**Dernière mise à jour :** 2026-03-20 — Complétion des plans Sprints 3-6
**Planifié par :** Pilotix

---

## Vue d'ensemble

| Sprint | Période | Thème | Issues | Effort |
|--------|---------|-------|--------|--------|
| Sprint 1 ✅ | 23 mars → 5 avril | Fondations & sécurité critique | 7 | S — Terminé (3j) |
| **Sprint 2** | 6 avril → 19 avril | Upgrade Next.js 15 + Auth UI + Layout | 12 | M |
| **Sprint 3** | 20 avril → 3 mai | Schémas BDD métier + API CRUD par app | 11 | L |
| **Sprint 4** | 4 mai → 17 mai | Pages métier (dashboards, listes, fiches) | 16 | XL |
| **Sprint 5** | 18 mai → 31 mai | Features avancées & intégrations | 12 | L-XL |
| **Sprint 6** | 1 juin → 14 juin | Tests E2E, sécurité, RGPD, production | 17 | M-L |
| **Total** | | | **75** | **~12 semaines** |

---

## Vélocité et métriques

| Sprint | Issues planifiées | Issues livrées | Jours | Vélocité (issues/jour) |
|--------|------------------|----------------|-------|----------------------|
| Sprint 1 ✅ | 7 | 7 (6 complètes + 1 partielle) | 3 | 2.3 |
| Sprint 2 | 12 | — | ~5-7 | cible 2.0 |
| Sprint 3 | 11 | — | ~7-10 | cible 1.5 |
| Sprint 4 | 16 | — | ~8-12 | cible 1.6 |
| Sprint 5 | 12 | — | ~10-14 | cible 1.0 (features complexes) |
| Sprint 6 | 17 | — | ~8-12 | cible 1.7 |

> **Note :** La vélocité diminue au Sprint 5 car les tâches sont plus complexes (intégrations, features avancées). La remontée au Sprint 6 s'explique par des tâches plus standardisées (RGPD, déploiement).

---

## Chemin critique global

```
Sprint 1 (✅ Socle sécurisé)
    │
    ▼
Sprint 2 (Next.js 15 + Auth UI + Layout)
    │
    ├──────────────────────────────────────────┐
    ▼                                          ▼
Sprint 3 (BDD + API par app)              Sprint 3 (BDD + API par app)
 ─ Links: bénéficiaires, bilans            ─ CREAI: établissements
 ─ Omega: interventions, KPIs             ─ Omega: Salesforce/SAP schéma
    │                                          │
    ├──────────────────────────────────────────┘
    ▼
Sprint 4 (Pages métier par app)
 ─ Dashboards, listes, fiches de détail
 ─ Formulaires CRUD
    │
    ▼
Sprint 5 (Features avancées, intégrations)
 ─ Links: questionnaire, documents, emails
 ─ CREAI: diagnostic wizard, indicateurs
 ─ Omega: Salesforce/SAP, workflow affectation
    │
    ▼
Sprint 6 (Qualité, sécurité, déploiement prod)
 ─ Tests E2E Playwright
 ─ Audit OWASP + RLS
 ─ RGPD (pages légales + export/suppression)
 ─ 3 déploiements production
```

---

## Dépendances inter-sprints

| Dépendance | Depuis | Vers | Impact | Statut |
|-----------|--------|------|--------|--------|
| Next.js 15 async API | Sprint 2 #1-#2 | Sprint 3+ | Tous les route handlers doivent utiliser la nouvelle API | À faire |
| Auth pages fonctionnelles | Sprint 2 #4-#7 | Sprint 3+ | Les features app requièrent un login fonctionnel | À faire |
| Layout protégé | Sprint 2 #8-#10 | Sprint 4 | Les pages métier s'intègrent dans le layout sidebar | À faire |
| Schémas BDD | Sprint 3 #1-#3 | Sprint 4 | Les pages affichent les données des tables créées | À faire |
| Types Supabase | Sprint 3 #4 | Sprint 4+ | TypeScript strict requiert les types BDD | À faire |
| API CRUD | Sprint 3 #8-#10 | Sprint 4 | Les pages consomment les endpoints API | À faire |
| Dashboards + fiches | Sprint 4 | Sprint 5 | Les features avancées enrichissent les pages existantes | À faire |
| Credentials Salesforce/SAP | Externe | Sprint 5 #7-#8 | POC intégrations bloqués sans accès sandbox | **À vérifier** |
| Features métier complètes | Sprint 5 Must Have | Sprint 6 | Tests E2E nécessitent des parcours fonctionnels | À faire |
| Audit sécu validé | Sprint 6 #5-#6 | Sprint 6 #14-#16 | Pas de déploiement production sans audit | À faire |

---

## Répartition par app

### Link's Accompagnement (6 semaines v1)

| Sprint | Livrables | Effort |
|--------|-----------|--------|
| 2 | Auth UI, layout sidebar consultant/bénéficiaire | M |
| 3 | BDD: 6 tables métier, RLS, types, API CRUD (beneficiaires, bilans, questionnaires, documents) | L |
| 4 | Dashboard consultant + bénéficiaire, liste bénéficiaires/bilans, fiches + formulaires CRUD | XL |
| 5 | Moteur de questionnaire (MUST), upload documents (SHOULD), notifications email (SHOULD) | L |
| 6 | Tests E2E (2 parcours), pages RGPD, export données, déploiement prod | M |

### CREAI Île-de-France (6-8 semaines PMV)

| Sprint | Livrables | Effort |
|--------|-----------|--------|
| 2 | Auth UI, layout sidebar direction/coordonnateur | M |
| 3 | BDD: 5 tables métier, RLS, types, API CRUD (etablissements, diagnostics, indicateurs, rapports) | L |
| 4 | Dashboard direction, liste établissements, fiche + formulaire établissement | L |
| 5 | Diagnostic wizard multi-étapes (MUST), indicateurs graphiques (SHOULD), export rapports (COULD) | L |
| 6 | Tests E2E (1 parcours), pages RGPD, déploiement prod | M |

### Omega Automotive (4-5 semaines)

| Sprint | Livrables | Effort |
|--------|-----------|--------|
| 2 | Auth UI, layout sidebar responsable SAV/technicien | M |
| 3 | BDD: 5 tables métier, RLS, types, API CRUD (interventions, affectations, pieces, kpis) | L |
| 4 | Dashboard SAV (KPIs temps réel), liste interventions/pièces, fiche + formulaire intervention | L |
| 5 | Connecteur Salesforce (MUST), workflow affectation (MUST), connecteur SAP (SHOULD), alertes stock (COULD) | L-XL |
| 6 | Tests E2E (1 parcours), pages RGPD, déploiement prod | M |

---

## Priorisation MoSCoW (Sprint 5 — sprint à risque)

Le Sprint 5 est le plus risqué en termes de scope creep. Priorisation stricte :

| Priorité | Issues | Règle de gestion |
|----------|--------|-----------------|
| **Must Have** | Questionnaire Links, Diagnostic CREAI, Salesforce Omega, Workflow affectation | Livrer impérativement |
| **Should Have** | Documents Links, Emails Links, Indicateurs CREAI, SAP Omega, Tests unitaires | Livrer si temps |
| **Could Have** | Export PDF CREAI, Alertes stock Omega, Tests intégration | Reporter en Sprint 7 |
| **Won't Have** | Export CSV, notifications push, dashboard analytics avancé | Hors scope v1 |

---

## Risques identifiés

| Risque | Probabilité | Impact | Sprint | Mitigation |
|--------|-------------|--------|--------|------------|
| Upgrade Next.js 15 casse des layouts | Moyenne | Fort | 2 | Sprint dédié, tests systématiques |
| Schéma BDD sous-estimé | Faible | Moyen | 3 | Revue archicodix avant migration |
| DataTable ne couvre pas tous les cas | Moyenne | Moyen | 4 | Extension du composant socle si nécessaire |
| Sandbox Salesforce/SAP indisponible | **Haute** | Fort | 5 | Mocks pour dev, vérifier credentials 1 semaine avant |
| Scope creep features avancées | Moyenne | Moyen | 5 | MoSCoW strict, time-box, report en Sprint 7 |
| Moteur de questionnaire sous-estimé | Moyenne | Fort | 5 | Types simples d'abord, enrichir ensuite |
| Faille sécurité découverte en audit | Moyenne | Fort | 6 | Buffer 2 jours pour corrections |
| Couverture tests insuffisante pour prod | Moyenne | Fort | 6 | Tests au fil de l'eau dès Sprint 3 |
| DNS/domaines non prêts | Faible | Moyen | 6 | Déployer sur URL Vercel par défaut d'abord |

---

## Métriques cibles fin de projet (Sprint 6)

| Métrique | Cible |
|----------|-------|
| Apps déployées en production | 3/3 |
| Tests unitaires | ≥ 200 (174 existants + ~30/sprint) |
| Tests E2E | ≥ 4 parcours (1 par rôle principal) |
| Couverture tests features | ≥ 60% |
| CVE HIGH/CRITICAL | 0 |
| Audit OWASP | Aucune faille critique |
| Conformité RGPD | Pages légales + export + suppression |
| Temps de build | < 60s par app |
| Health check | 200 sur les 3 apps |
