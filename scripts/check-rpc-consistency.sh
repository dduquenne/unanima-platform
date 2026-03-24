#!/usr/bin/env bash
# -------------------------------------------------------------------
# check-rpc-consistency.sh
#
# Vérifie la cohérence entre les appels supabase.rpc('...') dans le
# code TypeScript et les fonctions déclarées dans les migrations SQL.
#
# Usage :
#   ./scripts/check-rpc-consistency.sh
#
# Exit codes :
#   0 — Toutes les fonctions RPC appelées sont déclarées
#   1 — Fonctions RPC manquantes dans les migrations
# -------------------------------------------------------------------

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIGRATIONS_DIR="$REPO_ROOT/packages/db/migrations"
CODE_DIRS=("$REPO_ROOT/apps" "$REPO_ROOT/packages")

# Couleurs (désactivées si pas de terminal)
if [ -t 1 ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  BOLD='\033[1m'
  NC='\033[0m'
else
  RED='' GREEN='' YELLOW='' BOLD='' NC=''
fi

# -------------------------------------------------------------------
# 1. Extraire les fonctions RPC déclarées dans les migrations SQL
# -------------------------------------------------------------------
if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo -e "${RED}Erreur : répertoire de migrations introuvable : $MIGRATIONS_DIR${NC}"
  exit 1
fi

declared_file=$(mktemp)
grep -rihE 'CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+public\.' "$MIGRATIONS_DIR" \
  | sed -E 's/.*FUNCTION\s+public\.([a-zA-Z_][a-zA-Z0-9_]*).*/\1/' \
  | sort -u > "$declared_file"

declared_count=$(wc -l < "$declared_file")
echo -e "${BOLD}Fonctions SQL déclarées dans les migrations ($declared_count) :${NC}"
while IFS= read -r f; do
  echo "  ✓ $f"
done < "$declared_file"
echo ""

# -------------------------------------------------------------------
# 2. Extraire les appels .rpc('...') dans le code TypeScript
#    Gère les appels sur une ligne ET multi-lignes via perl.
# -------------------------------------------------------------------
called_file=$(mktemp)
locations_file=$(mktemp)

for dir in "${CODE_DIRS[@]}"; do
  [ -d "$dir" ] || continue
  # Trouver tous les fichiers .ts/.tsx, puis extraire les appels RPC
  # avec perl en mode slurp (-0777) pour gérer les appels multi-lignes
  find "$dir" -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 \
    | xargs -0 perl -0777 -ne '
      while (/\.rpc\(\s*[\x27"]([a-zA-Z_][a-zA-Z0-9_]*)[\x27"]/g) {
        # Calculer le numéro de ligne
        my $pos = pos($_) - length($&);
        my $prefix = substr($_, 0, $pos);
        my $linenum = ($prefix =~ tr/\n//) + 1;
        print "$ARGV:$linenum:$1\n";
      }
    ' 2>/dev/null || true
done | sort -t: -k3,3 -u > "$locations_file"

# Extraire les noms de fonctions uniques
cut -d: -f3 "$locations_file" | sort -u > "$called_file"

called_count=$(wc -l < "$called_file")
echo -e "${BOLD}Fonctions RPC appelées dans le code ($called_count uniques) :${NC}"
while IFS= read -r f; do
  # Lister les fichiers qui appellent cette fonction
  locations=$(grep ":${f}$" "$locations_file" | cut -d: -f1-2 | sed "s|$REPO_ROOT/||g" | tr '\n' ' ')
  echo "  → $f ($locations)"
done < "$called_file"
echo ""

# -------------------------------------------------------------------
# 3. Comparer : fonctions appelées mais non déclarées
# -------------------------------------------------------------------
missing_file=$(mktemp)
comm -23 "$called_file" "$declared_file" > "$missing_file"
missing_count=$(wc -l < "$missing_file")

# -------------------------------------------------------------------
# 4. Résultat
# -------------------------------------------------------------------
if [ "$missing_count" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✅ Cohérence OK — toutes les fonctions RPC appelées sont déclarées dans les migrations.${NC}"
  rm -f "$declared_file" "$called_file" "$locations_file" "$missing_file"
  exit 0
else
  echo -e "${RED}${BOLD}❌ INCOHÉRENCE DÉTECTÉE — $missing_count fonction(s) RPC appelée(s) mais absente(s) des migrations :${NC}"
  echo ""
  while IFS= read -r m; do
    echo -e "${RED}  ✗ $m${NC}"
    grep ":${m}$" "$locations_file" | while IFS= read -r loc; do
      file_info=$(echo "$loc" | cut -d: -f1-2 | sed "s|$REPO_ROOT/||g")
      echo -e "${YELLOW}    appelé dans : $file_info${NC}"
    done
  done < "$missing_file"
  echo ""
  echo -e "${RED}Ajoutez les migrations SQL manquantes dans packages/db/migrations/${NC}"
  rm -f "$declared_file" "$called_file" "$locations_file" "$missing_file"
  exit 1
fi
