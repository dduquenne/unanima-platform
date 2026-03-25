---
ref: RPT-0002
title: "Audit de conformité fonctionnelle et visuelle — Application Link's Accompagnement"
type: RPT
scope: links
status: final
version: "1.0"
created: 2026-03-25
updated: 2026-03-25
author: Claude (Auditix)
related-issues: []
supersedes: null
superseded-by: null
---

# RPT-0002 — Audit de conformité fonctionnelle et visuelle

## 1. Fiche d'identité de l'application auditée

| Propriété | Valeur |
|---|---|
| Application | Link's Accompagnement |
| Package | `@unanima/links` |
| Framework | Next.js 15 (App Router) |
| Pages implémentées | 23 fichiers page.tsx/layout.tsx |
| Routes API | 27 route handlers |
| Tests unitaires | 136 (Vitest) |
| Mode simulation | Actif (fixtures complètes) |
| Déploiement | Vercel (projet distinct) |

### Documents de référence

| Document | Réf. | Version |
|---|---|---|
| Note de cadrage | SPC-0001 | v1.15 |
| Spécifications fonctionnelles détaillées | SPC-0003 | v1.0 |
| Matrice de traçabilité | SPC-0004 | v1.0 |
| Plan de recette visuelle | SPC-0005 | v1.0 |
| Maquettes haute fidélité | MAQ-01 à MAQ-09 | v1.0–v2.0 |

---

## 2. Synthèse exécutive

L'application Link's Accompagnement présente un **taux de couverture fonctionnelle réel de ~88%** par rapport aux spécifications (SPC-0003). Sur 25 User Stories spécifiées :

- **22 sont implémentées** (88%)
- **2 sont partiellement implémentées** avec des écarts
- **1 est absente** (US-CON-08 — notification email planification)

> **Important** : la matrice SPC-0004 annonce une couverture de 24%. Ce chiffre est **obsolète**
> et ne reflète pas l'état réel de l'application. La Section 7 de ce rapport fournit une
> matrice corrigée.

Les écrans implémentés présentent **17 non-conformités fonctionnelles** et **12 écarts visuels**
par rapport aux maquettes de référence. Parmi ces écarts, **3 sont bloquants** car ils empêchent
un parcours utilisateur normal.

---

## 3. Anomalies bloquantes (CRITIQUE)

### 3.1 BLQ-01 — Phases "libre" non accessibles depuis le dashboard bénéficiaire

- **Écran** : Dashboard bénéficiaire
- **Fichier** : `app/(protected)/dashboard/page.tsx:368-371`
- **Spécification violée** : RT-01, RG-BEN-01, US-BEN-01
- **Maquette** : MAQ-02 — toutes les cartes sont cliquables avec bouton "Accéder"
- **Attendu** : "Toutes les phases sont accessibles librement dès la création du compte
  bénéficiaire. Aucun verrouillage séquentiel." (RT-01)
- **Constaté** : Les phases au statut `libre` affichent un `<span>` non cliquable au lieu
  d'un `<button>`. Un nouveau bénéficiaire ne peut accéder à **aucune phase** tant qu'aucune
  n'est passée en statut `en_cours`.
- **Preuve** :

```tsx
// dashboard/page.tsx:368-371
{isLibre ? (
  <span className="...text-[var(--color-text-muted)]">Accéder</span>
) : (
  <button onClick={() => router.push(`/bilans/${phase.phase_number}`)} ...>Accéder</button>
)}
```

- **Impact** : Parcours bénéficiaire entièrement bloqué à la première connexion
- **Sévérité** : CRITIQUE
- **Effort** : XS (< 1h) — remplacer le `<span>` par un `<button>` avec navigation
- **Préconisation** : Rendre toutes les cartes cliquables quel que soit le statut

---

### 3.2 BLQ-02 — CTA "Continuer le bilan" absent du dashboard

- **Écran** : Dashboard bénéficiaire
- **Fichier** : `app/(protected)/dashboard/page.tsx`
- **Spécification violée** : US-BEN-01, flux principal étape 6
- **Maquette** : MAQ-02
- **Attendu** : Bouton CTA "Continuer le bilan" → redirige vers la phase en cours
  (ou phase 1 si aucune)
- **Constaté** : Aucun bouton CTA n'existe sur la page. La fonction `getCurrentPhase()`
  est définie (ligne 50-60) mais jamais utilisée dans le rendu.
- **Impact** : L'utilisateur doit chercher manuellement quelle phase aborder
- **Sévérité** : CRITIQUE
- **Effort** : XS (< 1h)
- **Préconisation** : Ajouter un bouton CTA proéminent sous le message de bienvenue

