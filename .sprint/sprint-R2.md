# Sprint R2 — Écrans bénéficiaire Links v3 "chaleureux"

**Periode :** 2026-03-26
**Issues :** 5 au total (0 critiques, 0 majeures, 5 features)
**Source :** GitHub Issues label `sprint-r2`
**Objectif :** Implémenter les écrans bénéficiaire (dashboard, saisie phase, documents) et transversaux (profil, RGPD) selon les maquettes v3

## Checklist exhaustive

| Ordre | Issue | Titre | Priorite | Phase | Skill | Statut |
|-------|-------|-------|----------|-------|-------|--------|
| 1 | #210 | MAQ-02 — Dashboard bénéficiaire | 🟢 Feature | 1 | ergonomix | ✅ Fait (2026-03-26) |
| 2 | #211 | MAQ-03 — Saisie de phase (réponses questionnaire) | 🟢 Feature | 1 | ergonomix | ✅ Fait (2026-03-26) |
| 3 | #212 | MAQ-12 — Documents par phase (vue bénéficiaire) | 🟢 Feature | 1 | ergonomix | ✅ Fait (2026-03-26) |
| 4 | #213 | MAQ-14 — Profil utilisateur | 🟢 Feature | 2 | ergonomix | ✅ Fait (2026-03-26) |
| 5 | #214 | MAQ-15 — Mes données RGPD | 🟢 Feature | 2 | ergonomix | ✅ Fait (2026-03-26) |

## Dependances

```
Chaîne A (parcours bénéficiaire) :
#210 (Dashboard)
 └── #211 (Saisie phase) ← bloqué par #210
      └── #212 (Documents) ← bloqué par #211

Chaîne B (transversal) :
#213 (Profil) ← dépend de #206 (R1 ✅)
 └── #214 (RGPD) ← bloqué par #213

Les deux chaînes sont indépendantes et parallélisables.
```

## Phases

### Phase 1 — Parcours bénéficiaire (séquentiel, chaîne A)
- **#210** : Dashboard bénéficiaire — refonte visuelle v3 chaleureux (M) ✅
- **#211** : Saisie de phase — autosave debounced, validation, compteur questions (L) ✅
- **#212** : Documents par phase — téléchargement, statuts dynamiques (S) ✅

### Phase 2 — Écrans transversaux (séquentiel, chaîne B)
- **#213** : Profil utilisateur — affichage/modification données, changement mdp (S) ✅
- **#214** : Mes données RGPD — export, suppression, audit personnel (M) ✅

## Ordre d'exécution final

1. #210 — Dashboard bénéficiaire (M) ✅
2. #211 — Saisie de phase (L) ✅
3. #212 — Documents par phase (S) ✅
4. #213 — Profil utilisateur (S) ✅
5. #214 — Mes données RGPD (M) ✅

## Verification d'exhaustivite

- [x] Toutes les issues du sprint dans le GitHub Project sont listées ci-dessus (5/5)
- [x] Aucune issue n'a été omise ou reportée sans justification
- [x] L'ordre respecte la règle : fondations > features dépendantes > features indépendantes
- [x] Build vert après chaque issue
- [x] 5/5 issues implémentées et commitées
