---
ref: SPC-0002
title: "Proposition commerciale — Plateforme digitale de suivi des bilans de compétences"
type: SPC
scope: links
status: accepted
version: "1.4"
created: 2026-03-01
updated: 2026-03-23
author: David Duquenne — Unanima
related-issues: ["#91"]
supersedes: null
superseded-by: null
---

**PROPOSITION COMMERCIALE**

Plateforme digitale de suivi des bilans de compétences

**Link's Accompagnement**

  -----------------------------------------------------------------------
  **Prestataire**            Unanima --- David Duquenne
  -------------------------- --------------------------------------------
  **Client**                 Link's Accompagnement

  **Référence**              PROP-LINKS-2026-01

  **Date**                   Mars 2026

  **Version**                1.4

  **Validité**               30 jours à compter de la date d'émission
  -----------------------------------------------------------------------

*Document confidentiel --- Propriété Unanima*

# 1. Synthèse de la proposition

  -----------------------------------------------------------------------
  Unanima propose de réaliser la plateforme de suivi des bilans de
  compétences de Link's Accompagnement dans le cadre d'un **forfait
  développement de 3 500 € HT**
  -----------------------------------------------------------------------
  pour la version 1 (PMV). Les abonnements d'infrastructure (Vercel,
  Supabase, Resend) sont souscrits et réglés directement par Link's
  Accompagnement ; ils ne font pas partie du présent forfait.

  **Délai de livraison : 6 semaines --- Acompte 30 % à la signature ---
  Solde 70 % à la recette validée --- Total HT : 3 500 €**
  -----------------------------------------------------------------------

  ------------------------------------------------------------------------
  **Poste**                                **Jours**       **Montant HT**
  ---------------------------------------- --------------- ---------------
  Développement PMV v1 (forfait)           16,5 j          3 500 €

  Infrastructure (Vercel, Supabase,        ---             Réglée
  Resend, domaine OVH)                                     directement par
                                                           Link's

  **TOTAL HT**                             **16,5 j**      **3 500 €**

  TVA 20 %                                                 700 €

  **TOTAL TTC**                                            **4 200 €**
  ------------------------------------------------------------------------

# 2. Détail du chiffrage --- Version 1 (PMV)

Le présent forfait couvre l'intégralité du périmètre défini dans la note
de cadrage v1.15, sans réserve.

  -------------------------------------------------------------------------------
  **Module de développement**              **Jours**   **Sprint**   **Montant
                                                                    HT**
  ---------------------------------------- ----------- ------------ -------------
  Authentification 3 rôles +               1,5         Sprint 1     320 €
  réinitialisation mot de passe par e-mail

  Dashboard bénéficiaire + 6 phases (accès 3,0         Sprint 1     640 €
  libre, sans verrouillage)

  Saisie, sauvegarde manuelle, autosave et 2,0         Sprint 1     420 €
  validation des réponses

  Téléchargement documents par phase (PDF  1,0         Sprint 1     210 €
  mis à disposition)

  Dashboard consultant + accès aux         2,5         Sprint 2     530 €
  dossiers bénéficiaires (lecture)

  Dashboard Super Administrateur + gestion 3,5         Sprint 2     750 €
  des comptes + attributions

  Déploiement Vercel + HTTPS + conformité  2,0         Sprint 2     430 €
  RGPD de base

  Tests, recette, documentation            1,0         Sprint 2     200 €
  CLAUDE.md + Guide Super Admin

  **SOUS-TOTAL DÉVELOPPEMENT**             **16,5 j**               **3 500 €**

  Infrastructure de lancement (Vercel,     ---         Hors forfait \~57 €\*
  Supabase, Resend, domaine OVH) Réglée
  directement par Link's Accompagnement
  --- non comprise dans le forfait

  **TOTAL HT --- DÉVELOPPEMENT**           **16,5 j**               **3 500 €**
  -------------------------------------------------------------------------------

