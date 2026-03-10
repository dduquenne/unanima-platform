#!/usr/bin/env bash
# vercel-ignore.sh — Determines whether a Vercel deployment should proceed.
#
# Vercel calls this script via the "ignoreCommand" in vercel.json.
# Exit code 0 = skip deploy (no relevant changes)
# Exit code 1 = proceed with deploy (changes detected)
#
# Usage: ./scripts/vercel-ignore.sh <app-name>
#
# This ensures that a deployment failure or code change in one app
# does NOT trigger redeployment of another app.

set -euo pipefail

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
PREVIOUS_SHA="${VERCEL_GIT_PREVIOUS_SHA:-HEAD~1}"

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
