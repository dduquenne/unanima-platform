# Référence Audit — Architecture TypeScript

## Critères d'évaluation

### 1. Structure des dossiers
- [ ] Séparation claire des responsabilités (feature-based ou layer-based)
- [ ] Cohérence dans la nomenclature (kebab-case, PascalCase selon le contexte)
- [ ] Barrel exports (`index.ts`) utilisés judicieusement
- [ ] Absence de dossiers "fourre-tout" (`utils/`, `helpers/` > 10 fichiers sans sous-découpage)
- [ ] Profondeur d'arborescence raisonnable (< 5 niveaux)

### 2. Patterns architecturaux
- [ ] Pattern adopté identifiable (Clean Architecture, Feature Slicing, Hexagonal, MVC, etc.)
- [ ] Respect cohérent du pattern sur tout le projet
- [ ] Séparation domaine / infrastructure
- [ ] Couche de mapping entre les DTOs et les entités métier

### 3. Couplage et cohésion
- [ ] Absence de dépendances circulaires (`madge --circular`)
- [ ] Principe de dépendance inversée (DIP) appliqué
- [ ] Interfaces définies pour les services injectés
- [ ] Modules/features faiblement couplés entre eux

### 4. Principes SOLID
- [ ] **S** : Chaque classe/fonction a une seule responsabilité
- [ ] **O** : Extension sans modification (Open/Closed)
- [ ] **L** : Sous-types substituables (Liskov)
- [ ] **I** : Interfaces segmentées, pas de fat interfaces
- [ ] **D** : Dépendances vers les abstractions, pas les implémentations

### 5. Gestion des erreurs
- [ ] Stratégie centralisée (error boundaries, middleware global)
- [ ] Erreurs typées (classes d'erreur, Result pattern ou Either monad)
- [ ] Pas de `catch` vides ou silencieux
- [ ] Erreurs métier distinguées des erreurs techniques

### 6. Scalabilité
- [ ] Architecture permettant l'ajout de features sans toucher au core
- [ ] Absence de god objects / god modules
- [ ] Configuration externalisée (pas de magic strings/numbers hardcodés)

## Outils recommandés
```bash
npx madge --circular src/          # Dépendances circulaires
npx dependency-cruiser src/        # Graphe de dépendances
npx ts-prune                       # Exports non utilisés
```

## Score indicatif
- 18-24 critères : ≥ 8/10
- 12-17 critères : 5-7/10
- < 12 critères : < 5/10
