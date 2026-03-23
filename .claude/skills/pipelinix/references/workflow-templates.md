# Workflow Templates — YAML Complets

Reference extraite de SKILL.md — Templates de workflows GitHub Actions prets a l emploi.

---

## Template de workflow app (ci-links.yml)

```yaml
name: CI Links
on:
  push:
    branches: [main, dev]
    paths:
      - 'apps/links/**'
      - 'packages/**'
      - 'pnpm-lock.yaml'
  pull_request:
    paths:
      - 'apps/links/**'
      - 'packages/**'

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Turborepo cache
        uses: actions/cache@v4
        with:
          path: node_modules/.cache/turbo
          key: turbo-\${{ runner.os }}-\${{ hashFiles('**/pnpm-lock.yaml') }}-\${{ github.sha }}
          restore-keys: |
            turbo-\${{ runner.os }}-\${{ hashFiles('**/pnpm-lock.yaml') }}-
            turbo-\${{ runner.os }}-

      - name: Type check
        run: pnpm turbo run typecheck --filter=@unanima/links...

      - name: Lint
        run: pnpm turbo run lint --filter=@unanima/links...

      - name: Build
        run: pnpm turbo run build --filter=@unanima/links...

      - name: Test
        run: pnpm turbo run test --filter=@unanima/links...
```

---

## Workflow socle cross-app (ci-packages.yml)

```yaml
name: CI Packages (Socle)
on:
  push:
    branches: [main, dev]
    paths:
      - 'packages/**'
  pull_request:
    paths:
      - 'packages/**'

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  test-all-apps:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    strategy:
      fail-fast: false
      matrix:
        app: [links, creai, omega]

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile

      - name: Build \${{ matrix.app }}
        run: pnpm turbo run build --filter=@unanima/\${{ matrix.app }}...

      - name: Test \${{ matrix.app }}
        run: pnpm turbo run test --filter=@unanima/\${{ matrix.app }}...
```

---

## Quality gate composite

```yaml
name: Quality Gate
on:
  pull_request:
    branches: [main]

jobs:
  gate:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test, build, security-scan]
    if: always()
    steps:
      - name: Check all jobs passed
        run: |
          if [[ "\${{ needs.lint.result }}" != "success" ]] ||
             [[ "\${{ needs.typecheck.result }}" != "success" ]] ||
             [[ "\${{ needs.test.result }}" != "success" ]] ||
             [[ "\${{ needs.build.result }}" != "success" ]]; then
            echo "Quality gate FAILED"
            exit 1
          fi
          echo "Quality gate PASSED"
```

---

## Reusable workflow pour les apps

```yaml
# .github/workflows/reusable-app-ci.yml
name: Reusable App CI
on:
  workflow_call:
    inputs:
      app-name:
        required: true
        type: string
      run-e2e:
        required: false
        type: boolean
        default: false

jobs:
  ci:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run build --filter=@unanima/\${{ inputs.app-name }}...
      - run: pnpm turbo run test --filter=@unanima/\${{ inputs.app-name }}...
      - name: E2E tests
        if: inputs.run-e2e
        run: pnpm turbo run test:e2e --filter=@unanima/\${{ inputs.app-name }}
```

---

## Appel d un reusable workflow depuis une app

```yaml
# .github/workflows/ci-links.yml
name: CI Links
on:
  push:
    paths: ['apps/links/**', 'packages/**']

jobs:
  ci:
    uses: ./.github/workflows/reusable-app-ci.yml
    with:
      app-name: links
      run-e2e: \${{ github.ref == 'refs/heads/main' }}
    secrets: inherit
```

---

## Jobs paralleles (lint, typecheck, test, build)

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps: [...]

  typecheck:
    runs-on: ubuntu-latest
    steps: [...]

  test:
    runs-on: ubuntu-latest
    steps: [...]

  build:
    needs: [lint, typecheck, test]
    runs-on: ubuntu-latest
    steps: [...]
```
