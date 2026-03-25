---
ref: SPC-0004
title: Matrice de traçabilité — Spécifications → Maquettes → Code
type: SPC
scope: links
status: accepted
version: "1.0"
created: 2026-03-25
updated: 2026-03-25
author: Claude
related-issues: ["#168"]
supersedes: null
superseded-by: null
---

# SPC-0004 — Matrice de traçabilité spec → maquette → code

## 1. Objectif

Ce document établit la traçabilité complète entre les User Stories (SPC-0003),
les maquettes SVG (MAQ-01 à MAQ-09), les wireframes et les fichiers de code
implémentés dans l'application Link's Accompagnement.

Il permet de :
- Vérifier la complétude de l'implémentation
- Identifier rapidement les écrans manquants ou partiels
- S'assurer qu'un écran respecte sa maquette de référence

> **Maintenance** : ce document doit être mis à jour à chaque PR touchant une
> page de l'application Link's.

---

## 2. Légende des statuts

| Icône | Statut | Description |
|-------|--------|-------------|
| ✅ | Implémenté | Page fonctionnelle, conforme à la maquette |
| ⚠️ | Partiel | Page présente mais fonctionnalités incomplètes |
| 🔲 | Stub | Page créée avec contenu placeholder uniquement |
| ❌ | Absent | Aucun fichier de code correspondant |

---

## 3. Matrice de traçabilité User Stories → Maquettes → Code

### 3.1 EPIC-AUTH — Authentification

| User Story | Titre | Maquette | Wireframe | Fichier code | Statut |
|------------|-------|----------|-----------|--------------|--------|
| US-AUTH-01 | Connexion email / mot de passe | [MAQ-01-login-v2.svg](../../mockups/MAQ-01-login-v2.svg) | [wireframe-01-connexion.png](wireframes/wireframe-01-connexion.png) | `app/login/page.tsx` | ✅ Implémenté |
| US-AUTH-02 | Demande de réinitialisation MDP | — | — | `app/reset-password/page.tsx` | ✅ Implémenté |
| US-AUTH-03 | Changement MDP via lien | — | — | `app/reset-password/page.tsx` | ✅ Implémenté |
| US-AUTH-04 | Déconnexion sécurisée | — | — | *(logique dans le layout)* | ✅ Implémenté |

### 3.2 EPIC-BEN — Espace Bénéficiaire

| User Story | Titre | Maquette | Wireframe | Fichier code | Statut |
|------------|-------|----------|-----------|--------------|--------|
| US-BEN-01 | Visualisation progression 6 phases | [MAQ-02-dashboard-beneficiaire.svg](../../mockups/MAQ-02-dashboard-beneficiaire.svg) | [wireframe-02-dashboard-beneficiaire.png](wireframes/wireframe-02-dashboard-beneficiaire.png) | `app/(protected)/dashboard/page.tsx` | ✅ Implémenté |
| US-BEN-02 | Visualisation planning séances | [MAQ-02-dashboard-beneficiaire.svg](../../mockups/MAQ-02-dashboard-beneficiaire.svg) | [wireframe-02-dashboard-beneficiaire.png](wireframes/wireframe-02-dashboard-beneficiaire.png) | `app/(protected)/dashboard/page.tsx` | ✅ Implémenté |
| US-BEN-03 | Saisie réponses questions phase | [MAQ-03-saisie-phase.svg](../../mockups/MAQ-03-saisie-phase.svg) | [wireframe-03-saisie-phase.png](wireframes/wireframe-03-saisie-phase.png) | `app/(protected)/bilans/[id]/page.tsx` | 🔲 Stub |
| US-BEN-04 | Sauvegarde automatique (autosave) | [MAQ-03-saisie-phase.svg](../../mockups/MAQ-03-saisie-phase.svg) | — | `app/(protected)/bilans/[id]/page.tsx` | 🔲 Stub |
| US-BEN-05 | Validation d'une phase | [MAQ-03-saisie-phase.svg](../../mockups/MAQ-03-saisie-phase.svg) | — | `app/(protected)/bilans/[id]/page.tsx` | 🔲 Stub |
| US-BEN-06 | Modification réponses après validation | [MAQ-03-saisie-phase.svg](../../mockups/MAQ-03-saisie-phase.svg) | — | `app/(protected)/bilans/[id]/page.tsx` | 🔲 Stub |
| US-BEN-07 | Téléchargement documents phase | — | — | `app/(protected)/documents/page.tsx` | 🔲 Stub |

### 3.3 EPIC-CON — Espace Consultant

