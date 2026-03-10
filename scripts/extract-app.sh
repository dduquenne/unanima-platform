#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <app-name> <output-dir>"
  echo "Example: $0 links ~/livraison-links"
  exit 1
fi

APP_NAME="$1"
OUTPUT_DIR="$2"
APP_DIR="apps/${APP_NAME}"

if [ ! -d "$APP_DIR" ]; then
  echo "Error: App '${APP_NAME}' not found at ${APP_DIR}"
  exit 1
fi

if [ -d "$OUTPUT_DIR" ]; then
  echo "Error: Output directory '${OUTPUT_DIR}' already exists"
  exit 1
fi

echo "Extracting app '${APP_NAME}' to ${OUTPUT_DIR}..."

# Create output directory
mkdir -p "${OUTPUT_DIR}"

# Copy app source
cp -r "${APP_DIR}/." "${OUTPUT_DIR}/"

# Create lib directory for shared packages
mkdir -p "${OUTPUT_DIR}/lib"

# Detect which packages the app depends on
PACKAGES_DIR="packages"
for pkg_dir in "${PACKAGES_DIR}"/*/; do
  pkg_name=$(basename "$pkg_dir")
  # Check if the app's package.json references this package
  if grep -q "@unanima/${pkg_name}" "${APP_DIR}/package.json" 2>/dev/null; then
    echo "  Copying package: @unanima/${pkg_name}"
    cp -r "${pkg_dir}src" "${OUTPUT_DIR}/lib/${pkg_name}/"
    if [ -f "${pkg_dir}package.json" ]; then
      cp "${pkg_dir}package.json" "${OUTPUT_DIR}/lib/${pkg_name}/"
    fi
  fi
done

# Rewrite imports from @unanima/* to ./lib/*
echo "  Rewriting imports..."
find "${OUTPUT_DIR}" -name "*.ts" -o -name "*.tsx" | while read -r file; do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|from '@unanima/\([^']*\)'|from './lib/\1/src'|g" "$file"
    sed -i '' "s|from \"@unanima/\([^\"]*\)\"|from \"./lib/\1/src\"|g" "$file"
  else
    sed -i "s|from '@unanima/\([^']*\)'|from './lib/\1/src'|g" "$file"
    sed -i "s|from \"@unanima/\([^\"]*\)\"|from \"./lib/\1/src\"|g" "$file"
  fi
done

# Generate standalone package.json
echo "  Generating standalone package.json..."
cat > "${OUTPUT_DIR}/package.json" << EOF
{
  "name": "${APP_NAME}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@react-email/components": "^0.0.34",
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.48.1",
    "clsx": "^2.1.1",
    "next": "^14.2.23",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.15.0",
    "resend": "^4.1.2",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "typescript": "^5.7.3"
  }
}
EOF

# Copy base tsconfig
cp "tsconfig.base.json" "${OUTPUT_DIR}/tsconfig.base.json"

# Copy CLAUDE.md from the app, enriched with socle info
if [ -f "${APP_DIR}/CLAUDE.md" ]; then
  cp "${APP_DIR}/CLAUDE.md" "${OUTPUT_DIR}/CLAUDE.md"
fi

# Initialize git repo
echo "  Initializing git repository..."
cd "${OUTPUT_DIR}"
git init
git add .
git commit -m "feat: initial extraction from unanima-platform"

echo ""
echo "Extraction complete: ${OUTPUT_DIR}"
echo "  - App source copied"
echo "  - Shared packages copied to lib/"
echo "  - Imports rewritten"
echo "  - Standalone package.json generated"
echo "  - Git repository initialized"
