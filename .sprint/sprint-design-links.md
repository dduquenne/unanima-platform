# Sprint correctif Design — Links : Charte graphique & Ergonomie

**Projet :** Link's Accompagnement — MVP v1
**Période :** À insérer entre Sprint 9 (terminé) et Sprint 10 (non démarré)
**Objectif :** Aligner l'UI de l'app Links sur la charte graphique validée (SPC-0003, RT-04) et les maquettes MAQ-01 à MAQ-09. Éliminer toute couleur hardcodée et intégrer les composants du socle.

---

## Diagnostic d'origine

L'audit UI a révélé 4 problèmes majeurs :

1. **Palette non conforme** — `theme.css` dévie de SPC-0003 sur 4 couleurs (success, warning, background, text)
2. **55+ couleurs en dur** — Hex hardcodés et classes Tailwind par défaut au lieu des variables CSS
3. **Layout non conforme aux maquettes** — Header blanc au lieu de bleu foncé, pas de logo, pas d'avatar
4. **Ergonomie dégradée** — Dashboard en liste au lieu de tableau, éléments décoratifs absents des maquettes

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Issues totales | 7 (#150, #151, #152, #153, #154, #155, #157) |
| Critiques (P0) | 4 (#150, #151, #152, #154) |
| Hautes (P1) | 3 (#153, #155, #157) |
| Chemin critique | #150 → #151 → #152 → #154 |
| Parallélisme max | 3 (Phase 3 : #153, #155, #157) |
| Effort estimé | ~3-4 jours |

---

## Phase 1 — Fondation thème (séquentiel, bloquant)

Corriger la source de vérité CSS puis purger les valeurs en dur.

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 1 | #150 | Aligner theme.css sur la palette SPC-0003 (RT-04) | 🔴 P0 | S | ergonomix, accessibilix | — | ⚠️ Vérification contraste WCAG |
| 2 | #151 | Purger les couleurs hardcodées — variables CSS | 🔴 P0 | M | ergonomix, soclix | #150 | |

**Justification de l'ordre :**
- #150 fixe la source de vérité (theme.css) — toutes les autres issues en dépendent
- #151 garantit que les pages utilisent effectivement cette source de vérité

**Point de contrôle Phase 1 :**
- [x] Les 8 couleurs de base dans `theme.css` correspondent exactement à SPC-0003
- [x] Aucune couleur hex hardcodée dans `apps/links/src/app/` (hors email templates)
- [x] Aucune classe Tailwind `gray-*`, `red-*`, `green-*`, `orange-*`, `blue-*` dans les pages
- [x] Contraste WCAG AA vérifié (4.5:1 min)
- [x] `pnpm build --filter=@unanima/links` passe
- [ ] `pnpm test --filter=@unanima/links` passe

---

## Phase 2 — Intégration maquettes (séquentiel pour layout, parallélisable ensuite)

Refondre les composants visuels principaux pour correspondre aux maquettes validées.

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 3 | #152 | Refondre header et sidebar selon MAQ-02/04 | 🔴 P0 | M | ergonomix, archicodix | #150, #151 | ⚠️ Conformité maquette |
| 4 | #154 | Refondre dashboard bénéficiaire selon MAQ-02 | 🔴 P0 | M | ergonomix | #150, #151, #152 | ⚠️ Conformité maquette |

**Justification de l'ordre :**
- #152 (layout) doit être fait avant #154 (dashboard) car le header/sidebar encadre le contenu
- #154 est la page la plus visible et la plus utilisée — priorité maximale

**Point de contrôle Phase 2 :**
- [x] Header fond bleu foncé avec logo Links, avatar utilisateur, nom + rôle
- [x] Navigation avec icônes Lucide et onglet actif stylé (tabs horizontaux, pas sidebar)
- [x] Dashboard bénéficiaire : tableau séances, badges numérotés, progression détaillée
- [x] Cards de phases avec cercle numéroté + StatusBadge
- [x] Rendu conforme aux maquettes MAQ-02 et MAQ-04
- [x] `pnpm build --filter=@unanima/links` passe
- [ ] `pnpm test --filter=@unanima/links` passe

---

## Phase 3 — Cohérence transverse (parallélisable)

Pages secondaires et templates email.

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 5 | #153 | Refondre page login selon MAQ-01 | 🟠 P1 | S | ergonomix | #150, #151 | |
| 6 | #155 | Centraliser couleurs email dans EMAIL_THEME | 🟠 P1 | S | soclix | #150 | |
| 7 | #157 | Refondre page reset-password — variables CSS + UX | 🟠 P1 | S | ergonomix | #150, #151 | |

**Justification :**
- Ces 3 issues sont indépendantes entre elles et parallélisables
- Elles dépendent de la Phase 1 (palette + purge) mais pas de la Phase 2

**Point de contrôle Phase 3 :**
- [x] Login conforme à MAQ-01 (logo, icônes, barre décorative, section aide)
- [x] Reset-password sans aucune classe Tailwind par défaut (red/green/orange/gray)
- [x] Templates email utilisent `EMAIL_THEME` centralisé, aucun hex en dur
- [x] `pnpm build --filter=@unanima/links` passe
- [ ] `pnpm test --filter=@unanima/links` passe

---

## Vérification d'exhaustivité
- [x] Toutes les issues du sprint sont listées ci-dessus (7/7)
- [x] Aucune issue n'a été omise ou reportée sans justification
- [x] L'ordre respecte la règle fondation > layout > pages > transverse

---

## Contraintes d'exécution

- **Branche :** `claude/plan-links-design-sprint-0Q69B`
- **Base :** `master` (après merge Sprint 9)
- **Build obligatoire** entre chaque phase
- **Tests obligatoires** avant chaque commit
- **Format commit :** `fix(links): description (closes #XX)`
- **Scope :** `links` pour toutes les issues (app-specific)
- **Référence maquettes :** `docs/links/mockups/MAQ-01` à `MAQ-09`
- **Référence specs :** `docs/links/specs/SPC-0003-specifications-fonctionnelles-links-v1.0.md` § RT-04, RT-05, RT-08, RT-09

---

## Prérequis avant démarrage

- [x] Sprint 9 complet (EPIC-AUTH + Espace Bénéficiaire)
- [ ] Maquettes SVG accessibles dans `docs/links/mockups/`
- [ ] Palette SPC-0003 confirmée par le client (logos, HEX définitifs)
