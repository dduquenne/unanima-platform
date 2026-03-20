# Plan de Recette — Template complet

## En-tête contractuel

| Champ | Valeur |
|---|---|
| Projet | [Nom du projet] |
| Client | [Raison sociale, SIRET] |
| Prestataire | [Raison sociale] |
| Version | v1.0 |
| Date | YYYY-MM-DD |
| Statut | Brouillon / Validé / Signé |
| Référence contrat | [N° devis / bon de commande] |

---

## 1. Objet et périmètre

### 1.1 Objet du document

Ce Plan de Recette définit les conditions contractuelles dans
lesquelles le client réceptionnera les livrables du projet
[NOM]. Il est opposable aux deux parties à compter de sa
signature.

### 1.2 Périmètre des livrables soumis à recette

Liste exhaustive des livrables :

| ID | Livrable | Version | Référence SFD | Priorité |
|---|---|---|---|---|
| LIV-001 | [Module / Fonctionnalité] | 1.0 | UC-XX | P1 |
| LIV-002 | ... | ... | ... | ... |

### 1.3 Hors périmètre (exclusions explicites)

> Lister ici ce qui NE fait PAS l'objet de la recette.

---

## 2. Définition of Done (DoD) globale

Un livrable est considéré **recevable** si et seulement si :

- [ ] Toutes les User Stories du périmètre sont au statut Done
- [ ] Couverture tests unitaires ≥ 80 % (lignes et branches)
- [ ] 0 anomalie Bloquante ouverte
- [ ] ≤ N anomalies Majeures ouvertes (valeur à définir)
- [ ] Scores Lighthouse CI : Performance ≥ 80, Accessibilité ≥ 90
- [ ] 0 vulnérabilité critique (audit `npm audit` + Gitleaks)
- [ ] Documentation technique livrée (README, OpenAPI, ADR)
- [ ] Formation utilisateurs réalisée (si applicable)
- [ ] Environnement de production configuré et documenté

---

## 3. Critères d'acceptance par fonctionnalité

### Format Gherkin (BDD)

```gherkin
Fonctionnalité : [UC-ID] [Titre de la fonctionnalité]
  En tant que [rôle utilisateur]
  Je veux [action]
  Afin de [bénéfice attendu]

  Scénario : [Cas nominal]
    Étant donné que [contexte initial]
    Quand [action déclenchante]
    Alors [résultat attendu]
    Et [résultat complémentaire]

  Scénario : [Cas d'erreur]
    Étant donné que [contexte d'erreur]
    Quand [action]
    Alors [message d'erreur attendu]
```

---

## 4. Matrice de traçabilité SFD ↔ Cas de test

| UC / Règle | Cas de test | Type | Automatisé | Priorité |
|---|---|---|---|---|
| UC-01 Authentification | CT-001 Login valide | Fonctionnel | Oui (Playwright) | P1 |
| UC-01 | CT-002 Login MDP incorrect | Fonctionnel | Oui | P1 |
| RG-12 Calcul TVA | CT-045 TVA 20% | Unitaire | Oui (Vitest) | P2 |
| ... | ... | ... | ... | ... |

**Taux de couverture SFD cible** : 100 % des UC, 100 % des
règles de gestion P1/P2.

---

## 5. Environnements de recette

| Environnement | URL | Base de données | Données | Responsable |
|---|---|---|---|---|
| Recette (UAT) | https://uat.[projet].fr | Isolée — seed de recette | Anonymisées | [Prestataire] |
| Pré-production | https://preprod.[projet].fr | Clone production | Anonymisées | [Prestataire] |

### Jeux de données de référence

- **Compte administrateur** : admin@recette.fr / [mdp fourni séparément]
- **Compte utilisateur standard** : user@recette.fr / ...
- **Jeu de données métier** : [description du seed]

---

## 6. Calendrier des campagnes

| Phase | Activité | Dates | Durée | Responsable |
|---|---|---|---|---|
| P0 | Signature Plan de Recette | J-30 | 2 j | Client + Prestataire |
| P1 | Préparation jeux de tests | J-15 → J-5 | 10 j | Prestataire |
| P2 | Campagne fonctionnelle | J → J+5 | 5 j | Client assisté |
| P2 | Campagne automatisée | J → J+1 | 1 j | Prestataire |
| P2 | Correction anomalies bloquantes | J+5 → J+8 | 3 j | Prestataire |
| P3 | Contre-recette | J+8 → J+10 | 2 j | Client |
| P3 | Signature PVR | J+11 | 1 j | Client + Prestataire |

---

## 7. Seuils d'acceptation

### Tests automatisés

| Indicateur | Seuil de refus | Seuil d'acceptation |
|---|---|---|
| Couverture lignes | < 70 % | ≥ 80 % |
| Couverture branches | < 65 % | ≥ 75 % |
| Tests en échec | > 0 | 0 |
| Durée suite E2E | > 10 min | < 5 min |

### Performance

| Indicateur | Seuil de refus | Seuil d'acceptation |
|---|---|---|
| LCP (mobile) | > 4 s | < 2.5 s |
| Score Lighthouse Performance | < 70 | ≥ 80 |
| Score Lighthouse Accessibilité | < 80 | ≥ 90 |

### Anomalies

| Criticité | Seuil de refus (recette) |
|---|---|
| Bloquante | ≥ 1 |
| Majeure | > [N à définir] |

---

## 8. Processus de gestion des anomalies

1. **Détection** : le testeur ouvre une fiche anomalie (template
   section 5 du SKILL.md principal).
2. **Qualification** : le prestataire confirme la criticité sous
   24h.
3. **Correction** : selon les délais par criticité.
4. **Levée** : le testeur vérifie la correction et clôture la
   fiche.
5. **Refus** : si le prestataire conteste, revue contradictoire
   sous 48h.

---

## 9. Conditions de réception

### Réceptionné sans réserve
Tous les seuils atteints, 0 anomalie bloquante ou majeure ouverte.

### Réceptionné avec réserves
0 anomalie bloquante. Les réserves (anomalies mineures) sont
listées dans le PVR avec un plan de levée daté.

### Refusé
≥ 1 anomalie bloquante ouverte OU seuils critiques non atteints.
Un nouveau cycle de recette est planifié.

---

## 10. Signatures

| Rôle | Nom | Date | Signature |
|---|---|---|---|
| Représentant client | | | |
| Chef de projet client | | | |
| Chef de projet prestataire | | | |
| Responsable technique | | | |
