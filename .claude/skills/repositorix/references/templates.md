# GitHub Templates — Issues & Pull Requests

## Template bug report (`.github/ISSUE_TEMPLATE/bug_report.md`)

```markdown
---
name: 🐛 Rapport de bug
about: Signaler un comportement inattendu
labels: bug, status:needs-triage
---

## Description
<!-- Description claire et concise du bug -->

## Comportement attendu
<!-- Ce qui devrait se passer -->

## Comportement observé
<!-- Ce qui se passe réellement -->

## Étapes pour reproduire
1. Aller sur '...'
2. Cliquer sur '...'
3. Observer '...'

## Environnement
- OS : [ex. Ubuntu 22.04]
- Version : [ex. 1.4.2]
- Navigateur : [si applicable]

## Logs / Screenshots
<!-- Joindre si pertinent -->
```

## Template feature request (`.github/ISSUE_TEMPLATE/feature_request.md`)

```markdown
---
name: ✨ Demande de fonctionnalité
about: Proposer une nouvelle idée
labels: enhancement
---

## Problème à résoudre
<!-- Quelle frustration ou besoin cette feature adresse-t-elle ? -->

## Solution proposée
<!-- Description claire de ce que vous souhaitez -->

## Alternatives considérées
<!-- Autres approches envisagées -->

## Contexte additionnel
<!-- Captures d'écran, références, exemples -->
```

## Template PR (`.github/PULL_REQUEST_TEMPLATE.md`)

```markdown
## Description
<!-- Que fait cette PR ? Pourquoi ce changement ? -->

## Type de changement
- [ ] 🐛 Bug fix
- [ ] ✨ Nouvelle fonctionnalité
- [ ] 💥 Breaking change
- [ ] 📚 Documentation
- [ ] ♻️ Refactorisation
- [ ] ⚡ Performance

## Issue(s) liée(s)
Closes #<!-- numéro -->

## Checklist
- [ ] Mon code suit les conventions du projet
- [ ] J'ai effectué une auto-review de mon code
- [ ] J'ai ajouté des tests couvrant mes changements
- [ ] Les tests existants passent
- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] J'ai mis à jour le CHANGELOG.md

## Screenshots (si applicable)
```
