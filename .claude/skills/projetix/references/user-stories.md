# User Stories & Spécifications fonctionnelles — Référence complète

## Architecture en 3 niveaux

```
EPIC
  └── FEATURE (ou Capability)
        └── USER STORY
              ├── Critères d'acceptation (BDD/Gherkin)
              ├── Règles métier
              ├── Dépendances
              └── Definition of Done
```

---

## EPIC

Un Epic représente un **thème fonctionnel majeur**, trop large pour être réalisé en un sprint. Il regroupe des fonctionnalités cohérentes.

**Format d'un Epic :**
```
EPIC-[ID] | [NOM COURT EN MAJUSCULES]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Description : [Ce que cet ensemble de fonctionnalités permet d'accomplir]
Valeur métier : [Bénéfice global pour l'entreprise ou les utilisateurs]
Indicateur de succès : [Comment mesurer que l'epic est réussi]
User Stories associées : [US-01, US-02, US-03...]
Lot / Release cible : [V1 / V2 / MVP]
```

**Exemples d'Epics typiques :**
- EPIC-01 | GESTION DES UTILISATEURS ET ACCÈS
- EPIC-02 | TABLEAU DE BORD ET REPORTING
- EPIC-03 | GESTION DES COMMANDES
- EPIC-04 | NOTIFICATIONS ET ALERTES
- EPIC-05 | ADMINISTRATION ET PARAMÉTRAGE

---

## FEATURE

Une Feature est une **fonctionnalité cohérente** au sein d'un Epic. Elle peut généralement être livrée en 2 à 4 sprints.

**Format d'une Feature :**
```
FEAT-[ID] | [Nom de la fonctionnalité]
Epic parent : [EPIC-ID]
Description : [Ce que cette fonctionnalité permet de faire]
User Stories : [US-XX, US-YY...]
```

---

## USER STORY — Format complet

```
US-[ID] | [TITRE COURT ET EXPLICITE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXTE
  Epic     : [EPIC-ID | Nom]
  Feature  : [FEAT-ID | Nom]
  Priorité : [Must Have / Should Have / Could Have]
  Taille   : [XS / S / M / L / XL] ou [points : 1/2/3/5/8/13]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORY
  En tant que [PERSONA ou RÔLE PRÉCIS],
  Je veux [ACTION CONCRÈTE — verbe d'action],
  Afin de [BÉNÉFICE MÉTIER EXPLICITE — valeur réelle].
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITÈRES D'ACCEPTATION (BDD / Gherkin)

  Scénario 1 : [Cas nominal — "happy path"]
    ÉTANT DONNÉ [l'état initial du système et/ou de l'utilisateur]
    ET [conditions additionnelles si nécessaires]
    QUAND [l'action déclenchée par l'utilisateur]
    ALORS [le résultat observable et vérifiable]
    ET [effets secondaires attendus si pertinents]

  Scénario 2 : [Cas alternatif valide]
    ÉTANT DONNÉ [...]
    QUAND [...]
    ALORS [...]

  Scénario 3 : [Cas d'erreur ou de limite]
    ÉTANT DONNÉ [...]
    QUAND [...]
    ALORS [message d'erreur / comportement dégradé attendu]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES MÉTIER
  RG-[ID] : [Description de la règle — précise, non ambiguë]
  RG-[ID] : [Deuxième règle...]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MAQUETTES & RÉFÉRENCES
  - [Lien Figma / numéro d'écran / description de l'interface]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉPENDANCES
  - Dépend de : [US-XX — Description de la dépendance]
  - Bloque    : [US-YY — Raison du blocage]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEFINITION OF DONE
  □ Code développé et revu par un pair
  □ Tests unitaires écrits et passants (couverture ≥ 80%)
  □ Critères d'acceptation testés et validés
  □ Tests de non-régression passants
  □ Documentation technique mise à jour
  □ Validé par le PO ou représentant client
  □ Déployé en environnement de recette
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOTES / QUESTIONS OUVERTES
  - [Questions à clarifier avec le client avant développement]
```

---

## Exemples commentés de User Stories

### Exemple 1 — Authentification (simple, bien formée)

```
US-01 | CONNEXION PAR EMAIL ET MOT DE PASSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Epic     : EPIC-01 | GESTION DES UTILISATEURS
Feature  : FEAT-01 | Authentification
Priorité : Must Have
Taille   : S (3 points)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que collaborateur de l'entreprise,
Je veux me connecter avec mon adresse email professionnelle et mon mot de passe,
Afin d'accéder à mon espace de travail personnalisé et sécurisé.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITÈRES D'ACCEPTATION

  Scénario 1 : Connexion réussie
    ÉTANT DONNÉ qu'un utilisateur dispose d'un compte actif
    QUAND il saisit son email et son mot de passe corrects et clique sur "Se connecter"
    ALORS il est redirigé vers son tableau de bord
    ET sa session est valide pendant 8 heures d'inactivité

  Scénario 2 : Mot de passe oublié
    ÉTANT DONNÉ qu'un utilisateur ne connaît pas son mot de passe
    QUAND il clique sur "Mot de passe oublié" et saisit son email
    ALORS il reçoit un email avec un lien de réinitialisation valable 24h

  Scénario 3 : Trop de tentatives échouées
    ÉTANT DONNÉ qu'un utilisateur a saisi 5 mots de passe incorrects
    QUAND il tente une 6ème connexion
    ALORS son compte est verrouillé pendant 15 minutes
    ET il reçoit un email l'informant du verrouillage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES MÉTIER
  RG-01 : Le mot de passe doit contenir ≥ 8 caractères, 1 majuscule, 1 chiffre
  RG-02 : L'email doit correspondre au domaine @entreprise.com
  RG-03 : Les tentatives de connexion sont loguées (IP, horodatage)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉPENDANCES
  - Bloque : US-02 (Gestion des rôles et permissions)
  - Bloque : Toutes les US nécessitant une authentification
```

