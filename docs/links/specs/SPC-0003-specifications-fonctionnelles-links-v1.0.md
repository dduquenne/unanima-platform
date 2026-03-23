---
ref: SPC-0003
title: "Spécifications fonctionnelles détaillées — Plateforme Link's Accompagnement"
type: SPC
scope: links
status: draft
version: "1.0"
created: 2026-03-23
updated: 2026-03-23
author: David Duquenne — Unanima
related: ["SPC-0001", "SPC-0002"]
tags: ["links", "specs", "functional", "user-stories"]
---

# Spécifications fonctionnelles détaillées — Link's Accompagnement

> **Basé sur** : SPC-0001 v1.15 (Note de cadrage)
> **Statut** : Brouillon — en attente de validation Link's Accompagnement
> **Version** : 1.0 — 2026-03-23

---

## Sommaire

| Epic | Features | User Stories | Estimation |
|---|---|---|---|
| EPIC-AUTH — Authentification | FEAT-AUTH-01/02/03 | US-AUTH-01 à 04 | 4×S |
| EPIC-BEN — Espace Bénéficiaire | FEAT-BEN-01/02/03 | US-BEN-01 à 07 | 3M + 4S |
| EPIC-CON — Espace Consultant | FEAT-CON-01 à 05 | US-CON-01 à 08 | 5M + 3S |
| EPIC-ADM — Espace Super Admin | FEAT-ADM-01 à 04 | US-ADM-01 à 06 | 4M + 2S |

**Total : 25 User Stories — 12M + 13S**

---

## Règles transverses de la plateforme

