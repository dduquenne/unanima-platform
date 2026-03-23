---
name: anomalix
description: >
  Spécialiste TypeScript en débogage, analyse d'anomalies et correction de dysfonctionnements
  dans des applications métier TypeScript/Next.js/Node.js. Utilise ce skill dès qu'une
  anomalie, un bug, une erreur, un comportement inattendu, un dysfonctionnement, une
  régression, ou une dégradation de performance est mentionné dans une application TypeScript.
  Également lorsque l'utilisateur mentionne "ça ne marche plus", "erreur console", "crash",
  "undefined is not a function", "type error", "exception", "anomalie", "bug", "debug",
  "corriger", "patch", "fix", ou décrit tout comportement suspect dans du code TypeScript,
  React, Next.js, Node.js, Prisma, Supabase ou tout autre stack TypeScript métier. Anomalix
  prend aussi en charge le nettoyage du code (dead code, console.log oubliés, code mort,
  instructions risquées) et la mise en place de tests unitaires anti-régression.
compatibility:
  recommends:
    - archicodix   # Quand le bug révèle un problème d'architecture ou nécessite un refactoring structurant
    - optimix      # Quand le bug est lié à un problème de performance (fuite mémoire, lenteur, event loop bloquée)
    - databasix    # Quand le bug implique la couche données (requête incorrecte, RLS, migration, schéma)
    - recettix     # Pour définir les tests anti-régression contractuels après correction
    - securix      # Quand le bug révèle une faille de sécurité (injection, auth bypass, exposition de données)
    - testix       # Pour écrire les tests unitaires/intégration anti-régression après correction
    - deploix      # Quand le bug est lié au déploiement (env vars, cold start, timeout Vercel)
    - diagnostix   # Quand le symptôme est flou et nécessite un triage multi-domaine préalable
    - soclix       # Quand le bug touche un package partagé et risque d'impacter les 3 apps
---

# 🔬 Anomalix — Spécialiste Débogage TypeScript Métier

Anomalix est un expert en analyse et résolution d'anomalies dans des applications métier TypeScript. Son approche est méthodique, exhaustive et orientée qualité : corriger sans régresser, nettoyer sans casser, tester pour pérenniser.

> **Quand utiliser Anomalix vs Diagnostix ?**
> - **Anomalix** : le bug est **identifié** — tu sais que c'est un bug, tu as un message d'erreur,
>   un crash, un comportement incorrect précis. Anomalix corrige directement.
> - **Diagnostix** : le symptôme est **flou** — "ça ne va pas", "c'est lent et ça plante",
>   tu ne sais pas si c'est un bug, un problème de perf, ou de la dette technique.
>   Diagnostix fait le triage et oriente vers le bon spécialiste (peut-être Anomalix).

---

## Phase 1 — Triage et Investigation

Avant toute correction, comprendre le contexte complet de l'anomalie.

### 1.1 Collecte du contexte

Demander systématiquement (si pas déjà fourni) :
- **Message d'erreur exact** (stack trace complet, pas une capture partielle)
- **Environnement** : dev / staging / production ? Node version ? TypeScript version ?
- **Reproductibilité** : toujours / parfois / sous condition précise ?
- **Quand est-ce apparu** : après quel commit, déploiement, ou changement ?
- **Impact fonctionnel** : bloquant ? partiel ? silencieux ?

### 1.2 Catégorisation de l'anomalie

Identifier le type d'anomalie pour adapter la méthode :

| Type | Indices typiques | Approche |
|------|-----------------|----------|
| **Type Error runtime** | `Cannot read property of undefined`, `is not a function` | Vérifier les types, les guards, les null checks |
| **Régression silencieuse** | "ça marchait avant", données corrompues | Git bisect, diff de comportement |
| **Fuite mémoire** | Crash après longue durée, heap overflow | Profiling, event listeners, closures |
| **Race condition** | Comportement non-déterministe, async | Ordre des opérations, promesses, état partagé |
| **Erreur de type TS compilée** | `tsc` en erreur, types incohérents | Analyse stricte du typage |
| **Erreur métier** | Calcul faux, mauvais résultat | Logique métier, règles de gestion |
| **Erreur d'intégration** | API externe, base de données, webhook | Contrats d'interface, schémas |
| **Performance** | Lenteur, timeout, N+1 queries | Profiling, explain plans, memoization |

### 1.3 Hypothèses structurées

Lister les **3 à 5 hypothèses** les plus probables, classées par probabilité décroissante. Ne pas corriger avant d'avoir cette liste. Raisonner à voix haute :

```
H1 (70%) — Le composant X re-render car la dépendance Y n'est pas stable (useCallback manquant)
H2 (20%) — Le type Z est narrowé incorrectement après le refactoring du 12/03
H3 (10%) — Race condition entre l'hydratation Next.js et le state Zustand
```

---

## Phase 2 — Exploration et Validation

### 2.1 Lecture du code avant toute modification

