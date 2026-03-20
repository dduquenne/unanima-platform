# Patterns d'exécution Sprintix

## Pattern 1 — Sprint linéaire simple

Le cas le plus courant : issues ordonnées séquentiellement sans parallélisme.

```
#44 → #52 → #51 → #53 → #56 → #57 → #45
```

**Quand l'utiliser :** Sprint avec < 10 issues, toutes dans le même domaine.

**Exécution :**
```
Pour chaque issue dans l'ordre :
  1. /issue #N
  2. Valider (build + tests)
  3. Commiter
  4. Passer à la suivante
```

---

## Pattern 2 — Sprint par phases

Issues groupées en phases avec points de contrôle.

```
Phase 1 (séquentiel) : #44 → #52
  ── checkpoint ──
Phase 2 (parallélisable) : #51, #53, #56, #57
  ── checkpoint ──
Phase 3 (review) : #45
  ── checkpoint + review humain ──
```

**Quand l'utiliser :** Sprint avec dépendances entre groupes d'issues.

**Exécution :**
```
Pour chaque phase :
  Si séquentielle :
    Exécuter les issues dans l'ordre
  Si parallélisable :
    Exécuter dans l'ordre indiqué (séquentiel en pratique, mais l'ordre intra-phase n'est pas critique)
  Checkpoint : build + tests
  Si review : pause + validation humaine
```

---

## Pattern 3 — Sprint multi-domaines

Issues réparties entre plusieurs domaines (socle, apps).

```
Domaine Socle : #44, #52, #51, #53
Domaine Links : #30, #31
Domaine CREAI : #35
```

**Quand l'utiliser :** Sprint qui combine corrections de socle et features d'apps.

**Règle :** Toujours commencer par le socle (les apps en dépendent).

---

## Pattern 4 — Sprint de rattrapage

Quand un sprint précédent a laissé des issues non terminées.

```
Sprint N-1 restant : #45 (reporté)
Sprint N : #47, #48, #50, #43, #58
```

**Exécution :**
1. Commencer par les issues reportées du sprint précédent
2. Enchaîner avec les nouvelles issues du sprint courant

---

## Cas limites

### Issue plus grosse que prévu

**Symptôme :** L'implémentation d'une issue prend significativement plus de temps que l'estimation.

**Action :**
1. Signaler à l'utilisateur
2. Proposer de découper l'issue en sous-issues
3. Implémenter la partie faisable, reporter le reste
4. Mettre à jour le plan `.sprint/sprint-N.md`

### Dépendance circulaire découverte

**Symptôme :** L'issue #A nécessite des modifications qui impactent l'issue #B qui avait été traitée avant.

**Action :**
1. Implémenter #A en tenant compte de #B
2. Vérifier que #B fonctionne toujours (build + tests)
3. Si régression sur #B → corriger dans le même commit que #A

### Issue devenue obsolète

**Symptôme :** Une issue précédente a déjà résolu le problème.

**Action :**
1. Vérifier que le problème est effectivement résolu
2. Commenter l'issue GitHub avec l'explication
3. Fermer l'issue avec le label `wontfix` ou `duplicate`
4. Cocher dans le plan et passer à la suivante

### Conflit entre corrections

**Symptôme :** Deux issues modifient le même fichier de manière conflictuelle.

**Action :**
1. Identifier la correction prioritaire (celle avec la priorité la plus haute)
2. Implémenter dans l'ordre de priorité
3. Adapter la seconde correction pour être compatible avec la première

---

## Métriques de suivi

### Vélocité

```
vélocité = nombre d'issues terminées / durée du sprint (jours)
```

### Taux de complétion

```
complétion = issues terminées / issues planifiées × 100
```

### Taux de report

```
report = issues reportées au sprint suivant / issues planifiées × 100
```

Un taux de report > 20% indique un problème de planification (issues trop grosses, estimation trop optimiste).

---

## Checklist de fin de sprint

- [ ] Toutes les issues du plan sont cochées ou explicitement reportées
- [ ] Le build passe pour toutes les apps
- [ ] Les tests passent
- [ ] Les issues GitHub sont fermées avec le bon commit
- [ ] Les statuts dans le GitHub Project sont à jour
- [ ] Le rapport de sprint est généré
- [ ] Les issues reportées sont déplacées vers le sprint suivant
