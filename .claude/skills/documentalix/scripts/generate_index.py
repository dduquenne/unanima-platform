#!/usr/bin/env python3
"""
generate_index.py — Génère automatiquement l'INDEX.md du référentiel documentaire
Usage: python generate_index.py [docs_dir] [--output docs/00-meta/INDEX.md]
"""

import os
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

# Ordre des sections dans l'index
FOLDER_ORDER = {
    "00-meta": "00 — Méta / Charte",
    "01-vision": "01 — Vision & Produit",
    "01-produit": "01 — Vision & Produit",
    "02-architecture": "02 — Architecture",
    "03-specifications": "03 — Spécifications",
    "03-specs": "03 — Spécifications",
    "04-guides": "04 — Guides",
    "04-dev": "04 — Développement",
    "04-ux": "04 — UX & Design",
    "05-api": "05 — API",
    "06-tests": "06 — Tests & QA",
    "06-dev": "06 — Développement",
    "07-decisions": "07 — Décisions (ADR)",
    "07-ops": "07 — Opérations",
    "08-runbooks": "08 — Runbooks",
    "08-monitoring": "08 — Monitoring",
    "09-changelog": "09 — Changelog",
    "09-business": "09 — Business",
    "archives": "📦 Archives",
}

STATUS_EMOJI = {
    "draft": "📝",
    "review": "👀",
    "approved": "✅",
    "archived": "📦",
    "deprecated": "🗑️",
    "unknown": "❓",
}

FRESHNESS_THRESHOLD_WARN  = 60   # jours
FRESHNESS_THRESHOLD_ALERT = 90   # jours


def extract_frontmatter(filepath: Path) -> dict:
    try:
        content = filepath.read_text(encoding="utf-8")
    except Exception:
        return {}

    if not content.startswith("---"):
        return {}

    parts = content.split("---", 2)
    if len(parts) < 3:
        return {}

    fm_text = parts[1].strip()

    if not HAS_YAML:
        fm = {}
        for line in fm_text.splitlines():
            if ":" in line:
                k, _, v = line.partition(":")
                fm[k.strip()] = v.strip().strip('"')
        return fm

    try:
        return yaml.safe_load(fm_text) or {}
    except Exception:
        return {}


def freshness_badge(updated_str: str) -> str:
    if not updated_str:
        return "⚪ inconnue"
    try:
        updated = datetime.strptime(str(updated_str), "%Y-%m-%d")
        age = (datetime.now() - updated).days
        if age <= FRESHNESS_THRESHOLD_WARN:
            return f"🟢 {age}j"
        elif age <= FRESHNESS_THRESHOLD_ALERT:
            return f"🟡 {age}j"
        else:
            return f"🔴 {age}j"
    except ValueError:
        return "⚪ format invalide"