*\* Estimation infrastructure de lancement : Vercel Pro 1er mois
(\~20 €), Supabase Free (0 €), Resend Free (0 €), domaine OVH annuel
(\~12 €/an). Ces abonnements sont souscrits et réglés directement par
Link's Accompagnement. Unanima assure la configuration initiale dans le
cadre du forfait.*

*ℹ️ L'abonnement Claude Code (outil de codage agentique Anthropic) est
pris en charge par Unanima et n'est pas refacturé au client.*

# 3. Coûts récurrents après livraison

Les abonnements d'infrastructure sont souscrits et réglés directement
par Link's Accompagnement, qui en est propriétaire intégral. Unanima
assure la configuration initiale dans le cadre du forfait de
développement. Les coûts suivants sont indicatifs et dépendent du plan
choisi.

  -----------------------------------------------------------------------------
  **Poste**              **Plan gratuit** **Plan Pro**     **Recommandation**
  ---------------------- ---------------- ---------------- --------------------
  Hébergement (Vercel)   0 €/mois         \~20 €/mois      Pro pour la prod

  Base de données        0 €/mois         \~25 €/mois      Free au lancement
  (Supabase)

  E-mail transactionnel  0 €/mois         0 €/mois         Free (3 000
  (Resend)                                                 mails/mois)

  Nom de domaine (OVH)   \~1 €/mois       \~1 €/mois       Sous-domaine
                                                           existant

  **TOTAL ESTIMATIF /    **\~1 €**        **\~46 €**
  MOIS**
  -----------------------------------------------------------------------------

# 4. Conditions commerciales

## 4.1 Modalités de paiement

  ------------------------------------------------------------------------
  **Échéance**        **Condition**            **%**       **Montant HT**
  ------------------- ------------------------ ----------- ---------------
  Acompte             À la signature du bon de 30 %        1 050 €
                      commande

  Solde               Après signature du       70 %        2 450 €
                      procès-verbal de recette

  **TOTAL HT**                                 **100 %**   **3 500 €**
  ------------------------------------------------------------------------

