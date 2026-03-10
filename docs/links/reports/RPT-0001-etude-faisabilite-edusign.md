---
ref: RPT-0001
title: "Étude de faisabilité — Intégration API EduSign"
type: RPT
scope: links
status: accepted
version: "1.0"
created: 2026-03-10
updated: 2026-03-10
author: David Duquenne — Unanima
related-issues: ["#9"]
supersedes: null
superseded-by: null
---

# Étude de faisabilité — Intégration API EduSign

**Signature électronique pour les bilans de compétences à distance**

| | |
|---|---|
| Client | Link's Accompagnement |
| Auteur | David Duquenne — Unanima |
| Date | Mars 2026 |
| Version | 1.0 |
| Statut | Étude préliminaire |
| Référence | Note de cadrage v1.13 — Q-16 |

> Ce document est la propriété exclusive d'Unanima. Il est communiqué à Link's Accompagnement à titre confidentiel dans le cadre de l'évaluation du projet de plateforme de suivi des bilans de compétences.

> **Verdict** : l'intégration est techniquement faisable. L'API EduSign est bien documentée, gratuite d'utilisation, et propose des endpoints dédiés à l'envoi de documents pour signature. Cependant, la complexité réside dans le flux métier (déclenchement, suivi, archivage) et nécessite un arbitrage sur le périmètre exact.

---

## 1. Synthèse

Link's Accompagnement souhaite étudier l'intégration d'EduSign, service de signature électronique qu'ils utilisent déjà, dans la future plateforme de suivi des bilans de compétences. L'objectif est de permettre la signature électronique des documents liés aux séances réalisées à distance (bilans 100% distanciel).

Cette étude analyse la faisabilité technique de cette intégration, les coûts associés, les risques identifiés et les scénarios de mise en œuvre possibles.

## 2. Présentation d'EduSign

### 2.1 Qu'est-ce qu'EduSign ?

EduSign est une plateforme française spécialisée dans la gestion d'assiduité et la signature électronique pour les organismes de formation. Elle est utilisée par plus de 2 500 organismes de formation en France. Ses fonctionnalités principales couvrent l'émargement numérique, la signature de documents (conventions, attestations, contrats), la gestion des présences et le suivi des apprenants.

EduSign propose des signatures conformes au règlement européen eIDAS, avec génération systématique d'un dossier de preuve pour chaque signature. La validation d'identité du signataire peut se faire par e-mail (code OTP), par SMS, ou sans validation (optionnel).

### 2.2 Niveaux de signature et conformité eIDAS

Le règlement européen eIDAS définit trois niveaux de signature électronique, chacun avec un degré croissant de sécurité et de valeur juridique :