| User Story | Titre | Maquette | Wireframe | Fichier code | Statut |
|------------|-------|----------|-----------|--------------|--------|
| US-CON-01 | Vue d'ensemble portefeuille bénéficiaires | [MAQ-04-dashboard-consultant.svg](../../mockups/MAQ-04-dashboard-consultant.svg) | [wireframe-04-dashboard-consultant.png](wireframes/wireframe-04-dashboard-consultant.png) | `app/(protected)/beneficiaires/page.tsx` | 🔲 Stub |
| US-CON-02 | Accès dossier bénéficiaire | [MAQ-05-fiche-beneficiaire-consultant.svg](../../mockups/MAQ-05-fiche-beneficiaire-consultant.svg) | [wireframe-05-fiche-beneficiaire.png](wireframes/wireframe-05-fiche-beneficiaire.png) | `app/(protected)/beneficiaires/[id]/page.tsx` | 🔲 Stub |
| US-CON-03 | Consultation réponses par phase | [MAQ-05-fiche-beneficiaire-consultant.svg](../../mockups/MAQ-05-fiche-beneficiaire-consultant.svg) | — | `app/(protected)/beneficiaires/[id]/page.tsx` | 🔲 Stub |
| US-CON-04 | Planification 6 rendez-vous | [MAQ-09-planification.svg](../../mockups/MAQ-09-planification.svg) | — | — | ❌ Absent |
| US-CON-05 | Saisie lien visioconférence | [MAQ-09-planification.svg](../../mockups/MAQ-09-planification.svg) | — | — | ❌ Absent |
| US-CON-06 | Saisie comptes-rendus séances | [MAQ-06-comptes-rendus.svg](../../mockups/MAQ-06-comptes-rendus.svg) | [wireframe-07-comptes-rendus.png](wireframes/wireframe-07-comptes-rendus.png) | — | ❌ Absent |
| US-CON-07 | Export PDF comptes-rendus | [MAQ-06-comptes-rendus.svg](../../mockups/MAQ-06-comptes-rendus.svg) | — | — | ❌ Absent |
| US-CON-08 | Notification email planification | — | — | — | ❌ Absent |

### 3.4 EPIC-ADM — Espace Super Admin

| User Story | Titre | Maquette | Wireframe | Fichier code | Statut |
|------------|-------|----------|-----------|--------------|--------|
| US-ADM-01 | Dashboard KPIs et supervision | [MAQ-07-dashboard-admin.svg](../../mockups/MAQ-07-dashboard-admin.svg) | [wireframe-06-dashboard-admin.png](wireframes/wireframe-06-dashboard-admin.png) | — | ❌ Absent |
| US-ADM-02 | Création compte utilisateur | [MAQ-08-gestion-utilisateurs.svg](../../mockups/MAQ-08-gestion-utilisateurs.svg) | — | `app/(protected)/beneficiaires/nouveau/page.tsx` | ⚠️ Partiel |
| US-ADM-03 | Modification compte utilisateur | [MAQ-08-gestion-utilisateurs.svg](../../mockups/MAQ-08-gestion-utilisateurs.svg) | — | `app/(protected)/beneficiaires/[id]/modifier/page.tsx` | 🔲 Stub |
| US-ADM-04 | Suppression compte (RGPD) | — | — | `app/(protected)/profil/mes-donnees/page.tsx` | ⚠️ Partiel |
| US-ADM-05 | Attribution bénéficiaire ↔ consultant | — | — | — | ❌ Absent |
| US-ADM-06 | Gestion documents par phase | — | — | — | ❌ Absent |

### 3.5 Pages hors User Stories

| Page | Fichier code | Description | Statut |
|------|-------------|-------------|--------|
| Redirection accueil | `app/page.tsx` | Redirige vers `/login` | ✅ Implémenté |
| Mentions légales | `app/mentions-legales/page.tsx` | Composant `@unanima/rgpd` | ✅ Implémenté |
| Politique de confidentialité | `app/confidentialite/page.tsx` | Composant `@unanima/rgpd` | ✅ Implémenté |
| Gestion des cookies | `app/cookies/page.tsx` | Préférences cookies | ✅ Implémenté |
| Profil utilisateur | `app/(protected)/profile/page.tsx` | Affichage profil | ✅ Implémenté |
| Mes données (RGPD) | `app/(protected)/profil/mes-donnees/page.tsx` | Export et suppression données | ✅ Implémenté |
| Questionnaire phase | `app/(protected)/bilans/[id]/questionnaire/[questionnaireId]/page.tsx` | Questions d'une phase | 🔲 Stub |

---

## 4. Synthèse de couverture

### 4.1 Par Epic

