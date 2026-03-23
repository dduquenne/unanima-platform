---
name: ergonomix
description: >
  Conçoit, crée, modifie et améliore des interfaces utilisateur (UI/UX) pour des applications métier TypeScript : ERP, CRM, back-office, tableaux de bord opérationnels, outils internes, formulaires complexes, workflows, grilles de données. Applique les meilleures pratiques IHM (Interaction Homme-Machine) actuelles : lois de Fitts et Hick, charge cognitive, affordances, feedback immédiat, progressive disclosure, WCAG AA, états vides/erreur/chargement. Déclencher ce skill dès qu'une demande touche à : "interface métier", "formulaire", "tableau", "grille", "dashboard", "workflow", "back-office", "outil interne", "ergonomie", "UX métier", "composant admin", "vue liste", "fiche détail", "navigation", "sidebar", "breadcrumb", "filtre", "recherche", "pagination", "modal", "notification", "état vide", "skeleton", "accessibilité", "validation", ou tout fichier dans pages/, app/, components/, features/ d'un projet TypeScript. Priorité absolue : efficacité opérationnelle, clarté, et réduction de la charge cognitive de l'utilisateur métier.
compatibility:
  recommends:
    - maquettix # Pour produire des maquettes SVG avant ou pendant la conception UI
    - archicodix      # Quand l'architecture des composants impacte l'ergonomie (state management, flux de données)
    - testix          # Pour les tests de composants React et les tests E2E des parcours utilisateur
    - apix            # Pour la cohérence du contrat frontend/backend (types partagés, erreurs)
---

# Ergonomix — IHM pour Applications Métier TypeScript

Ce skill gouverne la conception et l'implémentation d'interfaces pour **applications métier** (applications à usage professionnel intensif, distincts des sites grand public). L'utilisateur final est un professionnel qui utilise l'outil quotidiennement, souvent sous contrainte de temps, parfois en situation de stress ou sur plusieurs écrans simultanément.

---

## 0. Philosophie IHM Métier — À intérioriser

> **"L'interface doit disparaître. Seule la tâche doit exister."**

Les applications métier obéissent à des règles opposées aux sites grand public :

| Site grand public | Application métier |
|---|---|
| Séduire au premier coup d'œil | Être efficace à la dixième heure d'utilisation |
| Animations spectaculaires | Feedback instantané, zéro latence perçue |
| Design mémorable | Prévisibilité absolue, conventions stables |
| Mobile-first | Desktop-first (parfois mobile en lecture seule) |
| Découverte progressive | Maîtrise progressive, shortcuts experts |
| Engagement émotionnel | Réduction de la charge cognitive |

---

## 1. Analyse du contexte — Obligatoire avant toute action

### 1.1 Comprendre le métier
Avant d'écrire une ligne de code, identifier :
- **Qui** utilise l'interface ? (rôles, niveaux d'expertise, fréquence d'utilisation)
- **Quelle tâche** doit être accomplie ? (saisie, consultation, validation, reporting)
- **Quel contexte** ? (bureau fixe, terrain, multi-écrans, interruptions fréquentes)
- **Quelles données** sont manipulées ? (volume, criticité, fréquence de mutation)
- **Quels flux** ? (séquentiels / parallèles, avec ou sans validation métier)

### 1.2 Audit du stack technique
```
package.json        → framework, composants UI existants
tailwind.config.*   → design system existant
tsconfig.json       → paths alias (@/), strict mode
/components/ui/     → bibliothèque interne (shadcn/ui, Radix, etc.)
/features/ ou /modules/ → organisation par domaine métier
```

### 1.3 Règle des 3 fichiers
**Toujours lire au moins 3 fichiers existants** avant de créer quoi que ce soit. Respecter les conventions établies : nommage, patterns d'état, gestion des erreurs, i18n.

---

## 2. Principes IHM Métier — Les 10 lois fondamentales

### Loi 1 — Fitts : Taille & proximité des cibles
Les éléments cliqués fréquemment doivent être **grands** et **proches** de là où l'œil/curseur se trouve naturellement.
```
✅ Boutons primaires : min 44×44px (touch), min 32px (desktop dense)
✅ Actions destructives : séparées spatialement des actions fréquentes
✅ CTA principal : position cohérente, jamais caché en bas de scroll
```