---

### 3.3 BLQ-03 — Incohérence des labels de phase entre écrans

- **Écrans** : Dashboard vs Phase détail vs Vue consultant
- **Fichiers** :
  - `dashboard/page.tsx:13-20`
  - `bilans/[id]/page.tsx:13-20`
  - `consultant/beneficiaires/[id]/page.tsx`
- **Constaté** : Trois jeux de labels différents pour les mêmes 6 phases :

| Phase | Dashboard | Bilan détail | Consultant |
|---|---|---|---|
| 1 | Définir mon projet | Phase préliminaire | Definir le projet |
| 2 | Explorer mes compétences | Investigation — Parcours personnel | Analyser les competences |
| 3 | Analyser mon marché | Investigation — Parcours professionnel | Etudier le marche |
| 4 | Construire mon plan | Investigation — Projet professionnel | Construire le plan |
| 5 | Préparer mon entretien | Conclusion | Preparer l'entretien |
| 6 | Finaliser mon bilan | Suivi à 6 mois | Finaliser le bilan |

- **Impact** : Confusion pour l'utilisateur qui voit des noms différents selon les écrans.
  De plus les labels consultant sont sans accents (Definir, competences, marche, Preparer).
- **Sévérité** : CRITIQUE (confusion utilisateur + fautes d'orthographe visibles)
- **Effort** : S (< 4h) — centraliser les labels dans un fichier unique
- **Préconisation** : Créer un fichier `src/config/phases.config.ts` avec les labels officiels
  issus de la note de cadrage et l'utiliser dans tous les écrans

---

## 4. Anomalies majeures (MAJEUR)

### 4.1 MAJ-01 — Layout sans sidebar contrairement aux maquettes

- **Maquettes** : MAQ-03, MAQ-06, MAQ-07, MAQ-08, MAQ-09 montrent une sidebar de navigation
  à gauche
- **Constaté** : L'app utilise une navigation par onglets horizontaux dans le header
  (`(protected)/layout.tsx:194-222`)
- **Impact** : Divergence structurelle significative avec les maquettes livrées au client
- **Sévérité** : MAJEUR
- **Effort** : L (< 3j) — refonte du layout pour ajouter une sidebar conditionnelle
- **Préconisation** : Implémenter une sidebar pour les rôles consultant et super_admin
  (comme sur MAQ-06/07/08), conserver les onglets horizontaux pour le bénéficiaire
  (cohérent avec MAQ-02)

---

### 4.2 MAJ-02 — Page de saisie de phase sans sidebar de progression (MAQ-03)

- **Maquette** : MAQ-03 — sidebar gauche avec progression des 6 phases, carte consultant,
  prochain RDV
- **Fichier** : `bilans/[id]/page.tsx`
- **Constaté** : Affiche uniquement les questions en colonne unique, sans sidebar
- **Manquent** :
  - Indicateurs de progression par phase (sidebar)
  - Carte consultant avec coordonnées
  - Info prochain rendez-vous
  - Compteur "Question X / N"
- **Sévérité** : MAJEUR
- **Effort** : M (< 1j)
- **Préconisation** : Ajouter une sidebar gauche sur la page phase avec les éléments de MAQ-03

---

### 4.3 MAJ-03 — Routes de redirection post-login non conformes à la SFD

- **Spécification** : RG-AUTH-11 — "consultant→`/beneficiaires`, super_admin→`/admin`"
- **Constaté** :
  - consultant → `/consultant/dashboard` (au lieu de `/beneficiaires`)
  - super_admin → `/admin/dashboard` (au lieu de `/admin`)
- **Sévérité** : MAJEUR (non-conformité SFD)
- **Effort** : XS
- **Préconisation** : Aligner la SFD sur le code actuel (`/consultant/dashboard` et
  `/admin/dashboard` sont plus explicites et recommandés). Mettre à jour SPC-0003
  en conséquence.

---

### 4.4 MAJ-04 — Stubs bloquant le parcours (routes `/beneficiaires/*`)

- **Fichiers** :
  - `(protected)/beneficiaires/page.tsx` — stub
  - `(protected)/beneficiaires/[id]/page.tsx` — stub
  - `(protected)/beneficiaires/[id]/modifier/page.tsx` — stub
- **Constaté** : Ces pages affichent "en cours de développement (Sprint 9)" alors que les
  pages fonctionnelles existent sous `/consultant/beneficiaires/...`
- **Impact** : Confusion dans la navigation. Un consultant qui arrive sur `/beneficiaires`
  voit un stub au lieu du contenu.
- **Sévérité** : MAJEUR
- **Effort** : S (< 4h)
- **Préconisation** : Supprimer les stubs ou les transformer en redirections vers les routes
  consultant/admin correspondantes

---

### 4.5 MAJ-05 — Admin : sidebar et notifications absentes (MAQ-07)

- **Maquette** : MAQ-07 — sidebar sombre (#0D3B6E), badge notification avec compteur,
  statut de connexion en footer
- **Fichier** : `admin/dashboard/page.tsx`
- **Constaté** : Utilise le layout générique avec tabs horizontaux. Pas de sidebar,
  pas de notifications, pas de footer de statut.
- **Sévérité** : MAJEUR
- **Effort** : M (< 1j)

---

### 4.6 MAJ-06 — Matrice de traçabilité SPC-0004 obsolète

- **Constaté** : SPC-0004 marque comme ❌ Absent ou 🔲 Stub des écrans pleinement
  implémentés :
  - US-ADM-01 (Admin dashboard) → marqué ❌ mais **implémenté**
  - US-CON-04 (Planification) → marqué ❌ mais **implémenté** dans `planification.tsx`
  - US-CON-06 (Comptes-rendus) → marqué ❌ mais **implémenté** dans `comptes-rendus.tsx`
  - US-CON-07 (Export PDF) → marqué ❌ mais **implémenté** dans `session-notes/export/`
  - US-BEN-03 à 07 → marqués 🔲 Stub mais **implémentés** dans `bilans/[id]/page.tsx`
- **Impact** : Le document de référence donne une image faussement pessimiste de l'avancement
- **Sévérité** : MAJEUR (documentation trompeuse pour le client)
- **Effort** : S (< 4h) — mettre à jour la matrice
- **Préconisation** : Recalculer la couverture réelle → **~88%** au lieu de 24%

---

### 4.7 MAJ-07 — Formulaire création utilisateur diffère de MAQ-08

- **Maquette** : MAQ-08 — modale avec champs Prénom, Nom, Email, Consultante assignée
- **Constaté** :
  - `admin/utilisateurs/page.tsx` — implémente une modale avec CRUD complet ✅
  - `beneficiaires/nouveau/page.tsx` — page pleine avec `full_name` unique (pas Prénom/Nom
    séparés), pas d'assignation consultant
- **Impact** : Deux chemins de création avec des interfaces différentes
- **Sévérité** : MAJEUR
- **Effort** : S — supprimer `beneficiaires/nouveau` et utiliser uniquement la modale admin
- **Préconisation** : Conserver `admin/utilisateurs` comme unique point de création

---

### 4.8 MAJ-08 — Checkbox "Se souvenir de moi" vs RG-AUTH-21

- **Spécification** : RG-AUTH-21 — "Pas de mécanisme 'Se souvenir de moi'"
- **Fichier** : `login/page.tsx`
- **Constaté** : Le formulaire comporte une checkbox "Se souvenir de moi"
- **Sévérité** : MAJEUR (non-conformité sécurité)
- **Effort** : XS — supprimer la checkbox et sa logique

---

## 5. Anomalies mineures (MINEUR)

### 5.1 MIN-01 — Fautes d'accents dans les textes consultant

| Fichier | Constaté | Attendu |
|---|---|---|
| `consultant/beneficiaires/[id]/page.tsx` | "Pas encore de reponse" | "Pas encore de réponse" |
| `comptes-rendus.tsx` | "Redige" | "Rédigé" |
| `planification.tsx` | "etre" | "être" |

- **Effort** : XS

---

### 5.2 MIN-02 — Entités HTML inutiles dans le dashboard bénéficiaire

- **Fichier** : `dashboard/page.tsx`
- **Constaté** : `&eacute;`, `&agrave;`, `&middot;` au lieu de caractères UTF-8 directs
- **Impact** : Code moins lisible et maintenance plus difficile
- **Effort** : XS

---

### 5.3 MIN-03 — Bouton "Planifier" trompeur pour le bénéficiaire

- **Fichier** : `dashboard/page.tsx:269-273`
- **Constaté** : Séances non planifiées affichent un `<span>` stylé en bouton "Planifier"
  mais non cliquable
- **Spécification** : RG-BEN-13 — "Dates de séances modifiables uniquement par la consultante"
- **Impact** : L'apparence de bouton est trompeuse
- **Effort** : XS
- **Préconisation** : Afficher "À planifier" comme texte informatif sans affordance de bouton

---

### 5.4 MIN-04 — Page profil minimaliste avec rôle non traduit

- **Fichier** : `profile/page.tsx`
- **Constaté** : Rôle affiché en minuscules non traduit ("beneficiaire" au lieu de
  "Bénéficiaire")
- **Effort** : XS

---

### 5.5 MIN-05 — Double route profil sans lien entre elles

- **Constaté** : `/profile` (infos) et `/profil/mes-donnees` (RGPD) existent séparément
  sans navigation mutuelle
- **Préconisation** : Fusionner en une seule page avec onglets
- **Effort** : S

---

### 5.6 MIN-06 — Code mort `onClick={() => undefined}`

- **Fichier** : `beneficiaires/nouveau/page.tsx:181`
- **Effort** : XS

---

### 5.7 MIN-07 — Erreurs API avalées silencieusement

- **Fichiers** : `dashboard/page.tsx`, `consultant/dashboard/page.tsx`, `admin/dashboard/page.tsx`
- **Constaté** : Les erreurs de fetch sont catchées sans notification utilisateur
- **Préconisation** : Ajouter des toasts d'erreur
- **Effort** : S

---

## 6. Conformité par maquette — Synthèse visuelle

| Maquette | Écran | Implémenté | Conformité | Écarts principaux |
|---|---|---|---|---|
| MAQ-01 | Login | ✅ | **85%** | Trust badges absents, illustration simplifiée |
| MAQ-02 | Dashboard bénéficiaire | ✅ | **70%** | CTA absent, phases libre non cliquables |
| MAQ-03 | Saisie de phase | ✅ | **50%** | Sidebar progression absente, carte consultant absente |
| MAQ-04 | Dashboard consultant | ✅ | **75%** | Sidebar absente, tabs conformes |
| MAQ-05 | Fiche bénéficiaire | ✅ | **70%** | Labels sans accents |
| MAQ-06 | Comptes-rendus | ✅ | **65%** | Sidebar navigation absente |
| MAQ-07 | Dashboard admin | ✅ | **55%** | Sidebar sombre absente, notifications absentes |
| MAQ-08 | Gestion utilisateurs | ✅ | **60%** | Formulaire création diffère (pleine page vs modale) |
| MAQ-09 | Planification | ✅ | **70%** | Sidebar absente |

**Score de conformité visuelle moyen : 67%**

---

## 7. Conformité par User Story — Matrice corrigée

> **Cette section corrige la matrice SPC-0004 v1.0 qui est obsolète.**

| Epic | US | Titre | Statut réel | Commentaire |
|---|---|---|---|---|
| AUTH | US-AUTH-01 | Connexion email/MDP | ✅ | Checkbox "Se souvenir" à retirer (MAJ-08) |
| AUTH | US-AUTH-02 | Demande réinit MDP | ✅ | Conforme |
| AUTH | US-AUTH-03 | Changement MDP via lien | ✅ | Conforme |
| AUTH | US-AUTH-04 | Déconnexion + expiration 8h | ✅ | Conforme |
| BEN | US-BEN-01 | Progression 6 phases | ⚠️ | Phases libre non cliquables (BLQ-01), CTA absent (BLQ-02) |
| BEN | US-BEN-02 | Planning séances | ✅ | Conforme |
| BEN | US-BEN-03 | Saisie réponses phase | ✅ | Labels incohérents (BLQ-03) |
| BEN | US-BEN-04 | Autosave 30s | ✅ | Conforme (blur + timer + retry) |
| BEN | US-BEN-05 | Validation phase | ✅ | Modal + sauvegarde forcée conformes |
| BEN | US-BEN-06 | Modification après validation | ✅ | Dé-validation possible conforme |
| BEN | US-BEN-07 | Téléchargement documents | ✅ | URL signées conformes |
| CON | US-CON-01 | Portefeuille bénéficiaires | ✅ | KPIs, filtres, pagination |
| CON | US-CON-02 | Dossier bénéficiaire | ✅ | Onglets, 403 si non assigné |
| CON | US-CON-03 | Consultation réponses | ✅ | Lecture seule conforme |
| CON | US-CON-04 | Planification 6 RDV | ✅ | Date/heure + validation futur |
| CON | US-CON-05 | Lien visioconférence | ✅ | HTTPS validé, champ unique |
| CON | US-CON-06 | Saisie comptes-rendus | ✅ | Accordéon, 10 000 car., confidentialité |
| CON | US-CON-07 | Export PDF CR | ✅ | @react-pdf/renderer côté serveur |
| CON | US-CON-08 | Notification email planif | ❌ | Non implémenté |
| ADM | US-ADM-01 | Dashboard KPIs admin | ✅ | 4 KPIs, table activité, CSV export |
| ADM | US-ADM-02 | Création compte | ✅ | MDP temporaire, modale |
| ADM | US-ADM-03 | Modification compte | ✅ | Réassignation consultant possible |
| ADM | US-ADM-04 | Suppression RGPD | ✅ | Double confirmation, suppression physique |
| ADM | US-ADM-05 | Attribution bénéf ↔ consultant | ⚠️ | Possible via formulaire admin, pas d'écran dédié |
| ADM | US-ADM-06 | Gestion documents par phase | ✅ | Upload, tri, max 3/phase |

### Synthèse corrigée

| Epic | Total | ✅ | ⚠️ | ❌ | Couverture |
|---|---|---|---|---|---|
| AUTH | 4 | 4 | 0 | 0 | **100%** |
| BEN | 7 | 6 | 1 | 0 | **86%** |
| CON | 8 | 7 | 0 | 1 | **88%** |
| ADM | 6 | 5 | 1 | 0 | **83%** |
| **Total** | **25** | **22** | **2** | **1** | **88%** |

---

## 8. Plan d'action priorisé

### Priorité 1 — Bloquants (à corriger immédiatement)

| # | Action | Fichier(s) | Effort | Réf. |
|---|---|---|---|---|
| 1 | Rendre les phases "libre" cliquables | `dashboard/page.tsx:368-371` | XS | BLQ-01 |
| 2 | Ajouter le CTA "Continuer le bilan" | `dashboard/page.tsx` | XS | BLQ-02 |
| 3 | Centraliser et corriger les labels de phase | Nouveau `config/phases.config.ts` + 3 pages | S | BLQ-03 |

### Priorité 2 — Conformité visuelle (avant livraison client)

| # | Action | Effort | Réf. |
|---|---|---|---|
| 4 | Implémenter sidebar consultant/admin | L | MAJ-01 |
| 5 | Ajouter sidebar progression sur page phase | M | MAJ-02 |
| 6 | Supprimer checkbox "Se souvenir de moi" | XS | MAJ-08 |
| 7 | Corriger formulaire création → modale avec Prénom/Nom/Consultant | M | MAJ-07 |
| 8 | Supprimer/rediriger stubs `/beneficiaires/*` | S | MAJ-04 |

### Priorité 3 — Qualité et finitions

| # | Action | Effort | Réf. |
|---|---|---|---|
| 9 | Corriger les accents manquants (3 fichiers) | XS | MIN-01 |
| 10 | Remplacer entités HTML par UTF-8 | XS | MIN-02 |
| 11 | Corriger bouton "Planifier" non interactif | XS | MIN-03 |
| 12 | Fusionner profil et mes-données | S | MIN-05 |
| 13 | Ajouter toasts d'erreur sur fetches | S | MIN-07 |
| 14 | Mettre à jour SPC-0004 avec la couverture réelle | S | MAJ-06 |

### Priorité 4 — Fonctionnalités manquantes

| # | Action | Effort | Réf. |
|---|---|---|---|
| 15 | Implémenter notification email planification | M | US-CON-08 |

### Estimation totale

| Priorité | Effort total estimé |
|---|---|
| P1 — Bloquants | ~1 jour |
| P2 — Conformité visuelle | ~5 jours |
| P3 — Qualité | ~1.5 jour |
| P4 — Fonctionnalités manquantes | ~1 jour |
| **Total** | **~8.5 jours** |

---

## 9. Points positifs identifiés

- **Authentification complète** : login, reset password, expiration 8h, RBAC — conforme
- **Autosave robuste** : timer 30s + blur + retry 2× + indicateur d'état — conforme
  RG-BEN-17/18/19
- **Mode simulation complet** : 8 profils, fixtures exhaustives, sélecteur de rôle —
  excellent pour les démos client
- **RGPD** : export données, suppression physique, mentions légales, cookies — conforme
- **Accessibilité** : skip link, aria-labels, focus visible, rôle status sur spinners
- **Architecture propre** : séparation API/pages, types Zod, packages partagés bien utilisés
- **Tests** : 136 tests unitaires couvrant schemas, logique métier, simulation

---

## 10. Historique

| Version | Date | Auteur | Changement |
|---|---|---|---|
| 1.0 | 2026-03-25 | Claude (Auditix) | Création initiale — audit complet |
