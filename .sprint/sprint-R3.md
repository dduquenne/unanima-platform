# Sprint R3 — Écrans consultant Links v3 "chaleureux"

**Periode :** 2026-03-26
**Issues :** 4 au total (0 critiques, 0 majeures, 4 features)
**Source :** GitHub Issues label `sprint-r3`
**Objectif :** Ré-implémenter les écrans consultant (dashboard, fiche bénéficiaire, comptes-rendus, planification) selon les maquettes v3 chaleureux

## Checklist exhaustive

| Ordre | Issue | Titre | Priorite | Phase | Skill | Statut |
|-------|-------|-------|----------|-------|-------|--------|
| 1 | #215 | MAQ-04 — Dashboard consultant | 🟢 Feature | 1 | ergonomix | ⬜ À faire |
| 2 | #216 | MAQ-05 — Fiche bénéficiaire (vue consultant) | 🟢 Feature | 1 | ergonomix | ⬜ À faire |
| 3 | #217 | MAQ-06 — Comptes-rendus de séances | 🟢 Feature | 2 | ergonomix | ⬜ À faire |
| 4 | #218 | MAQ-09 — Planification des séances | 🟢 Feature | 2 | ergonomix | ⬜ À faire |

## Dependances

```
Chaîne principale (séquentielle) :
#215 (Dashboard consultant)
 └── #216 (Fiche bénéficiaire) ← bloqué par #215
      ├── #217 (Comptes-rendus) ← bloqué par #216
      └── #218 (Planification) ← bloqué par #216

#217 et #218 sont indépendants entre eux (parallélisables en théorie, séquentiels en pratique).
```

## Phases

### Phase 1 — Fondations consultant (séquentiel)
- **#215** : Dashboard consultant — refonte v3 chaleureux avec KPIs, tableau, filtres pill-shaped (M)
- **#216** : Fiche bénéficiaire — profil, progression, 6 cartes de phase, panneau actions rapides (M)

### Phase 2 — Onglets fiche bénéficiaire (séquentiel)
- **#217** : Comptes-rendus — 4 textareas par séance, export PDF, historique latéral (M)
- **#218** : Planification — cartes de séance, formulaire étendu, mini-calendrier (M)

## Ordre d'exécution final

1. #215 — Dashboard consultant (M)
2. #216 — Fiche bénéficiaire (M)
3. #217 — Comptes-rendus de séances (M)
4. #218 — Planification des séances (M)

## Verification d'exhaustivite

- [x] Toutes les issues du sprint dans le GitHub Project sont listées ci-dessus (4/4)
- [ ] Aucune issue n'a été omise ou reportée sans justification
- [ ] L'ordre respecte la règle : fondations > features dépendantes > features indépendantes
- [ ] Build vert après chaque issue
- [ ] 4/4 issues implémentées et commitées