| ID | Règle |
|---|---|
| RT-01 | Toutes les phases sont accessibles librement dès la création du compte bénéficiaire. Aucun verrouillage séquentiel. |
| RT-02 | Un bénéficiaire peut modifier ses réponses après validation d'une phase (confirmé par Link's). |
| RT-03 | Les comptes-rendus de séances sont invisibles au bénéficiaire, visibles uniquement par la consultante et le super admin. |
| RT-04 | Palette couleur : primary #1E6FC0, dark #0D3B6E, success #28A745, warning #FF6B35, bg #F5F7FA, text #4A4A4A, border #DCE1EB, inactive #A0AAB9. |
| RT-05 | RGPD : durée de conservation 3 ans post-bilan, droit à l'effacement sur demande (suppression physique). |
| RT-06 | HTTPS obligatoire sur tous les environnements (Vercel + Let's Encrypt). |
| RT-07 | Toute action sensible (CRUD comptes, validation, suppression) est tracée dans audit_logs. |
| RT-08 | Interface responsive : desktop prioritaire, tablette supportée (breakpoints : 375px / 768px / 1280px). |
| RT-09 | Conformité WCAG AA : contraste texte/fond minimum 4.5:1, focus visible sur tous les éléments interactifs. |
| RT-10 | Performance : chargement des dashboards < 3 secondes sur connexion standard. |

---

## EPIC-AUTH | AUTHENTIFICATION ET GESTION DES ACCÈS

**Document** : SPC-0003 — Link's Accompagnement — Spécifications Fonctionnelles
**Version** : 1.0 | **Date** : 2026-03-23

---

### Présentation de l'épic

L'épic AUTHENTIFICATION ET GESTION DES ACCÈS couvre l'ensemble des mécanismes permettant aux utilisateurs de la plateforme Link's Accompagnement de prouver leur identité, d'accéder aux fonctionnalités correspondant à leur rôle et de sécuriser leurs sessions. Elle constitue le prérequis bloquant de toutes les autres épics.

**Trois rôles sont concernés :**
- **Bénéficiaire** — personne en bilan de compétences (25 à 50 par an). Accès limité à ses propres données.
- **Consultant** — accompagnateur certifié (3 à 5). Accès à l'ensemble des bénéficiaires de son portefeuille.
- **Super Admin** — administrateur technique (1). Accès complet à la plateforme.

**Périmètre fonctionnel de l'épic :**

| Feature | Titre | User Stories |
|---|---|---|
| FEAT-AUTH-01 | Connexion à la plateforme | US-AUTH-01 |
| FEAT-AUTH-02 | Réinitialisation du mot de passe | US-AUTH-02, US-AUTH-03 |
| FEAT-AUTH-03 | Gestion des sessions | US-AUTH-04 |

**Contraintes techniques transverses :**
- Authentification gérée par Supabase Auth
- Mots de passe hachés avec bcrypt, facteur de coût ≥ 12
- Tokens JWT : access token 1 heure, refresh token 7 jours
- HTTPS obligatoire sur tous les environnements (Vercel + Let's Encrypt)
- Middleware Next.js sur toutes les routes protégées
- Emails transactionnels via le package `@unanima/email` (Resend)
- RBAC appliqué via `@unanima/auth` (middleware + hooks)

---

### Règles métier transverses de l'épic

| ID | Règle |
|---|---|
| RG-AUTH-00 | Aucun mot de passe ne doit jamais être stocké en clair dans la base de données ni dans les journaux applicatifs. |
| RG-AUTH-01 | Tous les mots de passe sont hachés avec bcrypt, facteur de coût ≥ 12, délégué à Supabase Auth. |
| RG-AUTH-02 | Les access tokens JWT ont une durée de vie de 1 heure. Les refresh tokens ont une durée de vie de 7 jours. |
| RG-AUTH-03 | Toutes les communications entre le navigateur et le serveur se font exclusivement en HTTPS. |
| RG-AUTH-04 | Le middleware Next.js protège toutes les routes sous `/dashboard`, `/beneficiaires`, `/admin`. Un utilisateur non authentifié est redirigé vers `/login`. |
| RG-AUTH-05 | RBAC strict : un bénéficiaire ne peut jamais accéder aux routes `/beneficiaires` ou `/admin`. Toute tentative retourne 403. |
| RG-AUTH-06 | Après 3 tentatives de connexion échouées consécutives, le compte est verrouillé pendant 15 minutes. |
| RG-AUTH-07 | La durée maximale d'une session active est de 8 heures. |
| RG-AUTH-08 | Les tokens de réinitialisation de mot de passe sont à usage unique et expirent après 1 heure. |
| RG-AUTH-09 | La page de demande de réinitialisation ne révèle jamais si une adresse email existe dans le système (protection anti-énumération). |
| RG-AUTH-10 | Toute action d'authentification significative est journalisée dans `audit_logs`. |

---

### FEAT-AUTH-01 | Connexion à la plateforme

```
US-AUTH-01 | CONNEXION EMAIL / MOT DE PASSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant qu'utilisateur de la plateforme (bénéficiaire, consultant ou super admin),
Je veux me connecter avec mon adresse email et mon mot de passe,
Afin d'accéder aux fonctionnalités correspondant à mon rôle de manière sécurisée.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must | Estimation : S | Epic : AUTHENTIFICATION | Couvre : F-BEN-01, F-CON-01
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITÈRES D'ACCEPTATION (BDD/Gherkin)

Scénario 1 : Connexion réussie — bénéficiaire
  ÉTANT DONNÉ qu'un bénéficiaire possède un compte actif
  ET          qu'il se trouve sur la page /login
  QUAND       il saisit son email et son mot de passe corrects, puis clique "Connexion"
  ALORS       il est authentifié via Supabase Auth
  ET          un access token JWT (1h) et un refresh token (7j) sont émis
  ET          il est redirigé vers /dashboard
  ET          un enregistrement est créé dans audit_logs : { action: "LOGIN_SUCCESS" }

Scénario 2 : Connexion réussie — consultant → redirection /beneficiaires
Scénario 3 : Connexion réussie — super admin → redirection /admin

Scénario 4 : Échec — mot de passe incorrect (1re tentative)
  ÉTANT DONNÉ qu'un utilisateur possède un compte actif (compteur tentatives = 0)
  QUAND       il saisit un mot de passe erroné
  ALORS       affichage : "Identifiants incorrects. Il vous reste 2 tentative(s)."
  ET          compteur incrémenté à 1 | audit_logs : { action: "LOGIN_FAILURE" }

Scénario 5 : Verrouillage après 3 tentatives échouées
  ÉTANT DONNÉ que le compteur est à 2
  QUAND       il échoue une 3e fois
  ALORS       compte verrouillé 15 minutes
  ET          affichage : "Compte temporairement verrouillé. Réessayez dans 15 minutes
              ou réinitialisez votre mot de passe."
  ET          audit_logs : { action: "ACCOUNT_LOCKED", details: { duration_minutes: 15 } }

Scénario 6 : Compte désactivé
  QUAND       identifiants saisis pour un compte is_active = false
  ALORS       affichage : "Ce compte a été désactivé. Contactez votre consultant ou l'administrateur."

Scénario 7 : Accès direct à route protégée sans authentification → redirection /login
Scénario 8 : Bénéficiaire tentant d'accéder à /beneficiaires → 403 + redirection /dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES MÉTIER
  - RG-AUTH-06 : 3 échecs → verrouillage 15 min
  - RG-AUTH-11 : Redirection post-login : bénéficiaire→/dashboard, consultant→/beneficiaires, super_admin→/admin
  - RG-AUTH-05 : RBAC strict — accès non autorisé → 403 + redirection
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAS D'ERREUR ET MESSAGES UTILISATEUR
  - Identifiants incorrects (1-2e tentative) → "Identifiants incorrects. Il vous reste {N} tentative(s)."
  - 3e tentative / verrouillage → "Compte temporairement verrouillé. Réessayez dans 15 minutes."
  - Compte verrouillé (pendant période) → "Compte temporairement verrouillé. Réessayez dans {N} minute(s)."
  - Compte désactivé → "Ce compte a été désactivé. Contactez votre consultant ou l'administrateur."
  - Email vide/invalide → "Veuillez saisir une adresse email valide."
  - Erreur réseau → "Une erreur est survenue. Veuillez réessayer dans quelques instants."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉPENDANCES
  - Dépend de : —  |  Bloque : Toutes les autres US
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEFINITION OF DONE
  □ LoginForm dans @unanima/auth/components
  □ Middleware Next.js configuré sur toutes routes protégées
  □ Table de redirection par rôle implémentée et testée
  □ Verrouillage 3 tentatives implémenté
  □ Journalisation audit_logs tous scénarios
  □ Tests unitaires + Tests E2E Playwright (scénarios 1, 4, 5, 6, 7, 8)
  □ Validé par le PO/client
```

---

### FEAT-AUTH-02 | Réinitialisation du mot de passe

```
US-AUTH-02 | DEMANDE DE RÉINITIALISATION DU MOT DE PASSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant qu'utilisateur ayant oublié mon mot de passe,
Je veux pouvoir demander un lien de réinitialisation depuis la page de connexion,
Afin de retrouver l'accès à mon compte sans solliciter un administrateur.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must | Estimation : S | Epic : AUTHENTIFICATION | Couvre : F-BEN-02
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITÈRES D'ACCEPTATION (BDD/Gherkin)

Scénario 1 : Demande réussie pour un email existant
  ÉTANT DONNÉ qu'un utilisateur est sur la page /login
  QUAND       il clique "Mot de passe oublié ?" et saisit son email
  ALORS       un token unique (1h, usage unique) est généré
  ET          un email est envoyé via Resend avec lien de réinitialisation
  ET          affichage : "Si cette adresse est associée à un compte, vous recevrez
              un lien de réinitialisation dans quelques minutes. Pensez à vérifier vos spams."
  ET          audit_logs : { action: "PASSWORD_RESET_REQUESTED" }

Scénario 2 : Email inexistant — même message (protection anti-énumération)
  QUAND       email inexistant saisi
  ALORS       affichage du MÊME message générique qu'au scénario 1
  ET          temps de réponse homogénéisé artificiellement (200-500ms)

Scénario 3 : Compte désactivé → même message générique
Scénario 4 : Format email invalide → blocage côté client
Scénario 5 : Champ vide → "L'adresse email est obligatoire."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES MÉTIER
  - RG-AUTH-08 : Token usage unique, expiration 1h
  - RG-AUTH-09 : Réponse unifiée email existant/inexistant (anti-énumération)
  - RG-AUTH-14 : Temps de réponse homogénéisé (délai artificiel si nécessaire)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉPENDANCES
  - Dépend de : US-AUTH-01  |  Bloque : US-AUTH-03
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEFINITION OF DONE
  □ ResetPasswordForm dans @unanima/auth/components
  □ Template reset-password.tsx dans @unanima/email/templates
  □ Homogénéisation temps réponse implémentée
  □ Token généré, stocké, invalidé après usage/expiration
  □ Tests unitaires + E2E Playwright (scénarios 1, 2, 3, 4)
```

```
US-AUTH-03 | CHANGEMENT DU MOT DE PASSE VIA LE LIEN DE RÉINITIALISATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant qu'utilisateur ayant reçu un lien de réinitialisation,
Je veux pouvoir définir un nouveau mot de passe sécurisé,
Afin de retrouver l'accès à mon compte immédiatement après la réinitialisation.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must | Estimation : S | Epic : AUTHENTIFICATION | Couvre : F-BEN-02
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITÈRES D'ACCEPTATION (BDD/Gherkin)

Scénario 1 : Changement réussi avec token valide
  ÉTANT DONNÉ token valide (< 1h, non utilisé)
  QUAND       nouveau MDP "Soleil99!" saisi + confirmation identique
  ALORS       MDP mis à jour (bcrypt, facteur ≥ 12) | token invalidé
  ET          toutes les sessions actives révoquées
  ET          redirection /login avec message "Votre mot de passe a été modifié avec succès."

Scénario 2 : Token expiré → "Ce lien a expiré. Faites une nouvelle demande."
Scénario 3 : Token déjà utilisé → "Ce lien a déjà été utilisé."
Scénario 4 : Token absent/malformé → "Lien invalide. Faites une nouvelle demande."
Scénario 5 : MDP non identiques → "Les mots de passe ne correspondent pas."
Scénario 6 : Critères non respectés → indicateur visuel par critère
Scénario 7 : Indicateur temps réel de force du MDP (rouge/orange/vert)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES MÉTIER
  - RG-AUTH-15 : Complexité MDP : min 8 caractères, 1 majuscule, 1 chiffre
  - RG-AUTH-16 : Révocation de toutes les sessions après réinitialisation
  - RG-AUTH-17 : Historique 3 derniers MDP (non-réutilisation)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉPENDANCES
  - Dépend de : US-AUTH-02  |  Bloque : —
```

---

### FEAT-AUTH-03 | Gestion des sessions

```
US-AUTH-04 | DÉCONNEXION SÉCURISÉE ET EXPIRATION DE SESSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant qu'utilisateur authentifié,
Je veux pouvoir me déconnecter explicitement ou être déconnecté automatiquement,
Afin de protéger mon compte en cas d'absence ou de partage de poste.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must | Estimation : S | Epic : AUTHENTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITÈRES D'ACCEPTATION (BDD/Gherkin)

Scénario 1 : Déconnexion manuelle
  QUAND       clic sur "Se déconnecter" dans le header
  ALORS       refresh token invalidé côté serveur | cookies supprimés
  ET          redirection /login | audit_logs : { action: "LOGOUT" }

Scénario 2 : Expiration automatique après 8h
  ALORS       refresh token révoqué | redirection /login
  ET          message : "Votre session a expiré. Reconnectez-vous pour continuer."

Scénario 3 : Renouvellement transparent de l'access token (< 5 min avant expiration)
Scénario 4 : Token révoqué présenté à une route protégée → 401 + redirection /login
Scénario 5 : Compte désactivé en cours de session → révocation immédiate + message

Scénario 6 : Navigation vers /login avec session active
  ALORS       redirection vers la page d'accueil selon le rôle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES MÉTIER
  - RG-AUTH-18 : Cookies httpOnly, Secure, SameSite=Strict (jamais localStorage)
  - RG-AUTH-19 : Invalidation serveur du refresh token à la déconnexion
  - RG-AUTH-20 : Middleware vérifie is_active à chaque requête
  - RG-AUTH-21 : Pas de mécanisme "Se souvenir de moi"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉPENDANCES
  - Dépend de : US-AUTH-01  |  Bloque : —
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEFINITION OF DONE
  □ Cookies httpOnly/Secure/SameSite=Strict configurés
  □ Limite 8h non contournable par renouvellement
  □ Vérification is_active à chaque requête (middleware)
  □ Tests unitaires + E2E Playwright (scénarios 1, 2, 4, 5, 6)
```

---

## EPIC-BEN | ESPACE BÉNÉFICIAIRE

**Description** : Interface personnelle du bénéficiaire pour suivre sa progression, saisir ses réponses, valider ses phases et accéder aux documents.

**Périmètre** : 25 à 50 bénéficiaires/an. Accès libre à toutes les phases dès création du compte.

| Feature | User Stories |
|---|---|
| FEAT-BEN-01 — Tableau de bord | US-BEN-01, US-BEN-02 |
| FEAT-BEN-02 — Saisie et gestion des réponses | US-BEN-03 à US-BEN-06 |
| FEAT-BEN-03 — Documents disponibles | US-BEN-07 |

---

### FEAT-BEN-01 | Tableau de bord bénéficiaire

```
US-BEN-01 | VISUALISATION DE LA PROGRESSION SUR LES 6 PHASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que bénéficiaire authentifié,
Je veux voir en un coup d'œil l'état d'avancement de mon bilan sur les 6 phases,
Afin de savoir où j'en suis et quelle phase aborder ensuite.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must | Estimation : M | Epic : ESPACE BÉNÉFICIAIRE | Couvre : F-BEN-03, F-BEN-09, F-BEN-10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FLUX PRINCIPAL (Happy Path)
  1. Connexion → redirection /dashboard
  2. Message de bienvenue : "Bonjour [Prénom], bienvenue dans votre espace bilan."
  3. Barre de progression globale : "X / 6 phases validées — Y %"
  4. 6 cartes de phase avec statuts : Non commencée (gris #A0AAB9) | En cours (bleu #1E6FC0) | Validée (vert #28A745)
  5. Toutes les cartes sont cliquables (accès libre)
  6. Bouton CTA "Continuer le bilan" → phase en cours (ou phase 1 si aucune)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITÈRES D'ACCEPTATION (BDD/Gherkin)

Scénario 1 : Bilan en cours (phase 1 validée, phase 2 en cours, 3-6 non commencées)
  ALORS barre = "1 / 6 — 17 %" | badge vert phase 1 | badge bleu phase 2 | gris phases 3-6
  ET CTA redirige vers phase 2

Scénario 2 : Mise à jour après validation d'une phase → barre incrémentée
Scénario 3 : Toutes phases validées → barre 100 % | CTA redirige vers phase 1
Scénario 4 : Premier accès → toutes cartes grises | barre 0 % | CTA → phase 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES MÉTIER
  - RG-BEN-01 : Accès libre à toutes les phases dès création du compte — pas de verrouillage séquentiel
  - RG-BEN-07 : Phase → "En cours" dès la 1ère saisie enregistrée
  - RG-BEN-08 : Progression = nb phases validées / 6, arrondi entier
  - RG-BEN-09 : Prénom = premier mot du champ full_name
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉPENDANCES
  - Dépend de : US-BEN-03, US-BEN-05  |  Bloque : US-BEN-02
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEFINITION OF DONE
  □ Tests unitaires (calcul progression, statuts, logique CTA)
  □ Accessibilité : contrastes WCAG AA pour badges de statut
  □ Validé par le PO/client
```

```
US-BEN-02 | VISUALISATION DU PLANNING DES SÉANCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que bénéficiaire authentifié,
Je veux consulter le planning de mes 6 séances avec ma consultante,
Afin de connaître les dates et accéder au lien de visioconférence.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must | Estimation : S | Epic : ESPACE BÉNÉFICIAIRE | Couvre : F-BEN-09, F-BEN-10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FLUX PRINCIPAL (Happy Path)
  1. Panneau "Mes rendez-vous" sur /dashboard
  2. 6 séances numérotées avec statuts : Réalisée (gris, date passée) | À venir (bleu #1E6FC0) | À planifier
  3. Bouton "Rejoindre la visio" sur la prochaine séance à venir (si lien renseigné)
  4. Si aucune date planifiée : "Votre consultante planifiera vos rendez-vous prochainement."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITÈRES D'ACCEPTATION (BDD/Gherkin)

Scénario 1 : Planning avec dates + lien visio → séances colorées + bouton "Rejoindre la visio"
Scénario 2 : Aucune date planifiée → message informatif
Scénario 3 : 6 séances toutes réalisées → pas de bouton visio
Scénario 4 : Dates partielles, pas de lien visio → séances planifiées visibles, pas de bouton visio
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES MÉTIER
  - RG-BEN-10 : Lien visio unique et global — pas un lien par séance
  - RG-BEN-11 : Prochaine séance = date planifiée la plus proche dans le futur
  - RG-BEN-12 : Statut "Réalisée" calculé automatiquement (date < now())
  - RG-BEN-13 : Dates de séances modifiables uniquement par la consultante (lecture seule bénéficiaire)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉPENDANCES
  - Dépend de : US-BEN-01, US-CON-04, US-CON-05  |  Bloque : —
```

---

### FEAT-BEN-02 | Saisie et gestion des réponses

```
US-BEN-03 | SAISIE DES RÉPONSES AUX QUESTIONS D'UNE PHASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que bénéficiaire authentifié,
Je veux répondre aux questions de chaque phase dans une interface claire,
Afin de documenter ma réflexion et avancer dans mon parcours.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must | Estimation : M | Epic : ESPACE BÉNÉFICIAIRE | Couvre : F-BEN-04a
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FLUX PRINCIPAL (Happy Path)
  1. Navigation vers /dashboard/phase/[N]
  2. Breadcrumb : "Mon bilan > Phase [N] > [Titre]"
  3. En-tête bleu #1E6FC0 : titre + compteur "Question X / N"
  4. Questions numérotées avec textarea (min 120px, redimensionnable, compteur caractères)
  5. Réponses existantes pré-remplies
  6. Bouton "Enregistrer" (secondaire) + Bouton "Valider la phase" (vert)
  7. Section documents en bas de page (cf. US-BEN-07)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITÈRES D'ACCEPTATION (BDD/Gherkin)

Scénario 1 : Phase non commencée → champs vides, compteur "Question 1 / N"
Scénario 2 : Phase "En cours" → réponses existantes pré-remplies
Scénario 3 : Enregistrement manuel → réponse sauvegardée + toast "Réponses enregistrées"
Scénario 4 : Accès sans authentification → redirection /login
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES MÉTIER
  - RG-BEN-02 : Accès aux pages de phase réservé aux sessions authentifiées actives
  - RG-BEN-15 : Textarea : redimensionnable verticalement, hauteur min 120px, pas de limite de caractères
  - RG-BEN-16 : Compteur "Question X / N" purement indicatif — toutes questions sur une seule page
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉPENDANCES
  - Dépend de : US-BEN-01  |  Bloque : US-BEN-04, US-BEN-05, US-BEN-06, US-BEN-07
```

```
US-BEN-04 | SAUVEGARDE AUTOMATIQUE DES RÉPONSES (AUTOSAVE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que bénéficiaire en cours de saisie,
Je veux que mes réponses soient sauvegardées automatiquement,
Afin de ne jamais perdre mon travail.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must | Estimation : M | Epic : ESPACE BÉNÉFICIAIRE | Couvre : F-BEN-08
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FLUX PRINCIPAL (Happy Path)
  Déclencheurs : (a) Blur — quitter un champ → sauvegarde immédiate
                 (b) Timer — toutes les 30 secondes si modification détectée
  Indicateurs : "Sauvegarde en cours..." → "Sauvegardé à [HH:MM]" (3s)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITÈRES D'ACCEPTATION (BDD/Gherkin)

Scénario 1 : Timer 30s → sauvegarde déclenchée + indicateur
Scénario 2 : Blur → sauvegarde immédiate
Scénario 3 : Aucune modification → pas de requête envoyée
Scénario 4 : Échec réseau → "Sauvegarde impossible — vérifiez votre connexion"
Scénario 5 : Données conservées après fermeture et réouverture
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES MÉTIER
  - RG-BEN-03 : Autosave ≠ validation de phase
  - RG-BEN-17 : Déclenchement uniquement si dirty state détecté
  - RG-BEN-18 : Échec → 2 retry automatiques (délai 5s), puis message persistant
  - RG-BEN-19 : Indicateur discret (#A0AAB9 succès, #FF6B35 erreur)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉPENDANCES
  - Dépend de : US-BEN-03  |  Bloque : US-BEN-05
```

```
US-BEN-05 | VALIDATION D'UNE PHASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que bénéficiaire,
Je veux valider une phase lorsque mes réponses sont satisfaisantes,
Afin de signaler ma progression à ma consultante.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must | Estimation : S | Epic : ESPACE BÉNÉFICIAIRE | Couvre : F-BEN-07
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FLUX PRINCIPAL (Happy Path)
  1. Clic "Valider la phase" (vert #28A745)
  2. Modal de confirmation : "Êtes-vous sûr ? Vous pourrez toujours modifier vos réponses."
  3. Confirmation → sauvegarde forcée → statut "Validée" → toast "Phase [N] validée !" → /dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITÈRES D'ACCEPTATION (BDD/Gherkin)

Scénario 1 : Validation nominale → badge vert sur dashboard, progression incrémentée
Scénario 2 : Validation phase sans réponse → possible sans erreur (RG-BEN-04)
Scénario 3 : Annulation depuis modal → statut inchangé
Scénario 4 : Validation → retour sur phase → statut "Validée" maintenu + bouton "Dé-valider"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES MÉTIER
  - RG-BEN-04 : Validation possible même sans réponse saisie
  - RG-BEN-05 : Modification possible après validation (confirmé Link's)
  - RG-BEN-06 : Validation d'une phase n'affecte pas les autres phases
  - RG-BEN-20 : Ordre strict : sauvegarde forcée → changement statut → toast
  - RG-BEN-21 : Échec sauvegarde lors validation → validation annulée
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉPENDANCES
  - Dépend de : US-BEN-03, US-BEN-04  |  Bloque : US-BEN-06, US-BEN-01
```

```
US-BEN-06 | MODIFICATION DES RÉPONSES APRÈS VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que bénéficiaire dont une phase est validée,
Je veux pouvoir revenir sur mes réponses et les modifier,
Afin d'affiner ma réflexion sans être bloqué par une validation passée.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must | Estimation : S | Epic : ESPACE BÉNÉFICIAIRE | Couvre : F-BEN-06
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITÈRES D'ACCEPTATION (BDD/Gherkin)

Scénario 1 : Modification après validation → réponse sauvegardée, statut "Validée" maintenu
Scénario 2 : Statut "Validée" maintenu après modification et navigation retour dashboard
Scénario 3 : Dé-validation explicite → modal confirmation → statut repasse à "En cours"
Scénario 4 : Annulation dé-validation → statut "Validée" maintenu
Scénario 5 : Navigation libre entre phases validées et non validées
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES MÉTIER
  - RG-BEN-22 : Modification ≠ dé-validation automatique
  - RG-BEN-23 : Bouton "Dé-valider" visible uniquement sur les phases validées
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉPENDANCES
  - Dépend de : US-BEN-05  |  Bloque : —
```

---

### FEAT-BEN-03 | Documents disponibles par phase

```
US-BEN-07 | TÉLÉCHARGEMENT DES DOCUMENTS D'UNE PHASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que bénéficiaire sur la page d'une phase,
Je veux accéder aux documents mis à ma disposition pour cette phase,
Afin de disposer des supports nécessaires pour compléter mes réponses.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must | Estimation : S | Epic : ESPACE BÉNÉFICIAIRE | Couvre : F-BEN-05
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FLUX PRINCIPAL (Happy Path)
  1. Section "Documents disponibles" en bas de la page de phase (si documents)
  2. Chaque document : nom, icône type (PDF/DOCX), bouton "Télécharger"
  3. Téléchargement via URL signée Supabase Storage (validité 60 min)
  4. Si aucun document → section masquée ou "Aucun document disponible."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITÈRES D'ACCEPTATION (BDD/Gherkin)

Scénario 1 : Téléchargement nominal → fichier téléchargé
Scénario 2 : Phase sans document → section absente
Scénario 3 : Document indisponible (lien expiré) → "Document temporairement indisponible. Contactez votre consultante."
Scénario 4 : Plusieurs documents → liste avec téléchargements indépendants
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES MÉTIER
  - RG-BEN-24 : Upload documents réservé à la consultante — bénéficiaire lecture seule
  - RG-BEN-25 : URLs signées Supabase Storage, validité 60 min, générées côté serveur
  - RG-BEN-26 : Types acceptés : .pdf et .docx uniquement
  - RG-BEN-27 : Section masquée si aucun document disponible
  - RG-BEN-28 : Maximum 3 documents par phase (limite contrôlée à l'upload admin)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉPENDANCES
  - Dépend de : US-BEN-03, US-ADM-06  |  Bloque : —
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEFINITION OF DONE
  □ URLs signées générées côté serveur (Route Handler Next.js)
  □ Types .pdf/.docx vérifiés avant affichage
  □ Tests unitaires (génération URL signée, phase sans document, erreur stockage)
  □ Validé par le PO/client
```

---


---

## EPIC-CON — ESPACE CONSULTANT

```
EPIC-CON | ESPACE CONSULTANT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Description : Fonctionnalités réservées aux consultantes pour le suivi, la
              planification et la documentation du bilan de compétences.
Valeur métier : Centraliser le pilotage du bilan en un seul outil, réduire
                les tâches administratives, améliorer la qualité du suivi.
Indicateur de succès : Consultante gère l'intégralité du bilan sans sortir
                       de la plateforme.
User Stories : US-CON-01 à US-CON-08
Lot / Release : MVP (V1)
```

### Règles métier transverses EPIC-CON

- **RG-CON-01** : La consultante ne voit que les bénéficiaires qui lui sont attribués (RLS : `consultant_id = auth.uid()`)
- **RG-CON-02** : En lecture seule sur les réponses bénéficiaire — aucune modification possible
- **RG-CON-03** : Les comptes-rendus de séances sont strictement confidentiels — invisibles au bénéficiaire
- **RG-CON-04** : Une séance = une fiche compte-rendu ; 6 séances = 6 fiches maximum
- **RG-CON-05** : Le lien visioconférence est visible uniquement dans l'interface bénéficiaire si renseigné
- **RG-CON-06** : Notification email planification — hypothèse H1 (automatique via Resend) ou H2 (copier-coller) à valider avec le client (⚠️ DÉCISION EN ATTENTE)
- **RG-CON-07** : Toute action (création CR, planification, upload) génère une entrée `audit_logs`
- **RG-CON-08** : Le statut de phase est calculé depuis les réponses du bénéficiaire, non modifiable par la consultante
- **RG-CON-09** : Export PDF généré côté serveur (Route Handler) — jamais côté client
- **RG-CON-10** : Format dates : JJ/MM/AAAA HH:MM (fuseau Europe/Paris)
- **RG-CON-11** : Accès révoqué immédiatement si `is_active = false` sur le profil

---

### US-CON-01 — Vue d'ensemble portefeuille bénéficiaires

```
US-CON-01 | VUE D'ENSEMBLE PORTEFEUILLE BÉNÉFICIAIRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que CONSULTANTE,
Je veux voir la liste de mes bénéficiaires avec leur avancement global,
Afin de piloter mon portefeuille en un coup d'œil et prioriser mes actions.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must Have
Estimation : M (3-5 j)
Epic : EPIC-CON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Description fonctionnelle**

Le dashboard consultante est la page d'accueil après connexion. Elle présente
sous forme de tableau la liste des bénéficiaires assignés avec, pour chacun :
nom complet, progression globale (N/6 phases validées), indicateurs visuels
par phase (pastilles colorées), date de la prochaine séance et lien rapide
vers le dossier.

**Flux principal**

1. Consultante se connecte → redirection `/consultant/dashboard`
2. Chargement de la liste des bénéficiaires assignés (RLS filtre)
3. Pour chaque bénéficiaire : calcul progression depuis table `phase_responses`
4. Affichage tableau trié par date prochaine séance (ASC)
5. Clic sur une ligne → navigation vers dossier bénéficiaire

**Flux alternatif — portefeuille vide**

- Si aucun bénéficiaire assigné → affichage message "Aucun bénéficiaire assigné.
  Contactez votre administrateur." + illustration vide état

**Règles métier**

- RG-CON-01 : isolation RLS par `consultant_id`
- Les pastilles de phase suivent le code couleur : libre (gris #A0AAB9), en
  cours (orange #FF6B35), validé (vert #28A745)
- Tri par défaut : prochaine séance ASC (les plus urgents en premier)
- Badge rouge si bénéficiaire inactif depuis > 7 jours

**Critères d'acceptation**

```gherkin
Scénario 1 : Affichage du portefeuille avec bénéficiaires actifs
  ÉTANT DONNÉ une consultante connectée avec 3 bénéficiaires assignés
  QUAND elle accède à /consultant/dashboard
  ALORS elle voit une liste de 3 bénéficiaires
  ET chaque ligne affiche : nom, progression (ex. "3/6"), 6 pastilles colorées,
     date prochaine séance

Scénario 2 : Portefeuille vide
  ÉTANT DONNÉ une consultante sans bénéficiaire assigné
  QUAND elle accède à /consultant/dashboard
  ALORS elle voit le message "Aucun bénéficiaire assigné"
  ET aucune ligne dans le tableau

Scénario 3 : Pastilles de statut correctes
  ÉTANT DONNÉ un bénéficiaire avec phases 1 et 2 validées, phase 3 en cours
  QUAND la consultante voit sa ligne dans le tableau
  ALORS phases 1 et 2 sont en vert, phase 3 en orange, phases 4-6 en gris
```

**Dépendances**

- Dépend de : US-AUTH-01, US-ADM-05  |  Bloque : US-CON-02

**Definition of Done**

  □ RLS validée (consultante A ne voit pas bénéficiaires de consultante B)
  □ Calcul progression correct (test avec phases partiellement validées)
  □ Tests unitaires (calcul statut phases, tri)
  □ Validé par le PO/client

---

### US-CON-02 — Accès dossier bénéficiaire

```
US-CON-02 | ACCÈS DOSSIER BÉNÉFICIAIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que CONSULTANTE,
Je veux accéder au dossier complet d'un bénéficiaire,
Afin de visualiser ses informations et son avancement phase par phase.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must Have
Estimation : S (2-3 j)
Epic : EPIC-CON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Description fonctionnelle**

Le dossier bénéficiaire vue consultante affiche : en-tête avec informations
du bénéficiaire (nom, email, date début), barre de progression globale, et
navigation par onglets sur les 6 phases. Chaque onglet de phase affiche le
statut de la phase et permet d'accéder aux réponses (US-CON-03).

**Flux principal**

1. Consultante clique sur un bénéficiaire dans le tableau
2. Navigation vers `/consultant/beneficiaires/[id]`
3. Chargement profil + statuts phases
4. Affichage onglets 6 phases
5. Clic onglet phase → affichage réponses (US-CON-03)

**Règles métier**

- RG-CON-01 : accès refusé si bénéficiaire non assigné à cette consultante (erreur 403)
- RG-CON-02 : lecture seule, pas de bouton d'édition
- Route protégée par middleware RBAC (rôle `consultant`)

**Critères d'acceptation**

```gherkin
Scénario 1 : Accès dossier bénéficiaire autorisé
  ÉTANT DONNÉ une consultante connectée
  ET un bénéficiaire qui lui est assigné
  QUAND elle navigue vers /consultant/beneficiaires/[id]
  ALORS elle voit le profil du bénéficiaire
  ET la barre de progression globale
  ET les onglets des 6 phases

Scénario 2 : Accès refusé — bénéficiaire non assigné
  ÉTANT DONNÉ une consultante connectée
  ET un bénéficiaire assigné à une autre consultante
  QUAND elle tente d'accéder à /consultant/beneficiaires/[id_autre]
  ALORS elle reçoit une erreur 403
  ET est redirigée vers son dashboard avec message "Accès non autorisé"
```

**Dépendances**

- Dépend de : US-CON-01  |  Bloque : US-CON-03

---

### US-CON-03 — Consultation des réponses par phase

```
US-CON-03 | CONSULTATION DES RÉPONSES PAR PHASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que CONSULTANTE,
Je veux lire les réponses du bénéficiaire pour chaque phase,
Afin de préparer les séances et suivre sa progression.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Should Have
Estimation : S (2 j)
Epic : EPIC-CON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Description fonctionnelle**

Dans l'onglet d'une phase du dossier bénéficiaire, la consultante voit la
liste des questions avec les réponses texte saisies par le bénéficiaire.
Les réponses sont affichées en lecture seule dans des blocs distincts par
question. Le statut de la phase (libre/en cours/validé) est affiché en haut.

**Règles métier**

- RG-CON-02 : lecture seule absolue
- Si aucune réponse saisie pour une question → afficher "Pas encore de réponse"
- Si phase non démarrée → afficher message "Le bénéficiaire n'a pas encore
  commencé cette phase"

**Critères d'acceptation**

```gherkin
Scénario 1 : Affichage des réponses d'une phase complétée
  ÉTANT DONNÉ une consultante sur le dossier d'un bénéficiaire
  ET la phase 2 contient des réponses saisies
  QUAND elle clique sur l'onglet "Phase 2"
  ALORS elle voit chaque question avec sa réponse correspondante
  ET le statut de la phase affiché

Scénario 2 : Phase non démarrée
  ÉTANT DONNÉ un bénéficiaire n'ayant pas commencé la phase 4
  QUAND la consultante clique sur l'onglet "Phase 4"
  ALORS elle voit "Le bénéficiaire n'a pas encore commencé cette phase"

Scénario 3 : Tentative de modification bloquée
  ÉTANT DONNÉ une consultante sur la vue des réponses
  QUAND elle essaie de cliquer sur un champ de réponse
  ALORS le champ est en lecture seule, aucune modification possible
```

**Dépendances**

- Dépend de : US-CON-02  |  Bloque : —

---

### US-CON-04 — Planification des 6 rendez-vous

```
US-CON-04 | PLANIFICATION DES 6 RENDEZ-VOUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que CONSULTANTE,
Je veux saisir les dates et créneaux des 6 séances pour un bénéficiaire,
Afin que le bénéficiaire puisse les visualiser dans son espace.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must Have
Estimation : M (3 j)
Epic : EPIC-CON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Description fonctionnelle**

Dans le dossier bénéficiaire, un onglet "Planification" permet à la
consultante de saisir ou modifier la date et l'heure de chacune des 6 séances.
Un champ date/heure par séance (1 à 6). Les dates saisies deviennent visibles
immédiatement dans le dashboard bénéficiaire (F-BEN-09).

**Flux principal**

1. Consultante navigue vers onglet "Planification" du dossier
2. Formulaire avec 6 champs datetime (séance 1 à 6)
3. Saisie d'une ou plusieurs dates
4. Clic "Enregistrer les dates"
5. Enregistrement en BDD table `sessions`
6. Confirmation "Dates enregistrées avec succès"
7. Bénéficiaire voit les dates dans son dashboard

**Règles métier**

- Chaque date doit être dans le futur (validation serveur)
- Les dates ne sont pas obligatoirement séquentielles
- Modification possible à tout moment
- Si hypothèse H1 (email auto) : déclenchement email Resend à la sauvegarde

**Critères d'acceptation**

```gherkin
Scénario 1 : Saisie d'une date de séance
  ÉTANT DONNÉ une consultante sur l'onglet Planification
  QUAND elle saisit une date/heure pour la séance 3 et clique "Enregistrer"
  ALORS la date est sauvegardée en BDD
  ET le bénéficiaire voit la date dans son dashboard

Scénario 2 : Date dans le passé refusée
  ÉTANT DONNÉ une consultante sur le formulaire de planification
  QUAND elle saisit une date antérieure à aujourd'hui
  ALORS un message d'erreur "La date doit être dans le futur" s'affiche
  ET la date n'est pas enregistrée

Scénario 3 : Modification d'une date existante
  ÉTANT DONNÉ une séance 1 planifiée au 15/04/2026
  QUAND la consultante modifie la date au 20/04/2026 et enregistre
  ALORS la nouvelle date remplace l'ancienne
  ET le bénéficiaire voit la nouvelle date dans son dashboard
```

**Dépendances**

- Dépend de : US-CON-02  |  Bloque : US-BEN-06 (F-BEN-09), US-CON-08

---

### US-CON-05 — Saisie lien visioconférence

```
US-CON-05 | SAISIE LIEN VISIOCONFÉRENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que CONSULTANTE,
Je veux renseigner un lien visioconférence pour chaque bénéficiaire,
Afin que le bénéficiaire puisse accéder à la séance en un clic.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Should Have
Estimation : S (1-2 j)
Epic : EPIC-CON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Description fonctionnelle**

Dans l'onglet Planification, un champ URL permet à la consultante de saisir
le lien visioconférence (Teams, Zoom, Meet, etc.) associé au bénéficiaire.
Ce lien est stocké au niveau du bénéficiaire (pas par séance) et affiché
dans le dashboard bénéficiaire uniquement si renseigné (F-BEN-10).

**Règles métier**

- Validation format URL (https://)
- Un seul lien par bénéficiaire (lien permanent ou tournant)
- Champ facultatif : si vide, la section n'apparaît pas chez le bénéficiaire
- Modification possible à tout moment

**Critères d'acceptation**

```gherkin
Scénario 1 : Saisie d'un lien valide
  ÉTANT DONNÉ une consultante sur l'onglet Planification
  QUAND elle saisit "https://teams.microsoft.com/l/meetup-join/..." et enregistre
  ALORS le lien est sauvegardé
  ET le bénéficiaire voit le bouton "Rejoindre la visioconférence" dans son dashboard

Scénario 2 : URL invalide refusée
  ÉTANT DONNÉ une consultante saisissant "teams.example" (sans https://)
  QUAND elle soumet le formulaire
  ALORS un message "URL invalide. Format attendu : https://..." s'affiche

Scénario 3 : Suppression du lien
  ÉTANT DONNÉ un lien visio existant
  QUAND la consultante efface le champ et enregistre
  ALORS le lien est supprimé
  ET la section visio disparaît du dashboard bénéficiaire
```

**Dépendances**

- Dépend de : US-CON-04  |  Bloque : US-BEN-07

---

### US-CON-06 — Saisie comptes-rendus de séances

```
US-CON-06 | SAISIE COMPTES-RENDUS DE SÉANCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que CONSULTANTE,
Je veux rédiger un compte-rendu après chaque séance,
Afin de garder une trace structurée et confidentielle du bilan.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must Have
Estimation : M (3 j)
Epic : EPIC-CON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Description fonctionnelle**

Un onglet "Comptes-rendus" dans le dossier bénéficiaire liste les 6 fiches
de séances. Chaque fiche contient : le numéro de séance (1-6), la date de la
séance (pré-remplie si planifiée), et un champ texte libre pour le compte-rendu.
La consultante peut créer, modifier, et enregistrer chaque fiche.
Les comptes-rendus sont strictement confidentiels : invisibles au bénéficiaire.

**Flux principal**

1. Consultante navigue vers onglet "Comptes-rendus"
2. Liste des 6 fiches (vides ou complétées)
3. Clic sur une fiche → formulaire de saisie
4. Saisie/modification du texte libre
5. Clic "Enregistrer" → sauvegarde en BDD table `session_notes`
6. Confirmation "Compte-rendu enregistré"

**Règles métier**

- RG-CON-03 : confidentialité absolue — RLS `consultant_id = auth.uid()` ou `role = 'super_admin'`
- RG-CON-04 : 6 fiches maximum, une par numéro de séance (pas de duplication)
- Le champ texte libre supporte le markdown basique (gras, italique, listes)
- Longueur maximale : 10 000 caractères par fiche
- Modification possible à tout moment après création

**Critères d'acceptation**

```gherkin
Scénario 1 : Création d'un compte-rendu
  ÉTANT DONNÉ une consultante sur l'onglet Comptes-rendus d'un bénéficiaire
  QUAND elle saisit du texte dans la fiche séance 2 et clique "Enregistrer"
  ALORS le compte-rendu est sauvegardé
  ET la fiche affiche "Dernière modification : [date/heure]"

Scénario 2 : Confidentialité — bénéficiaire ne voit pas les CRs
  ÉTANT DONNÉ un compte-rendu créé pour le bénéficiaire X
  QUAND le bénéficiaire X se connecte et navigue dans son espace
  ALORS aucune mention des comptes-rendus n'apparaît dans son interface

Scénario 3 : Super admin peut lire les CRs
  ÉTANT DONNÉ un compte-rendu créé par la consultante
  QUAND un super admin accède au dossier du bénéficiaire
  ALORS il peut voir et lire le compte-rendu
```

**Dépendances**

- Dépend de : US-CON-02  |  Bloque : US-CON-07

---

### US-CON-07 — Export PDF des comptes-rendus

```
US-CON-07 | EXPORT PDF DES COMPTES-RENDUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que CONSULTANTE,
Je veux exporter les comptes-rendus d'un bénéficiaire en PDF,
Afin de produire un document imprimable ou archivable.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must Have
Estimation : M (2-3 j)
Epic : EPIC-CON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Description fonctionnelle**

Depuis l'onglet Comptes-rendus, un bouton "Exporter en PDF" génère un document
PDF compilant les 6 fiches de séances. Le PDF est généré côté serveur (Route
Handler Next.js) et déclenche un téléchargement dans le navigateur.
Le PDF inclut : en-tête avec nom bénéficiaire + consultante + date d'export,
les 6 fiches numérotées, et un pied de page avec mention de confidentialité.

**Flux principal**

1. Consultante clique "Exporter en PDF"
2. Requête POST vers `/api/consultant/session-notes/export`
3. Génération PDF côté serveur (bibliothèque : `@react-pdf/renderer` ou `puppeteer`)
4. Réponse avec header `Content-Disposition: attachment; filename="CR-[nom]-[date].pdf"`
5. Téléchargement automatique dans le navigateur

**Règles métier**

- RG-CON-09 : génération serveur uniquement
- Accès refusé si consultante n'est pas assignée au bénéficiaire (403)
- Fiches vides incluses avec mention "Séance N : compte-rendu non saisi"
- Mention de confidentialité obligatoire en pied de page

**Critères d'acceptation**

```gherkin
Scénario 1 : Export PDF complet
  ÉTANT DONNÉ une consultante avec 4 comptes-rendus saisis sur 6
  QUAND elle clique "Exporter en PDF"
  ALORS un fichier PDF est téléchargé
  ET il contient les 4 fiches rédigées + 2 fiches avec "compte-rendu non saisi"

Scénario 2 : Export avec aucun compte-rendu
  ÉTANT DONNÉ un bénéficiaire sans aucun compte-rendu saisi
  QUAND la consultante exporte en PDF
  ALORS le PDF contient 6 fiches vides avec "compte-rendu non saisi"

Scénario 3 : Accès non autorisé bloqué
  ÉTANT DONNÉ un utilisateur non autorisé
  QUAND il appelle POST /api/consultant/session-notes/export
  ALORS il reçoit une erreur 403
```

**Dépendances**

- Dépend de : US-CON-06  |  Bloque : —

---

### US-CON-08 — Notification email planification initiale

```
US-CON-08 | NOTIFICATION EMAIL PLANIFICATION INITIALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que CONSULTANTE,
Je veux que le bénéficiaire soit notifié par email lors de la planification,
Afin qu'il soit informé des dates de ses séances sans action manuelle de ma part.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must Have
Estimation : S (2 j) — dépend de la décision H1/H2
Epic : EPIC-CON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**⚠️ DÉCISION EN ATTENTE**

Deux hypothèses à trancher avec le client avant implémentation :

| | **H1 — Email automatique** | **H2 — Email manuel** |
|---|---|---|
| **Mécanisme** | Resend déclenché à la sauvegarde des dates | Consultante copie-colle les dates dans son email |
| **Complexité** | Moyenne (template + API Resend) | Nulle (pas de dev) |
| **Expérience** | Fluide, sans friction | Friction manuelle |
| **Recommandé** | ✅ Oui (MVP) | Fallback si budget contraint |

**Si H1 retenu :**

```gherkin
Scénario 1 : Email envoyé à la sauvegarde des dates
  ÉTANT DONNÉ une consultante qui vient de sauvegarder les 6 dates de séances
  QUAND la sauvegarde est confirmée
  ALORS un email récapitulatif est envoyé au bénéficiaire via Resend
  ET l'email contient les 6 dates formatées en JJ/MM/AAAA HH:MM

Scénario 2 : Modification de date — nouvel email
  ÉTANT DONNÉ des dates déjà planifiées
  QUAND la consultante modifie une date et enregistre
  ALORS un email de mise à jour est envoyé au bénéficiaire

Scénario 3 : Échec d'envoi géré gracieusement
  ÉTANT DONNÉ une erreur Resend API
  QUAND la sauvegarde des dates est effectuée
  ALORS les dates sont quand même sauvegardées en BDD
  ET une entrée d'erreur est créée dans audit_logs
  ET aucune erreur bloquante n'est présentée à la consultante
```

**Dépendances**

- Dépend de : US-CON-04  |  Bloque : —


---

## EPIC-ADM — ESPACE SUPER ADMIN

```
EPIC-ADM | ESPACE SUPER ADMIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Description : Fonctionnalités d'administration complète de la plateforme :
              gestion des utilisateurs, attribution, documents et supervision.
Valeur métier : Permettre à l'administrateur de piloter la plateforme sans
                intervention technique, en totale autonomie.
Indicateur de succès : Toutes les opérations CRUD utilisateurs et documents
                       réalisables depuis l'interface admin.
User Stories : US-ADM-01 à US-ADM-06
Lot / Release : MVP (V1)
```

### Règles métier transverses EPIC-ADM

- **RG-ADM-01** : Accès réservé au rôle `super_admin` — toutes routes `/admin/*` protégées
- **RG-ADM-02** : Toute action CRUD génère une entrée `audit_logs` (qui, quoi, quand, IP)
- **RG-ADM-03** : Suppression logique préférée à la suppression physique (`is_active = false`)
- **RG-ADM-04** : Droits à l'effacement RGPD : suppression physique possible avec confirmation
- **RG-ADM-05** : Mot de passe initial fourni par l'admin (copier-coller) — pas d'email automatique dans le MVP
- **RG-ADM-06** : Conservation des données : 3 ans post-clôture bilan, puis suppression automatique programmée
- **RG-ADM-07** : Documents uploadés stockés dans Supabase Storage (bucket `phase-documents`)
- **RG-ADM-08** : Taille maximale document : 10 Mo par fichier
- **RG-ADM-09** : Types autorisés : `.pdf`, `.docx` uniquement
- **RG-ADM-10** : Maximum 3 documents par phase par bénéficiaire
- **RG-ADM-11** : L'admin peut voir tous les comptes-rendus de toutes les consultantes

---

### US-ADM-01 — Dashboard KPIs et supervision globale

```
US-ADM-01 | DASHBOARD KPIS ET SUPERVISION GLOBALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que SUPER ADMIN,
Je veux voir les indicateurs clés de la plateforme et la liste complète
des utilisateurs actifs,
Afin de superviser l'activité globale et détecter les anomalies.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must Have
Estimation : M (3-4 j)
Epic : EPIC-ADM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Description fonctionnelle**

Le dashboard admin est la page d'accueil du super admin. Elle présente :
- **KPIs en cartes** : nombre de bénéficiaires actifs, taux d'avancement moyen
  (phases validées / 6), nombre de bilans terminés (6/6 phases validées),
  nombre de consultantes actives
- **Tableau de supervision** : liste complète des bénéficiaires avec
  progression, consultante assignée, dernière connexion
- **Alertes** : bénéficiaires inactifs depuis > 14 jours (badge rouge)

**Flux principal**

1. Admin connecté → redirection `/admin/dashboard`
2. Chargement agrégats via requête SQL (CTE ou vues matérialisées)
3. Affichage 4 cartes KPI + tableau de bord
4. Clic sur une ligne → accès dossier complet

**Critères d'acceptation**

```gherkin
Scénario 1 : Affichage des KPIs
  ÉTANT DONNÉ un admin connecté avec 10 bénéficiaires actifs
  QUAND il accède à /admin/dashboard
  ALORS il voit 4 cartes KPI avec des valeurs numériques correctes
  ET un tableau listant les 10 bénéficiaires

Scénario 2 : Alerte inactivité
  ÉTANT DONNÉ un bénéficiaire n'ayant pas eu d'activité depuis 15 jours
  QUAND l'admin consulte le tableau
  ALORS la ligne du bénéficiaire affiche un badge rouge "Inactif"

Scénario 3 : Accès refusé à un non-admin
  ÉTANT DONNÉ un utilisateur avec rôle "consultant"
  QUAND il tente d'accéder à /admin/dashboard
  ALORS il est redirigé vers /login avec message "Accès non autorisé"
```

**Dépendances**

- Dépend de : US-AUTH-01, US-ADM-02  |  Bloque : —

---

### US-ADM-02 — Création compte bénéficiaire et consultant

```
US-ADM-02 | CRÉATION COMPTE UTILISATEUR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que SUPER ADMIN,
Je veux créer les comptes des bénéficiaires et consultants,
Afin qu'ils puissent accéder à la plateforme.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must Have
Estimation : M (3-4 j)
Epic : EPIC-ADM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Description fonctionnelle**

L'admin crée les comptes via un formulaire simple. Pour un bénéficiaire :
prénom, nom, email, consultante assignée. Pour une consultante : prénom, nom,
email. Le mot de passe temporaire est généré et affiché une seule fois à
la création (à transmettre manuellement). La création utilise l'API Admin
Supabase (`admin.auth.createUser`) pour ne pas déclencher l'envoi d'email
de confirmation.

**Flux principal**

1. Admin navigue vers `/admin/utilisateurs/nouveau`
2. Sélection du type de compte (bénéficiaire / consultant)
3. Saisie du formulaire
4. Clic "Créer le compte"
5. Appel API Admin Supabase (Service Role Key, côté serveur uniquement)
6. Mot de passe temporaire généré (12 caractères, aléatoire)
7. Affichage modal "Compte créé : email@exemple.fr / Mot de passe temporaire : XXXX"
8. Bouton "Copier les identifiants" → copie presse-papier
9. Entrée dans `audit_logs`

**Règles métier**

- RG-ADM-05 : mot de passe initial = copier-coller manuel, pas d'email auto
- Email doit être unique dans `auth.users`
- Si email déjà utilisé → message "Cette adresse email est déjà utilisée"
- Le mot de passe temporaire n'est jamais stocké en clair (hash bcrypt dans Supabase Auth)
- L'admin ne peut pas créer un autre admin (rôle `super_admin` protégé)

**Critères d'acceptation**

```gherkin
Scénario 1 : Création d'un compte bénéficiaire
  ÉTANT DONNÉ un admin sur le formulaire de création
  QUAND il saisit les informations valides et clique "Créer"
  ALORS le compte est créé dans Supabase Auth
  ET une entrée est créée dans la table profiles avec role="beneficiaire"
  ET un mot de passe temporaire est affiché dans un modal

Scénario 2 : Email déjà utilisé
  ÉTANT DONNÉ un admin créant un compte avec un email existant
  QUAND il soumet le formulaire
  ALORS un message "Cette adresse email est déjà utilisée" s'affiche
  ET aucun compte n'est créé

Scénario 3 : Copie des identifiants
  ÉTANT DONNÉ le modal avec les identifiants générés
  QUAND l'admin clique "Copier les identifiants"
  ALORS les identifiants (email + mot de passe) sont copiés dans le presse-papier
  ET une confirmation visuelle "Copié !" s'affiche 2 secondes
```

**Dépendances**

- Dépend de : US-AUTH-01  |  Bloque : US-ADM-03, US-ADM-04, US-ADM-05

---

### US-ADM-03 — Modification compte utilisateur

```
US-ADM-03 | MODIFICATION COMPTE UTILISATEUR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que SUPER ADMIN,
Je veux modifier les informations d'un compte existant,
Afin de maintenir les données à jour (email, nom, statut actif/inactif).
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must Have
Estimation : S (2 j)
Epic : EPIC-ADM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Description fonctionnelle**

Depuis la liste des utilisateurs, l'admin peut accéder à la fiche d'un
utilisateur et modifier : nom, prénom, email, statut (actif/inactif).
La modification du statut `is_active = false` révoque immédiatement l'accès
(le token JWT suivant est refusé par le middleware).

**Règles métier**

- Modification email : mise à jour dans `auth.users` ET `profiles`
- Désactivation : `is_active = false` dans `profiles` + révocation sessions Supabase
- Réinitialisation mot de passe : génère un nouveau mot de passe temporaire (modal copier-coller)
- RG-ADM-02 : toute modification journalisée dans `audit_logs`

**Critères d'acceptation**

```gherkin
Scénario 1 : Modification du nom
  ÉTANT DONNÉ un admin sur la fiche d'un bénéficiaire
  QUAND il modifie le nom et enregistre
  ALORS le nouveau nom est affiché dans la liste et dans le dossier

Scénario 2 : Désactivation d'un compte
  ÉTANT DONNÉ un bénéficiaire actif
  QUAND l'admin bascule son statut à "Inactif" et confirme
  ALORS le bénéficiaire ne peut plus se connecter
  ET ses sessions existantes sont révoquées
  ET la modification est journalisée dans audit_logs

Scénario 3 : Réinitialisation mot de passe
  ÉTANT DONNÉ un admin sur la fiche d'un utilisateur
  QUAND il clique "Réinitialiser le mot de passe"
  ALORS un nouveau mot de passe temporaire est généré
  ET affiché dans un modal copier-coller
```

**Dépendances**

- Dépend de : US-ADM-02  |  Bloque : —

---

### US-ADM-04 — Suppression compte (droit RGPD à l'effacement)

```
US-ADM-04 | SUPPRESSION COMPTE (DROIT À L'EFFACEMENT RGPD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que SUPER ADMIN,
Je veux supprimer définitivement un compte et ses données personnelles,
Afin de respecter le droit à l'effacement du RGPD sur demande.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Must Have
Estimation : M (3 j)
Epic : EPIC-ADM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Description fonctionnelle**

La suppression définitive d'un compte (droit RGPD à l'effacement) est
accessible depuis la fiche utilisateur. Elle supprime : le profil, toutes les
réponses, les comptes-rendus associés, et le compte `auth.users` Supabase.
Un double mécanisme de confirmation est obligatoire (modal + saisie du nom).

**Flux principal**

1. Admin clique "Supprimer définitivement" sur la fiche
2. Modal de confirmation niveau 1 : "Cette action est irréversible"
3. Saisie du nom complet de l'utilisateur pour confirmation (anti-erreur)
4. Clic "Confirmer la suppression"
5. Appel API Admin Supabase (`admin.auth.deleteUser`)
6. Suppression en cascade (Foreign Key + `ON DELETE CASCADE`)
7. Entrée dans `audit_logs` avec `details: { "reason": "RGPD_effacement" }`
8. Confirmation "Compte supprimé. Cette action est irréversible."

**Règles métier**

- RG-ADM-04 : suppression physique autorisée uniquement pour RGPD
- RG-ADM-06 : conservation normale = 3 ans post-clôture (suppression automatique)
- Double confirmation obligatoire (modal + saisie nom)
- Les entrées `audit_logs` relatives à l'utilisateur sont conservées même après effacement (obligation légale)
- Impossibilité de supprimer le dernier `super_admin`

**Critères d'acceptation**

```gherkin
Scénario 1 : Suppression avec double confirmation réussie
  ÉTANT DONNÉ un admin sur la fiche d'un bénéficiaire
  QUAND il clique "Supprimer", confirme le modal et saisit le nom correct
  ALORS toutes les données du bénéficiaire sont supprimées
  ET une entrée audit_logs est créée avec reason="RGPD_effacement"
  ET l'admin est redirigé vers la liste avec confirmation

Scénario 2 : Nom de confirmation incorrect — suppression bloquée
  ÉTANT DONNÉ le formulaire de confirmation de suppression
  QUAND l'admin saisit un nom différent du nom réel et confirme
  ALORS la suppression est bloquée
  ET un message "Le nom saisi ne correspond pas" s'affiche

Scénario 3 : Suppression du dernier super admin bloquée
  ÉTANT DONNÉ un unique compte super_admin
  QUAND l'admin tente de le supprimer
  ALORS un message "Impossible de supprimer le seul compte administrateur" s'affiche
```

**Dépendances**

- Dépend de : US-ADM-02  |  Bloque : —

---

### US-ADM-05 — Attribution bénéficiaire ↔ consultant

```
US-ADM-05 | ATTRIBUTION BÉNÉFICIAIRE ↔ CONSULTANT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que SUPER ADMIN,
Je veux attribuer ou modifier la consultante suivant un bénéficiaire,
Afin que la consultante puisse accéder au dossier du bénéficiaire.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Should Have
Estimation : S (1-2 j)
Epic : EPIC-ADM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Description fonctionnelle**

Sur la fiche d'un bénéficiaire (ou lors de sa création), l'admin sélectionne
la consultante via un select. Cette attribution met à jour `consultant_id`
dans la table `profiles` (ou `beneficiary_profiles`). L'accès RLS de la
consultante est immédiatement mis à jour.

**Règles métier**

- Un bénéficiaire est assigné à exactement 1 consultante (0..1 → 1)
- Modification d'attribution possible (réassignation)
- Lors de la réassignation, l'ancienne consultante perd l'accès immédiatement
- Seules les consultantes actives (`is_active = true`) apparaissent dans le select

**Critères d'acceptation**

```gherkin
Scénario 1 : Attribution initiale à la création
  ÉTANT DONNÉ un admin créant un nouveau bénéficiaire
  QUAND il sélectionne "Marie Dupont" comme consultante et valide
  ALORS le bénéficiaire est créé avec consultant_id = Marie Dupont.id
  ET Marie Dupont voit le bénéficiaire dans son dashboard

Scénario 2 : Réassignation à une autre consultante
  ÉTANT DONNÉ un bénéficiaire assigné à Consultante A
  QUAND l'admin le réassigne à Consultante B
  ALORS Consultante B voit le bénéficiaire dans son dashboard
  ET Consultante A ne le voit plus

Scénario 3 : Consultante inactive absente du select
  ÉTANT DONNÉ une consultante avec is_active = false
  QUAND l'admin ouvre le select d'attribution
  ALORS cette consultante n'apparaît pas dans la liste
```

**Dépendances**

- Dépend de : US-ADM-02  |  Bloque : US-CON-01, US-CON-02

---

### US-ADM-06 — Gestion documents mis à disposition par phase

```
US-ADM-06 | GESTION DOCUMENTS PAR PHASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que SUPER ADMIN,
Je veux uploader, ordonner et supprimer les documents disponibles pour chaque
phase du bilan,
Afin que les bénéficiaires aient accès aux ressources pédagogiques appropriées.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Priorité : Large (L) (4-5 j)
Estimation : L
Epic : EPIC-ADM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Description fonctionnelle**

Depuis le panneau admin `/admin/documents`, l'admin gère les documents
disponibles pour chaque phase (1 à 6). Pour chaque phase : upload de fichiers
(.pdf, .docx), réordonnancement par drag & drop, suppression. Les documents
sont stockés dans Supabase Storage (bucket `phase-documents`) et référencés
dans la table `phase_documents`. Les bénéficiaires voient ces documents en
lecture seule via des URLs signées (US-BEN-05).

**Schéma BDD**

```sql
CREATE TABLE public.phase_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_number INT NOT NULL CHECK (phase_number BETWEEN 1 AND 6),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,   -- chemin dans le bucket Supabase Storage
  display_name TEXT NOT NULL,   -- nom affiché à l'utilisateur
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx')),
  sort_order INT NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS : lecture par tout utilisateur authentifié
CREATE POLICY "Authenticated users read phase_documents"
  ON public.phase_documents FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS : écriture par super_admin uniquement
CREATE POLICY "Super admin manages phase_documents"
  ON public.phase_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
```

**Flux principal — Upload**

1. Admin navigue vers `/admin/documents`
2. Sélection de la phase (1 à 6) via onglets
3. Clic "Ajouter un document" → sélection fichier local
4. Validation type (.pdf / .docx) et taille (≤ 10 Mo)
5. Upload vers Supabase Storage via Route Handler (Service Role Key)
6. Création entrée dans `phase_documents`
7. Confirmation "Document ajouté"

**Règles métier**

- RG-ADM-07 à RG-ADM-10 : stockage, taille, types, limite 3 docs/phase
- Suppression Storage + BDD (atomique via transaction si possible)
- `sort_order` mis à jour à chaque réordonnancement
- Nom d'affichage modifiable (sans toucher le fichier stocké)

**Critères d'acceptation**

```gherkin
Scénario 1 : Upload d'un document
  ÉTANT DONNÉ un admin sur le panneau documents de la phase 2
  QUAND il uploade un fichier "guide-phase2.pdf" de 2 Mo
  ALORS le fichier est stocké dans Supabase Storage
  ET une entrée est créée dans phase_documents
  ET le bénéficiaire voit le document dans la phase 2

Scénario 2 : Upload refusé — type non autorisé
  ÉTANT DONNÉ un admin tentant d'uploader "fichier.xlsx"
  QUAND il sélectionne le fichier
  ALORS un message "Type de fichier non autorisé. Types acceptés : .pdf, .docx" s'affiche
  ET l'upload ne se déclenche pas

Scénario 3 : Limite de 3 documents atteinte
  ÉTANT DONNÉ une phase qui contient déjà 3 documents
  QUAND l'admin tente d'uploader un 4ème document
  ALORS un message "Limite atteinte : 3 documents maximum par phase" s'affiche

Scénario 4 : Suppression d'un document
  ÉTANT DONNÉ un document existant dans la phase 3
  QUAND l'admin clique "Supprimer" et confirme
  ALORS le fichier est supprimé de Supabase Storage
  ET l'entrée est supprimée de phase_documents
  ET le document n'est plus visible pour les bénéficiaires
```

**Dépendances**

- Dépend de : US-AUTH-01  |  Bloque : US-BEN-05

---

## Annexe — Récapitulatif des messages d'erreur

| Code | Message | Déclencheur |
|------|---------|-------------|
| ERR-AUTH-001 | "Email ou mot de passe incorrect." | Login échoué |
| ERR-AUTH-002 | "Compte verrouillé. Réessayez dans 15 minutes." | 3 tentatives échouées |
| ERR-AUTH-003 | "Votre session a expiré. Veuillez vous reconnecter." | Token JWT expiré |
| ERR-AUTH-004 | "Un email de réinitialisation a été envoyé à [email]." | Reset password demandé |
| ERR-AUTH-005 | "Lien de réinitialisation invalide ou expiré." | Token reset > 1h |
| ERR-BEN-001 | "Votre réponse a été sauvegardée automatiquement." | Autosave |
| ERR-BEN-002 | "Erreur de sauvegarde. Vérifiez votre connexion." | Erreur réseau autosave |
| ERR-BEN-003 | "Cette action validera définitivement la phase. Vous pourrez toujours modifier vos réponses." | Modal validation phase |
| ERR-BEN-004 | "Document indisponible. Contactez votre consultante." | URL signée expirée |
| ERR-CON-001 | "Accès non autorisé." | Accès dossier non assigné |
| ERR-CON-002 | "La date doit être dans le futur." | Date séance dans le passé |
| ERR-CON-003 | "URL invalide. Format attendu : https://..." | Lien visio malformé |
| ERR-ADM-001 | "Cette adresse email est déjà utilisée." | Email dupliqué |
| ERR-ADM-002 | "Type de fichier non autorisé. Types acceptés : .pdf, .docx" | Upload type interdit |
| ERR-ADM-003 | "Limite atteinte : 3 documents maximum par phase." | Dépassement quota |
| ERR-ADM-004 | "Impossible de supprimer le seul compte administrateur." | Suppression dernier admin |
| ERR-ADM-005 | "Le nom saisi ne correspond pas." | Confirmation suppression erronée |

---

## Annexe — Palette couleurs et conventions UI

| Rôle | Valeur HEX | Usage |
|------|-----------|-------|
| Primary | `#1E6FC0` | Boutons principaux, liens, en-têtes |
| Primary Dark | `#0D3B6E` | Hover, textes sur fond clair |
| Success | `#28A745` | Phase validée, confirmations, pastille verte |
| Warning | `#FF6B35` | Phase en cours, alertes, pastille orange |
| Background | `#F5F7FA` | Fond général des pages |
| Text | `#4A4A4A` | Texte courant |
| Border | `#DCE1EB` | Séparateurs, bordures de cartes |
| Inactive | `#A0AAB9` | Phase libre, éléments désactivés, pastille grise |

---

*Document généré le 2026-03-23 — Unanima Platform*
*Confidentiel — Usage interne et client Link's Accompagnement uniquement*
