# Git Flow — Référence détaillée

## Comparaison des stratégies de branches

| Stratégie        | Adapté à                         | Complexité |
|------------------|----------------------------------|------------|
| Git Flow         | Versions software planifiées     | Élevée     |
| GitHub Flow      | Déploiement continu (CD)         | Faible     |
| GitLab Flow      | Entre les deux                   | Moyenne    |
| Trunk-Based Dev  | Équipes expérimentées, CI strict | Faible     |

## Quand utiliser quel modèle

**GitHub Flow** (recommandé pour la majorité des projets web) :
- `main` est toujours déployable
- Branches de feature directement depuis `main`
- PR → review → merge → déploiement immédiat
- Idéal : SaaS, applications web, déploiement plusieurs fois par jour

**Git Flow** (logiciel avec versions numérotées) :
- Cycles de release planifiés
- Support de plusieurs versions en parallèle
- Applications mobiles, bibliothèques, logiciels packagés

**Trunk-Based Development** (CI/CD mature) :
- Toute l'équipe pousse sur `main` (ou très courtes branches < 1 jour)
- Feature flags pour masquer les fonctionnalités incomplètes
- Tests automatisés robustes obligatoires

## Résolution de conflits de merge

```bash
# Préférer rebase pour les branches feature
git checkout feature/ma-feature
git fetch origin
git rebase origin/develop

# En cas de conflit
git status                    # identifier les fichiers en conflit
# Éditer les fichiers, résoudre <<<<< HEAD ... >>>>>> origin/develop
git add <fichier-résolu>
git rebase --continue

# Annuler le rebase si nécessaire
git rebase --abort
```

## Hotfix en urgence

```bash
# Partir de main (pas de develop !)
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-patch

# Fix, tests, commit
git commit -m "fix(security): corriger injection SQL sur endpoint /api/users

Closes #156 — CVE-2024-XXXX"

# Merger dans main ET develop
git checkout main && git merge --no-ff hotfix/critical-security-patch
git tag -a v1.4.1 -m "Hotfix: security patch CVE-2024-XXXX"
git push origin main --tags

git checkout develop && git merge --no-ff hotfix/critical-security-patch
git push origin develop

git branch -d hotfix/critical-security-patch
```

## Squash vs Merge vs Rebase — Choisir la bonne stratégie

| Stratégie     | Historique `main` | Quand l'utiliser                     |
|---------------|-------------------|--------------------------------------|
| Squash merge  | Linéaire, propre  | Feature branches (recommandé)        |
| Merge commit  | Non-linéaire      | Release branches, hotfixes           |
| Rebase merge  | Linéaire          | Petites branches triviales           |

**Règle d'or :** Ne jamais rebase une branche partagée/publique.
