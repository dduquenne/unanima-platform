# Note de cadrage — Référence complète

## Objectif du document

La note de cadrage est le premier livrable structuré d'un projet informatique métier. Elle sert à :
- **Aligner** client et prestataire sur une compréhension commune du projet
- **Délimiter** le périmètre (ce qui est inclus ET ce qui est exclu)
- **Fonder** la proposition commerciale sur des bases solides
- **Anticiper** les risques et contraintes majeurs

Elle est rédigée après le(s) premier(s) entretien(s) de découverte et AVANT la rédaction du devis.

---

## Structure CADRE — Détail section par section

### C — Contexte & enjeux métier

**Ce qu'on y met :**
- Présentation succincte de l'entreprise cliente (secteur, taille, activité principale)
- Situation actuelle : outils existants, processus en place, douleurs identifiées
- Événement déclencheur : pourquoi ce projet maintenant ?
- Enjeux stratégiques : ce que le projet va changer pour le client

**Questions clés à poser :**
- Quel problème business ce projet résout-il concrètement ?
- Qu'est-ce qui se passe si le projet n'est pas réalisé ?
- Quels indicateurs de succès le client a-t-il en tête ?

**Exemple de formulation :**
> La société XYZ gère actuellement ses interventions terrain via des feuilles Excel partagées par email. Cette organisation entraîne des erreurs de saisie, des doublons et une impossibilité de suivre en temps réel l'avancement des chantiers. Le projet vise à remplacer ce dispositif par une application web dédiée, afin de réduire les erreurs de 80% et d'accélérer la facturation de 15 jours en moyenne.

---

### A — Acteurs & parties prenantes

**Ce qu'on y met :**
- Tableau des parties prenantes avec rôle, attentes, niveau d'implication
- Personas utilisateurs principaux (1 à 3)
- Sponsor du projet côté client
- Interlocuteurs techniques si connus

**Tableau des parties prenantes :**

| Acteur | Rôle | Attentes principales | Implication |
|--------|------|----------------------|-------------|
| [Prénom] | Sponsor / Décideur | ROI, délais tenus | Validation |
| [Prénom] | Chef de projet client | Suivi, coordination | Hebdomadaire |
| [Rôle] | Utilisateur final | Simplicité d'usage | Tests, recette |
| [Rôle] | Admin système | Sécurité, maintenance | Déploiement |

**Format Persona :**
```
PERSONA : [Prénom fictif représentatif]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rôle : [Intitulé de poste]
Profil technique : [Novice / Intermédiaire / Expert]
Fréquence d'utilisation : [Quotidienne / Hebdomadaire / Occasionnelle]
Objectifs principaux :
  - [Ce qu'il veut accomplir avec l'outil]
Frustrations actuelles :
  - [Ce qui lui pose problème aujourd'hui]
Contraintes :
  - [Matériel, temps, compétences...]
```

---

### D — Domaine fonctionnel & périmètre

**Ce qu'on y met :**
- Liste des modules ou grandes fonctionnalités identifiées
- Priorisation MoSCoW
- Périmètre du MVP (version 1 livrable)
- Lots successifs envisagés
- Hors-périmètre explicite (évite le scope creep)

**Template MoSCoW :**

| Fonctionnalité | Description courte | MoSCoW | Lot |
|---|---|---|---|
| Authentification | Connexion sécurisée par rôle | Must | V1 |
| Tableau de bord | Vue synthétique des KPIs | Must | V1 |
| Export PDF | Génération de rapports | Should | V1 |
| Application mobile | Version iOS/Android | Could | V2 |
| IA prédictive | Suggestions automatiques | Won't | - |

**Hors-périmètre (exemples à adapter) :**
- Migration des données historiques (sauf si précisé)
- Formation des utilisateurs finaux (hors accompagnement au démarrage)
- Maintenance évolutive post-livraison (contrat séparé)
- Intégrations avec [système X] non mentionné dans le brief

---

### R — Risques & contraintes identifiés

**Ce qu'on y met :**
- Risques projet (délai, budget, ressources, technique)
- Contraintes légales et réglementaires (RGPD, sectorielles...)
- Contraintes techniques (SI existant, hébergement, performances)
- Hypothèses posées (et à valider)
- Dépendances externes

**Tableau des risques :**

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Indisponibilité référents métier | Moyenne | Fort | Planifier ateliers en avance |
| Données existantes non structurées | Haute | Moyen | Audit données avant démarrage |
| Changement de périmètre en cours | Moyenne | Fort | Procédure d'amendement contractuelle |
| Contrainte RGPD non identifiée | Faible | Fort | Audit conformité initial |

