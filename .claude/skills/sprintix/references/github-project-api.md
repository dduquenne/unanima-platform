# API GitHub Projects pour Sprintix

## Commandes essentielles

### Lister les projets

```bash
gh project list --owner <OWNER>
```

### Lister les items d'un projet

```bash
# Format JSON complet
gh project item-list <PROJECT_NUMBER> --owner <OWNER> --format json --limit 100

# Extraire les issues d'un sprint spécifique
gh project item-list <PROJECT_NUMBER> --owner <OWNER> --format json | \
  jq '[.items[] | select(.sprint.title == "Sprint 1")]'
```

### Structure d'un item (format JSON)

```json
{
  "id": "PVTI_...",
  "content": {
    "number": 44,
    "title": "[AUDITIX-CRIT-002] Variables d'environnement...",
    "body": "...",
    "repository": "owner/repo"
  },
  "status": "📋 Backlog",
  "sprint": {
    "title": "Sprint 1",
    "startDate": "2026-03-23",
    "duration": 14
  },
  "app": "⚙️ Socle",
  "priorité": "🔴 Critique"
}
```

### Filtrer par sprint

```bash
# Issues du Sprint 1
gh project item-list <N> --owner <OWNER> --format json | \
  jq '[.items[] | select(.sprint.title == "Sprint 1") | {
    number: .content.number,
    title: .content.title,
    status: .status,
    priority: .priorité,
    app: .app
  }]'
```

### Filtrer par statut

```bash
# Issues en backlog
gh project item-list <N> --owner <OWNER> --format json | \
  jq '[.items[] | select(.status == "📋 Backlog")]'

# Issues en cours
gh project item-list <N> --owner <OWNER> --format json | \
  jq '[.items[] | select(.status == "🏗️ En cours")]'
```

---

## Mise à jour des statuts

### Récupérer les IDs nécessaires

Pour modifier un item, il faut connaître :
1. L'ID du projet (`PROJECT_ID`)
2. L'ID de l'item (`ITEM_ID`)
3. L'ID du champ statut (`FIELD_ID`)
4. L'ID de l'option de statut (`OPTION_ID`)

```bash
# ID du projet
gh project list --owner <OWNER> --format json | \
  jq '.projects[] | select(.number == <N>) | .id'

# Champs du projet
gh project field-list <PROJECT_NUMBER> --owner <OWNER> --format json

# Items avec leurs IDs
gh project item-list <PROJECT_NUMBER> --owner <OWNER> --format json | \
  jq '.items[] | select(.content.number == 44) | .id'
```

### Modifier le statut d'un item

```bash
gh project item-edit \
  --project-id <PROJECT_ID> \
  --id <ITEM_ID> \
  --field-id <STATUS_FIELD_ID> \
  --single-select-option-id <OPTION_ID>
```

### Statuts standards du projet Unanima

| Statut | Emoji | Signification |
|--------|-------|---------------|
| Backlog | 📋 | Non commencé |
| En cours | 🏗️ | En développement |
| En review | 👀 | En attente de validation |
| Terminé | ✅ | Implémenté et validé |
| Reporté | ⏭️ | Déplacé au sprint suivant |

---

## Lecture d'une issue

```bash
# Body complet d'une issue
gh issue view <NUMBER> --json title,body,labels,state,milestone

# Avec commentaires
gh issue view <NUMBER> --json title,body,labels,comments
```

---

## Fermeture d'une issue

Les issues sont fermées automatiquement par les commits contenant `closes #N`,
`fixes #N`, ou `resolves #N`. Pas besoin de fermer manuellement.

En cas de besoin :

```bash
gh issue close <NUMBER> --comment "Résolu dans le commit abc1234"
```

---

## Déplacer une issue au sprint suivant

```bash
# Mettre à jour le champ Sprint
gh project item-edit \
  --project-id <PROJECT_ID> \
  --id <ITEM_ID> \
  --field-id <SPRINT_FIELD_ID> \
  --iteration-id <NEXT_SPRINT_ID>
```

---

## Script utilitaire : sprint-summary

```bash
#!/bin/bash
# Résumé rapide d'un sprint
PROJECT=$1
OWNER=$2
SPRINT=$3

gh project item-list $PROJECT --owner $OWNER --format json | \
  jq --arg sprint "$SPRINT" '
    .items
    | map(select(.sprint.title == $sprint))
    | group_by(.status)
    | map({
        status: .[0].status,
        count: length,
        issues: map(.content.number)
      })
  '
```

---

## Synchronisation bidirectionnelle

### Lecture enrichie du Project

```bash
# Récupérer les issues avec tous les champs custom (priorité, effort, itération)
gh project item-list <PROJECT_NUMBER> --owner @me --format json \
  | jq '.items[] | select(.iteration == "Sprint N") | {
      number: .content.number,
      title: .content.title,
      status: .status,
      priority: .priority,
      effort: .effort,
      labels: .content.labels
    }'
```

### Mise à jour automatique des colonnes

| Événement Sprintix | Action GitHub Project |
|---------------------|---------------------|
| Issue lue et analysée | Status → "In Progress" |
| Implémentation terminée + build vert | Status → "Done" |
| Issue bloquée | Status → "Blocked" + commentaire |
| Issue reportée au sprint suivant | Changer l'itération + commentaire |

### Vérification de cohérence en fin de sprint

```bash
# Comparer les issues "Done" dans le Project vs cochées dans le plan
PROJECT_DONE=$(gh project item-list ... | jq '[.items[] | select(.status=="Done")] | length')
PLAN_DONE=$(grep -c "^| ✅" .sprint/sprint-N.md)

if [ "$PROJECT_DONE" != "$PLAN_DONE" ]; then
  echo "⚠️ Incohérence : $PROJECT_DONE done dans Project vs $PLAN_DONE dans le plan"
fi
```
