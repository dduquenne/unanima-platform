# Guide de Performance des Skills — Conventions Communes

Ce guide définit les conventions de performance que chaque skill produisant des livrables
(documents, rapports, maquettes, code) doit appliquer pour garantir une expérience utilisateur
fluide et réactive.

---

## Principe fondamental : Feedback continu

L'utilisateur doit **toujours savoir ce qui se passe**. Chaque phase de travail silencieuse
(lecture de fichiers, réflexion, génération) doit être précédée d'un message court indiquant
ce qui va se passer et pourquoi.

### Règle des 10 secondes

Si une opération risque de prendre plus de 10 secondes sans output visible, affiche un message
de progression AVANT de la commencer. Exemples :

```
Phase 1/3 — Analyse de la structure du projet...
Lecture de la note de cadrage pour en extraire le périmètre fonctionnel...
Génération de l'Epic 2 : Gestion des bénéficiaires (4 User Stories)...
```

---

## Pattern 1 : Génération incrémentale (documents longs)

Pour tout livrable dépassant ~50 lignes, ne jamais générer le document complet en un seul bloc.
Découper en passes successives avec validation intermédiaire.

### Workflow recommandé

```
Passe 1 — Structure    : Générer le squelette (titres, sous-titres, IDs)
                          → Afficher à l'utilisateur pour validation
Passe 2 — Contenu      : Générer chaque section une par une
                          → Afficher la progression (section N/M)
Passe 3 — Compilation  : Assembler le document final
                          → Écrire le fichier
```

### Pourquoi c'est important

- L'utilisateur peut corriger la direction dès la passe 1 (évite de régénérer 100% du document)
- Chaque passe produit un output visible (élimine les périodes de silence)
- La charge cognitive du modèle est répartie (meilleure qualité par section)
- Le document final est plus cohérent (structure validée avant le contenu)

---

## Pattern 2 : Lecture conditionnelle des références

Ne pas lire systématiquement tous les fichiers de référence. Appliquer une stratégie de lecture
conditionnelle :

### Niveaux de chargement

| Niveau | Quand | Action |
|--------|-------|--------|
| **Essentiel** | Toujours | Templates et formats intégrés dans SKILL.md |
| **Contextuel** | Si le sujet le requiert | Lire le fichier de référence spécifique |
| **Approfondi** | Si l'utilisateur le demande ou cas complexe | Lire les références complémentaires |

### Règle pratique

Avant de lire un fichier de référence, se demander : "Ai-je besoin de ce fichier pour
répondre à cette demande précise ?" Si la réponse est non, ne pas le lire.

Exemples :
- Demande "rédige une User Story pour la connexion" → pas besoin de lire `story-mapping.md`
  ni `glossaire-methodes.md`
- Demande "rédige la SFD complète" → lire `user-stories.md`, pas forcément `note-cadrage.md`
- Demande "fais un story mapping" → lire `story-mapping.md`, pas `note-cadrage.md`

---

## Pattern 3 : Parallélisation par sous-agents

Pour les tâches décomposables en sous-tâches indépendantes, utiliser des sous-agents parallèles
via l'outil Agent. Cela divise le temps total par le nombre de sous-tâches.

### Cas d'usage typiques

| Skill | Tâche | Parallélisation |
|-------|-------|-----------------|
| projetix | SFD multi-Epics | 1 sous-agent par Epic |
| auditix | Audit multi-domaines | 1 sous-agent par domaine d'audit |
| recettix | Plan de recette multi-features | 1 sous-agent par feature |
| maquettix | Maquettes multi-écrans | 1 sous-agent par écran |

### Workflow parallèle

```
1. Générer la structure globale (séquentiel — rapide)
2. Valider la structure avec l'utilisateur
3. Lancer N sous-agents en parallèle pour le contenu détaillé
4. Assembler les résultats dans le document final
```

### Instruction pour sous-agents

Quand tu lances un sous-agent, fournis-lui :
- Le contexte minimal nécessaire (pas tout le document)
- Le format de sortie attendu (template exact)
- Les conventions de nommage (IDs des US, règles métier, etc.)

---

## Pattern 4 : Cadrage du scope avant exécution

Avant de commencer une génération longue, toujours cadrer le scope avec l'utilisateur.
Ne jamais partir dans une génération de document complet sans confirmation.

### Questions de cadrage rapide

```
Avant de commencer, quelques précisions :
- Scope : document complet ou une section spécifique ?
- Profondeur : structure seule, ou contenu détaillé avec critères d'acceptation ?
- Format : Markdown inline, fichier .md, ou .docx ?
```

