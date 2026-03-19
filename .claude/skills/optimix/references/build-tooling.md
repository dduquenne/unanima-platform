# Référence : Build Tooling TypeScript — Performance

## Table des matières
1. [Choisir le bon transpileur](#transpileurs)
2. [Configuration tsconfig.json optimisée](#tsconfig)
3. [Stratégies de build en monorepo](#monorepo)
4. [Analyse et réduction du bundle](#bundle)
5. [Pipeline CI/CD performant](#ci-cd)

---

## 1. Choisir le bon transpileur {#transpileurs}

### Comparaison rapide (2025)

| Outil | Vitesse | Type-check | Bundle | Cas d'usage |
|---|---|---|---|---|
| `tsc` | ❌ Lent | ✅ Complet | ❌ Non | Vérification de types uniquement |
| `esbuild` | ✅✅ 10-100x | ❌ Non | ✅ Oui | Build prod, dev rapide |
| `SWC` | ✅✅ 20-70x | ❌ Non | Partiel | Transpilation, Jest, Next.js |
| `tsup` | ✅✅ | ❌ Non | ✅ Oui | Librairies TypeScript |
| `Bun` | ✅✅✅ | Partiel | ✅ Oui | Runtime + build tout-en-un |

### Stratégie recommandée : split type-check / transpilation

```bash
# En développement
tsc --noEmit --watch &   # Type-check en background
tsx src/index.ts          # Exécution rapide sans type-check

# En CI
tsc --noEmit              # Bloquant : vérifie les types
esbuild src/index.ts --bundle --outfile=dist/bundle.js  # Build rapide

# Pour une librairie
tsup src/index.ts --format esm,cjs --dts  # ESM + CJS + .d.ts en une commande
```

### Configuration esbuild recommandée pour une API Node.js

```typescript
// build.ts
import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outdir: 'dist',
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production',
  external: ['pg-native', 'sharp'], // modules natifs exclus du bundle
  treeShaking: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
});
```

### Configuration tsup pour une librairie

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,               // Génère les .d.ts via tsc --emitDeclarationOnly
  splitting: true,         // Code splitting pour ESM
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: 'node20',
  // Exclure les dépendances du bundle (peerDeps)
  external: ['react', 'zod'],
});
```

---

## 2. Configuration tsconfig.json optimisée {#tsconfig}

### Template haute performance pour application Node.js

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "lib": ["ES2022"],
    
    // ✅ Performance : compilation incrémentale
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    
    // ✅ Performance : skip vérification des .d.ts des dépendances
    "skipLibCheck": true,
    
    // ✅ Compatibilité esbuild/SWC : chaque fichier est un module isolé
    "isolatedModules": true,
    
    // ✅ Strict mode complet (réduit les bugs, améliore les optimisations V8)
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    
    // ✅ Output
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    
    // ✅ Performance : limiter les fichiers inclus
    "rootDir": "src"
  },
  "include": ["src"],              // ❌ Ne pas mettre "." — trop large
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",               // Exclure les tests du build prod
    "**/*.spec.ts"
  ]
}
```

### Diagnostics de build lent

```bash
# Identifier ce qui prend du temps
tsc --extendedDiagnostics --noEmit 2>&1 | grep -E "(Files|Lines|Nodes|Memory|I/O)"

# Trouver les types qui ralentissent
tsc --generateTrace ./trace-output --noEmit
# Puis ouvrir trace-output dans Chrome DevTools Performance tab
```

### Optimisations avancées tsconfig

```json
{
  "compilerOptions": {
    // Pour les monorepos : références de projet pour build incrémental
    "composite": true,
    "declarationMap": true
  },
  // Réduire la charge de type-checking en splitant le projet
  "references": [
    { "path": "../shared" },
    { "path": "../core" }
  ]
}
```

---

## 3. Stratégies de build en monorepo {#monorepo}

### Turborepo + esbuild (recommandé 2025)

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],   // Build les dépendances en premier
      "outputs": ["dist/**"],
      "cache": true              // Cache Turborepo : skip si pas de changement
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": true
    }
  }
}
```

```bash
# Build parallèle avec cache
turbo run build --filter="./apps/*"

# Type-check uniquement les packages affectés par les changements
turbo run type-check --filter="...[HEAD^1]"
```

### Nx avec cache distribué (alternative)

```bash
# Cache local + remote (Nx Cloud)
nx affected:build --base=main
nx affected:test --base=main
```

### Éviter les imports circulaires en monorepo

```bash
# Détecter les cycles
npx madge --circular --extensions ts src/

# Alternative : dpdm
npx dpdm --circular src/index.ts
```

---

## 4. Analyse et réduction du bundle {#bundle}

### Identifier le code mort et les dépendances lourdes

```bash
# Analyse esbuild
esbuild src/index.ts --bundle --analyze --outfile=/dev/null

# Source map explorer (après build)
npx source-map-explorer dist/bundle.js

# Vite bundle visualizer
npx vite-bundle-visualizer
```

### Tree-shaking : conditions requises

Pour qu'un module soit tree-shakable :
1. Exports en **ESM** (`export const`, pas `module.exports`)
2. Pas d'effets de bord au niveau du module (pas de code exécuté au `import`)
3. `"sideEffects": false` dans `package.json` de la librairie

```json
// package.json de la librairie
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "sideEffects": false
}
```

### Lazy loading des modules lourds

```typescript
// ❌ Import statique — charge tout au démarrage
import { generatePDF } from './pdf-generator';

// ✅ Import dynamique — chargé à la demande
async function exportReport(data: ReportData): Promise<Buffer> {
  const { generatePDF } = await import('./pdf-generator');
  return generatePDF(data);
}
```

---

## 5. Pipeline CI/CD performant {#ci-cd}

### GitHub Actions optimisé pour TypeScript

```yaml
# .github/workflows/ci.yml
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'           # Cache des node_modules
      
      - run: pnpm install --frozen-lockfile
      
      # Type-check et build en parallèle
      - name: Type check
        run: pnpm type-check &
        
      - name: Build
        run: pnpm build &
        
      - name: Tests
        run: pnpm test
        
      - run: wait  # Attendre les jobs parallèles
```

### Cache de compilation TypeScript en CI

```yaml
- name: Cache TypeScript build info
  uses: actions/cache@v4
  with:
    path: |
      .tsbuildinfo
      packages/*/.tsbuildinfo
    key: tsbuildinfo-${{ hashFiles('**/*.ts', '**/tsconfig.json') }}
```

---

## TypeScript 7.0 — ce qui change (2025-2026)

Microsoft travaille sur un **port natif de tsc en Go** (TypeScript 7.0) :
- Réduction des temps de build de **10x**
- Réduction de la mémoire de **50%**
- Migration vers le **Language Server Protocol (LSP)**
- Preview de `tsc` CLI natif attendu mi-2025, version complète fin 2025

**Action recommandée maintenant** :
- Utiliser `"isolatedModules": true` (requis pour la compatibilité TS7)
- Éviter les patterns non compatibles avec l'isolation de modules (namespaces globaux, `const enum`)
