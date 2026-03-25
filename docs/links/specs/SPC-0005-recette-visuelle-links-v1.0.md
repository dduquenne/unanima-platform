---
ref: SPC-0005
title: Plan de recette visuelle — Application Link's Accompagnement
type: SPC
scope: links
status: accepted
version: "1.0"
created: 2026-03-25
updated: 2026-03-25
author: Claude
related-issues: ["#171"]
supersedes: null
superseded-by: null
---

# SPC-0005 — Plan de recette visuelle

## 1. Objectif

Ce document définit le processus de recette visuelle systématique pour
l'application Link's Accompagnement. Il garantit la conformité durable entre
les maquettes SVG de référence (MAQ-01 à MAQ-09) et le code implémenté,
et prévient les régressions visuelles.

> **Maintenance** : ce document doit être mis à jour lorsque de nouvelles
> maquettes sont ajoutées ou que les critères de vérification évoluent.

---

## 2. Périmètre

### 2.1 Maquettes de référence

| Réf. | Écran | Rôle cible | Fichier SVG |
|------|-------|------------|-------------|
| MAQ-01 | Page de connexion | Tous | `docs/links/mockups/MAQ-01-login-v2.svg` |
| MAQ-02 | Dashboard bénéficiaire | Bénéficiaire | `docs/links/mockups/MAQ-02-dashboard-beneficiaire.svg` |
| MAQ-03 | Saisie de phase | Bénéficiaire | `docs/links/mockups/MAQ-03-saisie-phase.svg` |
| MAQ-04 | Dashboard consultant | Consultant | `docs/links/mockups/MAQ-04-dashboard-consultant.svg` |
| MAQ-05 | Fiche bénéficiaire (vue consultant) | Consultant | `docs/links/mockups/MAQ-05-fiche-beneficiaire-consultant.svg` |
| MAQ-06 | Comptes-rendus de séances | Consultant | `docs/links/mockups/MAQ-06-comptes-rendus.svg` |
| MAQ-07 | Dashboard super admin | Super Admin | `docs/links/mockups/MAQ-07-dashboard-admin.svg` |
| MAQ-08 | Gestion des utilisateurs | Super Admin | `docs/links/mockups/MAQ-08-gestion-utilisateurs.svg` |
| MAQ-09 | Planification des rendez-vous | Consultant | `docs/links/mockups/MAQ-09-planification.svg` |

### 2.2 Document de traçabilité

La matrice **SPC-0004** (`docs/links/specs/SPC-0004-matrice-tracabilite-links-v1.0.md`)
fait le lien entre User Stories, maquettes et fichiers de code. Elle doit être
consultée et mise à jour en parallèle de toute recette visuelle.

---

## 3. Checklist de vérification par écran

### 3.1 Points de contrôle communs (tous écrans)

| # | Point de contrôle | Catégorie | Priorité |
|---|-------------------|-----------|----------|
| C01 | Palette de couleurs conforme aux variables CSS du thème (`theme.css`) | Couleurs | Critique |
| C02 | Couleur primaire `--color-primary: #1E6FC0` respectée | Couleurs | Critique |
| C03 | Couleur de fond `--color-background: #F5F7FA` respectée | Couleurs | Haute |
| C04 | Couleur de texte `--color-text: #4A4A4A` respectée | Couleurs | Haute |
| C05 | Couleur de bordure `--color-border: #DCE1EB` respectée | Couleurs | Moyenne |
| C06 | Police `Inter` utilisée, pas de fallback visible | Typographie | Haute |
| C07 | Hiérarchie typographique (H1 > H2 > body) conforme | Typographie | Haute |
| C08 | Espacements (padding/margin) visuellement cohérents avec la maquette | Espacement | Haute |
| C09 | Alignement des éléments (grille, flexbox) conforme | Layout | Haute |
| C10 | Bordures arrondies (`border-radius`) conformes | Formes | Moyenne |
| C11 | Ombres (`box-shadow`) conformes si présentes dans la maquette | Formes | Moyenne |
| C12 | Icônes présentes et conformes (taille, couleur, position) | Icônes | Moyenne |
| C13 | Responsive : pas de débordement horizontal sur mobile (375px) | Responsive | Haute |
| C14 | Responsive : mise en page adaptée sur tablette (768px) | Responsive | Moyenne |

### 3.2 Points de contrôle des états interactifs

| # | Point de contrôle | Catégorie | Priorité |
|---|-------------------|-----------|----------|
| I01 | État hover des boutons conforme (couleur, transition) | Interaction | Haute |
| I02 | État focus visible sur tous les éléments interactifs | Interaction | Haute |
| I03 | État disabled visuellement distinct | Interaction | Moyenne |
| I04 | État loading (spinner/skeleton) présent si applicable | Interaction | Moyenne |
| I05 | État vide (empty state) conforme si applicable | Interaction | Moyenne |
| I06 | État erreur des formulaires conforme (couleur rouge, message) | Interaction | Haute |
| I07 | Transitions/animations fluides (pas de saccade) | Interaction | Moyenne |

