# Sprint 13C — Corrections mineures et polish Links

**Periode :** 2026-03-26
**Issues :** 7 au total (0 critiques, 1 majeure, 6 mineures)
**Source :** GitHub Issues label `sprint-13C`, rapport d'audit RPT-0002
**Objectif :** Corriger les écarts mineurs identifiés dans l'audit RPT-0002 (textes, UX, documentation)

## Checklist exhaustive

| Ordre | Issue | Titre | Priorité | Phase | Skill | Statut |
|-------|-------|-------|----------|-------|-------|--------|
| ✅ 1 | #197 | Mettre à jour SPC-0004 matrice de traçabilité avec couverture réelle [MAJ-06] | 🟠 Majeur qualité | 1 | documentalix | Fait (2026-03-26) |
| ✅ 2 | #192 | Corriger les accents manquants dans les textes consultant [MIN-01] | 🟡 Mineur | 2 | ergonomix | Fait (2026-03-26) |
| 3 | #193 | Remplacer les entités HTML par des caractères UTF-8 [MIN-02] | 🟡 Mineur | 2 | ergonomix | ⬜ |
| 4 | #194 | Corriger le bouton "Planifier" trompeur sur le dashboard bénéficiaire [MIN-03] | 🟡 Mineur | 2 | ergonomix | ⬜ |
| 5 | #195 | Ajouter toasts d'erreur sur les appels API silencieux [MIN-07] | 🟡 Mineur | 2 | ergonomix | ⬜ |
| 6 | #196 | Fusionner les pages profil et mes-données en une seule page [MIN-05] | 🟡 Mineur | 2 | ergonomix | ⬜ |
| 7 | #198 | Implémenter notification email planification de séances [US-CON-08] | 🟡 Mineur | 3 | integratix | ⚠️ REVIEW |

## Dépendances

- **#197** : indépendante (docs uniquement) → Phase 1
- **#192** : indépendante (pages consultant uniquement, pas dashboard/page.tsx)
- **#193 → #194 → #195** : les 3 touchent `dashboard/page.tsx` → séquentiels dans cet ordre
- **#196** : indépendante (pages profil uniquement)
- **#198** : prérequis client non validé (hypothèse H1 vs H2) → Phase 3, ⚠️ REVIEW obligatoire

## Phases

### Phase 1 — Qualité documentation (séquentiel)
- #197 : mise à jour matrice de traçabilité

### Phase 2 — Corrections mineures (semi-parallélisable)
- #192 (indépendant), #193 → #194 → #195 (séquentiels sur dashboard/page.tsx), #196 (indépendant)

### Phase 3 — Feature avec review client (⚠️ REVIEW)
- #198 : nécessite validation hypothèse H1/H2 par le client avant implémentation

## Verification d'exhaustivité

- [x] Toutes les issues du sprint dans le GitHub Project sont listées ci-dessus
- [x] Aucune issue n'a été omise ou reportée sans justification
- [x] L'ordre respecte la règle sécurité > qualité > features > mineurs
