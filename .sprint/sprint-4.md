# Sprint 4 — Pages métier : dashboards, listes et fiches

**Projet :** Roadmap Unanima Platform
**Période :** 2026-05-04 → 2026-05-17
**Objectif :** Implémenter les pages principales de chaque application : tableau de bord, listes de données et fiches de détail.
**Vélocité de référence :** Sprint 2 = 12 issues/5 jours → Sprint 3 estimé ~11 issues

---

## Pré-requis (vérifier avant démarrage)

- [ ] Sprint 3 mergé dans `master`
- [ ] Schémas BDD appliqués sur les 3 projets Supabase
- [ ] Types TypeScript Supabase générés et à jour
- [ ] Route handlers API fonctionnels (`/api/beneficiaires`, `/api/etablissements`, `/api/interventions`)
- [ ] Tests API passent (`pnpm test`)
- [ ] `pnpm build` passe pour les 3 apps

---

## Phase 1 — Dashboards par app (parallélisable)

Première page visible par l'utilisateur après login. Utilise les composants `@unanima/dashboard` (KPICard, AlertPanel, ChartWrapper).

| Ordre | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|----------|--------|--------|-----------|--------|
| 1 | Dashboard consultant Links : KPIs, alertes, graphique bilans | 🔴 Critique | M | ergonomix, datanalytix | Sprint 3 #8 | — |
| 2 | Dashboard bénéficiaire Links : progression bilan, prochaines étapes | 🟠 Haute | S | ergonomix | Sprint 3 #8 | — |
| 3 | Dashboard direction CREAI : KPIs, graphiques indicateurs | 🔴 Critique | M | ergonomix, datanalytix | Sprint 3 #9 | — |
| 4 | Dashboard SAV Omega : KPIs temps réel, alertes stock | 🔴 Critique | M | ergonomix, datanalytix | Sprint 3 #10 | — |

### Détail tâche #1 — Dashboard consultant Links

**Fichier :** `apps/links/src/app/(protected)/dashboard/page.tsx` (remplace le placeholder actuel)

**Composants utilisés :**
- `<KPICard>` de `@unanima/dashboard` : Bénéficiaires actifs, Bilans en cours, Bilans terminés, Taux complétion moyen
- `<AlertPanel>` : Bilans proches de l'échéance (< 7 jours), Questionnaires non remplis
- `<ChartWrapper>` : Évolution des bilans par mois (bar chart Recharts)