Si l'utilisateur veut le document complet, l'informer de l'approche incrémentale :

```
Je vais procéder en 3 passes :
1. D'abord la structure (Epics/Features) pour validation
2. Puis le contenu détaillé Epic par Epic
3. Enfin l'assemblage du document final
Cela permet de corriger la direction à chaque étape.
```

---

## Pattern 5 : Messages de progression standardisés

Utiliser un format cohérent pour les messages de progression :

```
[Phase N/M] — Titre de la phase
  Description courte de ce qui se passe...
```

Exemples concrets :

```
[Phase 1/3] — Analyse du périmètre
  Lecture de la note de cadrage et identification des acteurs...

[Phase 2/3] — Génération des spécifications
  Epic 1 : Authentification (3 User Stories)... terminé
  Epic 2 : Gestion des bénéficiaires (5 User Stories)... en cours

[Phase 3/3] — Assemblage et écriture
  Compilation du document final dans docs/links/specs/SFD-v1.0.md...
```

---

## Anti-patterns à éviter

| Anti-pattern | Pourquoi c'est un problème | Alternative |
|---|---|---|
| Lire 4+ fichiers de référence avant de commencer | 30-60s de silence totale | Lecture conditionnelle |
| Générer un document de 200+ lignes en un Write | Longue phase de réflexion invisible | Génération incrémentale |
| Ne pas afficher de message entre les lectures | L'utilisateur croit que rien ne se passe | Message avant chaque phase |
| Invoquer des skills complémentaires en cascade | Chaque skill relit ses propres références | Passer le contexte nécessaire directement |
| Demander "voulez-vous que je continue ?" après chaque ligne | Trop de friction | Valider la structure, puis générer en continu |

---

## Pattern 6 : Gestion des tokens et anti-cascade

La fenetre de contexte est une ressource limitee. Chaque token consomme charge le
SKILL.md complet du skill declenche, plus les references lues, plus les documents
sources, plus la conversation. Quand le contexte se remplit, les messages anterieurs
sont compresses et des informations peuvent etre perdues.

### Regle anti-cascade

Ne jamais invoquer un skill complementaire (`compatibility.recommends`) dans la meme
conversation sauf si l'utilisateur le demande explicitement. Chaque skill charge ajoute
des centaines de lignes au contexte.

Exemple :
- projetix genere une SFD → ne PAS invoquer documentalix pour le frontmatter,
  ni ergonomix pour la validation UX, ni recettix pour les criteres d'acceptation.
- Si l'utilisateur veut ces enrichissements, il les demandera dans une conversation
  separee ou explicitement.

### Regle de compacite des SKILL.md

Le SKILL.md est charge EN ENTIER quand le skill est declenche. Chaque ligne consomme
des tokens. Objectifs de taille :

| Categorie | Lignes max SKILL.md | Strategy |
|-----------|-------------------|----------|
| Skill simple | < 200 lignes | Tout inline |
| Skill standard | 200-350 lignes | Templates inline, details en references |
| Skill complexe | 350-500 lignes | Minimum inline, maximum en references |
| > 500 lignes | A reduire | Extraire templates, exemples, code vers references |

### Regle de compacite des outputs

Pour les documents generes, privilegier la densite sur la verbosité :
- Pas de repetition des instructions dans la sortie
- Pas de commentaires explicatifs dans les templates generes
- Pas de sections vides ("A completer") — les omettre si pas de contenu
- Ecrire le fichier directement sans repeter son contenu dans la conversation

### Delegation aux sous-agents

Quand un skill genere un document long, le sous-agent herite d'un contexte vierge.
C'est un avantage majeur : le sous-agent ne porte pas le poids de la conversation
parente. En fournissant au sous-agent uniquement le contexte minimal necessaire
(template + donnees), on economise des milliers de tokens.

---

## Integration dans un SKILL.md

Pour appliquer ces conventions, ajouter dans chaque SKILL.md qui genere des livrables :

```markdown
## Conventions de performance

Ce skill applique les conventions de `_common/performance-workflow.md` :
- Feedback continu (message avant chaque phase)
- Generation incrementale (structure → validation → contenu → assemblage)
- Lecture conditionnelle des references (pas de lecture systematique)
- Cadrage du scope avant execution
- Anti-cascade (ne pas invoquer de skills complementaires sauf demande explicite)
- Compacite des outputs (densite > verbosite)
```

Puis adapter le workflow du skill en consequence.
