---
ref: PLAN-LINKS-V1
title: "Plan de développement — Plateforme Link's Accompagnement (MVP v1)"
type: PLAN
scope: links
status: approved
version: "1.0"
created: 2026-03-23
author: Pilotix — Unanima
related: ["SPC-0001", "SPC-0002", "SPC-0003"]
sprints: [8, 9, 10, 11]
---

# Plan de développement — Link's Accompagnement MVP v1

> **Basé sur** : SPC-0003 v1.0 (Spécifications fonctionnelles détaillées)
> **Budget** : 3 500 € HT — 16,5 jours développeur
> **Calendrier** : 6 semaines (Sprints 8 à 11)
> **Milestone GitHub** : [Links v1.0 — MVP](https://github.com/dduquenne/unanima-platform/milestone/4)

---

## Vue d'ensemble

| Sprint | Scope | Issues | Effort |
|--------|-------|--------|--------|
| Sprint 8 | Fondations BDD & Infrastructure | 5 | M |
| Sprint 9 | EPIC-AUTH + Espace Bénéficiaire | 7 | XL |
| Sprint 10 | Espace Bénéficiaire (fin) + Espace Consultant | 7 | XL |
| Sprint 11 | Espace Super Admin + Qualité + Déploiement | 8 | XL |
| **Total** | | **27 issues** | **~6 semaines** |

---

## Prérequis bloquants (avant démarrage)

- [ ] Contrat signé + acompte 30% reçu
- [ ] Contenu des 6 phases fourni par Link's (titres + libellés questions)
- [ ] Nom de domaine sélectionné (ex : bilan.links-accompagnement.com)
- [ ] Projet Supabase créé (plan Free ou Pro selon choix client)
- [ ] Décision H1/H2 notification email planification (avant Sprint 10)

---

## Chemin critique

```
Sprint 8 (BDD) → Sprint 9 (Auth) → Sprint 10 (Consultant) → Sprint 11 (Admin + Déploiement)
                      ↓
              EPIC-BEN bloqué par Auth + BDD
                      ↓
              EPIC-CON bloqué par EPIC-BEN + BDD
                      ↓
              EPIC-ADM bloqué par BDD (partiellement indépendant)
```

---

## Sprint 8 — Fondations BDD & Infrastructure

**Objectif** : Mettre en place les fondations techniques (schéma BDD, RLS, types,
middleware auth, CI/CD) qui bloquent tous les développements fonctionnels.

**Durée** : 1 semaine | **Issues** : 5

| Ordre | Issue | Titre | Priorité | Effort |
|-------|-------|-------|----------|--------|
| 1 | #104 | [links] Schéma BDD complet + migrations Supabase | 🔴 Critique | M |
| 2 | #105 | [links] RLS policies + politiques sécurité base de données | 🔴 Critique | S |
| 3 | #106 | [links] Types TypeScript générés + schémas Zod métier | 🟠 Haute | S |
| 4 | #107 | [links] Middleware Next.js auth + routing RBAC 3 rôles | 🔴 Critique | S |
| 5 | #108 | [links] CI/CD pipeline (GitHub Actions + Vercel preview) | 🟡 Moyenne | S |

**Point de contrôle Sprint 8 :**
- [ ] `pnpm build --filter=@unanima/links` passe
- [ ] Migrations Supabase appliquées sur environnement de dev
- [ ] Types TypeScript générés et valides
- [ ] Middleware bloque les routes non autorisées (test manuel 3 rôles)

---

## Sprint 9 — EPIC-AUTH + Espace Bénéficiaire

**Objectif** : Implémenter l'authentification complète (3 rôles) et l'espace
bénéficiaire : dashboard progression, planning séances, saisie réponses + autosave,
validation des phases.

**Durée** : 2 semaines | **Issues** : 7

| Ordre | Issue | Titre | Priorité | Effort | Dépend de |
|-------|-------|-------|----------|--------|-----------|
| 1 | #109 | [US-AUTH-01] Connexion email/mdp + verrouillage 3 tentatives | 🔴 Critique | S | Sprint 8 |
| 2 | #110 | [US-AUTH-02+03] Reset mot de passe (demande + changement) | 🟠 Haute | S | #109 |
| 3 | #111 | [US-AUTH-04] Déconnexion sécurisée + sessions 8h + cookies | 🟠 Haute | S | #109 |
| 4 | #112 | [US-BEN-01] Dashboard bénéficiaire — progression 6 phases | 🔴 Critique | M | #109 |
| 5 | #113 | [US-BEN-02] Planning séances bénéficiaire (dates + lien visio) | 🟠 Haute | S | #112 |
| 6 | #114 | [US-BEN-03+04] Saisie réponses + autosave (blur + 30s) | 🔴 Critique | M | #112 |
| 7 | #115 | [US-BEN-05+06] Validation phase + modification post-validation | 🔴 Critique | S | #114 |

**Point de contrôle Sprint 9 :**
- [ ] Login / logout fonctionnel sur 3 rôles
- [ ] Verrouillage après 3 tentatives
- [ ] Dashboard bénéficiaire affiche la progression correcte
- [ ] Autosave déclenché (blur + 30s) sans perte de données
- [ ] Validation phase → statut "Validée" → retour dashboard

---

## Sprint 10 — Espace Bénéficiaire (fin) + Espace Consultant

**Objectif** : Compléter l'espace bénéficiaire (documents) et implémenter l'espace
consultant complet : dashboard portefeuille, dossiers bénéficiaires, planification,
comptes-rendus, export PDF, notification email.

**Durée** : 2 semaines | **Issues** : 7

| Ordre | Issue | Titre | Priorité | Effort | Dépend de |
|-------|-------|-------|----------|--------|-----------|
| 1 | #116 | [US-BEN-07] Téléchargement documents par phase (URLs signées) | 🟠 Haute | S | #125 |
| 2 | #117 | [US-CON-01] Dashboard consultant — portefeuille bénéficiaires | 🔴 Critique | M | Sprint 9 + #124 |
| 3 | #118 | [US-CON-02+03] Dossier bénéficiaire + consultation réponses | 🟠 Haute | S | #117 |
| 4 | #119 | [US-CON-04+05] Planification 6 séances + lien visioconférence | 🔴 Critique | M | #118 |
| 5 | #120 | [US-CON-06] Comptes-rendus de séances (confidentiels) | 🔴 Critique | M | #118 |
| 6 | #121 | [US-CON-07] Export PDF comptes-rendus (génération serveur) | 🟠 Haute | M | #120 |
| 7 | #122 | [US-CON-08] Notification email planification (Resend H1) | 🟡 Moyenne | S | #119 |

**Point de contrôle Sprint 10 :**
- [ ] RLS consultant : impossible d'accéder à un bénéficiaire non assigné
- [ ] Comptes-rendus invisibles au bénéficiaire (test RLS)
- [ ] Export PDF téléchargeable (6 fiches, fiches vides gérées)
- [ ] Email Resend envoyé à la sauvegarde des dates (si H1 retenu)

---

## Sprint 11 — Espace Super Admin + Qualité + Déploiement

**Objectif** : Implémenter l'espace super admin complet, compléter la couverture de
tests (E2E Playwright + unitaires Vitest), déployer en production et réaliser la recette.

**Durée** : 1 semaine | **Issues** : 8

| Ordre | Issue | Titre | Priorité | Effort | Dépend de |
|-------|-------|-------|----------|--------|-----------|
| 1 | #123 | [US-ADM-02] Création comptes utilisateurs (Admin Supabase API) | 🔴 Critique | M | Sprint 8 |
| 2 | #124 | [US-ADM-05] Attribution bénéficiaire ↔ consultant (RLS) | 🔴 Critique | S | #123 |
| 3 | #125 | [US-ADM-06] Gestion documents par phase (upload Supabase Storage) | 🔴 Critique | L | Sprint 8 |
| 4 | #126 | [US-ADM-03+04] Modification compte + suppression RGPD | 🟠 Haute | M | #123 |
| 5 | #127 | [US-ADM-01] Dashboard KPIs + supervision globale + alertes | 🟠 Haute | M | #123 |
| 6 | #128 | [links] Tests E2E Playwright — parcours bénéficiaire + consultant | 🟠 Haute | M | Sprint 10 |
| 7 | #129 | [links] Tests unitaires — schémas Zod + logique métier | 🟠 Haute | S | Sprint 10 |
| 8 | #130 | [links] Déploiement production Vercel + recette finale + CLAUDE.md | 🔴 Critique | S | Tout |

**Point de contrôle Sprint 11 :**
- [ ] Super admin peut créer / désactiver / supprimer des comptes
- [ ] Upload documents fonctionnel (PDF/DOCX, max 10 Mo, max 3/phase)
- [ ] Tests E2E Playwright : parcours bénéficiaire (connexion → validation phase 1)
- [ ] Tests E2E Playwright : parcours consultant (login → lecture réponses → export PDF)
- [ ] `pnpm test --filter=@unanima/links` vert
- [ ] Application déployée sur Vercel production, accessible en HTTPS
- [ ] CLAUDE.md `apps/links` complété et à jour

---

## Récapitulatif des User Stories couvertes

| Epic | US | Titre | Sprint |
|------|----|-------|--------|
| EPIC-AUTH | US-AUTH-01 | Connexion email/mdp | Sprint 9 |
| EPIC-AUTH | US-AUTH-02+03 | Reset mot de passe | Sprint 9 |
| EPIC-AUTH | US-AUTH-04 | Sessions + déconnexion | Sprint 9 |
| EPIC-BEN | US-BEN-01 | Dashboard progression 6 phases | Sprint 9 |
| EPIC-BEN | US-BEN-02 | Planning séances (vue bénéficiaire) | Sprint 9 |
| EPIC-BEN | US-BEN-03+04 | Saisie réponses + autosave | Sprint 9 |
| EPIC-BEN | US-BEN-05+06 | Validation + modification | Sprint 9 |
| EPIC-BEN | US-BEN-07 | Téléchargement documents | Sprint 10 |
| EPIC-CON | US-CON-01 | Dashboard consultant | Sprint 10 |
| EPIC-CON | US-CON-02+03 | Dossier bénéficiaire + réponses | Sprint 10 |
| EPIC-CON | US-CON-04+05 | Planification + visio | Sprint 10 |
| EPIC-CON | US-CON-06 | Comptes-rendus séances | Sprint 10 |
| EPIC-CON | US-CON-07 | Export PDF | Sprint 10 |
| EPIC-CON | US-CON-08 | Notification email | Sprint 10 |
| EPIC-ADM | US-ADM-01 | Dashboard KPIs admin | Sprint 11 |
| EPIC-ADM | US-ADM-02 | Création comptes | Sprint 11 |
| EPIC-ADM | US-ADM-03+04 | Modification + suppression RGPD | Sprint 11 |
| EPIC-ADM | US-ADM-05 | Attribution consultant | Sprint 11 |
| EPIC-ADM | US-ADM-06 | Gestion documents | Sprint 11 |

**Total : 19 user stories + 8 issues techniques/qualité = 27 issues**

---

## Schéma de dépendances

```
Sprint 8: BDD + Infra (bloquant pour tout)
    ├─→ Sprint 9: AUTH-01 (bloquant EPIC-BEN + EPIC-CON)
    │       ├─→ BEN-01 → BEN-02
    │       ├─→ BEN-03+04 → BEN-05+06
    │       └─→ AUTH-02+03, AUTH-04 (parallèle)
    ├─→ Sprint 10: CON-01 (après Sprint 9)
    │       ├─→ CON-02+03 → CON-04+05 → CON-08
    │       └─→ CON-06 → CON-07
    │       └─→ BEN-07 (après ADM-06)
    └─→ Sprint 11: ADM-02 (dès Sprint 8)
            ├─→ ADM-05 → CON-01 (RLS)
            ├─→ ADM-06 → BEN-07
            ├─→ ADM-03+04 (après ADM-02)
            └─→ ADM-01 (après ADM-02)
```

---

## Règles d'exécution pour Sprintix

1. **Ne jamais implémenter une US sans que ses dépendances soient en Terminé**
2. **Tester le build après chaque issue** : `pnpm build --filter=@unanima/links`
3. **Lancer les tests unitaires après chaque issue** : `pnpm test --filter=@unanima/links`
4. **Commits en format conventionnel** : `feat(links): [US-XXX] description`
5. **RLS à valider systématiquement** : test avec 3 sessions simultanées (rôles différents)
6. **Pas de service_role_key dans le code frontend** — côté serveur uniquement (Route Handlers)
7. **Autosave = pas de validation** — distinction stricte à maintenir
8. **Comptes-rendus confidentiels** — RLS `consultant_id = auth.uid()` obligatoire

---

*Plan généré le 2026-03-23 — Pilotix — Unanima Platform*
*À valider par David Duquenne avant lancement Sprint 8*