## 4.2 Conditions du forfait

  -----------------------------------------------------------------------
  **Inclus dans le forfait**          **Non inclus (hors périmètre)**
  ----------------------------------- -----------------------------------
  ✓ Tous les modules de la note de    ✕ Upload de fichiers par le
  cadrage v1.15                       bénéficiaire

  ✓ Autosave intégré (fonctionnalité  ✕ Notifications e-mail automatiques
  de base v1)                         (validation de phase)

  ✓ Configuration initiale de         ✕ Application mobile native (iOS /
  l'infrastructure (Vercel, Supabase) Android)

  ✓ Déploiement en production et      ✕ Intégration SIRH ou CRM tiers
  HTTPS

  ✓ Conformité RGPD de base +         ✕ Migration de données depuis
  mentions légales                    l'outil actuel

  ✓ Documentation CLAUDE.md + Guide   ✕ Graphiques d'activité avancés
  Super Admin                         (v2)

  ✓ Garantie 1 mois (corrections      ✕ Maintenance corrective
  anomalies après livraison)          post-garantie (sur devis)

  ✓ Abonnement Claude Code (pris en   ✕ Abonnements infrastructure
  charge Unanima)                     (réglés directement par Link's)
  -----------------------------------------------------------------------

## 4.3 Garantie et maintenance

  -----------------------------------------------------------------------
  **Garantie : 1 mois calendaire après livraison de la version finale**
  -----------------------------------------------------------------------
  Pendant cette période, toute anomalie de fonctionnement constatée et
  relevant du périmètre défini dans la note de cadrage v1.15 est corrigée
  sans facturation supplémentaire.

  **Sont exclus de la garantie :** les anomalies résultant d'une mauvaise
  utilisation, d'une modification réalisée par un tiers, d'une mise à
  jour de l'infrastructure non coordonnée avec Unanima, ou d'une demande
  hors périmètre.

  *Au-delà de la période de garantie, un contrat de maintenance pourra
  être proposé à Link's Accompagnement (maintenance corrective et/ou
  évolutive, sur devis, tarif indicatif : 200 € HT/j).*
  -----------------------------------------------------------------------

## 4.4 Conditions de démarrage (pré-requis bloquants)

  --------------------------------------------------------------------------------
  **Pré-requis**                                  **Urgence**    **Responsable**
  ----------------------------------------------- -------------- -----------------
  Signature du bon de commande + versement        **BLOQUANT**   Link's
  acompte 30 %

  Contenu des 6 phases : titres définitifs +      **BLOQUANT**   Link's
  libellés des questions

  Liste des documents à fournir par phase (PDF,   Sprint 1       Link's
  guides)

  Nom de domaine retenu + accès DNS OVH           Sprint 1       Link's

  Charte graphique confirmée (logos vectoriels,   Sprint 1       Link's
  codes couleurs HEX)

  Choix du plan Supabase (gratuit ou Pro)         Avant kick-off Link's

  Arbitrage solution signature électronique       **Avant Lot    Link's + Unanima
  (EduSign ou alternative) --- requis avant       ES**
  lancement Lot ES (v2)

  Configurations des parcours par consultante     **Avant Lot    Link's
  (phases et questions spécifiques) --- requis    F**
  avant livraison pour intégration Lot F
  --------------------------------------------------------------------------------

# 5. Calendrier prévisionnel

Le délai de 6 semaines est compté à compter du kick-off (réception du
contenu des phases + signature).

  -----------------------------------------------------------------------------
  **Jalon**       **Contenu**                      **Semaine**   **Livrable**
  --------------- -------------------------------- ------------- --------------
  **J-0           Signature contrat, versement     S+0           ---
  Kick-off**      acompte, réception contenu
                  phases, briefing technique

  **J-1 Fin       Espace bénéficiaire complet :    S+3           Démo
  Sprint 1**      auth + dashboard + 6 phases +
                  saisie + docs. Démo
                  intermédiaire.

  **J-2 Fin       Espaces consultant et Super      S+6           Plateforme
  Sprint 2**      Admin + déploiement Vercel +                   complète
                  RGPD + tests + CLAUDE.md

  **J-3 Recette** Validation des critères          S+6 (+5j)     PV signé
                  d'acceptation, corrections
                  éventuelles, PV de recette

  **J-4           Formation Super Administrateur + S+6 (+1j)     Clés en main
  Formation**     transfert de compétences +
                  remise des accès
  -----------------------------------------------------------------------------

# 6. Version 2 --- Fonctionnalités avancées (sur devis)

Les lots suivants sont exclus du présent forfait. Ils pourront faire
l'objet d'un devis complémentaire.

  ---------------------------------------------------------------------------
  **Lot**   **Contenu**                              **Charge    **Statut**
                                                     estimée**
  --------- ---------------------------------------- ----------- ------------
  **C**     Graphiques d'activité mensuelle +        3,5 j       Sur devis
            gestion notifications Super Admin

  **D**     RGPD complet + refactorisation + tests   4,5 j       Sur devis
            avancés

  **E**     Tri et filtrage de la liste              1,0 j       Sur devis
            bénéficiaires (espace consultant)

  **IA**    Reformulation IA des réponses            3,0 j       Sur devis
            bénéficiaire (bouton IA par question)

  F         Modèles de parcours par consultante ---  1,5 j       Sur devis
            configurations fournies en amont par
            Link's (CONFIRMÉ). Intégration en dur à
            la livraison, sans interface
            d'administration dynamique. Parcours
            stables en année 1.

  ES        Signature électronique --- intégration   2--3 j      Sur devis
            API légère (envoi documents, webhook
            statut, archivage). Solution à
            arbitrer : EduSign ou alternative
            (critères : coût, API, conformité
            eIDAS). Pré-requis : arbitrage + accès
            API.
  ---------------------------------------------------------------------------

*Le lot IA (reformulation intelligente des réponses bénéficiaire) a été
intégré aux perspectives v2 à la demande de Link's Accompagnement lors
des échanges de mars 2026.*

  -----------------------------------------------------------------------
  **Validité de la proposition : 30 jours à compter du 10 mars 2026**
  -----------------------------------------------------------------------
  Pour accepter cette proposition, merci de retourner ce document signé
  avec la mention « Bon pour accord » accompagné du règlement de
  l'acompte (1 050 € HT).

  **Contact : David Duquenne --- Unanima**
  -----------------------------------------------------------------------

# 8. Conditions juridiques

Les présentes conditions s'appliquent à la relation contractuelle entre
Unanima (David Duquenne, prestataire) et Link's Accompagnement (client).
Elles complètent et précisent les conditions d'exécution décrites dans
les sections précédentes.

## 8.1 Propriété intellectuelle

  -----------------------------------------------------------------------
  **Objet**            **Disposition**
  -------------------- --------------------------------------------------
  **Code source et     L'intégralité du code source spécifique à la
  livrables**          plateforme Link's Accompagnement (configurations,
                       données métier, personnalisations graphiques et
                       fonctionnelles), ainsi que les schémas de base de
                       données et les livrables documentaires, est cédée
                       à Link's Accompagnement à titre exclusif,
                       définitif et irrévocable, dès le paiement intégral
                       du solde. Avant ce paiement, Unanima conserve tous
                       les droits sur le code produit.

  **Outils et          Les outils, gabarits, prompts et méthodologies
  méthodologie         propres à Unanima (notamment l'usage de Claude
  Unanima**            Code) demeurent la propriété exclusive d'Unanima
                       et ne font pas l'objet de la cession de droits
                       ci-dessus. Le socle applicatif générique développé
                       pour ce projet (architecture Next.js/Supabase,
                       composants réutilisables, modules
                       d'authentification et de gestion de parcours
                       multi-phases) reste la propriété exclusive
                       d'Unanima. Unanima se réserve expressément le
                       droit de réutiliser ce socle pour d'autres projets
                       clients, sans que cela ne porte atteinte aux
                       droits cédés à Link's Accompagnement sur le code
                       spécifique de sa plateforme.

  **Comptes et accès   Les abonnements Vercel, Supabase et Resend sont
  tiers**              souscrits au nom de Link's Accompagnement, qui en
                       est propriétaire intégral. Unanima n'en conserve
                       aucun droit après la livraison et la clôture du
                       projet.
  -----------------------------------------------------------------------