| Epic | Total US | ✅ Implémenté | ⚠️ Partiel | 🔲 Stub | ❌ Absent | Couverture |
|------|----------|--------------|-----------|---------|----------|------------|
| EPIC-AUTH | 4 | 4 | 0 | 0 | 0 | **100 %** |
| EPIC-BEN | 7 | 2 | 0 | 5 | 0 | **29 %** |
| EPIC-CON | 8 | 0 | 0 | 3 | 5 | **0 %** |
| EPIC-ADM | 6 | 0 | 2 | 1 | 3 | **0 %** |
| **Total** | **25** | **6** | **2** | **9** | **8** | **24 %** |

### 4.2 Par maquette

| Maquette | Écran | US couvertes | Statut code |
|----------|-------|--------------|-------------|
| MAQ-01 | Login | US-AUTH-01 | ✅ Implémenté |
| MAQ-02 | Dashboard bénéficiaire | US-BEN-01, US-BEN-02 | ✅ Implémenté |
| MAQ-03 | Saisie de phase | US-BEN-03 à US-BEN-06 | 🔲 Stub |
| MAQ-04 | Dashboard consultant | US-CON-01 | 🔲 Stub |
| MAQ-05 | Fiche bénéficiaire | US-CON-02, US-CON-03 | 🔲 Stub |
| MAQ-06 | Comptes-rendus | US-CON-06, US-CON-07 | ❌ Absent |
| MAQ-07 | Dashboard admin | US-ADM-01 | ❌ Absent |
| MAQ-08 | Gestion utilisateurs | US-ADM-02, US-ADM-03 | ⚠️ Partiel |
| MAQ-09 | Planification | US-CON-04, US-CON-05 | ❌ Absent |

---

## 5. Correspondance Critères d'Acceptation → User Stories

Les critères d'acceptation (CA) sont définis dans la note de cadrage
[SPC-0001](SPC-0001-note-cadrage-links-v1.15.md), section 13.

### 5.1 Critères du périmètre v1 (obligatoires)

| CA-ID | Critère | US liées | Statut |
|-------|---------|----------|--------|
| CA-01 | Authentification sécurisée (3 rôles) | US-AUTH-01, US-AUTH-02, US-AUTH-03, US-AUTH-04 | ✅ Validé |
| CA-02 | Accès libre aux phases | US-BEN-01, US-BEN-03 | 🔲 Stub (saisie phase non fonctionnelle) |
| CA-03 | Saisie et sauvegarde des réponses | US-BEN-03, US-BEN-04 | 🔲 Stub |
| CA-04 | Validation de phase | US-BEN-05 | 🔲 Stub |
| CA-05 | Téléchargement documents par phase | US-BEN-07, US-ADM-06 | 🔲 Stub / ❌ Absent |
| CA-06 | Dashboard consultant complet | US-CON-01, US-CON-02, US-CON-03 | 🔲 Stub |
| CA-07 | Dashboard Super Admin fonctionnel | US-ADM-01, US-ADM-02, US-ADM-05 | ⚠️ Partiel (création bénéficiaire uniquement) |
| CA-08 | Déploiement HTTPS en production | *(infra)* | ✅ Validé |
| CA-09 | Conformité RGPD de base | *(pages légales)* | ✅ Validé |
| CA-10 | CLAUDE.md livré | *(documentation)* | ✅ Validé |
| CA-11 | Performance (dashboard < 3s) | *(toutes pages)* | ✅ Validé |
| CA-12 | Responsive (desktop + tablette) | *(toutes pages)* | ✅ Validé |

### 5.2 Critères optionnels v1 (entre crochets dans SPC-0001)

| CA-ID | Critère | US liées | Statut |
|-------|---------|----------|--------|
| CA-13 | Comptes-rendus (saisie, 6 fiches, invisibilité bénéficiaire, export PDF) | US-CON-06, US-CON-07 | ❌ Absent |
| CA-14 | Planification séances (6 dates visibles chez le bénéficiaire) | US-CON-04 | ❌ Absent |
| CA-15 | Lien visioconférence accessible par le bénéficiaire | US-CON-05 | ❌ Absent |

### 5.3 Synthèse critères d'acceptation

| Catégorie | Total | ✅ Validé | ⚠️/🔲 Partiel/Stub | ❌ Bloqué |
|-----------|-------|----------|-------------------|----------|
| Obligatoires (CA-01 à CA-12) | 12 | 6 | 4 | 2 |
| Optionnels (CA-13 à CA-15) | 3 | 0 | 0 | 3 |
| **Total** | **15** | **6** | **4** | **5** |

---

## 6. Historique

| Version | Date | Auteur | Changement |
|---------|------|--------|------------|
| 1.0 | 2026-03-25 | Claude | Création initiale — état au 2026-03-25 |
