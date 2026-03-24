#!/usr/bin/env bash
# vercel-ignore.sh — Determines whether a Vercel deployment should proceed.
#
# Vercel calls this script via the "ignoreCommand" in vercel.json.
# Exit code 0 = skip deploy (no relevant changes)
# Exit code 1 = proceed with deploy (changes detected)
#
# IMPORTANT: Vercel runs ignoreCommand from the REPOSITORY ROOT,
# not from the configured Root Directory.
#
# Usage: ./scripts/vercel-ignore.sh <app-name>

set -uo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <app-name>"
  exit 1
fi

APP_NAME="$1"
APP_DIR="apps/${APP_NAME}"

echo "Checking for changes relevant to app '${APP_NAME}'..."

# Directories that, if changed, should trigger a rebuild of this app
WATCHED_PATHS=(
  "${APP_DIR}"
  "packages/core"
  "packages/auth"
  "packages/dashboard"
  "packages/db"
  "packages/email"
  "packages/rgpd"
  "tooling"
  "package.json"
  "pnpm-lock.yaml"
  "pnpm-workspace.yaml"
  "tsconfig.base.json"
)

# Use Vercel's VERCEL_GIT_PREVIOUS_SHA if available, otherwise compare with HEAD~1
PREVIOUS_SHA="${VERCEL_GIT_PREVIOUS_SHA:-}"

# If no previous SHA is available (first deployment), always deploy
if [ -z "${PREVIOUS_SHA}" ]; then
  echo "No previous deployment SHA found — proceeding with deployment of '${APP_NAME}'."
  exit 1
fi

# Ensure the previous commit is available in shallow clones.
# Strategy: progressively deepen the clone until PREVIOUS_SHA is reachable,
# rather than fetching an arbitrary SHA directly (which may fail on GitHub
# when the SHA is not a branch tip).
echo "Fetching previous commit ${PREVIOUS_SHA}..."
if ! git cat-file -e "${PREVIOUS_SHA}" 2>/dev/null; then
  for depth in 10 50 100; do
    git fetch --deepen="${depth}" origin 2>/dev/null || true
    if git cat-file -e "${PREVIOUS_SHA}" 2>/dev/null; then
      break
    fi
  done
fi

# Final fallback: try fetching the SHA directly (works if server allows it)
if ! git cat-file -e "${PREVIOUS_SHA}" 2>/dev/null; then
  git fetch --depth=1 origin "${PREVIOUS_SHA}" 2>/dev/null || true
fi

# Verify the commit is reachable
if ! git cat-file -e "${PREVIOUS_SHA}" 2>/dev/null; then
  echo "Previous SHA ${PREVIOUS_SHA} not reachable — proceeding with deployment of '${APP_NAME}'."
  exit 1
fi

for path in "${WATCHED_PATHS[@]}"; do
  if git diff --quiet "${PREVIOUS_SHA}" HEAD -- "${path}" 2>/dev/null; then
    continue
  else
    echo "Changes detected in '${path}' — proceeding with deployment of '${APP_NAME}'."
    exit 1
  fi
done

echo "No relevant changes for app '${APP_NAME}' — skipping deployment."
exit 0
