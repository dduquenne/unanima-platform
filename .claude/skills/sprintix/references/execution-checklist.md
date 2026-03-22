# Checklist d'exécution Sprintix

## Avant le sprint
- [ ] `.sprint/sprint-N.md` créé avec TOUTES les issues du Project
- [ ] Nombre d'issues plan == nombre d'issues GitHub Project (vérification croisée)
- [ ] Issues ordonnées : critique → majeur sécurité → features → mineurs
- [ ] Build de base vert (`pnpm build && pnpm test`)
- [ ] Branche à jour

## Pour chaque issue
- [ ] Issue lue via `gh issue view #N`
- [ ] Statut Project → "In Progress"
- [ ] Implémentation réalisée
- [ ] Build vert après implémentation
- [ ] Tests passent
- [ ] Commit avec `closes #N` dans le message
- [ ] Statut Project → "Done"
- [ ] Case cochée dans `.sprint/sprint-N.md`

## Entre chaque phase
- [ ] `pnpm build` (3 apps si socle modifié)
- [ ] `pnpm test`
- [ ] `git status` propre
- [ ] Review gate si phase marquée ⚠️

## Fin de sprint
- [ ] TOUTES les cases cochées dans `.sprint/sprint-N.md`
- [ ] Vérification croisée : issues plan vs issues GitHub Project
- [ ] Toutes les issues du sprint CLOSED sur GitHub
- [ ] Tous les statuts Project à "Done"
- [ ] Rapport de sprint généré
- [ ] Delta = 0 (aucune issue oubliée)

## En cas de delta > 0
- [ ] Issues manquantes listées explicitement
- [ ] Pour chaque issue manquante : justification écrite
- [ ] Issues reportées déplacées vers sprint suivant dans le Project
- [ ] Commentaire ajouté sur chaque issue reportée
