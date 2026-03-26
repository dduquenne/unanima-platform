# Sprint R3 — Espace Consultant (Correction conformite chaleureux v3)
**Periode :** 2026-03-26
**Issues :** 4 au total (0 critiques, 0 majeures securite, 4 features UI)
**Source :** GitHub Issues label sprint-r3
**Mode :** Correction de conformite visuelle vs maquettes SVG chaleureux

## Contexte
Les 4 ecrans du Sprint R3 sont fonctionnellement implementes mais leur conformite
visuelle avec les maquettes chaleureux v3 est insuffisante (42-70%).
Ce sprint corrige chaque ecran pour atteindre >= 90% de conformite.

## Checklist exhaustive

| Ordre | Issue | Titre | Priorite | Phase | Skill | Statut |
|-------|-------|-------|----------|-------|-------|--------|
| 1 | #215 | MAQ-04 Dashboard consultant | 🟢 Feature | 1 | ergonomix | ⬜ |
| 2 | #216 | MAQ-05 Fiche beneficiaire consultant | 🟢 Feature | 1 | ergonomix | ⬜ |
| 3 | #217 | MAQ-06 Comptes-rendus de seances | 🟢 Feature | 2 | ergonomix | ⬜ |
| 4 | #218 | MAQ-09 Planification des seances | 🟢 Feature | 2 | ergonomix | ⬜ |

## Dependances
- #215 → #216 (sequentiel : dashboard avant fiche)
- #216 → #217 + #218 (parallele : comptes-rendus et planification apres fiche)

## Corrections communes (appliquees a chaque ecran)
- Border-radius : 16-20px (rounded-2xl / rounded-[18px]) au lieu de 8-12px
- Couleurs chaudes : #FFF8F5, #FFFBF8, #FDFAF7, #FDF6F1 au lieu de #F9FAFB
- Ombres chaudes : rgba(212,160,138,0.12) au lieu de shadow-sm
- Tabs : style pill arrondi au lieu de underline
- Bordures chaudes : #E8D5CA, #F0E6DE au lieu de gris standards

## Verification d'exhaustivite
- [x] Toutes les issues du sprint dans le GitHub Project sont listees ci-dessus
- [x] Aucune issue n'a ete omise ou reportee sans justification
- [x] L'ordre respecte les dependances fonctionnelles