### Loi 2 — Hick : Réduire le nombre de choix
Chaque choix supplémentaire augmente le temps de décision. Dans le contexte métier, **filtrer avant de montrer**.
```
✅ Menus : max 7 ± 2 items visibles (regrouper le reste)
✅ Formulaires longs : découpage en étapes ou sections
✅ Tableaux : filtres & recherche en premier, pagination ensuite
```

### Loi 3 — Charge cognitive : Ne jamais forcer la mémorisation
L'utilisateur ne doit jamais avoir à se souvenir d'une information d'un écran à l'autre.
```
✅ Fil d'Ariane (breadcrumb) systématique
✅ Contexte toujours visible : "Fiche client : Dupont SA | Contrat #2024-087"
✅ Valeurs par défaut intelligentes basées sur l'historique
✅ Affichage inline des contraintes (format, longueur) sans tooltip
```

### Loi 4 — Feedback : Chaque action doit produire une réaction visible
```
✅ < 100ms : retour visuel immédiat (hover, focus, pressed)
✅ < 1s    : indicateur de chargement si traitement en cours
✅ < 10s   : progress bar avec estimation pour les opérations longues
✅ Toujours : confirmation de succès, message d'erreur explicite + solution
```

### Loi 5 — Prévention des erreurs avant correction
```
✅ Validation en temps réel (onBlur, pas onSubmit seul)
✅ Confirmation pour actions irréversibles (suppression, envoi, archivage)
✅ Champs avec contraintes : afficher le format attendu AVANT la saisie
✅ Disable + tooltip explicatif plutôt que bouton invisible
```

### Loi 6 — Cohérence & Standards
```
✅ Même action = même raccourci clavier partout (Ctrl+S, Échap, Entrée)
✅ Même couleur = même sémantique (rouge = danger/erreur, vert = succès)
✅ Même position = même type d'information (actions toujours en bas-droite)
✅ Respecter les conventions système de l'OS et du navigateur
```

### Loi 7 — Visibilité du statut système
```
✅ État de chaque enregistrement visible : brouillon, en cours, validé, archivé
✅ Indicateurs de synchronisation (sauvegarde auto, données en cache)
✅ Dernière mise à jour, dernière action, utilisateur concerné
✅ Connexion réseau, état des services tiers si pertinent
```

### Loi 8 — Flexibilité expert / novice
```
✅ Raccourcis clavier documentés et cohérents
✅ Actions rapides (quick actions) sur survol dans les tableaux
✅ Bulk actions pour la sélection multiple
✅ Vues sauvegardables (filtres, colonnes, tri)
✅ Fonctionnalités avancées derrière un toggle "mode avancé"
```

### Loi 9 — Récupération gracieuse des erreurs
```
✅ Messages d'erreur : Quoi s'est passé + Pourquoi + Comment corriger
✅ Jamais "Une erreur est survenue" seul — toujours un code ou une action
✅ Annulation (undo) pour les actions à risque, avec délai
✅ Sauvegarde automatique brouillon pour les formulaires longs
```

### Loi 10 — Densité adaptée au contexte
```
✅ Mode compact disponible pour les utilisateurs experts (tableaux denses)
✅ Mode confortable pour les tâches de lecture et de validation
✅ Pas de whitespace décoratif excessif dans les vues de travail
✅ Hiérarchie visuelle par la taille et la graisse, pas par les marges
```

---

## 3. Anatomie d'une Interface Métier

