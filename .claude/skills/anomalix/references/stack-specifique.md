# Stack Spécifique — Anomalix

## Supabase

### Erreurs d'authentification courantes
```typescript
// "JWT expired" → rafraîchir la session
const { data: { session }, error } = await supabase.auth.getSession();
if (!session) await supabase.auth.refreshSession();

// Row Level Security bloque les requêtes silencieusement
// Symptôme : tableau vide alors que des données existent
// Diagnostic : désactiver RLS temporairement en dev pour vérifier
// Solution : revoir les policies RLS

// Vérifier les policies actives sur une table
// Dans Supabase Studio > Authentication > Policies
```

### Realtime subscriptions
```typescript
// Fuite : channel non désabonné
useEffect(() => {
  const channel = supabase
    .channel('table-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, 
      payload => setData(prev => [...prev, payload.new])
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel); // ← OBLIGATOIRE
  };
}, []);
```

---

## tRPC

### Erreurs de typage entre client et serveur
```typescript
// Cause fréquente : le router n'est pas correctement inféré côté client
// Vérifier que le type AppRouter est bien importé

// server/trpc/root.ts
export const appRouter = createTRPCRouter({
  user: userRouter,
  product: productRouter,
});
export type AppRouter = typeof appRouter; // ← exporté pour le client

// client
import type { AppRouter } from '@/server/trpc/root';
const trpc = createTRPCReact<AppRouter>();
```

### Gestion d'erreurs tRPC
```typescript
import { TRPCError } from '@trpc/server';

// Utiliser les codes d'erreur sémantiques
throw new TRPCError({
  code: 'NOT_FOUND',
  message: `Utilisateur ${id} introuvable`,
});

// Codes disponibles : NOT_FOUND, UNAUTHORIZED, FORBIDDEN, 
// BAD_REQUEST, INTERNAL_SERVER_ERROR, CONFLICT, TOO_MANY_REQUESTS
```

---

## Zustand

### Problèmes de sélecteur et re-renders
```typescript
// ❌ Re-render à chaque changement du store
const { user, products } = useStore();

// ✅ Sélecteur granulaire = re-render uniquement si user change
const user = useStore(state => state.user);

// ✅ Pour plusieurs valeurs : shallow comparison
import { shallow } from 'zustand/shallow';
const { user, loading } = useStore(
  state => ({ user: state.user, loading: state.loading }),
  shallow
);
```

### Persistance et hydratation
```typescript
// Erreur d'hydratation SSR/Client avec zustand-persist
// Symptôme : "Hydration failed because the server rendered HTML didn't match"

// Solution : vérifier que le state persisted est ignoré en SSR
const useStore = create(
  persist(
    (set) => ({ user: null }),
    {
      name: 'app-storage',
      skipHydration: true, // ← Next.js SSR : skip l'hydratation auto
    }
  )
);

// Puis dans le layout client :
useEffect(() => {
  useStore.persist.rehydrate();
}, []);
```

---

## Vitest — Configuration optimale

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // pour React
    globals: true,         // describe/it/expect sans import
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.d.ts'],
    },
  },
});

// src/test/setup.ts
import '@testing-library/jest-dom'; // matchers étendus
import { vi } from 'vitest';

// Mock global de fetch
global.fetch = vi.fn();

// Reset des mocks entre les tests
afterEach(() => {
  vi.clearAllMocks();
});
```
