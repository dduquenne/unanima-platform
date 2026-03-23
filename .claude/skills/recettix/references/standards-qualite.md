# Standards TypeScript & Qualité du Code — Référence Recettix

## Seuils minimaux de couverture

```typescript
// vitest.config.ts — configuration Recettix
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      exclude: [
        'src/types/**',
        'src/**/*.d.ts',
        'src/migrations/**',
      ],
    },
  },
})
```

## Checklist revue de code TypeScript (avant recette)

- [ ] `strict: true` activé dans `tsconfig.json`
- [ ] Pas de `any` implicite, `unknown` utilisé à la place
- [ ] Zod / Valibot sur **toutes** les entrées externes (API, forms)
- [ ] Pas de `console.log` en production (ESLint rule)
- [ ] Erreurs typées (Result pattern ou classes d'erreur dédiées)
- [ ] Variables d'environnement validées au démarrage
- [ ] Pas de secrets hardcodés (Gitleaks CI)
- [ ] RLS Supabase activée sur toutes les tables
- [ ] Pas de requêtes N+1 (logs Supabase / Prisma)
- [ ] Bundle size ≤ seuil défini (Lighthouse CI budget)

## Métriques Core Web Vitals (seuils production)

| Métrique | Seuil acceptable | Seuil optimal |
|---|---|---|
| LCP | < 2.5 s | < 1.5 s |
| CLS | < 0.1 | < 0.05 |
| INP | < 200 ms | < 100 ms |
| TTFB | < 800 ms | < 400 ms |

## Intégration CI/CD

```yaml
# .github/workflows/recette.yml
jobs:
  quality-gate:
    steps:
      - name: Tests unitaires + couverture
        run: vitest run --coverage
      - name: Vérification seuils couverture
        run: vitest run --coverage --reporter=json
      - name: Tests E2E Playwright
        run: playwright test
      - name: Audit Lighthouse CI
        run: lhci autorun
      - name: Scan sécurité
        run: gitleaks detect --source .
      - name: Accessibilité axe-core
        run: playwright test --project=accessibility
```