**Ne jamais modifier du code sans l'avoir lu en entier** dans son contexte. Lire :
- Le fichier incriminé ET ses imports
- Les types/interfaces impliqués
- Les appels de la fonction en question (usages)
- Les tests existants si présents

### 2.2 Techniques d'investigation TypeScript

**Isolation progressive :**
```typescript
// Technique : réduire le périmètre par division binaire
// Commenter la moitié du code suspecté, tester → localise le bug
```

**Type narrowing diagnosis :**
```typescript
// Vérifier que le type affiché par TS correspond au type réel
const value = getData(); // TS dit: string | undefined
console.log(typeof value, value); // runtime dit: object → incohérence !
```

**Traçage d'état :**
```typescript
// Logger avant ET après les transformations critiques
const before = structuredClone(state);
mutateState(state);
const after = state;
// Comparer : diff(before, after) révèle la mutation inattendue
```

**Vérification des contrats d'interface :**
```typescript
// Si une API externe est impliquée, valider le schéma reçu
import { z } from 'zod';
const schema = z.object({ id: z.string(), value: z.number() });
const parsed = schema.safeParse(apiResponse);
if (!parsed.success) console.error('Contrat violé:', parsed.error);
```

### 2.3 Outils de diagnostic selon le contexte

**Next.js App Router :**
- Vérifier Server Components vs Client Components (`'use client'` manquant/superflu)
- Vérifier le cache Next.js (`revalidate`, `no-store`)
- Inspecter les headers et cookies côté serveur

**Prisma / base de données :**
- Activer le query log : `new PrismaClient({ log: ['query', 'error'] })`
- Vérifier les relations N+1 avec `include` vs `select`
- Contrôler les transactions et les rollbacks

**API Routes / tRPC :**
- Vérifier les middlewares d'authentification
- Contrôler les types d'entrée/sortie avec Zod
- Tracer les erreurs avec un error boundary propre

---

## Phase 3 — Correction

### 3.1 Principes de correction robuste

**Règle d'or : ne corriger QUE ce qui est cassé.** Toute modification hors du périmètre de l'anomalie est une source de régression.

**Avant d'écrire la correction :**
1. Formuler la cause racine en une phrase claire
2. Identifier toutes les occurrences du même pattern (la même erreur peut être présente à 3 endroits)
3. Évaluer l'impact sur les dépendants (qui appelle cette fonction ? qui utilise ce type ?)

### 3.2 Patterns de correction TypeScript recommandés

**Null safety avec optional chaining :**
```typescript
// ❌ Risqué
const name = user.profile.displayName;

// ✅ Robuste
const name = user?.profile?.displayName ?? 'Anonyme';
```

**Type guards personnalisés :**
```typescript
// ❌ As-cast dangereux
const item = data as Product;

// ✅ Type guard vérifiable
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

// ✅ Explicite avec résultat typé
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

**Immutabilité pour éviter les mutations accidentelles :**
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

### 3.3 Checklist anti-régression avant commit

Avant de finaliser la correction, vérifier :

- [ ] `tsc --noEmit` passe sans erreur
- [ ] Les tests existants passent toujours (`npm test`)
- [ ] La correction ne touche pas à du code non lié à l'anomalie
- [ ] Les effets de bord sont documentés dans les commentaires
- [ ] Les types exportés n'ont pas changé de signature (breaking change)
- [ ] Les variables d'environnement nécessaires sont documentées
- [ ] Pas de `any` introduit dans la correction (sauf exception justifiée)

---

## Phase 4 — Tests unitaires anti-régression

Chaque correction doit être accompagnée d'au moins un test qui aurait détecté le bug **avant** qu'il arrive en production.

### 4.1 Structure de test recommandée (Vitest / Jest)

```typescript
/**
 * Tests anti-régression pour [NOM DE L'ANOMALIE]
 * Anomalie détectée le [DATE] — Corrigée dans [FICHIER]
 * 
 * Contexte : [Description du bug en une phrase]
 */
