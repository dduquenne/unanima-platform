# Correction Patterns — Anomalix

## Techniques d'investigation TypeScript

**Isolation progressive :**
```typescript
// Technique : reduire le perimetre par division binaire
// Commenter la moitie du code suspecte, tester → localise le bug
```

**Type narrowing diagnosis :**
```typescript
// Verifier que le type affiche par TS correspond au type reel
const value = getData(); // TS dit: string | undefined
console.log(typeof value, value); // runtime dit: object → incoherence !
```

**Tracage d'etat :**
```typescript
// Logger avant ET apres les transformations critiques
const before = structuredClone(state);
mutateState(state);
const after = state;
// Comparer : diff(before, after) revele la mutation inattendue
```

**Verification des contrats d'interface :**
```typescript
// Si une API externe est impliquee, valider le schema recu
import { z } from 'zod';
const schema = z.object({ id: z.string(), value: z.number() });
const parsed = schema.safeParse(apiResponse);
if (!parsed.success) console.error('Contrat viole:', parsed.error);
```

---

## Patterns de correction TypeScript recommandes

**Null safety avec optional chaining :**
```typescript
// ❌ Risque
const name = user.profile.displayName;

// ✅ Robuste
const name = user?.profile?.displayName ?? 'Anonyme';
```

**Type guards personnalises :**
```typescript
// ❌ As-cast dangereux
const item = data as Product;

// ✅ Type guard verifiable
function isProduct(value: unknown): value is Product {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'price' in value
  );
}
if (isProduct(data)) { /* TypeScript sait que c'est un Product ici */ }
```

**Gestion d'erreurs async :**
```typescript
// ❌ Silencieux en cas d'erreur
const data = await fetchUser(id);

// ✅ Explicite avec resultat type
const result = await tryCatch(fetchUser(id));
if (result.error) {
  logger.error('fetchUser failed', { id, error: result.error });
  return null;
}
const data = result.data;

// Helper pattern Result<T>
type Result<T> = { data: T; error: null } | { data: null; error: Error };
async function tryCatch<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    return { data: await promise, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
```

**Immutabilite pour eviter les mutations accidentelles :**
```typescript
// ❌ Mutation de l'objet source
function updateUser(user: User, name: string): User {
  user.name = name; // modifie l'original !
  return user;
}

// ✅ Copie immutable
function updateUser(user: User, name: string): User {
  return { ...user, name };
}
```

---

## Nettoyage du code

### Elements a supprimer systematiquement

```typescript
// ❌ console.log de debogage oublies
console.log('DEBUG:', data);
console.log('test ici');

// ❌ code commente (utiliser git history)
// const oldFunction = () => { ... }

// ❌ imports inutilises
import { useState, useEffect, useCallback } from 'react'; // useCallback non utilise

// ❌ variables non utilisees
const _unused = computeExpensiveThing();

// ❌ any non justifie
function process(data: any): any { ... }
```

### Elements risques a neutraliser

```typescript
// ⚠️ eval() — a remplacer imperativement
eval(userInput); // Injection de code

// ⚠️ dangerouslySetInnerHTML sans sanitisation
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ⚠️ token/secret dans le code source
const API_KEY = 'sk-prod-xxxxx'; // → deplacer dans .env

// ⚠️ setTimeout sans cleanup
useEffect(() => {
  setTimeout(() => setState(val), 1000); // fuite si composant demonte
  // ✅ Corriger avec cleanup :
  // const id = setTimeout(...); return () => clearTimeout(id);
}, []);
```

### Commandes de nettoyage automatique

```bash
# Detection des imports inutilises
npx tsc --noEmit 2>&1 | grep "is declared but"

# Lint avec correction automatique
npx eslint --fix src/

# Verification des console.log restants
grep -rn "console\.log" src/ --include="*.ts" --include="*.tsx"

# Recherche de TODO/FIXME/HACK a traiter
grep -rn "TODO\|FIXME\|HACK\|XXX\|TEMP" src/ --include="*.ts" --include="*.tsx"
```

---

## Tests anti-regression templates

### Structure de test recommandee (Vitest / Jest)

```typescript
/**
 * Tests anti-regression pour [NOM DE L'ANOMALIE]
 * Anomalie detectee le [DATE] — Corrigee dans [FICHIER]
 *
 * Contexte : [Description du bug en une phrase]
 */
describe('[Module].[Fonction]', () => {

  // ✅ Cas nominal (happy path)
  it('retourne la valeur attendue pour une entree valide', () => {
    const result = myFunction({ id: '1', value: 42 });
    expect(result).toEqual({ processed: true, total: 42 });
  });

  // ⚠️ Cas limite (edge cases)
  it('gere une valeur null sans lever d exception', () => {
    expect(() => myFunction(null)).not.toThrow();
    expect(myFunction(null)).toBeNull();
  });

  it('gere un tableau vide', () => {
    expect(myFunction([])).toEqual([]);
  });

  // 🐛 Cas de regression (le bug exact)
  it('ne crash pas quand [condition du bug]', () => {
    const badInput = { id: undefined, value: 'not-a-number' };
    expect(() => myFunction(badInput as any)).not.toThrow();
  });

  // 🔒 Cas de securite si pertinent
  it('rejette les entrees malformees', () => {
    expect(() => myFunction({ id: '<script>alert(1)</script>' }))
      .toThrow('Invalid input');
  });
});
```

### Tests pour les cas async

```typescript
describe('fetchUserProfile', () => {

  it('retourne le profil pour un utilisateur valide', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    const result = await fetchUserProfile('user-123');

    expect(result).toMatchObject({ id: 'user-123', name: expect.any(String) });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-123' },
    });
  });

  it('retourne null pour un utilisateur inexistant (pas d exception)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await fetchUserProfile('ghost-id');

    expect(result).toBeNull();
  });

  it('propage l erreur de base de donnees avec le bon message', async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(
      new Error('Connection timeout')
    );

    await expect(fetchUserProfile('user-123')).rejects.toThrow('Connection timeout');
  });
});
```
