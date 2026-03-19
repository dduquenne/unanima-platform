# Glossaire des méthodes — Spécifications et gestion de projet

## Méthodes et frameworks

**Agile** : Approche de développement itérative et incrémentale basée sur des cycles courts (sprints). Favorise l'adaptation au changement et la collaboration client.

**Scrum** : Framework Agile avec des rôles définis (Product Owner, Scrum Master, équipe), des rituels (sprint planning, daily, review, rétrospective) et des artefacts (backlog produit, sprint backlog).

**SAFe (Scaled Agile Framework)** : Extension d'Agile pour les grandes organisations. Introduit la notion de PI (Program Increment), d'Epics, de Features et de User Stories organisés en niveaux.

**Shape Up (Basecamp)** : Méthode alternative à Scrum avec des cycles de 6 semaines, des "pitches" remplaçant les spécifications, et des équipes autonomes.

**Kanban** : Système de visualisation du flux de travail par colonnes (À faire / En cours / Terminé). Adapté pour les workflows continus sans itérations fixes.

**BDD (Behavior Driven Development)** : Approche de développement guidée par les comportements attendus, exprimés en langage naturel (Given/When/Then = Gherkin). Aligne métier et technique.

**TDD (Test Driven Development)** : Écriture des tests avant le code. La spec fonctionnelle en BDD peut guider le TDD.

---

## Artefacts et livrables

**Epic** : Thème fonctionnel majeur regroupant plusieurs Features. Trop large pour un seul sprint. Horizon de plusieurs mois.

**Feature** : Fonctionnalité cohérente au sein d'un Epic. Livrable en 2 à 4 sprints.

**User Story (US)** : Unité de valeur livrable exprimée du point de vue de l'utilisateur. Format : "En tant que... je veux... afin de..."

**Critère d'acceptation** : Condition vérifiable qui définit quand une US est considérée comme réalisée. Exprimé en BDD/Gherkin idéalement.

**Definition of Done (DoD)** : Liste de critères génériques qui s'appliquent à toutes les US pour être considérées "terminées" (code revu, tests passants, doc mise à jour...).

**Definition of Ready (DoR)** : Critères qu'une US doit remplir avant de pouvoir être prise en sprint (US rédigée, estimée, critères clairs, maquettes disponibles...).

**Backlog produit** : Liste ordonnée de toutes les US du projet, du plus prioritaire au moins prioritaire.

**Sprint backlog** : Sous-ensemble du backlog produit sélectionné pour un sprint donné.

**MVP (Minimum Viable Product)** : Version minimale du produit qui apporte une valeur réelle aux utilisateurs et permet de valider les hypothèses clés.

**MoSCoW** : Méthode de priorisation (Must Have / Should Have / Could Have / Won't Have).

**Persona** : Personnage fictif représentant un groupe d'utilisateurs cibles, avec ses objectifs, comportements et contraintes.

**Jobs-to-be-Done (JTBD)** : Framework centré sur le job que l'utilisateur cherche à accomplir, indépendamment de la solution.

**Story Point** : Unité de mesure relative de la complexité d'une User Story (pas des heures). Suite de Fibonacci recommandée : 1, 2, 3, 5, 8, 13, 21.

**Vélocité** : Nombre de story points qu'une équipe peut réaliser par sprint (calculé sur la moyenne des sprints passés).

---

## Termes techniques courants

**API (Application Programming Interface)** : Interface permettant à des systèmes de communiquer entre eux. À mentionner dans les spécifications quand une intégration est requise.

**SaaS (Software as a Service)** : Logiciel hébergé et accessible via internet (vs logiciel installé). Modèle d'abonnement.

**SSO (Single Sign-On)** : Authentification unique permettant d'accéder à plusieurs systèmes avec un seul identifiant (ex : connexion via Google/Microsoft).

**RGPD** : Règlement Général sur la Protection des Données. Impacte toute application traitant des données personnelles en Europe.

**RBAC (Role-Based Access Control)** : Contrôle d'accès basé sur les rôles. Chaque rôle a des permissions définies.

**Gherkin** : Langage structuré pour écrire des critères d'acceptation en BDD. Mots-clés : Given (Étant donné), When (Quand), Then (Alors), And (Et), But (Mais).

---

## Rôles dans un projet

**Product Owner (PO)** : Représentant du client/métier dans l'équipe. Priorise le backlog et valide les livrables.

**Scrum Master** : Facilitateur du processus Agile. Protège l'équipe et élimine les obstacles.

**Tech Lead / Architecte** : Responsable des choix techniques. Évalue la faisabilité des US.

**UX Designer** : Conçoit les maquettes et l'expérience utilisateur. Produit les wireframes et prototypes.

**QA (Quality Assurance)** : Teste les fonctionnalités selon les critères d'acceptation. Peut rédiger les tests en Gherkin.

**Sponsor** : Décideur côté client qui finance le projet et arbitre les priorités stratégiques.
