#!/usr/bin/env python3
"""
audit_docs.py — Script d'audit du référentiel documentaire Documentalix
Usage: python audit_docs.py [docs_dir] [--fix] [--report output.md]
"""

import os
import re
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime, timedelta

try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False
    print("⚠️  PyYAML non installé. Frontmatter parsing limité. pip install pyyaml")

# ─── Configuration ────────────────────────────────────────────────────────────

VALID_PREFIXES = {"SPEC", "ADR", "GUIDE", "API", "RUN", "RPT", "FEAT", "UX",
                  "SLA", "ONB", "INT", "SDK", "CHG", "ML", "META"}

VALID_STATUSES = {"draft", "review", "approved", "archived", "deprecated"}

REQUIRED_FRONTMATTER_FIELDS = ["title", "id", "version", "status", "author",
                                 "created", "updated"]

STALE_APPROVED_DAYS = 90   # alerte si doc approved non mis à jour depuis N jours
STALE_DRAFT_DAYS    = 30   # alerte si doc draft vieux de N jours

FILE_NAME_PATTERN = re.compile(
    r'^([A-Z]{2,6})-([A-Z0-9]{2,8})-([a-z0-9]+(?:-[a-z0-9]+)*)-v(\d+\.\d+)\.md$'
)

# ─── Helpers ──────────────────────────────────────────────────────────────────

def extract_frontmatter(filepath: Path) -> dict | None:
    """Extrait le frontmatter YAML d'un fichier Markdown."""
    try:
        content = filepath.read_text(encoding="utf-8")
    except Exception:
        return None

    if not content.startswith("---"):
        return None

    parts = content.split("---", 2)
    if len(parts) < 3:
        return None

    fm_text = parts[1].strip()
    if not HAS_YAML:
        # Parse minimal sans PyYAML
        fm = {}
        for line in fm_text.splitlines():
            if ":" in line:
                k, _, v = line.partition(":")
                fm[k.strip()] = v.strip().strip('"')
        return fm

    try:
        return yaml.safe_load(fm_text) or {}
    except yaml.YAMLError:
        return None


def check_naming_convention(filename: str) -> list[str]:
    """Vérifie le respect de la convention de nommage. Retourne une liste d'erreurs."""
    errors = []
    name = filename

    # Exceptions légitimes
    if name in {"README.md", "CHANGELOG.md", "CONTRIBUTING.md",
                "CODE_OF_CONDUCT.md", "SECURITY.md", "INDEX.md",
                "CHARTE.md", "MIGRATION-NOTES.md"}:
        return []  # Fichiers conventions universelles

    if not FILE_NAME_PATTERN.match(name):
        errors.append(f"Nommage non conforme : '{name}' "
                      f"(attendu : PREFIXE-CAT-nom-court-vX.Y.md)")

        # Diagnostics additionnels
        if " " in name:
            errors.append("  → Contient des espaces")
        if any(c in name for c in "àâäéèêëîïôùûü"):
            errors.append("  → Contient des accents")
        for bad in ["final", "new", "ok", "v2_new", "copy", "copie"]:
            if bad in name.lower():
                errors.append(f"  → Contient le mot proscrit '{bad}'")

    return errors


def check_frontmatter(fm: dict | None, filepath: Path) -> list[str]:
    """Vérifie la complétude et la cohérence du frontmatter."""
    errors = []

    if fm is None:
        return ["Frontmatter YAML absent ou invalide"]

    for field in REQUIRED_FRONTMATTER_FIELDS:
        if field not in fm or not fm[field]:
            errors.append(f"Champ frontmatter manquant ou vide : '{field}'")

    if "status" in fm and fm["status"] not in VALID_STATUSES:
        errors.append(f"Statut invalide : '{fm['status']}' "
                      f"(valeurs valides : {', '.join(VALID_STATUSES)})")

    if "version" in fm:
        v = str(fm["version"])
        if not re.match(r'^\d+\.\d+(\.\d+)?$', v):
            errors.append(f"Format de version invalide : '{v}' (ex: 1.2.0)")

    return errors


def check_freshness(fm: dict, filepath: Path) -> list[str]:
    """Détecte les documents potentiellement obsolètes."""
    warnings = []
    if not fm or "updated" not in fm or not fm["updated"]:
        return warnings

    try:
        updated = datetime.strptime(str(fm["updated"]), "%Y-%m-%d")
    except ValueError:
        return warnings

    age = (datetime.now() - updated).days
    status = fm.get("status", "")

    if status == "approved" and age > STALE_APPROVED_DAYS:
        warnings.append(f"⏰ Document approved non mis à jour depuis {age} jours "
                        f"(seuil : {STALE_APPROVED_DAYS}j)")

    if status == "draft" and age > STALE_DRAFT_DAYS:
        warnings.append(f"⏳ Document draft vieux de {age} jours — "
                        f"à faire avancer ou archiver (seuil : {STALE_DRAFT_DAYS}j)")

    return warnings


def find_broken_links(filepath: Path, docs_root: Path) -> list[str]:
    """Détecte les liens internes cassés dans un document Markdown."""
    broken = []
    try:
        content = filepath.read_text(encoding="utf-8")
    except Exception:
        return broken

    # Trouver tous les liens Markdown [text](path)
    links = re.findall(r'\[.*?\]\(([^)]+)\)', content)
    for link in links:
        # Ignorer les URLs externes et les ancres
        if link.startswith(("http://", "https://", "#", "mailto:")):
            continue
        # Résoudre le chemin relatif
        target = (filepath.parent / link).resolve()
        if not target.exists():
            broken.append(f"Lien cassé : '{link}'")

    return broken


