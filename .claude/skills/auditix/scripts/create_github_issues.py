#!/usr/bin/env python3
"""
Auditix — Script de création d'issues GitHub en masse
Usage: python create_github_issues.py --repo owner/repo --token ghp_xxx --issues issues.json
"""

import argparse
import json
import sys
import time
from typing import Any

try:
    import requests
except ImportError:
    print("Installer requests : pip install requests")
    sys.exit(1)


def create_issue(
    repo: str,
    token: str,
    title: str,
    body: str,
    labels: list[str],
    milestone: int | None = None,
    assignees: list[str] | None = None,
) -> dict[str, Any]:
    """Crée une issue GitHub via l'API REST."""
    url = f"https://api.github.com/repos/{repo}/issues"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    payload: dict[str, Any] = {
        "title": title,
        "body": body,
        "labels": labels,
    }
    if milestone:
        payload["milestone"] = milestone
    if assignees:
        payload["assignees"] = assignees

    response = requests.post(url, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    return response.json()


def ensure_labels_exist(repo: str, token: str, labels: list[str]) -> None:
    """Crée les labels manquants sur le dépôt."""
    url = f"https://api.github.com/repos/{repo}/labels"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
    }

    # Récupérer les labels existants
    response = requests.get(url, headers=headers, timeout=30)
    existing = {label["name"] for label in response.json()}

    label_colors = {
        "audit": "0075ca",
        "security": "d93f0b",
        "performance": "e4e669",
        "architecture": "c5def5",
        "ux": "bfd4f2",
        "testing": "0e8a16",
        "code-quality": "cfd3d7",
        "documentation": "e99695",
        "devops": "fbca04",
        "accessibility": "5319e7",
        "tech-debt": "b60205",
        "critical": "ee0701",
        "major": "ff7900",
        "minor": "ffcc00",
        "auditix": "1d76db",
    }

    for label in labels:
        if label not in existing:
            color = label_colors.get(label, "ededed")
            requests.post(
                url,
                headers=headers,
                json={"name": label, "color": color},
                timeout=30,
            )
            print(f"  ✅ Label créé : {label}")


def build_issue_body(finding: dict[str, Any]) -> str:
    """Génère le corps Markdown d'une issue à partir d'un finding Auditix."""
    priority_emoji = {
        "critical": "🔴 Critique",
        "major": "🟠 Majeur",
        "minor": "🟡 Mineur",
    }.get(finding.get("priority", "minor"), "🟡 Mineur")

    code_block = ""
    if finding.get("evidence"):
        code_block = f"\n```\n{finding['evidence']}\n```\n"

    acceptance_criteria = "\n".join(
        f"- [ ] {criterion}"
        for criterion in finding.get("acceptance_criteria", ["Problème corrigé", "Tests mis à jour"])
    )

    return f"""## 🔍 Finding Auditix

**Domaine :** {finding.get('domain', 'N/A')}
**Priorité :** {priority_emoji}
**Effort estimé :** {finding.get('effort', 'M')}

## Problème identifié

{finding.get('description', 'N/A')}

## Localisation

`{finding.get('location', 'N/A')}`
{code_block}
## Impact

{finding.get('impact', 'N/A')}

## Préconisation

{finding.get('recommendation', 'N/A')}

## Critères d'acceptance

{acceptance_criteria}

---
*Généré automatiquement par [Auditix](https://github.com)*"""


def main() -> None:
    parser = argparse.ArgumentParser(description="Créer des issues GitHub depuis un rapport Auditix")
    parser.add_argument("--repo", required=True, help="Dépôt cible : owner/repo")
    parser.add_argument("--token", required=True, help="Token GitHub (ghp_xxx)")
    parser.add_argument("--issues", required=True, help="Fichier JSON des findings")
    parser.add_argument("--dry-run", action="store_true", help="Simuler sans créer")
    parser.add_argument(
        "--priority",
        choices=["all", "critical", "critical_major"],
        default="critical_major",
        help="Filtrer par priorité",
    )
    args = parser.parse_args()

    with open(args.issues, encoding="utf-8") as f:
        findings = json.load(f)

    # Filtrer selon la priorité
    if args.priority == "critical":
        findings = [f for f in findings if f.get("priority") == "critical"]
    elif args.priority == "critical_major":
        findings = [f for f in findings if f.get("priority") in ("critical", "major")]

    print(f"📋 {len(findings)} issue(s) à créer sur {args.repo}")

    if not args.dry_run:
        # Collecter tous les labels nécessaires
        all_labels = set()
        for finding in findings:
            all_labels.update(finding.get("labels", []))
        all_labels.update(["auditix"])

        print("🏷️  Vérification des labels...")
        ensure_labels_exist(args.repo, args.token, list(all_labels))

    created = []
    for i, finding in enumerate(findings, 1):
        title = f"[AUDITIX-{finding.get('id', i):03d}] {finding.get('title', 'Finding')}"
        body = build_issue_body(finding)
        labels = finding.get("labels", []) + ["auditix"]

        if args.dry_run:
            print(f"  [DRY RUN] {title}")
            print(f"  Labels: {labels}")
            continue

        try:
            issue = create_issue(
                repo=args.repo,
                token=args.token,
                title=title,
                body=body,
                labels=labels,
            )
            created.append({"id": finding.get("id"), "url": issue["html_url"], "number": issue["number"]})
            print(f"  ✅ #{issue['number']} : {title}")
            time.sleep(0.5)  # Rate limiting
        except Exception as e:
            print(f"  ❌ Erreur pour '{title}' : {e}")

    if not args.dry_run:
        print(f"\n🎉 {len(created)} issue(s) créée(s)")
        for issue in created:
            print(f"  #{issue['number']} → {issue['url']}")


if __name__ == "__main__":
    main()
