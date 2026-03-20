# Référence Audit — Tests TypeScript

## Pyramide de tests

```
          /\
         /E2E\          → 5-10% — Cypress, Playwright (parcours critiques)
        /------\
       /  Intég. \      → 20-30% — Supertest, API tests, DB tests
      /------------\
     /   Unitaires  \   → 60-70% — Jest, Vitest (logique pure)
    /________________\
```

Vérifier que la répartition correspond à ce modèle. Une pyramide inversée (beaucoup d'E2E,
peu d'unitaires) est un anti-pattern coûteux.

## Métriques de couverture

| Niveau | Minimum acceptable | Cible |
|---|---|---|
| Statements | 60% | 80% |
| Branches | 55% | 75% |
| Functions | 65% | 85% |
| Lines | 60% | 80% |

⚠️ La couverture seule ne suffit pas — vérifier la **qualité** des tests.

## Qualité des tests

- [ ] Tests indépendants (pas d'ordre d'exécution requis)
- [ ] Pas de logique conditionnelle dans les tests (`if` dans un test = code smell)
- [ ] Assertions précises (pas de `toBeTruthy()` quand `toBe(42)` est possible)
- [ ] Nommage AAA (Arrange / Act / Assert) ou BDD (Given / When / Then)
- [ ] Mocks limités et justifiés (sur-mocking masque les bugs d'intégration)
- [ ] Snapshots utilisés avec parcimonie et relecture systématique
- [ ] Tests de régression pour chaque bug corrigé

## Tests de la logique métier TypeScript

```typescript
// ✅ Test bien structuré
describe('PricingService', () => {
  describe('calculateDiscount', () => {
    it('should apply 20% discount for premium customers with > 1000€ order', () => {
      // Arrange
      const customer = createCustomer({ tier: 'premium' })
      const order = createOrder({ total: 1500 })
      
      // Act
      const discount = pricingService.calculateDiscount(customer, order)
      
      // Assert
      expect(discount).toBe(300) // 20% of 1500
    })
  })
})
```

## Tests de types TypeScript (tsd, expect-type)

```typescript
import { expectType, expectError } from 'tsd'
expectType<User>(getUser(1))
expectError(getUser('not-a-number'))
```

## Tests de mutation

Les tests de mutation (Stryker) vérifient que les tests *détectent vraiment les bugs* :
- [ ] Mutation score > 70%
- [ ] Survivants analysés et couverts ou acceptés

## Outils
```bash
npx vitest run --coverage
npx jest --coverage --collectCoverageFrom='src/**/*.ts'
npx stryker run               # Tests de mutation
npx playwright test           # E2E
```
