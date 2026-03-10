#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <app-name>"
  echo "Example: $0 links"
  echo ""
  echo "Generates Supabase TypeScript types for the given app."
  echo "Requires: SUPABASE_PROJECT_ID environment variable"
  exit 1
fi

APP_NAME="$1"
APP_DIR="apps/${APP_NAME}"

if [ ! -d "$APP_DIR" ]; then
  echo "Error: App '${APP_NAME}' not found at ${APP_DIR}"
  exit 1
fi

PROJECT_ID="${SUPABASE_PROJECT_ID:-}"
if [ -z "$PROJECT_ID" ]; then
  echo "Error: SUPABASE_PROJECT_ID environment variable is not set"
  exit 1
fi

OUTPUT_FILE="${APP_DIR}/src/lib/database.types.ts"
mkdir -p "$(dirname "$OUTPUT_FILE")"

echo "Generating types for app '${APP_NAME}' (project: ${PROJECT_ID})..."

npx supabase gen types typescript \
  --project-id "$PROJECT_ID" \
  > "$OUTPUT_FILE"

echo "Types generated: ${OUTPUT_FILE}"
