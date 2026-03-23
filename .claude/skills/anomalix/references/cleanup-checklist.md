# Checklist de Nettoyage du Code

## Elements a supprimer systematiquement

```typescript
// console.log de debogage oublies
console.log('DEBUG:', data);
console.log('test ici');
console.log(JSON.stringify(obj, null, 2));

// code commente (utiliser git history a la place)
// const oldFunction = () => { ... }
// TODO: remove this after migration

// imports inutilises (tsc et eslint les detectent)
import { useState, useEffect, useCallback } from 'react'; // useCallback non utilise

// variables non utilisees
const _unused = computeExpensiveThing(); // jamais lu

// any non justifie
function process(data: any): any { ... } // typing a enrichir

// code de test laisse en prod
if (process.env.NODE_ENV !== 'test') {
  // Ce bloc ne devrait pas avoir de logique critique
}
```

## Elements risques a neutraliser

```typescript
// RISQUE : eval() -- a remplacer imperativement
eval(userInput); // Injection de code

// RISQUE : dangerouslySetInnerHTML sans sanitisation
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// RISQUE : token/secret dans le code source
const API_KEY = 'sk-prod-xxxxx'; // -> deplacer dans .env

// RISQUE : setTimeout sans cleanup
useEffect(() => {
  setTimeout(() => setState(val), 1000); // fuite si composant demonte
  // Corriger avec cleanup :
  // const id = setTimeout(...); return () => clearTimeout(id);
}, []);
```

## Commandes de nettoyage automatique

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