**Hypothèses à valider :**
- Le client dispose d'un hébergement adapté OU accepte notre solution cloud
- Les données existantes seront fournies dans un format exploitable
- Un référent métier sera disponible [X] jours/semaine pendant le projet
- [Autres hypothèses spécifiques au contexte]

---

### E — Estimation de valeur & orientations techniques

**Ce qu'on y met :**
- Valeur attendue et indicateurs de succès (KPIs)
- Orientations technologiques proposées (sans sur-spécifier)
- Architecture cible à haut niveau
- Volumétrie estimée (utilisateurs, données)
- Fourchette d'effort / de budget (à confirmer après spécification)
- Proposition de planning macro

**KPIs de succès exemples :**
- Taux d'adoption : > 80% des utilisateurs actifs à 3 mois
- Gain de temps : -30% sur le temps de traitement des [processus X]
- Qualité des données : 0 doublon détecté en production
- Satisfaction utilisateur : NPS > 40 à 6 mois

**Planning macro (exemple) :**

| Phase | Durée | Livrable |
|-------|-------|---------|
| Spécification | 2 semaines | Spec fonctionnelle validée |
| Développement Sprint 1 | 3 semaines | Module Authentification + Core |
| Développement Sprint 2 | 3 semaines | Module [X] |
| Recette | 2 semaines | Procès-verbal de recette |
| Déploiement & formation | 1 semaine | Go-live |

---

## Modèle de document complet

```markdown
# Note de cadrage — [NOM DU PROJET]
**Client :** [Nom société]  
**Date :** [JJ/MM/AAAA]  
**Version :** 1.0  
**Statut :** [Brouillon / À valider / Validée]  
**Rédacteur :** [Nom]

---

## 1. Contexte et enjeux

[Paragraphe de contexte...]

### 1.1 Situation actuelle
[Description de l'existant et des problèmes...]

### 1.2 Objectifs du projet
[Ce que le projet doit accomplir...]

### 1.3 Indicateurs de succès
| KPI | Valeur cible | Délai de mesure |
|-----|-------------|-----------------|
| ... | ... | ... |

---

## 2. Acteurs et parties prenantes

### 2.1 Tableau des parties prenantes
[Tableau...]

### 2.2 Personas utilisateurs
[Fiches personas...]

---

## 3. Périmètre fonctionnel

### 3.1 Modules identifiés
[Liste et description...]

### 3.2 Priorisation MoSCoW
[Tableau MoSCoW...]

### 3.3 Définition du MVP
[Description du périmètre V1...]

### 3.4 Hors-périmètre
[Liste explicite...]

---

## 4. Risques et contraintes

### 4.1 Risques projet
[Tableau des risques...]

### 4.2 Contraintes techniques et réglementaires
[Liste des contraintes...]

### 4.3 Hypothèses
[Liste des hypothèses à valider...]

---

## 5. Orientations et estimations

### 5.1 Architecture cible
[Schéma ou description...]

### 5.2 Stack technologique envisagée
[Technologies proposées et justification...]

### 5.3 Volumétrie
- Nombre d'utilisateurs estimé : [X]
- Volume de données : [X]
- Pics d'usage prévisibles : [...]

### 5.4 Planning macro
[Tableau des phases...]

### 5.5 Fourchette budgétaire
[À compléter après spécification détaillée — indicatif : X à Y k€]

---

## Annexes

### A. Questions ouvertes
[Liste des points à clarifier avec le client]

### B. Glossaire
[Termes métier spécifiques à ce projet]
```

---

## Checklist de qualité — Note de cadrage

Avant de livrer la note de cadrage, vérifier :

- [ ] Le contexte explique POURQUOI le projet existe (pas seulement QUOI)
- [ ] Chaque partie prenante est identifiée avec son rôle et ses attentes
- [ ] Le MoSCoW est validé (au moins Must/Won't renseignés)
- [ ] Le hors-périmètre est explicite et approuvé
- [ ] Au moins 3 risques identifiés avec leur mitigation
- [ ] Les hypothèses sont listées (pas implicites)
- [ ] Les KPIs de succès sont mesurables (pas "améliorer la productivité")
- [ ] Le document est compréhensible par un décideur non-technique
- [ ] La fourchette budgétaire est cohérente avec le périmètre
- [ ] Les questions ouvertes sont listées en annexe
