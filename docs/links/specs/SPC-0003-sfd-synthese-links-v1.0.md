---
ref: SPC-0003
title: "Spécifications fonctionnelles détaillées — Synthèse et architecture"
type: SPC
scope: links
status: draft
version: "1.0"
created: 2026-03-23
updated: 2026-03-23
author: David Duquenne — Unanima
related-issues: ["#90", "#91"]
supersedes: null
superseded-by: null
depends-on: ["SPC-0001"]
---

**SPÉCIFICATIONS FONCTIONNELLES DÉTAILLÉES**

**Synthèse et architecture — Plateforme de suivi des bilans de compétences**

*[Version 1.0]*

  -----------------------------------------------------------------------
  **Propriété**          **Valeur**
  ---------------------- ------------------------------------------------
  Client                 Link's Accompagnement

  Auteur                 David Duquenne — Unanima

  Version                1.0

  Date                   Mars 2026

  Statut                 Brouillon

  Référence cadrage      SPC-0001 — Note de cadrage v1.15
  -----------------------------------------------------------------------

# 1. Objet du document

Ce document constitue le volet de synthèse des spécifications fonctionnelles détaillées (SFD) de la plateforme de suivi des bilans de compétences de Link's Accompagnement. Il présente :

- L'architecture fonctionnelle en Epics, Features et User Stories
- La Story Map du produit
- Le glossaire métier consolidé
- Les règles métier transverses
- La Definition of Done partagée
- Le tableau de backlog synthétique