| Niveau | Caractéristiques | Cas d'usage formation |
|---|---|---|
| Simple | Authentification basique (e-mail, clic « J'accepte »). Valeur juridique limitée mais non nulle. | Feuilles d'émargement, accusés de réception, documents internes peu sensibles. |
| Avancée | Identification renforcée du signataire (OTP e-mail/SMS). Détecte toute modification post-signature. Force probante supérieure. | Conventions de formation, attestations de compétences, bilans de compétences. |
| Qualifiée | Équivalent légal de la signature manuscrite. Certificat qualifié délivré par un PSCQ. Processus lourd. | Actes juridiques engageants. Peu adapté au contexte formation. |

> **Recommandation** : pour les bilans de compétences à distance, le niveau « avancé » avec validation par e-mail (OTP) constitue le meilleur équilibre entre sécurité juridique, coût et simplicité d'usage. C'est le niveau proposé par EduSign par défaut.

## 3. Analyse technique de l'API EduSign

### 3.1 Caractéristiques générales

| Caractéristique | Détail |
|---|---|
| Type d'API | REST (JSON) |
| Authentification | Bearer Token (clé API générée depuis le dashboard admin EduSign) |
| Coût d'utilisation de l'API | Gratuit — inclus dans l'abonnement EduSign (aucun surcoût) |
| Rate limit | 480 requêtes/min (standard), 24 req/min (requêtes lourdes). Throttling progressif, pas de blocage. |
| Versions | v1.0 et v3.0 disponibles |
| Documentation | developers.edusign.com — Complète avec tutoriels, collection Postman, exemples de code |
| SDK / Bibliothèque | Package npm @\_edusign/api disponible (Node.js) |
| Webhooks | Oui — notifications push sur événements (signature complétée, etc.) |
| Serveur MCP | Disponible — interrogation de la documentation par agents IA |
| Maintenance | Fenêtre le samedi 16h-22h (UTC+1), quelques minutes |
| Clés API | 5 clés max par organisme. Génération par le rôle « propriétaire » uniquement. |

### 3.2 Endpoints clés pour l'intégration

L'API EduSign propose un ensemble d'endpoints directement exploitables pour le cas d'usage de Link's :

| Opération | Endpoint | Usage dans notre contexte |
|---|---|---|
| Créer un apprenant | `POST /student` | Synchroniser le bénéficiaire lors de la création de son compte sur la plateforme. |
| Envoyer un document pour signature | `POST /document/custom/send/{templateId}` | Envoyer le document de la séance (convention, feuille de présence) au bénéficiaire pour signature électronique. |
| Envoyer depuis un template | `POST /document` (avec base64 ou templateId) | Utiliser un modèle préconfiguré dans EduSign avec champs dynamiques (dates, noms). |
| Webhook signature complétée | Webhook (push) | Recevoir la notification quand le bénéficiaire a signé → mettre à jour le statut de la séance sur la plateforme. |
| Récupérer le document signé | `GET /document/{id}` | Télécharger et archiver le document signé dans le dossier du bénéficiaire. |

### 3.3 Compatibilité avec la stack technique

La stack technique retenue pour la plateforme (Node.js / Vercel / Supabase) est parfaitement compatible avec l'API EduSign. Le package npm officiel `@_edusign/api` peut être intégré directement dans le backend. Les appels API REST sont standards (Bearer token + JSON). Les webhooks EduSign peuvent être reçus par un endpoint Vercel serverless. Supabase peut stocker les références des documents signés et leur statut.

## 4. Scénarios d'intégration

### 4.1 Scénario A — Intégration légère (recommandé)

La plateforme déclenche l'envoi d'un document pour signature via l'API EduSign, puis reçoit le statut de signature par webhook. Le bénéficiaire signe directement dans EduSign (redirection ou lien e-mail). La plateforme affiche le statut de signature dans le dossier.

**Flux :**

1. La consultante valide la séance à distance dans son espace.
2. La plateforme appelle l'API EduSign pour envoyer le document (template préconfiguré avec champs dynamiques : nom, date, séance).
3. EduSign envoie un e-mail au bénéficiaire avec le lien de signature.
4. Le bénéficiaire signe sur EduSign (interface EduSign, pas la plateforme).
5. EduSign notifie la plateforme via webhook → mise à jour du statut.
6. Le document signé est récupérable via l'API pour archivage.

| Critère | Détail |
|---|---|
| Complexité | Modérée — intégration API standard + webhook |
| Charge estimée | 2 à 3 jours de développement |
| Avantages | Simplicité, fiabilité (EduSign gère le flux signature), pas de développement UI signature côté plateforme. |
| Inconvénients | Le bénéficiaire sort de la plateforme pour signer (redirection vers EduSign). |

### 4.2 Scénario B — Intégration embarquée

La signature est réalisée directement dans la plateforme via un iframe ou composant EduSign intégré. Le bénéficiaire ne quitte jamais la plateforme.

| Critère | Détail |
|---|---|
| Complexité | Élevée — nécessite de vérifier la disponibilité d'un composant embarquable chez EduSign |
| Charge estimée | 4 à 6 jours de développement |
| Avantages | Expérience utilisateur fluide, tout dans la même interface. |
| Inconvénients | Dépendance forte à l'interface EduSign, maintenance plus complexe, faisabilité à confirmer avec EduSign. |

### 4.3 Scénario C — Intégration différée (v2)

La signature n'est pas intégrée dans la v1. La plateforme fournit uniquement un lien rapide vers l'interface EduSign existante. L'intégration API complète est reportée en v2.

| Critère | Détail |
|---|---|
| Complexité | Nulle en v1 — aucun développement spécifique |
| Charge estimée | 0 jour en v1 (simple lien) |
| Avantages | Aucun impact sur le budget et le planning v1. |
| Inconvénients | Aucune automatisation. La consultante doit gérer manuellement l'envoi via EduSign, comme aujourd'hui. |

## 5. Pré-requis côté Link's Accompagnement

Avant toute intégration, les éléments suivants doivent être fournis ou confirmés par Link's :

| Pré-requis | Urgence | Responsable |
|---|---|---|
| Confirmer le plan EduSign actuel et vérifier l'accès API (certains plans n'incluent pas l'API) | BLOQUANT | Julien / Séverine |
| Fournir la clé API EduSign (générée par le rôle propriétaire dans l'espace admin EduSign) | BLOQUANT | Julien / Séverine |
| Identifier les documents à signer (convention de formation, feuille de présence, autre) | Avant dev | Julien |
| Créer les templates de documents dans EduSign (champs dynamiques : nom, date, séance) | Avant dev | Julien / Unanima |
| Confirmer le mode de validation de signature souhaité (e-mail OTP, SMS, ou sans validation) | Avant dev | Julien |

## 6. Risques identifiés

| Risque | Probabilité | Impact | Atténuation |
|---|---|---|---|
| Le plan EduSign de Link's n'inclut pas l'accès API | Moyen | Élevé | Vérifier avant tout développement. Upgrade de plan si nécessaire (coût à évaluer). |
| Évolution de l'API EduSign (breaking changes) | Faible | Moyen | Versioning API (v1.0 / v3.0). Couche d'abstraction dans le code. |
| Indisponibilité EduSign (maintenance samedi) | Faible | Faible | Les bilans ne se déroulent pas le samedi soir. Impact négligeable. |
| Le bénéficiaire ne signe pas (e-mail ignoré) | Moyen | Moyen | Relances automatiques configurables via l'API (paramètres `sendCustomSignatureReminderEmail`). |
| Complexité des templates sous-estimée | Moyen | Faible | Prototypage sur un template simple avant intégration complète. |

## 7. Estimation budgétaire

| Poste | Charge | Commentaire |
|---|---|---|
| Scénario A (recommandé) — intégration légère | 2 à 3 j | API + webhook + UI statut |
| Scénario B — intégration embarquée | 4 à 6 j | Si composant embarquable disponible |
| Scénario C — report v2 (lien simple) | 0 j | Aucun développement v1 |
| Coût API EduSign | 0 € | Inclus dans l'abonnement EduSign |

> **Note** : ces estimations de charge seront intégrées dans la proposition commerciale Unanima. Les coûts en jours de développement s'ajoutent au périmètre v1 ou v2 selon le scénario retenu.

## 8. Recommandation Unanima

**Scénario recommandé : Scénario C en v1 (lien simple) + Scénario A en v2 (intégration légère).**

Cette approche permet de livrer la v1 dans l'enveloppe budgétaire définie, sans prendre de risque sur l'intégration d'un service tiers dont les pré-requis (plan, clé API, templates) ne sont pas encore validés.

En v1, la consultante accède à EduSign comme aujourd'hui, via un lien direct depuis la plateforme. En v2, l'intégration API automatise l'envoi des documents et le suivi du statut de signature.

L'architecture v1 sera conçue pour anticiper cette intégration (champs `signature_status` et `edusign_document_id` prévus dans le modèle de données dès la conception).

**Prochaines étapes immédiates :**

1. Link's vérifie son plan EduSign actuel et l'accès API.
2. Link's identifie les documents à signer électroniquement pour les bilans à distance.
3. Unanima intègre le scénario retenu dans la proposition commerciale.
