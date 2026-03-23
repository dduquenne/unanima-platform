# Ordering Algorithm — Sprintix

## Algorithme d'ordonnancement pour la generation du plan

### Etape 1 : Collecte

```
issues[] ← gh project item-list (filtrees par sprint)
Pour chaque issue :
  - priorite ← champ "Priorite" du projet (Critique > Haute > Moyenne > Basse)
  - domaine ← labels ou champ "App" (socle, links, creai, omega)
  - effort ← champ "Effort" ou estimation depuis le body
  - fichiers ← analyse du body (localisation mentionnee)
  - dependances ← mentions "depend de #N" ou "bloque par #N"
```

### Etape 2 : Graphe de dependances

```
Pour chaque paire (issue_A, issue_B) :
  Si A.fichiers ∩ B.fichiers ≠ ∅ → A depend de B (ou inversement, selon priorite)
  Si A.body mentionne "depend de #B" → A depend de B
  Si A est un prerequis (env vars, config) → tout depend de A
```

### Etape 3 : Tri topologique + priorite

```
phases[] ← []
remaining ← toutes les issues

Tant que remaining n'est pas vide :
  batch ← issues de remaining sans dependance non resolue
  Trier batch par (priorite DESC, effort ASC)
  phases.push(batch)
  remaining -= batch
```

### Etape 4 : Annotation des phases

```
Pour chaque phase :
  Si contient des issues critiques sans parallelisme → "sequentiel"
  Si toutes les issues sont independantes → "parallelisable"
  Si contient des CVE ou breaking changes → "review humain requis"
```

---

## Points de controle inter-phases

Entre chaque phase, Sprintix verifie systematiquement :

```bash
# 1. Build complet
pnpm build

# 2. Tests
pnpm test

# 3. Lint (si configure)
pnpm lint 2>/dev/null || true

# 4. Git status propre
git status --porcelain  # doit etre vide
```

Si un point de controle echoue :
1. **Identifier** la cause (quelle issue a casse quoi)
2. **Tenter** une correction automatique
3. **Si impossible** → arreter le sprint et signaler
