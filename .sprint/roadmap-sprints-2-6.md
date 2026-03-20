# Roadmap Sprints 2 à 6 — Unanima Platform

**Projet :** Monorepo Unanima (Links + CREAI + Omega)
**Date de planification :** 2026-03-20
**Planifié par :** Pilotix

---

## Vue d'ensemble

| Sprint | Période | Thème | Effort |
|--------|---------|-------|--------|
| Sprint 1 ✅ | 23 mars → 5 avril | Fondations & sécurité critique | S — Terminé |
| **Sprint 2** | 6 avril → 19 avril | Upgrade Next.js 15 + Auth UI + Layout | M |
| **Sprint 3** | 20 avril → 3 mai | Schémas BDD métier + API CRUD par app | L |
| **Sprint 4** | 4 mai → 17 mai | Pages métier (dashboards, listes, fiches) | XL |
| **Sprint 5** | 18 mai → 31 mai | Features avancées & intégrations | L |
| **Sprint 6** | 1 juin → 14 juin | Tests E2E, sécurité, RGPD, mise en production | M |

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
    │
    ▼
Sprint 5 (Features avancées, intégrations)
    │
    ▼
Sprint 6 (Qualité, sécurité, déploiement prod)
```

---

## Dépendances inter-sprints

| Dépendance | Depuis | Vers | Impact |
|-----------|--------|------|--------|
| Next.js 15 async API | Sprint 2 | Sprint 3+ | Tous les route handlers doivent utiliser la nouvelle API |
| Auth pages fonctionnelles | Sprint 2 | Sprint 3+ | Les apps-level features requièrent un login fonctionnel |
| Layout protégé | Sprint 2 | Sprint 4 | Les pages métier s'intègrent dans le layout sidebar |
| Schémas BDD | Sprint 3 | Sprint 4 | Les pages affichent les données des tables créées |
| API CRUD | Sprint 3 | Sprint 4 | Les pages consomment les endpoints API |
| Types générés Supabase | Sprint 3 | Sprint 4+ | TypeScript strict requiert les types BDD |

---

## Répartition par app

### Link's Accompagnement (6 semaines v1)

| Sprint | Livrables |
|--------|-----------|
| 2 | Auth UI, layout sidebar consultant/bénéficiaire |
| 3 | BDD: beneficiaires, bilans, questionnaires, responses, documents — API CRUD |
| 4 | Dashboard consultant, liste bénéficiaires, fiche bénéficiaire, création bilan |
| 5 | Moteur de questionnaire, upload documents, notifications email |
| 6 | Tests E2E parcours bénéficiaire + consultant, conformité RGPD |

### CREAI Île-de-France (6-8 semaines PMV)

| Sprint | Livrables |
|--------|-----------|
| 2 | Auth UI, layout sidebar direction/coordonnateur |
| 3 | BDD: etablissements, diagnostics, indicateurs, rapports — API CRUD |
| 4 | Dashboard direction, liste établissements, fiche établissement |
| 5 | Rapport de diagnostic, indicateurs graphiques, export données |
| 6 | Tests E2E parcours coordonnateur + direction, conformité RGPD |

### Omega Automotive (4-5 semaines)

| Sprint | Livrables |
|--------|-----------|
| 2 | Auth UI, layout sidebar responsable SAV/technicien |
| 3 | BDD: interventions, affectations, pieces_detachees, kpis_sav — API CRUD |
| 4 | Dashboard SAV (KPIs temps réel), liste interventions, fiche intervention |
| 5 | Connecteur Salesforce/SAP, workflow affectation, suivi pièces |
| 6 | Tests E2E parcours technicien + responsable, conformité RGPD |

---

## Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Upgrade Next.js 15 casse des layouts | Moyenne | Fort | Sprint 2 dédié, tests systématiques |
| Schéma BDD sous-estimé (Sprint 3) | Faible | Moyen | Revue archicodix avant migration |
| Intégration Salesforce/SAP complexe (Sprint 5) | Haute | Fort | POC isolé en début de Sprint 5 |
| Couverture tests insuffisante pour prod (Sprint 6) | Moyenne | Fort | Tests au fil de l'eau dès Sprint 3 |
| Scope creep sur les features avancées (Sprint 5) | Moyenne | Moyen | MoSCoW strict, report en Sprint 7 si nécessaire |
