# Catalogue d'actions GitHub Actions réutilisables

## Authentification GITHUB_TOKEN dans les workflows

```yaml
# Pattern standard : toujours passer GITHUB_TOKEN aux actions qui touchent GitHub
- uses: actions/checkout@v4
  with:
    token: ${{ secrets.GITHUB_TOKEN }}   # droits en écriture si nécessaire

# Pour les outils CLI (gh, git push) dans un step run:
- name: Opération GitHub
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    gh release create ...
    git push origin main --tags
```

---

## Checkout & Setup

```yaml
- uses: actions/checkout@v4          # Checkout du code
- uses: actions/setup-node@v4        # Node.js
- uses: actions/setup-python@v5      # Python
- uses: actions/setup-java@v4        # Java
- uses: actions/setup-go@v5          # Go
- uses: docker/setup-buildx-action@v3 # Docker Buildx
```

## Cache

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: ${{ runner.os }}-node-
```

## Tests & Qualité

```yaml
- uses: codecov/codecov-action@v4    # Coverage
- uses: SonarSource/sonarcloud-github-action@v2  # SonarCloud
- uses: github/codeql-action/analyze@v3  # CodeQL SAST
```

## Docker

```yaml
- uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

- uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

## Release & Changelog

```yaml
- uses: orhun/git-cliff-action@v3    # Génération changelog (git-cliff)
- uses: softprops/action-gh-release@v2  # Créer une GitHub Release
- uses: release-drafter/release-drafter@v6  # Draft de release automatique
```

## Notifications

```yaml
- uses: slackapi/slack-github-action@v1  # Notification Slack
  with:
    webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
    webhook-type: incoming-webhook
    payload: |
      {
        "text": "Deploy ${{ github.ref_name }} → production ✅"
      }
```

## Workflow de déploiement avec environnement

```yaml
jobs:
  deploy:
    environment:
      name: production
      url: https://monapp.com
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: ./scripts/deploy.sh
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

## Matrice de tests multi-version

```yaml
strategy:
  fail-fast: false
  matrix:
    node-version: ['18', '20', '22']
    os: [ubuntu-latest, windows-latest, macos-latest]
```

## Job conditionnel (ne tourne qu'en PR)

```yaml
jobs:
  preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
```

## Réutilisation de workflows

```yaml
# Dans le workflow appelant
jobs:
  tests:
    uses: ./.github/workflows/reusable-tests.yml
    with:
      node-version: '20'
    secrets: inherit
```
