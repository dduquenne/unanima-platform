# Processus de Release

## Suffixes pre-release

```
1.0.0-alpha.1   - alpha (instable, usage interne)
1.0.0-beta.2    - beta (fonctionnelle, tests publics)
1.0.0-rc.1      - release candidate (figee, validation finale)
1.0.0           - release stable
```

## Processus complet de release

```bash
# 1. Creer la branche release
git checkout -b release/1.2.0 develop

# 2. Bumper la version (package.json, pyproject.toml, etc.)
npm version minor --no-git-tag-version

# 3. Mettre a jour CHANGELOG.md
# Ajouter section [1.2.0] - YYYY-MM-DD

# 4. Commit de version
git commit -am "chore(release): preparer la version 1.2.0"

# 5. Merger dans main et taguer
git checkout main && git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

# 6. Merger en retour dans develop
git checkout develop && git merge --no-ff release/1.2.0
git push origin develop

# 7. Supprimer la branche release
git branch -d release/1.2.0
```