### 3.3 Checklist spécifique par écran

#### MAQ-01 — Page de connexion

| # | Point de contrôle |
|---|-------------------|
| L01 | Layout split-screen : illustration à gauche, formulaire à droite |
| L02 | Logo Link's Accompagnement positionné correctement |
| L03 | Champs email et mot de passe avec labels et placeholders |
| L04 | Bouton "Se connecter" avec style primaire |
| L05 | Lien "Mot de passe oublié ?" positionné et stylé |
| L06 | Message d'erreur d'authentification stylé correctement |

#### MAQ-02 — Dashboard bénéficiaire

| # | Point de contrôle |
|---|-------------------|
| D01 | Barre latérale (sidebar) avec navigation conforme |
| D02 | En-tête avec nom de l'utilisateur et avatar/initiales |
| D03 | Carte de progression des 6 phases avec barre de progression |
| D04 | Liste des prochaines séances avec dates et statuts |
| D05 | Indicateurs KPI (nombre de phases complétées, etc.) |
| D06 | Couleurs de statut conformes (vert=terminé, bleu=en cours, gris=à venir) |

#### MAQ-03 — Saisie de phase

| # | Point de contrôle |
|---|-------------------|
| P01 | Titre de la phase et numéro clairement affichés |
| P02 | Liste des questions avec numérotation |
| P03 | Zones de saisie (textarea) dimensionnées correctement |
| P04 | Bouton de sauvegarde et indicateur d'autosave |
| P05 | Bouton de validation de la phase |
| P06 | Navigation entre phases (précédent/suivant) |

#### MAQ-04 — Dashboard consultant

| # | Point de contrôle |
|---|-------------------|
| DC01 | Tableau des bénéficiaires avec colonnes conformes |
| DC02 | Barre de recherche fonctionnelle et positionnée |
| DC03 | Indicateurs de progression par bénéficiaire |
| DC04 | Filtres (statut, date) conformes |
| DC05 | Actions par ligne (voir fiche, planifier) |

#### MAQ-05 — Fiche bénéficiaire (vue consultant)

| # | Point de contrôle |
|---|-------------------|
| FB01 | Informations du bénéficiaire (nom, email, date inscription) |
| FB02 | Progression détaillée des 6 phases |
| FB03 | Accès aux réponses par phase |
| FB04 | Historique des séances |
| FB05 | Actions (planifier séance, saisir compte-rendu) |

#### MAQ-06 — Comptes-rendus de séances

| # | Point de contrôle |
|---|-------------------|
| CR01 | Liste des séances avec dates et statuts |
| CR02 | Formulaire de saisie du compte-rendu |
| CR03 | Champs : objectifs, contenu, observations, actions |
| CR04 | Bouton export PDF |
| CR05 | Historique des comptes-rendus précédents |

#### MAQ-07 — Dashboard super admin

| # | Point de contrôle |
|---|-------------------|
| DA01 | KPIs globaux (nombre de bilans, consultants, bénéficiaires) |
| DA02 | Graphiques statistiques (progression, répartition) |
| DA03 | Alertes et notifications système |
| DA04 | Navigation vers gestion des utilisateurs |

#### MAQ-08 — Gestion des utilisateurs

| # | Point de contrôle |
|---|-------------------|
| GU01 | Tableau des utilisateurs avec colonnes conformes |
| GU02 | Filtres par rôle (bénéficiaire, consultant, admin) |
| GU03 | Actions : créer, modifier, désactiver |
| GU04 | Modale ou page de création d'utilisateur |
| GU05 | Attribution consultant ↔ bénéficiaire |

#### MAQ-09 — Planification des rendez-vous

| # | Point de contrôle |
|---|-------------------|
| PL01 | Vue calendrier ou liste des créneaux |
| PL02 | Formulaire de planification (date, heure, bénéficiaire) |
| PL03 | Champ lien visioconférence |
| PL04 | Statuts de rendez-vous (planifié, confirmé, passé) |
| PL05 | Notifications associées |

---

## 4. Procédure de comparaison maquette vs rendu

### 4.1 Méthode manuelle (v1 — immédiate)

1. **Ouvrir la maquette SVG** correspondante dans un navigateur ou un éditeur SVG
2. **Ouvrir l'écran implémenté** dans le navigateur à la même résolution (1440×900 desktop)
3. **Comparer visuellement** en plaçant les deux fenêtres côte à côte
4. **Vérifier chaque point** de la checklist commune (C01-C14) + checklist spécifique
5. **Vérifier les états interactifs** (I01-I07) en interagissant avec la page
6. **Documenter les écarts** dans le rapport d'écart (section 5)

### 4.2 Méthode par superposition

