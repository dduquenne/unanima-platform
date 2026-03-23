# GitHub Issues Workflow — Auditix

## Proposition a l'utilisateur

```
🐛 Je peux creer des issues GitHub pour les preconisations.

Options :
1. Toutes les issues (critiques + majeures + mineures)
2. Uniquement les critiques et majeures
3. Selection manuelle (l'utilisateur choisit les IDs)
4. Pas d'issues pour l'instant

Depot GitHub cible : [demander si non fourni]
Labels a utiliser : [audit], [bug], [security], [performance]... [demander ou confirmer]
Milestone : [optionnel]
Assignees : [optionnel]
```

## Format de chaque issue GitHub

```markdown
**Titre :** [AUDITIX-{ID}] {Titre court}

**Labels :** audit, {domaine}, {priorite}

**Body :**
## 🔍 Finding Auditix

**Domaine :** {domaine}
**Priorite :** {🔴 Critique / 🟠 Majeur / 🟡 Mineur}
**Effort estime :** {XS/S/M/L/XL}

## Probleme identifie

{Description precise}

## Localisation

`{fichier:ligne}`

```{extrait de code ou metrique}```

## Impact

{Ce qui peut se passer si non traite}

## Preconisation

{Action concrete}

## Criteres d'acceptance

- [ ] {Critere 1}
- [ ] {Critere 2}
- [ ] Tests ajoutes/mis a jour
- [ ] Documentation mise a jour si necessaire

---
*Genere automatiquement par Auditix*
```

## Suivi post-audit — Integration avec Sprintix

Quand Auditix cree des issues et les assigne a des sprints :

1. **Verifier l'assignation** : chaque issue creee **DOIT** etre ajoutee au
   GitHub Project avec le bon sprint/iteration
2. **Taguer les issues** avec le label `audit` pour les distinguer des features
3. **Ajouter dans le body** de chaque issue :
   ```
   > ⚠️ Issue d'audit Auditix — ne pas reporter sans justification.
   > Assignee au Sprint N. Sera traitee par Sprintix.
   ```
4. **Apres chaque sprint**, verifier que les issues audit assignees ont bien ete
   traitees. Si non → alerter dans le rapport d'audit de suivi.

## Creation via script (si acces filesystem)

Si des fichiers sont accessibles en local, proposer de generer un script de creation en masse
via l'API GitHub ou un fichier JSON importable :

```python
# Voir scripts/create_github_issues.py
```

Sinon, fournir les issues formatees en Markdown copiable-collable, ou en JSON exportable.
