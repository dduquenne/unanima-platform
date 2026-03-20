# Référence Audit — Qualité du Code TypeScript

## Métriques de complexité

| Métrique | Cible | Alerte |
|---|---|---|
| Complexité cyclomatique (par fonction) | ≤ 10 | > 20 |
| Longueur d'une fonction (lignes) | ≤ 40 | > 80 |
| Longueur d'un fichier (lignes) | ≤ 300 | > 600 |
| Profondeur d'imbrication | ≤ 3 | > 5 |
| Nombre de paramètres | ≤ 4 | > 7 |
| Duplication de code | < 3% | > 10% |

## TypeScript — Rigueur du typage

- [ ] `strict: true` dans `tsconfig.json`
- [ ] `noImplicitAny: true` (inclus dans strict)
- [ ] `strictNullChecks: true` (inclus dans strict)
- [ ] `noUncheckedIndexedAccess: true` recommandé
- [ ] Pas d'`any` (ou < 1% des types, et commentés `// eslint-disable-next-line`)
- [ ] Types utilitaires utilisés correctement (`Partial`, `Required`, `Pick`, `Omit`, `Record`)
- [ ] Generics pour les fonctions réutilisables
- [ ] Enums ou const assertions pour les valeurs constantes
- [ ] Discriminated unions pour modéliser les états
- [ ] Zod / valibot pour valider les données externes

## Patterns anti-performance à détecter

```typescript
// ❌ Mutation d'état partagé
function processItems(items: Item[]) {
  items.push(newItem) // Mutation surprise
}

// ❌ Type assertion dangereuse
const user = data as User // Sans validation préalable

// ❌ Optional chaining excessif masquant un bug
const name = user?.profile?.address?.city?.name // Pourquoi autant d'optionals ?

// ✅ Exhaustive check sur les unions discriminées
function handle(action: Action): never {
  throw new Error(`Unhandled action: ${(action as any).type}`)
}
```

## ESLint — Configuration recommandée

Vérifier la présence et la rigueur de :
- `@typescript-eslint/recommended-type-checked`
- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/no-floating-promises`
- `@typescript-eslint/await-thenable`
- `@typescript-eslint/consistent-type-imports`
- `unicorn/` pour les patterns modernes
- `import/order` pour les imports organisés

## Principes DRY / KISS / YAGNI

- [ ] Pas de code dupliqué détectable (`jscpd`)
- [ ] Fonctions simples et focalisées (KISS)
- [ ] Pas de sur-ingénierie / abstractions prématurées (YAGNI)
- [ ] Magic numbers/strings nommés en constantes
- [ ] Feature flags plutôt que code mort commenté

## Outils
```bash
npx jscpd src/                         # Détection de duplication
npx eslint src/ --format stylish
npx ts-morph-stats                     # Statistiques TypeScript
```
- SonarQube / SonarCloud pour métriques continues
- CodeClimate pour tracking de la dette
