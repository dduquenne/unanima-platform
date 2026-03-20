# Sprint 4 — Pages métier : dashboards, listes et fiches

**Projet :** Roadmap Unanima Platform
**Période :** 2026-05-04 → 2026-05-17
**Objectif :** Implémenter les pages principales de chaque application : tableau de bord, listes de données et fiches de détail.

---

## Phase 1 — Dashboards par app (parallélisable)

Première page visible par l'utilisateur après login. Utilise les composants `@unanima/dashboard`.

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| 1 | Dashboard consultant Links : KPIs (nb bénéficiaires, bilans en cours, taux complétion), alertes | 🔴 Critique | ergonomix, datanalytix | Sprint 3 API | — |
| 2 | Dashboard bénéficiaire Links : progression du bilan, prochaines étapes, documents récents | 🟠 Haute | ergonomix | Sprint 3 API | — |
| 3 | Dashboard direction CREAI : KPIs (nb établissements, diagnostics en cours, indicateurs clés), graphiques | 🔴 Critique | ergonomix, datanalytix | Sprint 3 API | — |
| 4 | Dashboard SAV Omega : KPIs temps réel (interventions ouvertes, délai moyen, taux résolution), alertes stock | 🔴 Critique | ergonomix, datanalytix | Sprint 3 API | — |

**Détail issue #1 — Dashboard consultant Links :**
- `<KPICard>` : Nombre de bénéficiaires actifs, Bilans en cours, Bilans terminés, Taux de complétion moyen
- `<AlertPanel>` : Bilans proches de l'échéance, Questionnaires non remplis
- `<ChartWrapper>` : Évolution des bilans par mois (bar chart)
- Données chargées via API `/api/bilans?statut=en_cours` et agrégations
- Server Component avec fetch côté serveur

**Détail issue #3 — Dashboard direction CREAI :**
- `<KPICard>` : Nb établissements suivis, Diagnostics en cours, Recommandations ouvertes, Score moyen des indicateurs
- `<ChartWrapper>` : Répartition par type d'établissement (pie chart), Évolution des indicateurs (line chart)
- `<AlertPanel>` : Échéances de rapports, Indicateurs en dessous du seuil

**Détail issue #4 — Dashboard SAV Omega :**
- `<KPICard>` : Interventions ouvertes, Délai moyen de traitement (jours), Taux de résolution premier passage, Pièces en alerte stock
- `<ChartWrapper>` : Interventions par semaine (bar chart), Répartition par type (pie chart)
- `<AlertPanel>` : Interventions priorité haute non affectées, Stock pièces sous seuil

**Point de contrôle Phase 1 :**
- [ ] Dashboards affichent des données réelles depuis les API
- [ ] KPIs calculés correctement
- [ ] Responsive (mobile/desktop)
- [ ] States vides gérés (nouveau projet sans données)
- [ ] `pnpm build` passe

---

## Phase 2 — Pages listes (parallélisable par app)

Listes paginées, triables et filtrables utilisant `<DataTable>` de `@unanima/dashboard`.

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| 5 | Liste des bénéficiaires Links (`/beneficiaires`) | 🟠 Haute | ergonomix | #1 | — |
| 6 | Liste des bilans Links (`/bilans`) | 🟠 Haute | ergonomix | #1 | — |
| 7 | Liste des établissements CREAI (`/etablissements`) | 🟠 Haute | ergonomix | #3 | — |
| 8 | Liste des interventions Omega (`/interventions`) | 🟠 Haute | ergonomix | #4 | — |
| 9 | Liste des pièces détachées Omega (`/pieces`) | 🟡 Moyenne | ergonomix | #4 | — |

**Pattern commun pour les listes :**
- `<SearchBar>` : recherche textuelle multi-champs
- `<DataTable>` : colonnes configurées par entité, tri, pagination
- Filtres : `<StatusBadge>` pour le statut, sélecteur de dates
- Actions par ligne : voir, modifier, supprimer (selon permissions)
- Bouton "Nouveau" (selon permissions)
- Export CSV (optionnel, Sprint 5 si temps)
- Gestion état vide : illustration + message + CTA

