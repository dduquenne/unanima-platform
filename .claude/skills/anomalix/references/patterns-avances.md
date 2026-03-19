# Patterns Avancés — Anomalix

## Race Conditions

### Détection
```typescript
// Signal : résultat différent selon la vitesse réseau ou le timing
// Signal : setState après démontage du composant
// Signal : données écrasées par une requête plus lente qui finit après

// AbortController pour annuler les requêtes obsolètes
useEffect(() => {
  const controller = new AbortController();
  
  fetchData(id, { signal: controller.signal })
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') setError(err);
    });

  return () => controller.abort(); // ← cleanup = annulation
}, [id]);
```

### Pattern "dernière requête gagne"
```typescript
// Évite les réponses désordonnées (requête lente de t-1 arrive après t)
function useLatestFetch<T>(fetcher: (id: string) => Promise<T>) {
  const latestRequestId = useRef(0);
  
  return async (id: string) => {
    const requestId = ++latestRequestId.current;
    const result = await fetcher(id);
    
    if (requestId !== latestRequestId.current) return; // périmé
    return result;
  };
}
```

---

## Fuites Mémoire

### Causes courantes en React/Next.js
```typescript
// ❌ Event listener non nettoyé
useEffect(() => {
  window.addEventListener('resize', handler);
  // Manque : return () => window.removeEventListener('resize', handler);
}, []);

// ❌ Subscription non désabonnée
useEffect(() => {
  const sub = store.subscribe(handler);
  // Manque : return () => sub.unsubscribe();
}, []);

// ❌ setInterval non arrêté
useEffect(() => {
  const id = setInterval(poll, 5000);
  return () => clearInterval(id); // ✅ Cleanup correct
}, []);
```

### Diagnostic avec Node.js
```typescript
// Activer le heap snapshot
import v8 from 'v8';
const snapshot = v8.writeHeapSnapshot(); // écrit dans le CWD
// Analyser avec Chrome DevTools > Memory > Load Heap Snapshot
```

---

## Performance

### N+1 Queries Prisma
```typescript
// ❌ N+1 : 1 query pour les posts + N queries pour chaque auteur
const posts = await prisma.post.findMany();
for (const post of posts) {
  post.author = await prisma.user.findUnique({ where: { id: post.authorId } });
}

// ✅ 1 seule query avec include
const posts = await prisma.post.findMany({
  include: { author: { select: { id: true, name: true } } },
});
```

### Memoization React
```typescript
// Quand utiliser useMemo : calcul coûteux qui ne doit pas se refaire à chaque render
const sortedItems = useMemo(
  () => items.sort((a, b) => b.date.getTime() - a.date.getTime()),
  [items] // ← se recalcule seulement si items change
);

// Quand utiliser useCallback : fonction passée comme prop à un composant mémoïsé
const handleSubmit = useCallback(
  (data: FormData) => submitForm(data, userId),
  [userId] // ← nouvelle référence seulement si userId change
);

// Attention : useMemo/useCallback ont un coût, ne pas sur-utiliser
// Mesurer avant d'optimiser : React DevTools Profiler
```

---

## Débogage Next.js App Router

### Server vs Client Component
```typescript
// Erreur : "useState is not a function" dans un Server Component
// Cause : utiliser des hooks React côté serveur

// ✅ Solution : ajouter 'use client' en première ligne
'use client';
import { useState } from 'react';

// Ou mieux : extraire la partie interactive dans un sous-composant client
// et garder le parent en Server Component pour les données
```

### Cache et Revalidation
```typescript
// Données périmées après mise à jour ?
// Vérifier la politique de cache :

// fetch avec no-cache pour les données dynamiques
const data = await fetch(url, { cache: 'no-store' });

// Revalidation par tag
import { revalidateTag } from 'next/cache';
revalidateTag('products'); // invalide tout le cache tagué 'products'

// Revalidation par path
import { revalidatePath } from 'next/cache';
revalidatePath('/dashboard');
```

---

## Zod pour la validation de contrats

```typescript
import { z } from 'zod';

// Schéma strict avec messages d'erreur utiles
const UserSchema = z.object({
  id: z.string().uuid('ID doit être un UUID valide'),
  email: z.string().email('Email invalide'),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.coerce.date(), // coerce: string → Date automatiquement
  metadata: z.record(z.string()).optional(),
});

type User = z.infer<typeof UserSchema>; // Type TS dérivé du schéma

// Validation avec message d'erreur structuré
function validateUser(raw: unknown): User {
  const result = UserSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Validation échouée: ${result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`
    );
  }
  return result.data;
}
```