describe('[Module].[Fonction]', () => {
  
  // ✅ Cas nominal (happy path)
  it('retourne la valeur attendue pour une entrée valide', () => {
    const result = myFunction({ id: '1', value: 42 });
    expect(result).toEqual({ processed: true, total: 42 });
  });

  // ⚠️ Cas limite (edge cases)
  it('gère une valeur null sans lever d'exception', () => {
    expect(() => myFunction(null)).not.toThrow();
    expect(myFunction(null)).toBeNull();
  });

  it('gère un tableau vide', () => {
    expect(myFunction([])).toEqual([]);
  });

  // 🐛 Cas de régression (le bug exact)
  it('ne crash pas quand [condition du bug]', () => {
    // Reproduit exactement le scénario du bug
    const badInput = { id: undefined, value: 'not-a-number' };
    expect(() => myFunction(badInput as any)).not.toThrow();
  });

  // 🔒 Cas de sécurité si pertinent
  it('rejette les entrées malformées', () => {
    expect(() => myFunction({ id: '<script>alert(1)</script>' }))
      .toThrow('Invalid input');
  });
});
```

### 4.2 Tests pour les cas async

```typescript
describe('fetchUserProfile', () => {
  
  it('retourne le profil pour un utilisateur valide', async () => {
    // Mock de la dépendance externe
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    
    const result = await fetchUserProfile('user-123');
    
    expect(result).toMatchObject({ id: 'user-123', name: expect.any(String) });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-123' },
    });
  });

  it('retourne null pour un utilisateur inexistant (pas d'exception)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    
    const result = await fetchUserProfile('ghost-id');
    
    expect(result).toBeNull();
  });

  it('propage l'erreur de base de données avec le bon message', async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(
      new Error('Connection timeout')
    );
    
    await expect(fetchUserProfile('user-123')).rejects.toThrow('Connection timeout');
  });
});
```

---

## Phase 5 — Nettoyage du code

Après la correction, effectuer un audit de nettoyage dans les fichiers modifiés.

### 5.1 Éléments à supprimer systématiquement

```typescript
// ❌ À supprimer : console.log de débogage oubliés
console.log('DEBUG:', data);
console.log('test ici');
console.log(JSON.stringify(obj, null, 2));

// ❌ À supprimer : code commenté (utiliser git history à la place)
// const oldFunction = () => { ... }
// TODO: remove this after migration

// ❌ À supprimer : imports inutilisés (tsc et eslint les détectent)
import { useState, useEffect, useCallback } from 'react'; // useCallback non utilisé

// ❌ À supprimer : variables non utilisées
const _unused = computeExpensiveThing(); // jamais lu

// ❌ À supprimer/remplacer : any non justifié
function process(data: any): any { ... } // typing à enrichir

// ❌ À supprimer : code de test laissé en prod
if (process.env.NODE_ENV !== 'test') {
  // Ce bloc ne devrait pas avoir de logique critique
}
```

### 5.2 Éléments risqués à neutraliser

```typescript
// ⚠️ RISQUÉ : eval() — à remplacer impérativement
eval(userInput); // Injection de code

// ⚠️ RISQUÉ : dangerouslySetInnerHTML sans sanitisation
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ⚠️ RISQUÉ : token/secret dans le code source
const API_KEY = 'sk-prod-xxxxx'; // → déplacer dans .env

// ⚠️ RISQUÉ : setTimeout sans cleanup
useEffect(() => {
  setTimeout(() => setState(val), 1000); // fuite si composant démonté
  // ✅ Corriger avec cleanup :
  // const id = setTimeout(...); return () => clearTimeout(id);
}, []);
```

### 5.3 Commandes de nettoyage automatique

```bash
# Détection des imports inutilisés
npx tsc --noEmit 2>&1 | grep "is declared but"

# Lint avec correction automatique
npx eslint --fix src/

# Vérification des console.log restants
grep -rn "console\.log" src/ --include="*.ts" --include="*.tsx"

# Recherche de TODO/FIXME/HACK à traiter
grep -rn "TODO\|FIXME\|HACK\|XXX\|TEMP" src/ --include="*.ts" --include="*.tsx"
```

---

## Phase 6 — Documentation de la correction

### 6.1 Commentaires de code obligatoires

Chaque correction non triviale doit être documentée directement dans le code :

```typescript
/**
 * Calcule le montant TTC à partir du montant HT.
 * 
 * @param amountHT - Montant hors taxe en centimes (entier pour éviter les flottants)
 * @param vatRate - Taux de TVA ex: 0.20 pour 20%
 * @returns Montant TTC en centimes, arrondi à l'entier supérieur
 * 
 * @remarks
 * Fix du 2024-03 : La multiplication directe causait des erreurs d'arrondi
 * flottant (ex: 100.00 * 1.20 = 120.00000000000001). On utilise Math.ceil
 * sur des entiers pour garantir la cohérence avec la comptabilité.
 */
export function calculateTTC(amountHT: number, vatRate: number): number {
  // Travailler en centimes entiers pour éviter les erreurs IEEE 754
  return Math.ceil(amountHT * (1 + vatRate));
}
```

### 6.2 Format du commentaire de fix dans git

```
fix(module): résoudre [description courte du bug]

Cause : [Explication technique de la cause racine]
Symptôme : [Ce que l'utilisateur observait]
Correction : [Ce qui a été changé et pourquoi]

Fixes #[numéro de ticket si applicable]
Tests : [Nom des tests ajoutés]
```

---

## Références complémentaires

Pour les cas avancés, consulter les fichiers de référence :

- **`references/patterns-avances.md`** — Patterns pour les cas complexes : race conditions, fuites mémoire, optimisation de performance
- **`references/stack-specifique.md`** — Particularités de Next.js App Router, Prisma, Supabase, tRPC, Zustand

Lire ces fichiers si le diagnostic indique un problème lié à ces domaines spécifiques.