Les User Stories détaillées (critères d'acceptation, scénarios BDD/Gherkin, règles métier spécifiques) sont rédigées dans deux documents complémentaires :

| Document | Périmètre | Référence |
|---|---|---|
| SPC-0004 | SFD Sprint 1 — Espace bénéficiaire | `SPC-0004-sfd-sprint1-links-v1.0.md` |
| SPC-0005 | SFD Sprint 2 — Espaces consultant, super admin et déploiement | `SPC-0005-sfd-sprint2-links-v1.0.md` |

---

# 2. Architecture fonctionnelle

## 2.1 Vue d'ensemble des Epics

```
EPIC-01 | AUTHENTIFICATION ET GESTION DES ACCÈS
EPIC-02 | PARCOURS BÉNÉFICIAIRE
EPIC-03 | ESPACE CONSULTANT
EPIC-04 | ESPACE SUPER ADMINISTRATEUR
EPIC-05 | DÉPLOIEMENT, CONFORMITÉ ET DOCUMENTATION
```

## 2.2 Décomposition Epics → Features → User Stories

### EPIC-01 | AUTHENTIFICATION ET GESTION DES ACCÈS

**Description :** Mise en place de l'authentification sécurisée pour les 3 profils utilisateurs (bénéficiaire, consultant, super admin) avec gestion des sessions, réinitialisation de mot de passe et redirection contextuelle selon le rôle.

**Valeur métier :** Sécuriser l'accès à la plateforme et garantir que chaque utilisateur accède uniquement à son espace dédié.

**Indicateur de succès :** 100 % des utilisateurs accèdent à leur espace en < 3 secondes après connexion.

**Lot / Release :** v1 — Sprint 1

| Feature | User Stories |
|---|---|
| FEAT-01 — Connexion et session | US-01, US-02, US-03, US-04 |

---

### EPIC-02 | PARCOURS BÉNÉFICIAIRE

**Description :** Espace dédié au bénéficiaire : dashboard de suivi des 6 phases, saisie des réponses aux questions ouvertes, sauvegarde manuelle et automatique, validation de phase, téléchargement de documents et visualisation des rendez-vous.

**Valeur métier :** Offrir au bénéficiaire une expérience guidée, autonome et rassurante pour réaliser son bilan de compétences à son rythme.

**Indicateur de succès :** 90 % des bénéficiaires complètent au moins 3 phases sans assistance technique.

**Lot / Release :** v1 — Sprint 1

| Feature | User Stories |
|---|---|
| FEAT-02 — Dashboard bénéficiaire | US-05, US-06, US-07 |
| FEAT-03 — Saisie et gestion des réponses | US-08, US-09, US-10, US-11, US-12 |
| FEAT-04 — Documents par phase | US-13 |

---

### EPIC-03 | ESPACE CONSULTANT

**Description :** Espace dédié au consultant : tableau de bord portefeuille bénéficiaires, accès aux dossiers en lecture, planification des 6 séances, saisie des comptes-rendus et export PDF.

**Valeur métier :** Permettre au consultant de suivre efficacement l'avancement de ses bénéficiaires et de documenter chaque séance d'accompagnement.

**Indicateur de succès :** Le consultant accède à l'ensemble de son portefeuille et au détail de chaque dossier en < 2 clics.

**Lot / Release :** v1 — Sprint 2

| Feature | User Stories |
|---|---|
| FEAT-05 — Dashboard consultant | US-14, US-15, US-16 |
| FEAT-06 — Fiche bénéficiaire (lecture) | US-17, US-18 |
| FEAT-07 — Planification des séances | US-19, US-20 |
| FEAT-08 — Comptes-rendus des séances | US-21, US-22 |

---

### EPIC-04 | ESPACE SUPER ADMINISTRATEUR

**Description :** Interface complète de pilotage : KPIs globaux, gestion des comptes utilisateurs (création, modification, suppression), attribution bénéficiaire-consultant, gestion des documents par phase.

**Valeur métier :** Donner au super administrateur une vision d'ensemble de l'activité et les outils de gestion autonomes, sans dépendance technique.

**Indicateur de succès :** Le super admin crée un compte bénéficiaire complet (création + attribution consultant) en < 2 minutes.

**Lot / Release :** v1 — Sprint 2

| Feature | User Stories |
|---|---|
| FEAT-09 — Dashboard super admin | US-23, US-24 |
| FEAT-10 — Gestion des comptes | US-25, US-26, US-27 |
| FEAT-11 — Attribution bénéficiaire-consultant | US-28 |
| FEAT-12 — Gestion des documents par phase | US-29 |

---

### EPIC-05 | DÉPLOIEMENT, CONFORMITÉ ET DOCUMENTATION

**Description :** Déploiement de la plateforme sur Vercel avec HTTPS, mise en place de la conformité RGPD de base (mentions légales, politique de confidentialité), rédaction de la documentation technique (CLAUDE.md) et du guide super administrateur.

**Valeur métier :** Garantir un service accessible, sécurisé et conforme aux obligations légales.

**Indicateur de succès :** URL de production accessible en HTTPS avec certificat valide, mentions légales et politique de confidentialité visibles.

**Lot / Release :** v1 — Sprint 2

| Feature | User Stories |
|---|---|
| FEAT-13 — Déploiement production | US-30 |
| FEAT-14 — Conformité RGPD | US-31, US-32 |

---

# 3. Story Map

## 3.1 Vue synthétique

| Activité → | 🔐 Accès | 📋 Parcours bénéficiaire | 👤 Espace consultant | ⚙️ Administration | 🚀 Déploiement |
|---|---|---|---|---|---|
| **Tâches** | Connexion · Reset MDP · Déconnexion · Redirection rôle | Dashboard 6 phases · Saisie réponses · Save/Autosave · Validation · Documents · Rendez-vous | Dashboard portefeuille · Fiche bénéficiaire · Planification séances · Comptes-rendus · Export PDF | KPIs globaux · Gestion comptes · Attribution · Documents | Vercel HTTPS · RGPD · Documentation |
| **Sprint 1** | US-01 Connexion | US-05 Dashboard | US-14 Dashboard *(Sprint 2)* | US-23 KPIs *(Sprint 2)* | US-30 Déploiement *(Sprint 2)* |
| | US-02 Reset MDP | US-06 Progression | | | |
| | US-03 Déconnexion | US-07 Rendez-vous | | | |
| | US-04 Redirection | US-08 Saisie réponses | | | |
| | | US-09 Save manuelle | | | |
| | | US-10 Autosave | | | |
| | | US-11 Validation phase | | | |
| | | US-12 Modif. après valid. | | | |
| | | US-13 Documents | | | |
| **Sprint 2** | | | US-15 KPIs consultant | US-24 Liste bénéficiaires | US-31 Mentions légales |
| | | | US-16 Indicateurs visuels | US-25 Création comptes | US-32 Politique confidentialité |
| | | | US-17 Accès dossier | US-26 Modification comptes | |
| | | | US-18 Consultation réponses | US-27 Suppression comptes | |
| | | | US-19 Planif. séances | US-28 Attribution | |
| | | | US-20 Lien visio | US-29 Gestion documents | |
| | | | US-21 Saisie CR | | |
| | | | US-22 Export PDF CR | | |
| **v2** | | | F-CON-06 Pièces jointes | F-ADM-06 Graphiques | |
| | | | F-CON-07 Tri/filtrage | F-ADM-07 Notifications | |
| | | | F-CON-14 Signature EduSign | Lot F — Modèles parcours | |
| | | | | Lot G — Interface gestion contenu | |
| | | | | Lot IA — Reformulation IA | |

---

# 4. Glossaire métier

| Terme | Définition |
|---|---|
| **Bénéficiaire** | Personne réalisant un bilan de compétences via la plateforme. 25 à 50 par an. |
| **Consultant(e)** | Professionnel(le) de Link's Accompagnement qui accompagne les bénéficiaires tout au long de leur bilan. 3 à 5 consultants. |
| **Super Administrateur** | Gestionnaire unique de la plateforme avec accès complet à l'interface d'administration (gestion comptes, attributions, documents, KPIs). |
| **Phase** | Étape du parcours de bilan de compétences. Le parcours comporte 6 phases séquentielles avec questions ouvertes. |
| **Séance** | Rendez-vous d'accompagnement entre la consultante et le bénéficiaire. 6 séances par parcours, correspondant aux 6 phases. |
| **Compte-rendu (CR)** | Note rédigée par la consultante après chaque séance. Invisible pour le bénéficiaire. Visible par la consultante et le super admin. |
| **Validation de phase** | Action du bénéficiaire marquant une phase comme terminée. La validation n'est pas bloquante : le bénéficiaire peut modifier ses réponses après validation. |
| **Autosave** | Sauvegarde automatique des réponses du bénéficiaire à intervalles réguliers, sans action explicite. |
| **Attribution** | Liaison entre un bénéficiaire et un consultant. Réalisée par le super admin à la création du compte bénéficiaire. |
| **PMV** | Périmètre Minimum Viable — ensemble minimal de fonctionnalités pour un service opérationnel (= v1). |
| **RBAC** | Role-Based Access Control — contrôle d'accès basé sur les rôles : bénéficiaire, consultant, super_admin. |
| **Lien visioconférence** | Lien unique (Teams, Zoom, Meet...) saisi par la consultante, visible par le bénéficiaire dans son espace pour toutes les séances. Un seul lien global par bénéficiaire. |

---

# 5. Règles métier transverses

Ces règles s'appliquent à l'ensemble de la plateforme, indépendamment des User Stories spécifiques.

## 5.1 Accès et sécurité

| ID | Règle |
|---|---|
| RG-T01 | L'authentification repose sur email + mot de passe avec hachage bcrypt (facteur de coût ≥ 12). |
| RG-T02 | Trois rôles exclusifs : `beneficiaire`, `consultant`, `super_admin`. Un utilisateur a un et un seul rôle. |
| RG-T03 | L'isolement des données est strict : un bénéficiaire ne voit que ses propres données ; un consultant ne voit que les bénéficiaires qui lui sont attribués ; le super admin voit tout. |
| RG-T04 | Toute la plateforme est accessible uniquement en HTTPS. |
| RG-T05 | Les sessions utilisateur sont limitées dans le temps (durée à définir, recommandation : 8h d'inactivité). |

## 5.2 Parcours bénéficiaire

| ID | Règle |
|---|---|
| RG-T06 | Toutes les 6 phases sont accessibles dès la création du compte bénéficiaire. Aucun verrouillage progressif. |
| RG-T07 | Le bénéficiaire peut réaliser les phases dans l'ordre qu'il souhaite. |
| RG-T08 | Un bénéficiaire peut modifier ses réponses à tout moment, y compris après validation d'une phase. |
| RG-T09 | Le nombre de questions par phase est variable (défini par le contenu fourni par Link's). |
| RG-T10 | Les réponses sont liées à l'identifiant technique de la question, pas à son texte. Un changement de libellé n'affecte pas les réponses existantes. |

## 5.3 Séances et comptes-rendus

| ID | Règle |
|---|---|
| RG-T11 | Les comptes-rendus des séances sont invisibles pour le bénéficiaire. Visibles uniquement par la consultante et le super admin. |
| RG-T12 | Un seul lien de visioconférence global par bénéficiaire (pas un lien par séance). |
| RG-T13 | Les dates de séances sont modifiables en cours de parcours. Aucune notification e-mail n'est déclenchée en cas de modification ultérieure. |
| RG-T14 | La notification e-mail des séances (H1 ou H2) est à arbitrer par Link's avant le Sprint 2. En mode dégradé, les dates sont visibles dans l'espace bénéficiaire sans e-mail. |

## 5.4 Gestion des comptes

| ID | Règle |
|---|---|
| RG-T15 | Les identifiants de connexion sont générés par le super admin et communiqués manuellement (copier-coller puis envoi par e-mail). Aucun e-mail d'invitation automatique en v1. |
| RG-T16 | La suppression d'un compte utilisateur doit respecter le droit à l'effacement RGPD. |

## 5.5 Documents

| ID | Règle |
|---|---|
| RG-T17 | Les documents mis à disposition par phase sont gérés par le super admin. Ce sont des fichiers PDF ou des liens vers des fichiers hébergés sur les serveurs Link's. |
| RG-T18 | Le bénéficiaire ne peut pas uploader de fichiers (hors périmètre confirmé). |

---

# 6. Personas utilisateurs

## Persona 1 — Marie (Bénéficiaire)

```
PERSONA : Marie
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rôle : Salariée en reconversion, 38 ans
Profil technique : Novice
Fréquence d'utilisation : 2 à 3 fois par semaine pendant 2 mois
Objectifs principaux :
  - Remplir les questionnaires de son bilan de compétences à son rythme
  - Retrouver facilement où elle en est dans son parcours
  - Consulter les dates de ses rendez-vous avec sa consultante
Frustrations actuelles :
  - Peur de perdre ses réponses en fermant le navigateur
  - Ne sait plus quelle phase elle a déjà terminée
Contraintes :
  - Utilise un PC personnel, pas toujours à la maison
  - Connexion internet parfois instable
```

## Persona 2 — Séverine (Consultante)

```
PERSONA : Séverine
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rôle : Consultante en bilan de compétences
Profil technique : Intermédiaire
Fréquence d'utilisation : Quotidienne (jours ouvrés)
Objectifs principaux :
  - Voir d'un coup d'œil l'avancement de tous ses bénéficiaires
  - Accéder rapidement aux réponses d'un bénéficiaire avant une séance
  - Saisir les comptes-rendus de chaque séance et les exporter en PDF
  - Planifier les dates des 6 rendez-vous
Frustrations actuelles :
  - Suivi manuel par fichiers Excel et e-mails
  - Difficulté à retrouver les informations avant chaque rendez-vous
Contraintes :
  - Gère 5 à 10 bénéficiaires en parallèle
  - Souvent en rendez-vous, peu de temps pour l'administration
```

## Persona 3 — Julien (Super Administrateur)

```
PERSONA : Julien
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rôle : Dirigeant de Link's Accompagnement / Super Administrateur
Profil technique : Intermédiaire
Fréquence d'utilisation : Hebdomadaire
Objectifs principaux :
  - Piloter l'activité globale (combien de bilans en cours, terminés)
  - Créer les comptes bénéficiaires et les attribuer aux consultantes
  - Mettre à jour les documents de référence par phase
  - Consulter les comptes-rendus des consultantes
Frustrations actuelles :
  - Coûts de licence trop élevés pour l'outil actuel
  - Pas de vision synthétique de l'activité
Contraintes :
  - Doit pouvoir administrer la plateforme sans compétence technique
  - Budget limité — cherche une solution à coût fixe
```

---

# 7. Definition of Done (partagée)

Chaque User Story est considérée comme terminée lorsque tous les critères suivants sont remplis :

- [ ] Code développé et fonctionnel
- [ ] Tests unitaires écrits et passants (Vitest)
- [ ] Critères d'acceptation testés et validés
- [ ] Interface responsive (desktop prioritaire, tablette compatible)
- [ ] Accessibilité WCAG AA respectée (contraste, focus visible, ARIA)
- [ ] Données isolées selon le rôle (RLS Supabase)
- [ ] Pas de régression sur les fonctionnalités existantes
- [ ] Code revu et conforme aux conventions CLAUDE.md

---

# 8. Tableau de backlog synthétique

| ID | Titre | Epic | Priorité | Taille | Sprint | Réf. SFD |
|---|---|---|---|---|---|---|
| US-01 | Connexion email / mot de passe | EPIC-01 | Must | S | Sprint 1 | SPC-0004 |
| US-02 | Réinitialisation du mot de passe | EPIC-01 | Must | S | Sprint 1 | SPC-0004 |
| US-03 | Déconnexion sécurisée | EPIC-01 | Must | XS | Sprint 1 | SPC-0004 |
| US-04 | Redirection selon le rôle après connexion | EPIC-01 | Must | XS | Sprint 1 | SPC-0004 |
| US-05 | Dashboard bénéficiaire avec 6 phases | EPIC-02 | Must | M | Sprint 1 | SPC-0004 |
| US-06 | Barre de progression globale | EPIC-02 | Must | S | Sprint 1 | SPC-0004 |
| US-07 | Panneau rendez-vous et lien visio | EPIC-02 | Must | S | Sprint 1 | SPC-0004 |
| US-08 | Saisie des réponses (texte long) | EPIC-02 | Must | M | Sprint 1 | SPC-0004 |
| US-09 | Sauvegarde manuelle des réponses | EPIC-02 | Must | S | Sprint 1 | SPC-0004 |
| US-10 | Sauvegarde automatique (autosave) | EPIC-02 | Must | S | Sprint 1 | SPC-0004 |
| US-11 | Validation de phase | EPIC-02 | Must | S | Sprint 1 | SPC-0004 |
| US-12 | Modification des réponses après validation | EPIC-02 | Must | XS | Sprint 1 | SPC-0004 |
| US-13 | Téléchargement des documents par phase | EPIC-02 | Must | S | Sprint 1 | SPC-0004 |
| US-14 | Dashboard consultant — portefeuille bénéficiaires | EPIC-03 | Must | M | Sprint 2 | SPC-0005 |
| US-15 | KPIs consultant | EPIC-03 | Must | S | Sprint 2 | SPC-0005 |
| US-16 | Indicateurs visuels par phase | EPIC-03 | Must | S | Sprint 2 | SPC-0005 |
| US-17 | Accès au dossier bénéficiaire (lecture) | EPIC-03 | Must | M | Sprint 2 | SPC-0005 |
| US-18 | Consultation des réponses saisies | EPIC-03 | Must | S | Sprint 2 | SPC-0005 |
| US-19 | Planification des 6 rendez-vous | EPIC-03 | Must | M | Sprint 2 | SPC-0005 |
| US-20 | Saisie du lien de visioconférence | EPIC-03 | Must | XS | Sprint 2 | SPC-0005 |
| US-21 | Saisie des comptes-rendus de séances | EPIC-03 | Must | M | Sprint 2 | SPC-0005 |
| US-22 | Export PDF des comptes-rendus | EPIC-03 | Must | M | Sprint 2 | SPC-0005 |
| US-23 | Dashboard super admin — KPIs globaux | EPIC-04 | Must | M | Sprint 2 | SPC-0005 |
| US-24 | Liste complète des bénéficiaires | EPIC-04 | Must | S | Sprint 2 | SPC-0005 |
| US-25 | Création de comptes utilisateurs | EPIC-04 | Must | M | Sprint 2 | SPC-0005 |
| US-26 | Modification de comptes utilisateurs | EPIC-04 | Must | S | Sprint 2 | SPC-0005 |
| US-27 | Suppression / désactivation de comptes | EPIC-04 | Must | S | Sprint 2 | SPC-0005 |
| US-28 | Attribution bénéficiaire-consultant | EPIC-04 | Must | S | Sprint 2 | SPC-0005 |
| US-29 | Gestion des documents par phase | EPIC-04 | Must | M | Sprint 2 | SPC-0005 |
| US-30 | Déploiement Vercel + HTTPS | EPIC-05 | Must | M | Sprint 2 | SPC-0005 |
| US-31 | Mentions légales | EPIC-05 | Must | S | Sprint 2 | SPC-0005 |
| US-32 | Politique de confidentialité RGPD | EPIC-05 | Must | S | Sprint 2 | SPC-0005 |

---

# 9. Matrice de traçabilité — Note de cadrage → User Stories

| Fonctionnalité (note de cadrage) | ID cadrage | User Stories |
|---|---|---|
| Authentification (login / MDP) | F-BEN-01 | US-01, US-04 |
| Réinitialisation mot de passe | F-BEN-02 | US-02 |
| Dashboard 6 phases et statuts | F-BEN-03 | US-05, US-06 |
| Saisie réponses texte | F-BEN-04a | US-08 |
| Téléchargement documents | F-BEN-05 | US-13 |
| Sauvegarde / modification | F-BEN-06 | US-09, US-12 |
| Validation de phase | F-BEN-07 | US-11 |
| Autosave | F-BEN-08 | US-10 |
| Visualisation dates séances | F-BEN-09 | US-07 |
| Accès lien visioconférence | F-BEN-10 | US-07 |
| Authentification consultant | F-CON-01 | US-01, US-04 |
| Dashboard consultant | F-CON-02 | US-14, US-15 |
| Indicateur visuel par phase | F-CON-03 | US-16 |
| Accès dossier bénéficiaire | F-CON-04 | US-17 |
| Consultation réponses | F-CON-05 | US-18 |
| Comptes-rendus séances | F-CON-09 | US-21 |
| Export PDF comptes-rendus | F-CON-10 | US-22 |
| Planification rendez-vous | F-CON-11 | US-19 |
| Lien visioconférence | F-CON-12 | US-20 |
| Dashboard KPIs globaux | F-ADM-01 | US-23 |
| Gestion comptes | F-ADM-02 | US-25, US-26, US-27 |
| Attribution bénéficiaire-consultant | F-ADM-03 | US-28 |
| Gestion documents par phase | F-ADM-04 | US-29 |
| Supervision activité globale | F-ADM-05 | US-24 |

---

# 10. Questions ouvertes restantes

| ID | Question | Impact | Décision requise avant |
|---|---|---|---|
| QO-01 | Contenu exact des 6 phases (titres, libellés des questions) | BLOQUANT Sprint 1 | Kick-off |
| QO-02 | Liste des documents à fournir par phase | BLOQUANT Sprint 1 | Kick-off |
| QO-03 | Hypothèse notification e-mail séances (H1 vs H2) | Impact chiffrage Sprint 2 | Démarrage Sprint 2 |

---

# 11. Hors périmètre v1 (rappel)

Les éléments suivants sont explicitement exclus du périmètre v1 :

- Upload de fichiers par le bénéficiaire (confirmé hors périmètre)
- Notifications e-mail automatiques (supprimées pour économie budgétaire)
- Application mobile native
- Intégration outils tiers (SIRH, CRM)
- Module de visioconférence intégré
- Facturation en ligne
- Multi-tenants
- Signature électronique EduSign (reportée en v2 — Lot ES)
- Tri et filtrage de la liste bénéficiaires côté consultant (v2 — Lot E)
- Graphiques d'activité mensuelle côté admin (v2 — Lot C)
- Modèles de parcours par consultante (v2 — Lot F)
- Interface graphique de gestion du contenu des phases (v2 — Lot G)
- Reformulation IA des réponses (v2 — Lot IA)
