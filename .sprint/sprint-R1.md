# Sprint R1 — Refonte visuelle Links v3 "chaleureux" (Auth + Layout)

**Periode :** 2026-03-26
**Issues :** 5 au total (0 critiques, 0 majeures, 5 features)
**Source :** GitHub Issues label `sprint-r1`
**Objectif :** Ré-implémenter le thème chaleureux, le layout partagé et les écrans d'authentification selon les maquettes v3

## Checklist exhaustive

| Ordre | Issue | Titre | Priorite | Phase | Skill | Statut |
|-------|-------|-------|----------|-------|-------|--------|
| 1 | #205 | Thème chaleureux + Layout partagé (sidebar, header, variables CSS) | 🟢 Fondation | 1 | ergonomix | ⬜ |
| 2 | #206 | MAQ-01 — Écran de connexion (Login) | 🟢 Feature | 2 | ergonomix | ⬜ |
| 3 | #207 | MAQ-10 — Demande de réinitialisation de mot de passe | 🟢 Feature | 2 | ergonomix | ⬜ |
| 4 | #208 | MAQ-11 — Changement de mot de passe via lien de réinitialisation | 🟢 Feature | 2 | ergonomix | ⬜ |
| 5 | #209 | MAQ-19 — Page d'erreur 404 | 🟢 Feature | 2 | ergonomix | ⬜ |

## Dependances

```
#205 (Thème + Layout)
 ├── #206 (Login) ← bloqué par #205
 │    └── #207 (Reset request) ← bloqué par #206
 │         └── #208 (Reset change) ← bloqué par #207
 └── #209 (404) ← bloqué par #205
```

## Phases

### Phase 1 — Fondation (séquentiel, bloquant)
- **#205** : Thème CSS chaleureux + Layout protégé (sidebar+header) + Layout public

### Phase 2 — Écrans d'authentification + 404 (séquentiel sur chaîne auth, #209 indépendant)
- **#206** : Écran login (dépend de #205)
- **#207** : Reset password request (dépend de #206 pour le layout split-screen)
- **#208** : Reset password change (dépend de #207)
- **#209** : Page 404 (dépend de #205 uniquement, parallélisable avec #206-#208)

## Ordre d'exécution final

1. #205 — Thème + Layout (M)
2. #206 — Login (S)
3. #207 — Reset request (S)
4. #208 — Reset change (S)
5. #209 — 404 (XS)

## Verification d'exhaustivite

- [x] Toutes les issues du sprint dans le GitHub Project sont listées ci-dessus (5/5)
- [x] Aucune issue n'a été omise ou reportée sans justification
- [x] L'ordre respecte la règle : fondations > features dépendantes > features indépendantes