### 3.1 Structure de navigation standard

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] [Module A] [Module B] [Module C]   [User] [⚙]   │  ← Barre globale
├──────────┬──────────────────────────────────────────────┤
│          │ Module > Section > Fiche                      │  ← Breadcrumb
│ Sidebar  ├──────────────────────────────────────────────┤
│ (nav     │  [Titre de page]          [Actions primaires] │  ← En-tête page
│  locale) ├──────────────────────────────────────────────┤
│          │                                              │
│          │  Zone de contenu principale                  │  ← Contenu
│          │                                              │
│          ├──────────────────────────────────────────────┤
│          │  [Pagination / Résumé]      [Actions batch]  │  ← Pied de liste
└──────────┴──────────────────────────────────────────────┘
```

### 3.2 Hiérarchie des actions

```typescript
// Toujours respecter cette hiérarchie visuelle :
// Primaire   → bouton plein, couleur brand       (1 seul par vue)
// Secondaire → bouton outline                    (2-3 max)
// Tertiaire  → bouton ghost / lien               (actions annexes)
// Danger     → bouton rouge, toujours séparé     (jamais adjacent au primaire)
// Discret    → icône seule + tooltip             (actions contextuelles)
```

---

## 4. Composants Critiques — Patterns Métier

### 4.1 Tableaux de données (DataTable)

Fonctionnalités obligatoires : tri multi-colonnes, filtres + recherche globale, pagination, sélection multiple + bulk actions, visibilité des colonnes, export CSV/Excel, actions inline sur hover, et les 3 états (vide/chargement/erreur).
Voir `references/composants-patterns-code.md` pour l'interface `DataTableFeatures` et le pattern d'actions inline.

### 4.2 Formulaires métier

Architecture robuste : schéma Zod séparé, 4 états (pristine/dirty/submitting/submitted), validation onBlur + onSubmit, sauvegarde auto brouillon si > 5 champs, indicateur "non sauvegardé", erreurs inline ET résumé en haut. Grouper les champs en `<fieldset>` avec `<legend>`.
Voir `references/composants-patterns-code.md` pour les exemples de code.

### 4.3 États vides, chargement et erreur

Tout composant chargeant des données DOIT implémenter 4 états : Loading (skeleton), Empty (illustration + message + action), Error (message + retry + code), Data. Jamais "Aucun résultat" seul.
Voir `references/composants-patterns-code.md` pour le pattern `EmptyState`.

### 4.4 Notifications & Feedback

5 niveaux de feedback selon l'urgence : toast (transitoire 3-5s), banner (persistant), inline (sous le champ), modal (bloquant), badge (compteur nav). Jamais `alert()` natif. Jamais toast d'erreur sans code de référence.
Voir `references/composants-patterns-code.md` pour le type `FeedbackLevel`.

---

## 5. Standards TypeScript & Architecture

### 5.1 Typage strict orienté domaine métier

Utiliser des branded types (`UserId`, `InvoiceId`, `Amount`) pour éviter les primitives seules. Définir des unions discriminées exhaustives pour les états métier. Utiliser `Result<T, E>` plutôt que des exceptions pour le contrôle de flux.
Voir `references/composants-patterns-code.md` pour les exemples de branded types et Result.

### 5.2 Structure de composant métier

Ordre obligatoire : 1) Types/interface des props, 2) Composant fonctionnel avec destructuration, 3) Hooks, 4) Derived state (mémorisation si coûteux), 5) Handlers (useCallback si passé en prop), 6) Render.
Voir `references/composants-patterns-code.md` pour l'exemple `InvoiceRow`.

### 5.3 Conventions de nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Composant | `PascalCase` | `InvoiceTable.tsx` |
| Page/Route | `page.tsx` ou `[id].tsx` | `app/invoices/[id]/page.tsx` |
| Hook | `use` + `PascalCase` | `useInvoiceFilter.ts` |
| Store/Context | `PascalCase` + `Context` | `InvoiceContext.tsx` |
| Service/API | `camelCase` + `Service` | `invoiceService.ts` |
| Type domaine | `PascalCase` | `Invoice`, `LineItem` |
| Enum | `PascalCase` | `InvoiceStatus.Draft` |
| Constante | `SCREAMING_SNAKE_CASE` | `MAX_LINE_ITEMS` |

---

## 6. Accessibilité — Niveau WCAG AA (Non Négociable)

### Checklist composant

- [ ] **Contraste** : ≥ 4.5:1 texte normal, ≥ 3:1 texte large et composants UI
- [ ] **Focus visible** : outline 2px offset 2px sur TOUS les éléments interactifs
- [ ] **Ordre de tabulation** logique, suit le flux visuel
- [ ] **Aucun piège au focus** (modales : focus trap, fermeture Échap)
- [ ] **Étiquettes explicites** : `<label>` associé, ou `aria-label` / `aria-labelledby`
- [ ] **Rôles ARIA** : tableaux avec `role="grid"` si interactifs, `role="status"` pour les loaders
- [ ] **Annonces dynamiques** : `aria-live="polite"` pour les mises à jour asynchrones
- [ ] **Messages d'erreur** : `aria-describedby` liant le champ à son erreur
- [ ] **Actions icônes** : `aria-label` descriptif sur chaque bouton icône seul
- [ ] **Titres de page** : `<title>` mis à jour à chaque navigation SPA

Focus trap : utiliser `@radix-ui/react-dialog` ou `@headlessui/react` (ne pas réimplémenter). Annonce SPA : mettre à jour `document.title` et `aria-live` region à chaque navigation. Pour la checklist détaillée, consulter `references/accessibilite-metier.md` et le skill **accessibilix**.

---

## 7. Performance Perçue — Ce qui compte pour l'utilisateur métier

### Priorités (différentes du grand public)

```
1. Réactivité des interactions   → < 50ms de latence perçue
2. Temps de premier affichage    → Skeleton immédiat, données ensuite
3. Stabilité du layout           → Jamais de saut visuel (CLS = 0)
4. Persistance de l'état         → Filtres, scroll, sélection conservés
5. Travail hors-ligne            → Au moins lecture en cache (si pertinent)
```

### Patterns de performance métier

Optimistic UI pour les actions fréquentes (mise à jour locale immédiate, revert si erreur). Virtualisation (TanStack Virtual) pour listes > 100 items. Debounce 300ms pour la recherche. React Query/SWR pour le cache. Pagination serveur obligatoire.
Voir `references/composants-patterns-code.md` pour les exemples d'implémentation.

---

## 8. Internationalisation & Localisation (i18n)

Applications métier = souvent multi-langues, multi-fuseaux, multi-formats.

```typescript
// ✅ Jamais de texte en dur dans le JSX
// ❌ <p>Aucun résultat trouvé</p>
// ✅ <p>{t('table.emptyState.noResults')}</p>

