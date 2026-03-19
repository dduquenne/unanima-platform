# Référence : Système de Types TypeScript — Performance

## Table des matières
1. [Interface vs Type alias](#interface-vs-type)
2. [Types complexes et coût de compilation](#types-complexes)
3. [Patterns de types efficaces](#patterns-efficaces)
4. [Diagnostiquer les types lents](#diagnostics)
5. [TypeScript 5.x — nouvelles fonctionnalités de performance](#ts5x)

---

## 1. Interface vs Type alias {#interface-vs-type}

### Pourquoi `interface` est plus performante pour les objets

Le compilateur TypeScript **memoïse** les interfaces : une fois évaluée, elle n'est pas recalculée. Les `type` aliases avec objets sont re-évalués à chaque utilisation dans certains contextes.

```typescript
// ✅ Préférer pour les structures de données métier
interface UserDTO {
  id: string;
  email: string;
  roles: Role[];
  createdAt: Date;
}

// ✅ OK pour les unions, intersections, utilitaires
type UserId = string;
type UserOrAdmin = User | Admin;
type PartialUser = Partial<User>;

// ❌ Éviter les type aliases d'objets complexes très utilisés
type UserDTO = {   // Moins efficace que interface dans ce cas
  id: string;
  ...
};
```

### Intersection vs Extension

```typescript
// ❌ Intersection de types — évaluée à chaque usage
type AdminUser = User & { permissions: Permission[] };

// ✅ Extension d'interface — memoïsée
interface AdminUser extends User {
  permissions: Permission[];
}
```

---

## 2. Types complexes et coût de compilation {#types-complexes}

### Types récursifs — attention au coût exponentiel

```typescript
// ❌ Type récursif profond — coût exponentiel pour tsc
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// ✅ Limiter la profondeur avec un compteur
type DeepReadonly<T, D extends number = 5> = D extends 0
  ? T
  : { readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K], Prev[D]> : T[K] };
```

### Unions larges — impact sur les performances IDE

```typescript
// ❌ Union de 50+ chaînes de caractères — ralentit l'autocomplétion
type CountryCode = 'FR' | 'DE' | 'ES' | 'IT' | ... ; // 200 pays

// ✅ Pour les grandes unions statiques : utiliser un enum ou un const object
const COUNTRY_CODES = {
  FR: 'FR', DE: 'DE', ES: 'ES',
} as const;
type CountryCode = keyof typeof COUNTRY_CODES;

// ✅ Ou générer les types depuis la source de vérité (ex: base de données)
```

### Types conditionnels imbriqués

```typescript
// ❌ Conditionnels profondément imbriqués — slow to check
type Unpack<T> = T extends Promise<infer U>
  ? U extends Array<infer V>
    ? V extends Record<string, infer W>
      ? W
      : never
    : never
  : T;

// ✅ Décomposer en étapes nommées
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;
type UnpackArray<T> = T extends Array<infer U> ? U : T;
type UnpackRecord<T> = T extends Record<string, infer U> ? U : T;
type Unpack<T> = UnpackRecord<UnpackArray<UnpackPromise<T>>>;
```

---

## 3. Patterns de types efficaces {#patterns-efficaces}

### `satisfies` — la meilleure alternative aux assertions

```typescript
// ❌ Assertion de type — perd la précision du type inféré
const config = {
  db: { host: 'localhost', port: 5432 }
} as AppConfig;

// ❌ Annotation — perd la précision des littéraux
const config: AppConfig = {
  db: { host: 'localhost', port: 5432 }
};

// ✅ satisfies — vérifie la conformité SANS perdre les types précis
const config = {
  db: { host: 'localhost', port: 5432 }
} satisfies AppConfig;
// config.db.port est de type `5432`, pas `number`
```

### Template Literal Types pour les clés de routes/événements

```typescript
// ✅ Génère automatiquement les combinaisons de clés
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type ApiVersion = 'v1' | 'v2';
type RouteKey = `${HttpMethod}:${ApiVersion}/${string}`;

// Types de clés d'i18n (utile pour les apps métier multilingues)
type TranslationKey = 
  | `common.${keyof typeof common}`
  | `errors.${keyof typeof errors}`
  | `forms.${keyof typeof forms}`;
```

### Branded Types pour éviter les erreurs de paramètres

```typescript
// ❌ Deux `string` — erreur possible d'inversion
function createOrder(userId: string, productId: string): Order { ... }

// ✅ Branded types — incompatibles à la compilation
type UserId = string & { readonly __brand: 'UserId' };
type ProductId = string & { readonly __brand: 'ProductId' };

function createOrder(userId: UserId, productId: ProductId): Order { ... }

// Helpers de construction
function asUserId(id: string): UserId { return id as UserId; }
function asProductId(id: string): ProductId { return id as ProductId; }
```

### Infer avec contrainte pour limiter le coût

```typescript
// ❌ `infer` sans contrainte — évaluation large
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// ✅ `infer extends` (TS 4.7+) — contrainte directe, plus efficace
type StringReturn<T> = T extends (...args: any[]) => infer R extends string ? R : never;
```

### `const` generics (TS 5.0+) — inférence précise sans `as const`

```typescript
// Avant TS 5.0
function createRoute<T extends string>(path: T): Route<T> { ... }
const route = createRoute('/users' as const); // fallback sur string sans `as const`

// ✅ TS 5.0+ — inférence littérale automatique
function createRoute<const T extends string>(path: T): Route<T> { ... }
const route = createRoute('/users'); // T est '/users', pas string
```

---

## 4. Diagnostiquer les types lents {#diagnostics}

### Générer une trace de compilation

```bash
# Générer la trace
tsc --generateTrace ./trace --noEmit

# Analyser dans Chrome
# 1. Ouvrir chrome://tracing
# 2. Charger ./trace/trace.json
# 3. Chercher les "checkTypes" et "structuredTypeRelatedTo" les plus longs
```

### Identifier les types coûteux programmatiquement

```typescript
// tsconfig pour activer les statistiques
{
  "compilerOptions": {
    "diagnostics": true,           // Stats globales
    "extendedDiagnostics": true,   // Stats détaillées par phase
    "listFiles": true              // Liste les fichiers inclus
  }
}
```

### Signes d'un type trop complexe

- L'IDE met > 2s à afficher le type au survol
- `tsc --noEmit` prend > 30s sur un projet moyen
- Erreur `"Type instantiation is excessively deep and possibly infinite"`
- Autocomplétion lente ou incomplète dans VS Code

### Solution : `// @ts-expect-error` stratégique vs refactoring

```typescript
// ❌ Utiliser @ts-ignore à tort et à travers — masque les problèmes
// @ts-ignore
const result = complexGenericFunction(value);

// ✅ Refactorer le type complexe en intermédiaires nommés
type IntermediateType = ComplexGeneric<SomeParam>;
const result: IntermediateType = complexGenericFunction(value);

// ✅ Accepter un type moins précis avec @ts-expect-error documenté
// @ts-expect-error — Type trop complexe pour l'inférence, validé manuellement
const result = ultraComplexGeneric(value);
```

---

## 5. TypeScript 5.x — nouvelles fonctionnalités de performance {#ts5x}

### TS 5.0 — `const` type parameters
Élimine les `as const` dans les appels génériques (voir section 3).

### TS 5.2 — `using` et `Symbol.dispose` (Resource management)
```typescript
// ✅ Libération automatique de ressources (DB connections, file handles)
async function processReport() {
  await using db = await openDbConnection(); // Fermé automatiquement
  await using file = await openFile(path);   // Fermé automatiquement
  return await db.query('SELECT ...');
}
// Pas de finally/try-catch nécessaire pour le cleanup
```

### TS 5.4 — `NoInfer<T>`
```typescript
// Empêche l'inférence depuis un paramètre spécifique
function setDefault<T>(values: T[], defaultValue: NoInfer<T>): T[] {
  return values.length ? values : [defaultValue];
}
// Évite des inférences incorrectes qui peuvent ralentir le type-checker
```

### TS 5.5 — Type narrowing inféré pour les prédicats

```typescript
// Avant TS 5.5 : annotation manuelle obligatoire
function isString(x: unknown): x is string { return typeof x === 'string'; }

// ✅ TS 5.5 : inférence automatique du prédicat
function isString(x: unknown) { return typeof x === 'string'; }
// TypeScript infère automatiquement `x is string`
```

### TS 5.8 — Décorateurs (Stage 3, standard)
Les décorateurs sont maintenant standards et peuvent remplacer certains patterns coûteux en types.