**Data fetching :**
- Server Component avec `fetch` côté serveur via les helpers CRUD (Sprint 3 #5)
- Agrégation SQL pour les KPIs (count, avg) — via route `/api/bilans?aggregate=true` ou helper dédié

**États gérés :**
- État vide (nouveau consultant, pas de bénéficiaires) : illustration + message + CTA "Ajouter un bénéficiaire"
- État chargement : `<Skeleton>` de `@unanima/core`
- État erreur : `<AlertPanel severity="error">`

**Critères d'acceptation :**
```gherkin
Feature: Dashboard consultant Links
  Scenario: Affichage des KPIs corrects
    Given je suis connecté en tant que consultant avec 3 bénéficiaires actifs et 2 bilans en cours
    When la page /dashboard se charge
    Then je vois KPI "Bénéficiaires actifs" = 3
    And je vois KPI "Bilans en cours" = 2

  Scenario: État vide pour nouveau consultant
    Given je suis connecté en tant que consultant sans bénéficiaires
    When la page /dashboard se charge
    Then je vois un message "Aucun bénéficiaire pour le moment"
    And je vois un bouton "Ajouter un bénéficiaire"

  Scenario: Alertes affichées
    Given un bilan avec date_fin dans 3 jours
    When la page /dashboard se charge
    Then une alerte "Bilan proche de l'échéance" est visible
```

### Détail tâche #3 — Dashboard direction CREAI

**Fichier :** `apps/creai/src/app/(protected)/dashboard/page.tsx`

**Composants :**
- `<KPICard>` : Nb établissements suivis, Diagnostics en cours, Recommandations ouvertes, Score moyen indicateurs
- `<ChartWrapper>` : Répartition par type d'établissement (pie), Évolution indicateurs (line)
- `<AlertPanel>` : Échéances de rapports, Indicateurs sous seuil

### Détail tâche #4 — Dashboard SAV Omega

**Fichier :** `apps/omega/src/app/(protected)/dashboard/page.tsx`

**Composants :**
- `<KPICard>` : Interventions ouvertes, Délai moyen (jours), Taux résolution 1er passage, Pièces en alerte stock
- `<ChartWrapper>` : Interventions/semaine (bar), Répartition par type (pie)
- `<AlertPanel>` : Interventions priorité haute non affectées, Stock pièces sous seuil

### Point de contrôle Phase 1

- [ ] 4 dashboards affichent des données réelles depuis les API Sprint 3
- [ ] KPIs calculés correctement (vérifier avec données de test connues)
- [ ] États vides gérés pour les 3 apps (nouveau projet sans données)
- [ ] Responsive (mobile : KPIs empilés, desktop : grille 2x2 ou 4 colonnes)
- [ ] `pnpm build` passe

---

## Phase 2 — Pages listes (parallélisable par app)

Listes paginées, triables et filtrables utilisant `<DataTable>` de `@unanima/dashboard`.

| Ordre | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|----------|--------|--------|-----------|--------|
| 5 | Liste des bénéficiaires Links (`/beneficiaires`) | 🟠 Haute | M | ergonomix | #1 | — |
| 6 | Liste des bilans Links (`/bilans`) | 🟠 Haute | M | ergonomix | #1 | — |
| 7 | Liste des établissements CREAI (`/etablissements`) | 🟠 Haute | M | ergonomix | #3 | — |
| 8 | Liste des interventions Omega (`/interventions`) | 🟠 Haute | M | ergonomix | #4 | — |
| 9 | Liste des pièces détachées Omega (`/pieces`) | 🟡 Moyenne | S | ergonomix | #4 | — |

### Fichiers à créer

- `apps/links/src/app/(protected)/beneficiaires/page.tsx`
- `apps/links/src/app/(protected)/bilans/page.tsx`
- `apps/creai/src/app/(protected)/etablissements/page.tsx`
- `apps/omega/src/app/(protected)/interventions/page.tsx`
- `apps/omega/src/app/(protected)/pieces/page.tsx`

### Pattern commun pour les listes

```typescript
// apps/links/src/app/(protected)/beneficiaires/page.tsx
import { DataTable, SearchBar, StatusBadge } from '@unanima/dashboard'
import { getBeneficiaires } from '@/lib/api/beneficiaires'

export default async function BeneficiairesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; statut?: string }>
}) {
  const params = await searchParams
  const { data, meta } = await getBeneficiaires({
    page: Number(params.page ?? '1'),
    search: params.search,
    statut: params.statut,
  })

  return (
    <div>
      <SearchBar placeholder="Rechercher un bénéficiaire..." />
      <DataTable columns={columns} data={data} meta={meta} />
    </div>
  )
}
```

**Éléments par liste :**
- `<SearchBar>` : recherche textuelle multi-champs
- `<DataTable>` : colonnes configurées, tri sur header, pagination en pied
- Filtres : `<StatusBadge>` cliquable, sélecteur de dates si pertinent
- Actions par ligne : Voir (lien), Modifier, Supprimer (selon permissions)
- Bouton "Nouveau" (selon permissions)
- État vide : illustration + message + CTA

### Détail tâche #5 — Liste bénéficiaires Links

**Colonnes :** Nom, Email, Consultant assigné, Statut (`<StatusBadge>`), Dernier bilan, Date inscription
**Filtres :** statut (actif/inactif), consultant (dropdown)
**Actions :** Voir fiche, Créer bilan
**Permissions :** consultant voit ses bénéficiaires, super_admin voit tout

**Critères d'acceptation :**
```gherkin
Feature: Liste bénéficiaires
  Scenario: Pagination
    Given 25 bénéficiaires dans la base
    When j'affiche la page 1 avec limit=10
    Then je vois 10 bénéficiaires
    And la pagination indique "Page 1/3"

  Scenario: Recherche textuelle
    Given un bénéficiaire "Jean Dupont"
    When je tape "dupont" dans la recherche
    Then seul "Jean Dupont" est visible

  Scenario: Filtre par statut
    Given 3 bénéficiaires actifs et 2 inactifs
    When je filtre par statut "actif"
    Then je vois 3 résultats
```

### Point de contrôle Phase 2

- [ ] 5 listes paginées fonctionnelles avec données réelles
- [ ] Tri sur chaque colonne (asc/desc)
- [ ] Recherche textuelle fonctionnelle
- [ ] Filtres par statut fonctionnels
- [ ] Permissions respectées (consultant ne voit que ses bénéficiaires)
- [ ] `pnpm build` et `pnpm test` passent

---

## Phase 3 — Pages fiches de détail (parallélisable par app)

Pages de consultation et édition d'un enregistrement unique.

| Ordre | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|----------|--------|--------|-----------|--------|
| 10 | Fiche bénéficiaire Links (`/beneficiaires/[id]`) | 🟠 Haute | M | ergonomix | #5 | — |
| 11 | Formulaire création/édition bénéficiaire Links | 🟠 Haute | M | ergonomix | #10 | — |
| 12 | Fiche bilan Links (`/bilans/[id]`) avec progression | 🟠 Haute | M | ergonomix | #6 | — |
| 13 | Fiche établissement CREAI (`/etablissements/[id]`) | 🟠 Haute | M | ergonomix | #7 | — |
| 14 | Formulaire création/édition établissement CREAI | 🟠 Haute | M | ergonomix | #13 | — |
| 15 | Fiche intervention Omega (`/interventions/[id]`) | 🟠 Haute | M | ergonomix | #8 | — |
| 16 | Formulaire création/édition intervention Omega | 🟠 Haute | M | ergonomix | #15 | — |

### Fichiers à créer

- `apps/links/src/app/(protected)/beneficiaires/[id]/page.tsx`
- `apps/links/src/app/(protected)/beneficiaires/new/page.tsx`
- `apps/links/src/app/(protected)/beneficiaires/[id]/edit/page.tsx`
- `apps/links/src/app/(protected)/bilans/[id]/page.tsx`
- `apps/creai/src/app/(protected)/etablissements/[id]/page.tsx`
- `apps/creai/src/app/(protected)/etablissements/new/page.tsx`
- `apps/creai/src/app/(protected)/etablissements/[id]/edit/page.tsx`
- `apps/omega/src/app/(protected)/interventions/[id]/page.tsx`
- `apps/omega/src/app/(protected)/interventions/new/page.tsx`
- `apps/omega/src/app/(protected)/interventions/[id]/edit/page.tsx`

### Pattern commun pour les fiches

**Layout fiche :**
- Header : titre (nom entité) + `<StatusBadge>` + actions (Modifier, Supprimer)
- Breadcrumb : Dashboard > Bénéficiaires > Jean Dupont
- Onglets (`<Tabs>` de `@unanima/core`) pour les sections
- Mode lecture par défaut, bouton "Modifier" → page `/edit`

**Layout formulaire :**
- Validation Zod côté client (même schéma que l'API)
- `<Input>`, `<Textarea>`, `<Select>` de `@unanima/core`
- Boutons : Sauvegarder (submit), Annuler (retour)
- Suppression via `<Modal>` de confirmation
- `<Toast>` de feedback après chaque action (succès/erreur)

### Détail tâche #10 — Fiche bénéficiaire Links

**Onglets :** Informations personnelles, Bilans (sous-liste), Documents (sous-liste)
**Sidebar :** statut, consultant assigné, dates clés (inscription, dernier bilan)
**Actions :** Modifier, Créer un bilan, Désactiver

**Critères d'acceptation :**
```gherkin
Feature: Fiche bénéficiaire
  Scenario: Affichage des informations
    Given un bénéficiaire "Jean Dupont" avec 2 bilans
    When j'ouvre /beneficiaires/{id}
    Then je vois le nom "Jean Dupont"
    And l'onglet "Bilans" affiche 2 bilans

  Scenario: Création d'un bénéficiaire
    Given je suis sur /beneficiaires/new
    When je remplis le formulaire avec des données valides
    And je clique "Sauvegarder"
    Then je suis redirigé vers /beneficiaires/{new_id}
    And un toast "Bénéficiaire créé avec succès" est affiché

  Scenario: Modification avec validation
    Given je suis sur /beneficiaires/{id}/edit
    When je vide le champ "Nom"
    And je clique "Sauvegarder"
    Then une erreur de validation "Le nom est requis" est affichée
    And aucune modification n'est envoyée à l'API

  Scenario: Suppression avec confirmation
    Given je suis sur /beneficiaires/{id}
    When je clique "Supprimer"
    Then une modale de confirmation apparaît
    When je confirme la suppression
    Then je suis redirigé vers /beneficiaires
    And un toast "Bénéficiaire supprimé" est affiché
```

### Point de contrôle Phase 3

- [ ] 7 fiches de détail affichent les données correctes
- [ ] 6 formulaires de création/édition fonctionnels avec validation Zod
- [ ] Feedback utilisateur (toast succès/erreur) après chaque action
- [ ] Navigation breadcrumb fonctionnelle
- [ ] Responsive (formulaires pleine largeur mobile, 2 colonnes desktop)
- [ ] `pnpm build` et `pnpm test` passent

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Issues totales | 16 |
| Critiques | 3 (#1, #3, #4 — dashboards) |
| Hautes | 12 (#2, #5-#8, #10-#16) |
| Moyennes | 1 (#9) |
| Effort total | XL (8-12 jours) |
| Chemin critique | Sprint 3 → #1 → #5 → #10 → #11 |
| Parallélisme max | 4 (Phase 1) + 5 (Phase 2) + 7 (Phase 3) |

### Estimations par tâche

| Effort | Tâches | Nb |
|--------|--------|----|
| S (< 0.5j) | #2, #9 | 2 |
| M (0.5-1j) | #1, #3, #4, #5, #6, #7, #8, #10-#16 | 14 |

---

## Contraintes d'exécution

- **Base :** `master` (après merge Sprint 3)
- **Build obligatoire** entre chaque phase
- **Tests obligatoires** avant chaque commit
- **Accessibilité :** WCAG AA minimum (labels, focus, contraste)
- **Responsive :** chaque page testée mobile + desktop
- **Format commit :** `feat(scope): description`
- **Scopes :** `links`, `creai`, `omega`, `dashboard`
- **Composants du socle uniquement** : KPICard, DataTable, AlertPanel, etc. — pas de composants ad hoc

---

## Risques et mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Sprint 3 (BDD/API) incomplet | Faible | Fort | Vérifier les pré-requis avant démarrage |
| DataTable ne supporte pas tous les cas | Moyenne | Moyen | Étendre DataTable si nécessaire (contribution au socle) |
| Formulaires trop complexes | Faible | Moyen | Garder les formulaires simples en v1, enrichir en Sprint 5 |
| Performance des dashboards (agrégations lentes) | Moyenne | Moyen | Utiliser des vues matérialisées si nécessaire |
| Incohérence UX entre les 3 apps | Faible | Moyen | Revue ergonomix croisée entre apps |