1. Capturer un screenshot de l'écran implémenté (même résolution que la maquette)
2. Ouvrir la maquette SVG et le screenshot dans un éditeur d'image
3. Superposer avec opacité à 50% pour identifier les décalages
4. Les décalages > 4px sont considérés comme des écarts à corriger

### 4.3 Tests visuels automatisés (v2 — optionnel)

Configuration Playwright pour capture et comparaison automatique :

```typescript
// apps/links/e2e/visual-regression.spec.ts
import { test, expect } from '@playwright/test'

const SCREENS = [
  { name: 'login', url: '/login', maq: 'MAQ-01' },
  { name: 'dashboard-beneficiaire', url: '/dashboard', maq: 'MAQ-02' },
  { name: 'saisie-phase', url: '/bilans/1', maq: 'MAQ-03' },
  { name: 'dashboard-consultant', url: '/beneficiaires', maq: 'MAQ-04' },
  { name: 'fiche-beneficiaire', url: '/beneficiaires/1', maq: 'MAQ-05' },
  { name: 'comptes-rendus', url: '/beneficiaires/1/comptes-rendus', maq: 'MAQ-06' },
  { name: 'dashboard-admin', url: '/admin', maq: 'MAQ-07' },
  { name: 'gestion-utilisateurs', url: '/admin/utilisateurs', maq: 'MAQ-08' },
  { name: 'planification', url: '/beneficiaires/1/planification', maq: 'MAQ-09' },
]

for (const screen of SCREENS) {
  test(`${screen.maq} - ${screen.name} visual regression`, async ({ page }) => {
    await page.goto(screen.url)
    await expect(page).toHaveScreenshot(`${screen.name}.png`, {
      maxDiffPixelRatio: 0.001, // 0.1% de tolérance
      fullPage: true,
    })
  })
}
```

**Mise en place v2 :**
- Ajouter les screenshots de référence après validation visuelle initiale
- Configurer dans le workflow CI (`ci-links.yml`) un job dédié
- Seuil de tolérance configurable par écran si nécessaire

---

## 5. Template de rapport d'écart

Utiliser ce template pour documenter tout écart constaté :

```markdown
### Écart [MAQ-XX] — [Titre court]

- **Écran** : MAQ-XX — [Nom de l'écran]
- **Point de contrôle** : [Code du point, ex : C01, L03]
- **Sévérité** : Critique | Haute | Moyenne | Basse
- **Description** : [Description précise de l'écart]
- **Attendu** : [Ce que montre la maquette]
- **Constaté** : [Ce que montre le rendu]
- **Capture** : [Screenshot ou description précise]
- **Fichier concerné** : [Chemin du fichier source]
- **Correction proposée** : [Action corrective]
```

### Niveaux de sévérité

| Sévérité | Définition | Action |
|----------|------------|--------|
| Critique | Écart majeur de layout ou de couleur rendant l'écran non conforme | Bloque la PR — correction obligatoire |
| Haute | Écart notable d'espacement, typographie ou état interactif | Correction avant merge recommandée |
| Moyenne | Écart mineur de bordure, ombre ou arrondi | Peut être corrigé dans une PR suivante |
| Basse | Écart cosmétique quasi imperceptible | Suivi en backlog |

---

## 6. Intégration dans le workflow de développement

### 6.1 Avant chaque PR touchant une page Links

1. Identifier les écrans impactés par les modifications
2. Pour chaque écran impacté :
   - Ouvrir la maquette SVG de référence
   - Effectuer la comparaison visuelle (section 4)
   - Vérifier les points de contrôle communs (C01-C14) + spécifiques
   - Vérifier les états interactifs (I01-I07)
3. Documenter tout écart identifié dans la PR
4. Compléter la checklist de conformité visuelle dans le template de PR
5. Mettre à jour la matrice de traçabilité SPC-0004 si le statut d'un écran change

### 6.2 Pour les développeurs IA (Claude Code)

Lors de l'implémentation d'un écran Links :
1. Lire la maquette SVG de référence avant toute modification
2. Appliquer les styles conformément aux variables CSS du thème
3. Vérifier la conformité en relisant le SVG après implémentation
4. Mentionner dans le commit la maquette de référence : `feat(links): implement MAQ-XX ...`

### 6.3 Révision de PR

Le relecteur de PR doit :
1. Vérifier que la checklist de conformité visuelle est complétée
2. Ouvrir la maquette SVG de référence et comparer avec le rendu
3. Signaler tout écart non documenté
4. Vérifier que la matrice de traçabilité SPC-0004 est à jour

---

## 7. Références

| Document | Lien |
|----------|------|
| Matrice de traçabilité | `docs/links/specs/SPC-0004-matrice-tracabilite-links-v1.0.md` |
| Spécifications fonctionnelles | `docs/links/specs/SPC-0003-specifications-fonctionnelles-links-v1.0.md` |
| Thème CSS | `apps/links/src/styles/theme.css` |
| Maquettes SVG | `docs/links/mockups/MAQ-01 à MAQ-09` |