// ✅ Formats localisés systématiques
const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency })
const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })

// ✅ Ordre logique des champs selon la locale (prénom/nom inversé en Asie)
// ✅ Support RTL dès le départ si pertinent (dir="rtl", logical CSS properties)
// CSS : margin-inline-start plutôt que margin-left
```

---

## 9. Gestion des Rôles & Permissions dans l'UI

```typescript
// ✅ Pattern : hook de permission
function usePermission(action: Permission): boolean {
  const { user } = useAuth()
  return hasPermission(user.roles, action)
}

// ✅ Composant conditionnel avec fallback gracieux
const canEdit = usePermission('invoice:edit')

// Afficher le bouton désactivé + tooltip > le masquer totalement
// L'utilisateur comprend qu'une action existe, même s'il n'y a pas accès
<Button
  disabled={!canEdit}
  title={!canEdit ? "Droits insuffisants pour modifier" : undefined}
>
  Modifier
</Button>
```

---

## 10. Workflow de Conception & Livraison

```
1. COMPRENDRE   → Qui ? Quoi ? Dans quel contexte métier ?
2. CARTOGRAPHIER → Flux utilisateur, données, états, actions
3. HIÉRARCHISER → Actions primaires / secondaires / tertiaires
4. PROTOTYPER   → Structure HTML sémantique d'abord, styles ensuite
5. CODER        → TypeScript strict, composants atomiques, états complets
6. VÉRIFIER     → Checklist accessibilité + 4 états (loading/empty/error/data)
7. DOCUMENTER   → JSDoc sur les composants réutilisables, types domaine commentés
```

---

## 11. Anti-Patterns Métier — Interdictions Absolues

| ❌ Interdit | ✅ Alternative |
|-------------|---------------|
| Masquer des erreurs dans la console | Logger + afficher un état erreur explicite |
| Texte tronqué sans tooltip | Tooltip ou ligne complète |
| Boutons sans état disabled cohérent | Disable + explication |
| Spinner global bloquant | Skeleton ou optimistic update |
| Formulaire sans validation inline | onBlur + message sous champ |
| Suppression sans confirmation | Modal de confirmation + description de l'impact |
| `any` TypeScript | Type explicite ou `unknown` + narrowing |
| Couleurs seules pour les statuts | Couleur + icône + libellé (daltonisme) |
| Texte en dur (pas de i18n) | Clé de traduction systématique |
| Données sans état vide/erreur | 4 états obligatoires |
| Actions non annulables silencieuses | Toast "Annuler" avec délai (5s) |

---

## 12. Références Complémentaires

- `references/design-system-metier.md` — Tokens, palette, typographie pour apps métier
- `references/composants-metier.md` — DataTable, FormBuilder, StatusBadge, ActionMenu, EmptyState
- `references/patterns-etat.md` — Gestion état async (React Query), formulaires (React Hook Form + Zod), optimistic UI
- `references/accessibilite-metier.md` — Checklist détaillée WCAG AA, ARIA patterns, tests

Consulter ces fichiers pour les implémentations complètes et prêtes à l'emploi.
