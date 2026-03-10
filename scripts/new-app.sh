#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <app-name>"
  echo "Example: $0 links"
  exit 1
fi

APP_NAME="$1"
APP_DIR="apps/${APP_NAME}"

if [ -d "$APP_DIR" ]; then
  echo "Error: App '${APP_NAME}' already exists at ${APP_DIR}"
  exit 1
fi

echo "Creating app '${APP_NAME}' at ${APP_DIR}..."

# Create directory structure
mkdir -p "${APP_DIR}/src/app"
mkdir -p "${APP_DIR}/src/config"
mkdir -p "${APP_DIR}/src/styles"
mkdir -p "${APP_DIR}/src/lib"

# package.json
cat > "${APP_DIR}/package.json" << EOF
{
  "name": "@unanima/${APP_NAME}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "@unanima/auth": "workspace:*",
    "@unanima/core": "workspace:*",
    "@unanima/dashboard": "workspace:*",
    "@unanima/db": "workspace:*",
    "@unanima/email": "workspace:*",
    "@unanima/rgpd": "workspace:*",
    "next": "^14.2.23",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@unanima/eslint-config": "workspace:*",
    "@unanima/tailwind-config": "workspace:*",
    "@unanima/tsconfig": "workspace:*",
    "typescript": "^5.7.3",
    "vitest": "^1.6.1"
  }
}
EOF

# next.config.js
cat > "${APP_DIR}/next.config.js" << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@unanima/core',
    '@unanima/auth',
    '@unanima/dashboard',
    '@unanima/db',
    '@unanima/email',
    '@unanima/rgpd',
  ],
}

module.exports = nextConfig
EOF

# vercel.json
cat > "${APP_DIR}/vercel.json" << EOF
{
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "buildCommand": "pnpm build --filter=@unanima/${APP_NAME}"
}
EOF

# tsconfig.json
cat > "${APP_DIR}/tsconfig.json" << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "next-env.d.ts", ".next/types/**/*.ts"],
  "exclude": ["node_modules", ".next"]
}
EOF

# Auth config template
cat > "${APP_DIR}/src/config/auth.config.ts" << 'EOF'
import type { AuthConfig } from '@unanima/auth'

export const authConfig: AuthConfig = {
  roles: ['admin', 'user'],
  defaultRole: 'user',
  redirects: {
    afterLogin: '/dashboard',
    afterLogout: '/login',
    unauthorized: '/login',
  },
  permissions: {
    admin: ['*'],
    user: ['read:own', 'write:own'],
  },
}
EOF

# Theme CSS template
cat > "${APP_DIR}/src/styles/theme.css" << 'EOF'
:root {
  --color-primary: #1E6FC0;
  --color-primary-dark: #0D3B6E;
  --color-success: #28A745;
  --color-warning: #FF6B35;
  --color-danger: #DC3545;
  --color-info: #17A2B8;
  --color-background: #F5F7FA;
  --color-text: #4A4A4A;
  --color-border: #DCE1EB;
  --font-family: 'Inter', sans-serif;
}
EOF

# Main layout
cat > "${APP_DIR}/src/app/layout.tsx" << 'EOF'
import type { Metadata } from 'next'
import '../styles/theme.css'

export const metadata: Metadata = {
  title: 'Unanima',
  description: 'Application Unanima',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
EOF

# Main page
cat > "${APP_DIR}/src/app/page.tsx" << 'EOF'
export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-3xl font-bold text-[var(--color-primary)]">
        Bienvenue
      </h1>
    </main>
  )
}
EOF

# CLAUDE.md template
cat > "${APP_DIR}/CLAUDE.md" << EOF
# CLAUDE.md — ${APP_NAME}

## Vue d'ensemble
Application extranet basée sur le socle Unanima.

## Structure
\`\`\`
src/
├── app/          ← App Router Next.js
├── config/       ← Configuration (auth, etc.)
├── lib/          ← Logique métier spécifique
└── styles/       ← Thème CSS
\`\`\`

## Rôles et permissions
Voir \`src/config/auth.config.ts\`
EOF

echo "App '${APP_NAME}' created successfully at ${APP_DIR}"
echo "Next steps:"
echo "  1. Update the theme in ${APP_DIR}/src/styles/theme.css"
echo "  2. Configure roles in ${APP_DIR}/src/config/auth.config.ts"
echo "  3. Run: pnpm install"
