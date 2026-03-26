# Sprint 13B — Corrections majeures et navigation Links

**Periode :** 2026-03-25
**Issues :** 5 au total (0 critiques, 5 majeures)
**Source :** GitHub Issues label `sprint-13B`, rapport d'audit RPT-0002
**Objectif :** Corriger les écarts majeurs identifiés dans l'audit RPT-0002 (sécurité auth, stubs, navigation)

## Checklist exhaustive

| Ordre | Issue | Titre | Priorité | Phase | Skill | Statut |
|-------|-------|-------|----------|-------|-------|--------|
| ✅ 1 | #189 | Supprimer checkbox "Se souvenir de moi" non conforme RG-AUTH-21 [MAJ-08] | 🟠 Majeur sécurité | 1 | securix | Déjà résolu (2026-03-25) |
| ✅ 2 | #190 | Supprimer ou rediriger les stubs /beneficiaires/* inutilisés [MAJ-04] | 🟠 Majeur qualité | 2 | ergonomix | Fait (2026-03-25) |
| ✅ 3 | #191 | Aligner formulaire création utilisateur sur maquette MAQ-08 [MAJ-07] | 🟠 Majeur qualité | 2 | ergonomix | Déjà conforme (2026-03-25) |
| ✅ 4 | #187 | Implémenter sidebar navigation pour consultant et admin [MAJ-01] | 🟠 Majeur feature | 2 | ergonomix | Fait (2026-03-25) |
| ✅ 5 | #188 | Ajouter sidebar de progression sur la page de saisie de phase [MAJ-02] | 🟠 Majeur feature | 2 | ergonomix | Fait (2026-03-25) |

## Dépendances

- **#189** : indépendante (login page uniquement) → Phase 1 (sécurité)
- **#190 → #191** : #190 redirige/supprime `beneficiaires/nouveau`, #191 touche aussi cette route → #190 d'abord
- **#187 → #188** : #187 modifie le layout `(protected)/layout.tsx`, #188 ajoute une sidebar dans une page interne → #187 d'abord
- #191 et #187 sont indépendantes entre elles

## Verification d'exhaustivité

- [x] Toutes les issues du sprint dans le GitHub Project sont listées ci-dessus
- [x] Aucune issue n'a été omise ou reportée sans justification
- [x] L'ordre respecte la règle sécurité > features > mineurs
