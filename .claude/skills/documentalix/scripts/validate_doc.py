#!/usr/bin/env python3
"""
validate_doc.py — Valide un document individuel selon la charte Documentalix
Usage: python validate_doc.py chemin/vers/document.md [--strict]
"""

import re
import sys
import argparse
from pathlib import Path
from datetime import datetime

try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False

VALID_PREFIXES = {"SPEC", "ADR", "GUIDE", "API", "RUN", "RPT", "FEAT", "UX",
                  "SLA", "ONB", "INT", "SDK", "CHG", "ML", "META"}
VALID_STATUSES = {"draft", "review", "approved", "archived", "deprecated"}
REQUIRED_FIELDS = ["title", "id", "version", "status", "author", "created", "updated"]
UNIVERSAL_FILES = {"README.md", "CHANGELOG.md", "CONTRIBUTING.md",
                   "CODE_OF_CONDUCT.md", "SECURITY.md", "INDEX.md",
                   "CHARTE.md", "MIGRATION-NOTES.md"}

FILE_NAME_PATTERN = re.compile(
    r'^([A-Z]{2,6})-([A-Z0-9]{2,8})-([a-z0-9]+(?:-[a-z0-9]+)*)-v(\d+\.\d+)\.md$'
)


def validate(filepath_str: str, strict: bool = False) -> bool:
    filepath = Path(filepath_str)
    errors = []
    warnings = []
    passed = []

    print(f"\n🔍 Validation de : {filepath}\n{'─' * 50}")

    # ── Existence du fichier
    if not filepath.exists():
        print(f"❌ Fichier introuvable : {filepath}")
        return False

    filename = filepath.name

    # ── Nommage
    if filename not in UNIVERSAL_FILES:
        match = FILE_NAME_PATTERN.match(filename)
        if match:
            prefix, cat, name, version = match.groups()
            passed.append(f"Nommage conforme : PREFIXE={prefix}, CAT={cat}, NOM={name}, VER={version}")
            if prefix not in VALID_PREFIXES:
                warnings.append(f"Préfixe inconnu '{prefix}' — vérifier la charte")
        else:
            errors.append(f"Nommage non conforme : '{filename}'")
            errors.append("  Format attendu : PREFIXE-CAT-nom-court-vX.Y.md")
    else:
        passed.append(f"Fichier convention universelle : '{filename}'")

    # ── Lecture du contenu
    try:
        content = filepath.read_text(encoding="utf-8")
    except Exception as e:
        errors.append(f"Impossible de lire le fichier : {e}")
        _print_results(passed, warnings, errors)
        return False

    # ── Frontmatter
    if not content.startswith("---"):
        errors.append("Frontmatter YAML absent (le fichier doit commencer par ---)")
    else:
        parts = content.split("---", 2)
        if len(parts) < 3:
            errors.append("Frontmatter YAML mal formé (pas de --- de fermeture)")
        else:
            fm_text = parts[1].strip()
            fm = {}

            if HAS_YAML:
                try:
                    fm = yaml.safe_load(fm_text) or {}
                    passed.append("Frontmatter YAML syntaxiquement valide")
                except yaml.YAMLError as e:
                    errors.append(f"Frontmatter YAML invalide : {e}")
            else:
                for line in fm_text.splitlines():
                    if ":" in line:
                        k, _, v = line.partition(":")
                        fm[k.strip()] = v.strip().strip('"')

            # Champs requis
            for field in REQUIRED_FIELDS:
                if field not in fm or not fm.get(field):
                    errors.append(f"Champ frontmatter manquant ou vide : '{field}'")
                else:
                    passed.append(f"Champ '{field}' présent : {fm[field]}")

            # Statut
            if "status" in fm:
                if fm["status"] in VALID_STATUSES:
                    passed.append(f"Statut valide : '{fm['status']}'")
                else:
                    errors.append(f"Statut invalide : '{fm['status']}' "
                                  f"(valeurs : {', '.join(sorted(VALID_STATUSES))})")

            # Version sémantique
            if "version" in fm:
                v = str(fm["version"])
                if re.match(r'^\d+\.\d+(\.\d+)?$', v):
                    passed.append(f"Format de version valide : {v}")
                else:
                    errors.append(f"Format de version invalide : '{v}' (ex: 1.2.0)")

            # Cohérence ID / nom de fichier
            if "id" in fm and filename not in UNIVERSAL_FILES:
                doc_id = str(fm["id"])
                expected_prefix = filename.split("-")[0] if "-" in filename else ""
                id_prefix = doc_id.split("-")[0] if "-" in doc_id else ""
                if expected_prefix and id_prefix and expected_prefix != id_prefix:
                    warnings.append(
                        f"Le préfixe de l'ID ('{id_prefix}') ne correspond pas "
                        f"au préfixe du nom de fichier ('{expected_prefix}')"
                    )

            # Fraîcheur (mode strict)
            if strict and "updated" in fm and fm["updated"]:
                try:
                    updated = datetime.strptime(str(fm["updated"]), "%Y-%m-%d")
                    age = (datetime.now() - updated).days
                    status = fm.get("status", "")
                    if status == "approved" and age > 90:
                        warnings.append(f"Document approved non mis à jour depuis {age} jours")
                    if status == "draft" and age > 30:
                        warnings.append(f"Document draft non modifié depuis {age} jours")
                except ValueError:
                    warnings.append(f"Format de date 'updated' invalide : {fm['updated']}")

    # ── Liens internes
    links = re.findall(r'\[.*?\]\(([^)]+)\)', content)
    broken_links = []
    for link in links:
        if link.startswith(("http://", "https://", "#", "mailto:")):
            continue
        target = (filepath.parent / link).resolve()
        if not target.exists():
            broken_links.append(link)

    if broken_links:
        for bl in broken_links:
            warnings.append(f"Lien interne cassé : '{bl}'")
    else:
        if links:
            passed.append(f"Tous les liens internes ({len(links)}) sont valides")

    _print_results(passed, warnings, errors)

    success = len(errors) == 0
    if success:
        print(f"\n{'✅ DOCUMENT VALIDE' if not warnings else '⚠️  DOCUMENT VALIDE AVEC AVERTISSEMENTS'}")
    else:
        print(f"\n❌ DOCUMENT INVALIDE — {len(errors)} erreur(s) à corriger")

    return success


def _print_results(passed, warnings, errors):
    if passed:
        print("✅ Validations réussies :")
        for p in passed:
            print(f"   ✓ {p}")
    if warnings:
        print("\n⚠️  Avertissements :")
        for w in warnings:
            print(f"   ⚡ {w}")
    if errors:
        print("\n❌ Erreurs :")
        for e in errors:
            print(f"   ✗ {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Valide un document selon la charte Documentalix")
    parser.add_argument("filepath", help="Chemin vers le fichier .md à valider")
    parser.add_argument("--strict", action="store_true",
                        help="Mode strict : vérifications de fraîcheur activées")
    args = parser.parse_args()

    success = validate(args.filepath, strict=args.strict)
    sys.exit(0 if success else 1)