### Exemple 2 — Fonctionnalité métier complexe

```
US-12 | GÉNÉRATION D'UN RAPPORT D'INTERVENTION PDF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Epic     : EPIC-03 | GESTION DES INTERVENTIONS
Feature  : FEAT-05 | Reporting et exports
Priorité : Should Have
Taille   : M (5 points)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En tant que technicien terrain,
Je veux générer un rapport PDF de clôture d'intervention,
Afin de le transmettre au client comme preuve de la prestation réalisée.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITÈRES D'ACCEPTATION

  Scénario 1 : Génération réussie
    ÉTANT DONNÉ qu'une intervention est au statut "Terminée"
    QUAND le technicien clique sur "Générer le rapport PDF"
    ALORS un PDF est généré incluant : informations client, date/heure, 
          travaux réalisés, pièces remplacées, signature du client
    ET le PDF est téléchargeable et envoyé automatiquement au client par email

  Scénario 2 : Intervention non terminée
    ÉTANT DONNÉ qu'une intervention est au statut "En cours"
    QUAND le technicien tente de générer le rapport
    ALORS un message lui indique que le rapport ne peut être généré 
          que sur une intervention clôturée

  Scénario 3 : Signature client absente
    ÉTANT DONNÉ qu'une intervention est terminée mais sans signature client
    QUAND le technicien génère le rapport
    ALORS le rapport est généré avec la mention "Signature client non recueillie"
    ET une notification est envoyée au responsable
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES MÉTIER
  RG-12 : Le rapport utilise le template de l'entreprise (logo, couleurs)
  RG-13 : Le PDF est archivé et lié à l'intervention en base de données
  RG-14 : L'email client est celui enregistré dans la fiche client
  RG-15 : Le rapport est numéroté séquentiellement (RPT-AAAA-XXXXX)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MAQUETTES
  - Figma : [Écran "Clôture d'intervention" → bouton PDF]
  - Template PDF : voir fichier template-rapport-intervention.pdf
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉPENDANCES
  - Dépend de : US-08 (Saisie des travaux réalisés)
  - Dépend de : US-09 (Signature électronique client)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOTES
  - Clarifier : faut-il un envoi automatique ou une confirmation technicien ?
  - Format email client à définir avec le service communication
```

---

## Checklist INVEST par User Story

Avant de valider chaque US :

| Critère | Question de contrôle | ✓/✗ |
|---------|----------------------|-----|
| **I**ndépendante | Peut-elle être développée et livrée seule ? | |
| **N**égociable | Le "comment" est-il flexible (pas sur-spécifié) ? | |
| **V**aluable | Apporte-t-elle une valeur métier réelle ? | |
| **E**stimable | L'équipe peut-elle l'évaluer en points ? | |
| **S**mall | Réalisable en ≤ 5 jours / 1 sprint ? | |
| **T**estable | Les critères d'acceptation sont-ils vérifiables ? | |

---

## Patterns de découpage d'US (quand une US est trop grande)

Si une US ne passe pas le critère SMALL, découper selon l'un de ces patterns :

1. **Par workflow** : US pour chaque étape d'un processus
2. **Par règle métier** : Une US sans la règle complexe, une avec
3. **Par variation de données** : US pour chaque type de données clé
4. **Par opération CRUD** : Créer / Lire / Modifier / Supprimer séparément
5. **Par profil utilisateur** : Admin vs Utilisateur standard vs Lecteur
6. **Happy path first** : US pour le cas nominal, puis pour les cas alternatifs
7. **Par interface** : Web d'abord, mobile ensuite (ou l'inverse)

---

## Tableau de backlog — Format synthétique

```markdown
| ID | Titre | Epic | Priorité | Taille | Sprint | Statut |
|----|-------|------|----------|--------|--------|--------|
| US-01 | Connexion email/MDP | EPIC-01 | Must | S | S1 | ✅ Done |
| US-02 | Gestion des rôles | EPIC-01 | Must | M | S1 | 🔄 En cours |
| US-03 | Profil utilisateur | EPIC-01 | Should | S | S2 | 📋 À faire |
| US-12 | Export PDF rapport | EPIC-03 | Should | M | S3 | 📋 À faire |
```

---

## Checklist de qualité — Spécifications fonctionnelles

- [ ] Chaque Epic est décrit avec sa valeur métier
- [ ] Toutes les US Must Have du MVP sont rédigées
- [ ] Chaque US a minimum 3 scénarios (nominal, alternatif, erreur)
- [ ] Les règles métier sont numérotées et non ambiguës
- [ ] Les dépendances sont explicites et réciproques
- [ ] Aucune US n'est formulée en termes techniques
- [ ] Le glossaire métier couvre tous les termes spécifiques
- [ ] Les questions ouvertes sont listées et assignées
- [ ] La DoD est définie et partagée avec l'équipe
- [ ] Les liens vers les maquettes sont valides
