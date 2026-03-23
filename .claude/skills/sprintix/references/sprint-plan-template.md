# Sprint Templates — Sprintix

## Sprint Plan Template (`.sprint/sprint-N.md`)

```markdown
# Sprint N — [Titre]
**Periode :** YYYY-MM-DD → YYYY-MM-DD
**Issues :** X au total (Y critiques, Z majeures, W mineures)
**Source :** GitHub Project "Pilotage Multi-Apps", iteration Sprint N

## Checklist exhaustive

| Ordre | Issue | Titre | Priorite | Phase | Skill | Statut |
|-------|-------|-------|----------|-------|-------|--------|
| 1 | #43 | Injection RGPD | 🔴 Critique | 1 | securix | ⬜ |
| 2 | #47 | Validation email | 🟠 Haute | 1 | soclix | ⬜ |
| ... | | | | | | |

## Verification d'exhaustivite
- [ ] Toutes les issues du sprint dans le GitHub Project sont listees ci-dessus
- [ ] Aucune issue n'a ete omise ou reportee sans justification
- [ ] L'ordre respecte la regle securite > features > mineurs
```

Si l'utilisateur demande `/sprintix run N` sans fichier `.sprint/sprint-N.md` :
→ Generer le plan d'abord, le montrer, attendre validation, puis executer.

---

## Sprint Status Display Template

```markdown
## Sprint N — [Titre]
📅 2026-03-23 → 2026-04-05 | ⏱️ Jour 3/14

### Progression
████████░░░░ 5/7 issues (71%)

### Par phase
| Phase | Issues | Terminees | Statut |
|-------|--------|-----------|--------|
| 1 — Prerequis | 2 | 2/2 | ✅ Complete |
| 2 — Independantes | 4 | 3/4 | 🏗️ En cours |
| 3 — Review | 1 | 0/1 | ⏳ En attente |

### Derniere issue traitee
✅ #56 — console.log residuels (il y a 2h)

### Prochaine issue
🎯 #53 — Email expediteur code en dur

### Blocages
(aucun)
```

### Sources de donnees
1. **`.sprint/sprint-N.md`** : plan et checkboxes
2. **GitHub Project** : statuts et metadonnees
3. **Git log** : commits recents avec `closes #N`

---

## Sprint Report Template

```markdown
## Rapport Sprint N — [Titre]

### Resume
- **Periode :** 2026-03-23 → 2026-04-05
- **Issues traitees :** 7/7 (100%)
- **Commits :** 9
- **Fichiers modifies :** 23

### Issues completees
| # | Issue | Commit | Fichiers | Resultat |
|---|-------|--------|----------|----------|
| 1 | #44 | abc1234 | 5 | ✅ |
| 2 | #52 | def5678 | 3 | ✅ |
| ... | | | | |

### Metriques de qualite
- Build : ✅ (les 3 apps)
- Tests : ✅ (X tests, Y% couverture)
- Lint : ✅
- CVE : X restantes (vs Y avant sprint)

### Recommandations pour le Sprint N+1
- [Issues reportees le cas echeant]
- [Dettes techniques decouvertes pendant le sprint]
```

---

## Plan Update Format

Quand une issue est terminee, mettre a jour `.sprint/sprint-N.md` :

```markdown
# Avant
| 3 | #51 | Index manquants sur audit_logs | 🟠 Haute | databasix | — | — |

# Apres
| ✅ 3 | #51 | Index manquants sur audit_logs | 🟠 Haute | databasix | — | Fait (2026-03-24) |
```