def generate_index(docs_dir: str, output_path: str | None = None) -> str:
    root = Path(docs_dir)
    if not root.exists():
        print(f"❌ Répertoire introuvable : {docs_dir}")
        sys.exit(1)

    # Collecter tous les fichiers .md
    all_files = sorted(root.rglob("*.md"))

    # Organiser par dossier de premier niveau
    sections: dict[str, list] = {}

    for filepath in all_files:
        rel = filepath.relative_to(root)
        parts = rel.parts

        # Déterminer le dossier de section
        if len(parts) == 1:
            section_key = "."
            section_label = "📄 Racine"
        else:
            folder = parts[0]
            section_key = folder
            section_label = FOLDER_ORDER.get(folder, folder)

        # Ignorer les fichiers INDEX.md eux-mêmes pour éviter la récursion
        if filepath.name == "INDEX.md" and len(parts) == 2 and parts[0] == "00-meta":
            continue

        fm = extract_frontmatter(filepath)

        entry = {
            "path": rel,
            "filename": filepath.name,
            "title": fm.get("title", filepath.stem),
            "id": fm.get("id", "—"),
            "version": fm.get("version", "—"),
            "status": fm.get("status", "unknown"),
            "author": fm.get("author", "—"),
            "updated": str(fm.get("updated", "")),
            "tags": fm.get("tags", []),
        }

        if section_key not in sections:
            sections[section_key] = {"label": section_label, "files": []}
        sections[section_key]["files"].append(entry)

    # Générer le Markdown
    now = datetime.now().strftime("%Y-%m-%d à %H:%M")
    total = sum(len(s["files"]) for s in sections.values())

    lines = [
        "---",
        'title: "INDEX — Référentiel documentaire"',
        "id: META-GLOBAL-index",
        f"version: {datetime.now().strftime('%Y.%m.%d')}",
        "status: approved",
        f"updated: {datetime.now().strftime('%Y-%m-%d')}",
        "---",
        "",
        "# 📚 Index du référentiel documentaire",
        "",
        f"> Généré automatiquement le {now} — **{total} documents** indexés.",
        "",
        "---",
        "",
    ]

    # Tri des sections selon FOLDER_ORDER
    def section_sort_key(k):
        keys = list(FOLDER_ORDER.keys())
        return keys.index(k) if k in keys else 999

    for section_key in sorted(sections.keys(), key=section_sort_key):
        section = sections[section_key]
        lines.append(f"## {section['label']}")
        lines.append("")
        lines.append("| Document | ID | Version | Statut | Auteur | Fraîcheur |")
        lines.append("|----------|----|---------|--------|--------|-----------|")

        for entry in sorted(section["files"], key=lambda x: str(x["path"])):
            rel_from_meta = Path("..") / entry["path"] if section_key != "." else entry["path"]
            status_emoji = STATUS_EMOJI.get(entry["status"], "❓")
            freshness = freshness_badge(entry["updated"])
            title_link = f"[{entry['title']}]({rel_from_meta})"

            lines.append(
                f"| {title_link} | `{entry['id']}` | {entry['version']} "
                f"| {status_emoji} {entry['status']} | {entry['author']} | {freshness} |"
            )

        lines.append("")

    # Section de légende
    lines += [
        "---",
        "",
        "## Légende",
        "",
        "### Statuts",
        "| Icône | Statut | Signification |",
        "|-------|--------|---------------|",
        "| 📝 | draft | En cours de rédaction |",
        "| 👀 | review | En attente de validation |",
        "| ✅ | approved | Validé, fait référence |",
        "| 📦 | archived | Remplacé, conservé pour traçabilité |",
        "| 🗑️ | deprecated | Obsolète, à supprimer prochainement |",
        "",
        "### Fraîcheur (dernière mise à jour)",
        "| Icône | Signification |",
        "|-------|---------------|",
        f"| 🟢 | Mis à jour il y a moins de {FRESHNESS_THRESHOLD_WARN} jours |",
        f"| 🟡 | Entre {FRESHNESS_THRESHOLD_WARN} et {FRESHNESS_THRESHOLD_ALERT} jours |",
        f"| 🔴 | Plus de {FRESHNESS_THRESHOLD_ALERT} jours — à vérifier |",
        "| ⚪ | Date inconnue |",
        "",
        "---",
        f"*Index généré par [Documentalix](../00-meta/CHARTE.md) — {now}*",
    ]

    content = "\n".join(lines)

    if output_path:
        out = Path(output_path)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(content, encoding="utf-8")
        print(f"✅ INDEX.md généré : {output_path} ({total} documents)")
    else:
        print(content)

    return content


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Génère l'INDEX.md du référentiel docs")
    parser.add_argument("docs_dir", nargs="?", default="docs",
                        help="Répertoire à indexer (défaut: docs/)")
    parser.add_argument("--output", metavar="FILE",
                        default="docs/00-meta/INDEX.md",
                        help="Fichier de sortie (défaut: docs/00-meta/INDEX.md)")
    args = parser.parse_args()

    generate_index(args.docs_dir, args.output)
