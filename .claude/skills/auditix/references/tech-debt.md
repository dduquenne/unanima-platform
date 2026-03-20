# Référence Audit — Dette Technique

## Indicateurs de dette

### Signaux dans le code
- Commentaires `// TODO`, `// FIXME`, `// HACK`, `// XXX` → compter et analyser
- Code commenté (pas supprimé) → signal d'incertitude
- `@ts-ignore` / `@ts-expect-error` non justifiés
- Variables nommées `tmp`, `temp`, `data2`, `newData`
- Fonctions nommées `processStuff()`, `handleThing()`
- Conditions > 5 niveaux d'imbrication
- Fichiers > 500 lignes

```bash
grep -r "TODO\|FIXME\|HACK\|XXX" src/ | wc -l
grep -r "@ts-ignore\|@ts-expect-error" src/
```

### Mesure objective

| Outil | Ce qu'il mesure |
|---|---|
| SonarQube | Dette en heures, code smells, duplication |
| CodeClimate | Maintenabilité A-F, hotspots |
| ESLint stats | Nombre de violations par catégorie |
| `jscpd` | Pourcentage de duplication |

## Priorisation de la dette

**Matrice effort/impact :**

```
Impact élevé  │ Planifier    │ Faire en 1er  │
              │ (Quick wins) │               │
              ├──────────────┼───────────────┤
Impact faible │ Ignorer      │ Planifier     │
              │              │ (si le temps) │
              └──────────────┴───────────────┘
                 Effort élevé   Effort faible
```

## Processus de remboursement suggéré

- **Règle du boy scout** : laisser le code plus propre qu'on l'a trouvé
- **20% rule** : réserver 20% de chaque sprint au remboursement de dette
- **Strangler Fig Pattern** : pour les modules legacy, construire le nouveau à côté
- **Feature Flags** : pour migrer progressivement sans briser l'existant