# ─── Audit principal ──────────────────────────────────────────────────────────

def audit_directory(docs_dir: str) -> dict:
    """Audite récursivement le répertoire de documentation."""
    root = Path(docs_dir)
    if not root.exists():
        print(f"❌ Répertoire introuvable : {docs_dir}")
        sys.exit(1)

    results = {
        "timestamp": datetime.now().isoformat(),
        "docs_dir": str(root.absolute()),
        "total_files": 0,
        "files_with_errors": 0,
        "files_with_warnings": 0,
        "files": [],
        "summary": {
            "naming_errors": 0,
            "frontmatter_errors": 0,
            "freshness_warnings": 0,
            "broken_links": 0,
            "status_distribution": {}
        }
    }

    md_files = sorted(root.rglob("*.md"))
    results["total_files"] = len(md_files)

    for filepath in md_files:
        rel_path = filepath.relative_to(root)
        filename = filepath.name

        file_result = {
            "path": str(rel_path),
            "errors": [],
            "warnings": []
        }

        # 1. Vérification nommage
        naming_errors = check_naming_convention(filename)
        file_result["errors"].extend(naming_errors)
        results["summary"]["naming_errors"] += len(naming_errors)

        # 2. Extraction et vérification frontmatter
        fm = extract_frontmatter(filepath)
        fm_errors = check_frontmatter(fm, filepath)
        file_result["errors"].extend(fm_errors)
        results["summary"]["frontmatter_errors"] += len(fm_errors)

        # 3. Vérification fraîcheur
        if fm:
            freshness_warnings = check_freshness(fm, filepath)
            file_result["warnings"].extend(freshness_warnings)
            results["summary"]["freshness_warnings"] += len(freshness_warnings)

            # Distribution des statuts
            status = fm.get("status", "unknown")
            results["summary"]["status_distribution"][status] = \
                results["summary"]["status_distribution"].get(status, 0) + 1

        # 4. Liens cassés
        broken = find_broken_links(filepath, root)
        file_result["warnings"].extend(broken)
        results["summary"]["broken_links"] += len(broken)

        if file_result["errors"]:
            results["files_with_errors"] += 1
        if file_result["warnings"]:
            results["files_with_warnings"] += 1

        if file_result["errors"] or file_result["warnings"]:
            results["files"].append(file_result)

    return results


def format_report(results: dict) -> str:
    """Génère un rapport Markdown lisible."""
    lines = [
        "# Rapport d'audit documentaire",
        f"\n**Date :** {results['timestamp'][:10]}",
        f"**Répertoire :** `{results['docs_dir']}`",
        "",
        "## Résumé",
        f"- 📄 **Total fichiers** : {results['total_files']}",
        f"- ❌ **Fichiers avec erreurs** : {results['files_with_errors']}",
        f"- ⚠️  **Fichiers avec avertissements** : {results['files_with_warnings']}",
        "",
        "### Distribution des statuts",
    ]

    for status, count in sorted(results["summary"]["status_distribution"].items()):
        emoji = {"draft": "📝", "review": "👀", "approved": "✅",
                 "archived": "📦", "deprecated": "🗑️"}.get(status, "❓")
        lines.append(f"- {emoji} **{status}** : {count}")

    lines += [
        "",
        "### Métriques de qualité",
        f"- Erreurs de nommage : {results['summary']['naming_errors']}",
        f"- Erreurs de frontmatter : {results['summary']['frontmatter_errors']}",
        f"- Avertissements de fraîcheur : {results['summary']['freshness_warnings']}",
        f"- Liens cassés : {results['summary']['broken_links']}",
        "",
    ]

    if results["files"]:
        lines.append("## Détail des problèmes détectés\n")
        for f in results["files"]:
            lines.append(f"### `{f['path']}`")
            for e in f["errors"]:
                lines.append(f"- ❌ {e}")
            for w in f["warnings"]:
                lines.append(f"- ⚠️  {w}")
            lines.append("")
    else:
        lines.append("## ✅ Aucun problème détecté\n")
        lines.append("Le référentiel documentaire est conforme à la charte.")

    return "\n".join(lines)


# ─── Point d'entrée ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Audit du référentiel documentaire")
    parser.add_argument("docs_dir", nargs="?", default="docs",
                        help="Répertoire à auditer (défaut: docs/)")
    parser.add_argument("--report", metavar="FILE",
                        help="Sauvegarder le rapport dans un fichier Markdown")
    parser.add_argument("--json", metavar="FILE",
                        help="Sauvegarder les résultats bruts en JSON")
    args = parser.parse_args()

    print(f"🔍 Audit du répertoire : {args.docs_dir}\n")
    results = audit_directory(args.docs_dir)
    report = format_report(results)

    print(report)

    if args.report:
        Path(args.report).write_text(report, encoding="utf-8")
        print(f"\n📄 Rapport sauvegardé : {args.report}")

    if args.json:
        Path(args.json).write_text(json.dumps(results, indent=2, ensure_ascii=False),
                                    encoding="utf-8")
        print(f"📊 JSON sauvegardé : {args.json}")

    # Code de retour pour CI/CD
    sys.exit(1 if results["files_with_errors"] > 0 else 0)
