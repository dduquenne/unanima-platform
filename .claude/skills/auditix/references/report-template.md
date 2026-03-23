# Report Template — Auditix

## Full Audit Report Template

```markdown
# 🔍 Rapport d'Audit Auditix
**Application :** [Nom]
**Date :** [Date]
**Auditeur :** Auditix
**Perimetre :** [Domaines couverts]
**Version auditee :** [commit/tag/branche]

---

## 📊 Tableau de bord

| Domaine | Score /10 | Critiques | Majeurs | Mineurs |
|---|---|---|---|---|
| Architecture | X | N | N | N |
| Securite | X | N | N | N |
| ... | ... | ... | ... | ... |
| **GLOBAL** | **X** | **N** | **N** | **N** |

---

## 🏆 Points forts

> Ce qui fonctionne bien et merite d'etre preserve (3-5 points)

---

## 🚨 Preconisations

### Classement par priorite absolue

#### 🔴 CRITIQUES — A traiter immediatement

[Pour chaque finding critique :]
**[CRIT-XXX] Titre court du probleme**
- **Domaine :** [domaine]
- **Localisation :** [fichier:ligne ou module]
- **Probleme :** Description precise du probleme
- **Impact :** Ce qui peut se passer si non corrige
- **Preuve :** `extrait de code ou metrique`
- **Preconisation :** Action concrete a mener
- **Effort estime :** [XS/S/M/L/XL]

#### 🟠 MAJEURS — A planifier dans le sprint suivant

[Meme format, identifiants MAJ-XXX]

#### 🟡 MINEURS — Backlog d'amelioration continue

[Meme format, identifiants MIN-XXX]

---

## 📋 Preconisations par domaine

### 🏗️ Architecture
[Findings et recommandations specifiques au domaine]

### 🔒 Securite
[...]

[Un sous-titre par domaine audite]

---

## 🗺️ Roadmap suggeree

| Sprint | Actions prioritaires | Effort total |
|---|---|---|
| Immediat (< 1 semaine) | CRIT-001, CRIT-002... | M |
| Sprint 1 | MAJ-001, MAJ-002... | L |
| Sprint 2 | MAJ-003, MIN-001... | M |
| Backlog | MIN-XXX... | XL |

---

## 📈 Metriques de suivi

> KPIs a mesurer avant/apres remediation

---

## 🐛 Issues GitHub suggerees

[Liste des N issues proposees — voir section dediee]
```
