# Sprint R4 — Écrans admin + pages légales Links v3 "chaleureux"

**Periode :** 2026-03-26
**Issues :** 6 au total (0 critiques, 0 majeures, 6 features)
**Source :** GitHub Issues label `sprint-r4`
**Objectif :** Ré-implémenter les écrans admin (dashboard, utilisateurs, documents) et les pages légales (mentions, confidentialité, cookies) selon les maquettes v3 chaleureux

## Checklist exhaustive

| Ordre | Issue | Titre | Priorite | Phase | Skill | Statut |
|-------|-------|-------|----------|-------|-------|--------|
| 1 | #219 | MAQ-07 — Dashboard admin (KPIs et supervision) | 🟢 Feature | 1 | ergonomix | ✅ Fait |
| 2 | #222 | MAQ-16 — Mentions légales | 🟢 Feature | 2 | ergonomix | ✅ Fait |
| 3 | #223 | MAQ-17 — Politique de confidentialité | 🟢 Feature | 2 | ergonomix | ✅ Fait |
| 4 | #224 | MAQ-18 — Gestion des cookies | 🟢 Feature | 2 | ergonomix | ✅ Fait |
| 5 | #220 | MAQ-08 — Gestion des utilisateurs (admin) | 🟢 Feature | 2 | ergonomix | ✅ Fait |
| 6 | #221 | MAQ-13 — Gestion des documents par phase (admin) | 🟢 Feature | 2 | ergonomix | ✅ Fait |

## Dependances

```
Chaîne A (admin) :
#219 (Dashboard admin) ← dépend de #206 (R1 ✅)
 ├── #220 (Gestion utilisateurs) ← bloqué par #219
 └── #221 (Gestion documents) ← bloqué par #219

Chaîne B (pages légales, indépendantes entre elles) :
#222 (Mentions légales) ← dépend de #205 (R1 ✅)
#223 (Confidentialité) ← dépend de #205 (R1 ✅)
#224 (Cookies) ← dépend de #205 (R1 ✅)

Les deux chaînes sont indépendantes et parallélisables.
```

## Phases

### Phase 1 — Fondation admin (séquentiel, bloquant)
- **#219** : Dashboard admin — refonte visuelle v3 avec KPIs chaleureux, tableau supervision, alertes inactivité (M)

### Phase 2 — Écrans admin + pages légales (parallélisable)
- **#222** : Mentions légales — refonte v3 avec layout public, cartes sections, footer (XS)
- **#223** : Politique de confidentialité — refonte v3 avec onglets, cartes articles, DPO (XS)
- **#224** : Gestion des cookies — refonte v3 avec toggles, catégories, tableau détaillé (S)
- **#220** : Gestion utilisateurs — refonte v3 avec filtres pills, modale création, tableau (L)
- **#221** : Gestion documents admin — refonte v3 avec onglets phase, drag-and-drop, résumé (M)

## Ordre d'exécution final

1. #219 — Dashboard admin (M)
2. #222 — Mentions légales (XS)
3. #223 — Politique de confidentialité (XS)
4. #224 — Gestion des cookies (S)
5. #220 — Gestion des utilisateurs (L)
6. #221 — Gestion des documents admin (M)

## Verification d'exhaustivite

- [x] Toutes les issues du sprint dans le GitHub Project sont listées ci-dessus (6/6)
- [x] Aucune issue n'a été omise ou reportée sans justification
- [x] L'ordre respecte la règle : fondations > features dépendantes > features indépendantes
- [x] Build vert après chaque issue
- [x] 6/6 issues implémentées et commitées
