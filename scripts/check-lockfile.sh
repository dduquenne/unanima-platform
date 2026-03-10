#!/usr/bin/env bash
# scripts/check-lockfile.sh
# Vérifie que pnpm-lock.yaml est synchronisé avec tous les package.json du workspace.
# Utilisé en CI pour prévenir les déploiements avec un lockfile désynchronisé.

set -euo pipefail

echo "Vérification de la synchronisation du lockfile..."

# pnpm install --frozen-lockfile échoue si le lockfile est désynchronisé
if pnpm install --frozen-lockfile 2>&1; then
  echo "✓ pnpm-lock.yaml est synchronisé avec tous les package.json du workspace."
  exit 0
else
  echo ""
  echo "✗ pnpm-lock.yaml est désynchronisé."
  echo ""
  echo "Correction : exécutez 'pnpm install' localement et commitez le lockfile mis à jour."
  exit 1
fi
