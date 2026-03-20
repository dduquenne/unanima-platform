# Référence Audit — Performances TypeScript

## Core Web Vitals (apps web/Next.js)

| Métrique | Cible | Alerte |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | > 4s |
| INP (Interaction to Next Paint) | < 200ms | > 500ms |
| CLS (Cumulative Layout Shift) | < 0.1 | > 0.25 |
| TTFB (Time to First Byte) | < 800ms | > 1800ms |
| FCP (First Contentful Paint) | < 1.8s | > 3s |

## Bundle & assets (Frontend)

- [ ] Bundle analysé (`webpack-bundle-analyzer`, `next-bundle-analyzer`)
- [ ] Tree-shaking effectif (pas d'imports en `* as`)
- [ ] Code splitting configuré (lazy loading des routes, dynamic imports)
- [ ] Images optimisées (format WebP/AVIF, responsive, lazy loading)
- [ ] Fonts subsettées et avec `font-display: swap`
- [ ] Third-party scripts chargés en async/defer
- [ ] Taille du bundle initial < 200KB (gzippé)

## Performances serveur (Node.js/Next.js)

- [ ] Pas de requêtes N+1 (vérifier les includes ORM)
- [ ] Index DB sur les colonnes fréquemment filtrées/triées
- [ ] Requêtes DB paginées (pas de `findAll()` sans limite)
- [ ] Cache configuré (Redis, in-memory, cache HTTP)
- [ ] Pas de traitement lourd en synchrone dans le thread principal
- [ ] Streams utilisés pour les gros volumes de données
- [ ] Pool de connexions DB correctement dimensionné

## Performances React/Next.js

- [ ] Mémoïsation appropriée (`useMemo`, `useCallback`, `React.memo`)
- [ ] Éviter les re-renders inutiles (profiler React DevTools)
- [ ] Virtualization pour les longues listes (`react-virtual`, `tanstack-virtual`)
- [ ] State lifting minimal (état au plus proche de son usage)
- [ ] Server Components (Next.js 13+) pour les composants sans interactivité
- [ ] Pas de waterfall de requêtes (paralléliser avec `Promise.all`)

## Analyse des patterns lents (TypeScript)

```typescript
// ❌ Quadratic complexity
for (const item of items) {
  const found = allItems.find(i => i.id === item.id) // O(n²)
}

// ✅ Linear with Map
const itemMap = new Map(allItems.map(i => [i.id, i]))
for (const item of items) {
  const found = itemMap.get(item.id) // O(n)
}
```

## Outils de mesure
```bash
npx lighthouse https://votre-app.com --output json
npx clinic doctor -- node server.js  # Profiling Node.js
npx 0x -- node server.js             # Flame graphs
```

- Chrome DevTools Performance tab
- React DevTools Profiler
- Vercel Speed Insights / Analytics
- Datadog / New Relic APM
