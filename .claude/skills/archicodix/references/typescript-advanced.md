# TypeScript Avancé — Techniques pour applications robustes

## Table des matières
1. [Branded Types](#branded-types)
2. [Type Guards & Narrowing](#type-guards)
3. [Template Literal Types](#template-literals)
4. [Types Utilitaires Custom](#utility-types)
5. [Discriminated Unions](#discriminated-unions)
6. [Inférence et Génériques avancés](#generics)
7. [Decorators (TypeScript 5+)](#decorators)

---

## 1. Branded Types {#branded-types}

```typescript
// Technique : intersection avec un objet fantôme readonly
declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

type UserId = Brand<string, "UserId">;
type ProductId = Brand<string, "ProductId">;
type EUR = Brand<number, "EUR">;
type PositiveInt = Brand<number, "PositiveInt">;

// Constructeurs avec validation
const createPositiveInt = (n: number): PositiveInt => {
  if (!Number.isInteger(n) || n <= 0) throw new Error(`Expected positive integer, got ${n}`);
  return n as PositiveInt;
};

// Runtime cast (pour données de confiance depuis DB)
const asUserId = (s: string) => s as UserId;
```

---

## 2. Type Guards & Narrowing {#type-guards}

```typescript
// Type guard user-defined
function isError(value: unknown): value is Error {
  return value instanceof Error;
}

// Type guard avec propriété discriminante
interface Cat { type: "cat"; purrs: boolean }
interface Dog { type: "dog"; barks: boolean }
type Animal = Cat | Dog;

function isCat(animal: Animal): animal is Cat {
  return animal.type === "cat";
}

// Assertion function (TypeScript 3.7+)
function assertDefined<T>(value: T | null | undefined, msg: string): asserts value is T {
  if (value == null) throw new Error(msg);
}

// Exhaustive check
function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

function handleAnimal(animal: Animal): string {
  switch (animal.type) {
    case "cat": return animal.purrs ? "purring" : "silent";
    case "dog": return animal.barks ? "barking" : "silent";
    default: return assertNever(animal); // Erreur de compilation si cas manquant
  }
}
```

---

## 3. Template Literal Types {#template-literals}

```typescript
// Routes typées
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type ApiPath = `/${string}`;
type RouteKey = `${HttpMethod} ${ApiPath}`;

// Événements typés
type EntityName = "user" | "order" | "product";
type EventAction = "created" | "updated" | "deleted";
type DomainEventName = `${EntityName}.${EventAction}`;
// "user.created" | "user.updated" | "user.deleted" | "order.created" | ...

// CSS-in-TS
type CssValue = `${number}px` | `${number}em` | `${number}rem` | `${number}%`;

// Event emitter typé
type EventMap = {
  "user.created": { userId: UserId; email: Email };
  "order.confirmed": { orderId: OrderId; total: Money };
};

interface TypedEventEmitter<T extends Record<string, unknown>> {
  emit<K extends keyof T>(event: K, payload: T[K]): void;
  on<K extends keyof T>(event: K, handler: (payload: T[K]) => void): void;
}
```

---

## 4. Types Utilitaires Custom {#utility-types}

```typescript
// Deep Readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// Deep Partial
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// NonNullable récursif
type NonNullableDeep<T> = {
  [K in keyof T]-?: NonNullableDeep<NonNullable<T[K]>>;
};

// Extraire les clés d'un type selon leur valeur
type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

interface User { id: string; name: string; age: number; active: boolean }
type StringKeys = KeysOfType<User, string>; // "id" | "name"

// Merge de types avec override
type Merge<T, U> = Omit<T, keyof U> & U;

// Type pour les callbacks async
type AsyncFunction<T extends unknown[], R> = (...args: T) => Promise<R>;

// Infer le type de retour d'une promesse
type Awaited<T> = T extends Promise<infer R> ? R : T; // Natif en TS 4.5+
```

---

## 5. Discriminated Unions {#discriminated-unions}

```typescript
// Pattern State Machine avec Discriminated Union
type OrderState =
  | { status: "DRAFT"; items: OrderItem[]; createdAt: Date }
  | { status: "CONFIRMED"; items: OrderItem[]; confirmedAt: Date; paymentId: PaymentId }
  | { status: "SHIPPED"; trackingNumber: string; shippedAt: Date }
  | { status: "DELIVERED"; deliveredAt: Date }
  | { status: "CANCELLED"; reason: string; cancelledAt: Date };

// Transitions typées
type OrderTransition =
  | { from: "DRAFT"; to: "CONFIRMED"; paymentId: PaymentId }
  | { from: "CONFIRMED"; to: "SHIPPED"; trackingNumber: string }
  | { from: "SHIPPED"; to: "DELIVERED" }
  | { from: "DRAFT" | "CONFIRMED"; to: "CANCELLED"; reason: string };

// RemoteData pattern (pour les états asynchrones)
type RemoteData<T, E = Error> =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; data: T }
  | { state: "error"; error: E };
```

---

## 6. Inférence et Génériques avancés {#generics}

```typescript
// Inférence depuis un tuple de validateurs
type InferSchema<T extends Record<string, (v: unknown) => unknown>> = {
  [K in keyof T]: T[K] extends (v: unknown) => infer R ? R : never;
};

// Builder pattern typé
class QueryBuilder<T extends Record<string, unknown>> {
  private filters: Partial<T> = {};

  where<K extends keyof T>(key: K, value: T[K]): QueryBuilder<T> {
    this.filters[key] = value;
    return this;
  }

  build(): Partial<T> { return this.filters; }
}

// Currification typée
type Curry<F extends (...args: unknown[]) => unknown> =
  F extends (a: infer A, ...rest: infer R) => infer Ret
    ? R extends []
      ? F
      : (a: A) => Curry<(...rest: R) => Ret>
    : never;

// Mapped types conditionnels
type OptionalIfNullable<T> = {
  [K in keyof T as null extends T[K] ? K : never]?: T[K];
} & {
  [K in keyof T as null extends T[K] ? never : K]: T[K];
};
```

---

## 7. Decorators TypeScript 5+ {#decorators}

```typescript
// Decorator de validation (Stage 3, TypeScript 5+)
function validate(schema: ZodSchema) {
  return function <This, Args extends unknown[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This>,
  ) {
    return function (this: This, ...args: Args): Return {
      const parsed = schema.safeParse(args[0]);
      if (!parsed.success) throw new ValidationError(parsed.error.format());
      return target.call(this, parsed.data as Args[0], ...args.slice(1) as Args);
    };
  };
}

// Decorator de logging
function log(target: Function, context: ClassMethodDecoratorContext) {
  const methodName = String(context.name);
  return function (this: unknown, ...args: unknown[]) {
    const logger = getLogger();
    logger.debug({ method: methodName, args }, "Method called");
    const result = target.call(this, ...args);
    if (result instanceof Promise) {
      return result.then(r => { logger.debug({ method: methodName }, "Method resolved"); return r; });
    }
    return result;
  };
}
```

---

## Configuration tsconfig.json recommandée

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "experimentalDecorators": false,
    "useDefineForClassFields": true,
    "paths": {
      "@domain/*": ["./src/domain/*"],
      "@application/*": ["./src/application/*"],
      "@infrastructure/*": ["./src/infrastructure/*"],
      "@shared/*": ["./src/shared/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```