## 8.2 Confidentialité

  -----------------------------------------------------------------------
  **Obligations d'Unanima**           **Obligations de Link's
                                      Accompagnement**
  ----------------------------------- -----------------------------------
  Confidentialité stricte sur toutes  La présente proposition est
  les données des bénéficiaires et    confidentielle. Elle ne peut être
  les informations métier de Link's   transmise à des tiers --- notamment
  Accompagnement, pendant et après la des prestataires concurrents ---
  prestation, sans limitation de      sans accord écrit préalable
  durée.                              d'Unanima.

  -----------------------------------------------------------------------

## 8.3 Responsabilité et limitations

  -----------------------------------------------------------------------
  **Domaine**           **Disposition**
  --------------------- -------------------------------------------------
  **Plafond de          La responsabilité d'Unanima est limitée au
  responsabilité**      montant HT de la présente prestation (3 500 €
                        HT). Elle ne saurait être engagée pour des
                        préjudices indirects (perte de revenus, perte de
                        données due à un usage incorrect, interruption
                        d'activité, etc.).

  **Périmètre**         Unanima est responsable du bon fonctionnement de
                        la plateforme conformément aux spécifications de
                        la note de cadrage v1.15. Toute demande hors
                        périmètre fera l'objet d'un avenant écrit signé
                        par les deux parties.

  **Données             Link's Accompagnement est responsable de
  personnelles (RGPD)** traitement au sens du RGPD (Règl. UE 2016/679).
                        Unanima agit en qualité de sous-traitant et
                        s'engage à respecter les obligations du Chapitre
                        IV. Un accord de sous-traitance peut être
                        formalisé sur demande.

  **Sécurité**          Unanima met en œuvre les bonnes pratiques de
                        sécurité (HTTPS, JWT, bcrypt, RBAC, sauvegardes
                        Supabase) dans le cadre du PMV v1. La sécurité
                        des accès aux comptes Vercel et Supabase relève
                        de la responsabilité de Link's Accompagnement
                        après livraison.
  -----------------------------------------------------------------------

## 8.4 Résiliation et dédit

  -----------------------------------------------------------------------
  **Situation**              **Conséquences financières**
  -------------------------- --------------------------------------------
  **Résiliation avant        L'acompte de 30 % (1 050 € HT) est acquis à
  kick-off (avant            Unanima en compensation de la réservation de
  démarrage)**               capacité et de la préparation technique.

  **Résiliation en cours de  Facturation des jours réellement effectués
  Sprint 1**                 au prorata du taux journalier, déduction
                             faite de l'acompte. Livraison de tout le
                             code produit à date.

  **Résiliation en cours de  Facturation de l'intégralité du Sprint 1 +
  Sprint 2**                 jours Sprint 2 effectués au prorata.
                             Livraison de l'ensemble du code produit.

  **Résiliation à            Remboursement intégral de l'acompte.
  l'initiative d'Unanima**   Livraison du code produit à date. Préavis
                             minimum de 5 jours ouvrables.
  -----------------------------------------------------------------------

## 8.5 Force majeure et dispositions diverses

  -----------------------------------------------------------------------
  **Disposition**       **Détail**
  --------------------- -------------------------------------------------
  **Force majeure**     Aucune des parties ne peut être tenue responsable
                        d'un manquement causé par un événement
                        imprévisible et extérieur à sa volonté (panne
                        généralisée des services cloud, catastrophe
                        naturelle, etc.). Les délais contractuels sont
                        suspendus pendant la durée de l'événement.

  **Retards imputables  Tout retard dans la fourniture des pré-requis
  au client**           bloquants (contenu des phases, charte graphique,
                        accès DNS) entraîne un report équivalent du
                        calendrier de livraison, sans pénalité pour
                        Unanima ni facturation supplémentaire.

  **Pré-requis non      Si les pré-requis ne sont pas transmis dans un
  fournis dans les      délai de 30 jours après signature, Unanima se
  délais**              réserve le droit de reporter le projet ou
                        d'annuler la prestation, avec conservation de
                        l'acompte.

  **Avenants**          Toute modification du périmètre après signature
                        fait l'objet d'un avenant écrit signé par les
                        deux parties, avec chiffrage supplémentaire
                        préalable.

  **Droit applicable et Le présent contrat est soumis au droit français.
  juridiction**         En cas de litige, les parties s'engagent à
                        rechercher une solution amiable avant tout
                        recours judiciaire. À défaut d'accord, le
                        Tribunal de Commerce compétent sera celui du
                        siège social d'Unanima.

  **Divisibilité**      Si une clause des présentes conditions est
                        reconnue nulle ou inapplicable par une
                        juridiction compétente, les autres clauses
                        demeurent pleinement en vigueur.
  -----------------------------------------------------------------------

# Récapitulatif et bon pour accord

  -----------------------------------------------------------------------
  Développement PMV v1 --- forfait (16,5 jours)     3 500 € HT
  ------------------------------------------------- ---------------------
  Infrastructure (Vercel, Supabase, Resend, domaine Réglée directement
  OVH)                                              par Link's

  **TOTAL HT**                                      **3 500 €**

  TVA 20 %                                          700 €

  **TOTAL TTC**                                     **4 200 €**

  Acompte à la signature (30 % HT)                  1 050 € HT

  Solde à la recette validée (70 % HT)              2 450 € HT
  -----------------------------------------------------------------------

+---------------------------------+---+---------------------------------+
| **Pour Unanima**                |   | **Pour Link's Accompagnement**  |
+=================================+===+=================================+
| David Duquenne                  |   | Julien Estier                   |
|                                 |   |                                 |
| Signature :                     |   | Signature + cachet : Bon pour   |
|                                 |   | accord                          |
+---------------------------------+---+---------------------------------+
| Date : \_\_\_/\_\_\_/2026       |   | Date : \_\_\_/\_\_\_/2026       |
+---------------------------------+---+---------------------------------+
