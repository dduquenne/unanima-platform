# Templates d Issues GitHub

## Template bug report (.github/ISSUE_TEMPLATE/bug_report.md)

```markdown
---
name: Rapport de bug
about: Signaler un comportement inattendu
labels: bug, status:needs-triage
---

## Description
<!-- Description claire et concise du bug -->

## Comportement attendu
<!-- Ce qui devrait se passer -->

## Comportement observe
<!-- Ce qui se passe reellement -->

## Etapes pour reproduire
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

## Template feature request (.github/ISSUE_TEMPLATE/feature_request.md)

```markdown
---
name: Demande de fonctionnalite
about: Proposer une nouvelle idee
labels: enhancement
---

## Probleme a resoudre
<!-- Quelle frustration ou besoin cette feature adresse-t-elle ? -->

## Solution proposee
<!-- Description claire de ce que vous souhaitez -->

## Alternatives considerees
<!-- Autres approches envisagees -->

## Contexte additionnel
<!-- Captures d ecran, references, exemples -->
```

## Template PR (.github/PULL_REQUEST_TEMPLATE.md)

```markdown
## Description
<!-- Que fait cette PR ? Pourquoi ce changement ? -->

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalite
- [ ] Breaking change
- [ ] Documentation
- [ ] Refactorisation
- [ ] Performance

## Issue(s) liee(s)
Closes #<!-- numero -->

## Checklist
- [ ] Mon code suit les conventions du projet
- [ ] J ai effectue une auto-review de mon code
- [ ] J ai ajoute des tests couvrant mes changements
- [ ] Les tests existants passent
- [ ] J ai mis a jour la documentation si necessaire
- [ ] J ai mis a jour le CHANGELOG.md

## Screenshots (si applicable)
```