**Détail issue #5 — Liste bénéficiaires Links :**
- Colonnes : Nom, Email, Consultant assigné, Statut, Dernier bilan, Date inscription
- Filtres : statut (actif/inactif), consultant
- Actions : Voir fiche, Créer bilan
- Permissions : consultant voit ses bénéficiaires, super_admin voit tout

**Point de contrôle Phase 2 :**
- [ ] Listes paginées fonctionnelles avec données réelles
- [ ] Tri et recherche fonctionnels
- [ ] Filtres par statut fonctionnels
- [ ] Permissions respectées (données visibles selon le rôle)
- [ ] `pnpm build` et `pnpm test` passent

---

## Phase 3 — Pages fiches de détail (parallélisable par app)

Pages de consultation et édition d'un enregistrement unique.

| Ordre | Titre | Priorité | Skills | Dépend de | Review |
|-------|-------|----------|--------|-----------|--------|
| 10 | Fiche bénéficiaire Links (`/beneficiaires/[id]`) | 🟠 Haute | ergonomix | #5 | — |
| 11 | Formulaire création/édition bénéficiaire Links | 🟠 Haute | ergonomix | #10 | — |
| 12 | Fiche bilan Links (`/bilans/[id]`) avec progression | 🟠 Haute | ergonomix | #6 | — |
| 13 | Fiche établissement CREAI (`/etablissements/[id]`) | 🟠 Haute | ergonomix | #7 | — |
| 14 | Formulaire création/édition établissement CREAI | 🟠 Haute | ergonomix | #13 | — |
| 15 | Fiche intervention Omega (`/interventions/[id]`) | 🟠 Haute | ergonomix | #8 | — |
| 16 | Formulaire création/édition intervention Omega | 🟠 Haute | ergonomix | #15 | — |

**Pattern commun pour les fiches :**
- Layout : header avec titre + `<StatusBadge>` + actions
- Onglets (`<Tabs>` de `@unanima/core`) pour les sections
- Mode lecture par défaut, bouton "Modifier" bascule en mode édition
- Formulaires : validation Zod côté client, `<Input>`, `<Textarea>` de `@unanima/core`
- Boutons : Sauvegarder, Annuler, Supprimer (avec confirmation `<Modal>`)
- `<Toast>` de feedback après chaque action
- Breadcrumb pour la navigation retour

**Détail issue #10 — Fiche bénéficiaire Links :**
- Onglets : Informations personnelles, Bilans (liste), Documents (liste)
- Sidebar : statut, consultant assigné, dates clés
- Actions : Modifier, Créer un bilan, Désactiver

**Point de contrôle Phase 3 :**
- [ ] Fiches de détail affichent les données correctes
- [ ] Formulaires de création/édition fonctionnels avec validation
- [ ] Feedback utilisateur (toast succès/erreur)
- [ ] Navigation breadcrumb fonctionnelle
- [ ] `pnpm build` et `pnpm test` passent

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Issues totales | 16 |
| Critiques | 3 (#1, #3, #4) |
| Hautes | 11 (#2, #5-#8, #10-#16) |
| Moyennes | 1 (#9) |
| Chemin critique | Sprint 3 → #1 → #5 → #10 → #11 |
| Parallélisme max | 3 dashboards (Phase 1) + 5 listes (Phase 2) + 7 fiches (Phase 3) |
| Effort estimé | ~8-12 jours |

---

## Contraintes d'exécution

- **Base :** `master` (après merge Sprint 3)
- **Build obligatoire** entre chaque phase
- **Tests obligatoires** avant chaque commit
- **Accessibilité :** WCAG AA minimum (labels, focus, contraste)
- **Responsive :** chaque page testée mobile + desktop
- **Format commit :** `feat(scope): description (closes #XX)`
- **Scopes :** `links`, `creai`, `omega`, `dashboard`
