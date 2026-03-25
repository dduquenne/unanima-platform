# Checklist UI — Consultation obligatoire des specs et maquettes

Ce fichier est le point de référence commun pour les skills **ergonomix** et
**maquettix**. Avant toute création ou modification d'écran, les deux skills
DOIVENT suivre cette checklist.

---

## 1. Correspondance App → Specs → Maquettes → Wireframes

| App | Specs fonctionnelles (SFD) | Maquettes SVG | Wireframes |
|---|---|---|---|
| **Links** | `docs/links/specs/SPC-0003-specifications-fonctionnelles-links-v1.0.md` | `docs/links/mockups/MAQ-*.svg` | `docs/links/specs/wireframes/wireframe-*.png` |
| **CREAI** | `docs/creai/specs/` *(à compléter)* | `docs/creai/mockups/` *(à compléter)* | `docs/creai/specs/wireframes/` *(à compléter)* |
| **Omega** | `docs/omega/specs/` *(à compléter)* | `docs/omega/mockups/` *(à compléter)* | `docs/omega/specs/wireframes/` *(à compléter)* |

### Inventaire Links (à jour)

**Maquettes SVG :**
| Réf. | Écran | Fichier |
|---|---|---|
| MAQ-01 | Connexion | `docs/links/mockups/MAQ-01-login.svg` (+ v2) |
| MAQ-02 | Dashboard bénéficiaire | `docs/links/mockups/MAQ-02-dashboard-beneficiaire.svg` |
| MAQ-03 | Saisie de phase | `docs/links/mockups/MAQ-03-saisie-phase.svg` |
| MAQ-04 | Dashboard consultant | `docs/links/mockups/MAQ-04-dashboard-consultant.svg` |
| MAQ-05 | Fiche bénéficiaire (consultant) | `docs/links/mockups/MAQ-05-fiche-beneficiaire-consultant.svg` |
| MAQ-06 | Comptes rendus | `docs/links/mockups/MAQ-06-comptes-rendus.svg` |
| MAQ-07 | Dashboard admin | `docs/links/mockups/MAQ-07-dashboard-admin.svg` |
| MAQ-08 | Gestion utilisateurs | `docs/links/mockups/MAQ-08-gestion-utilisateurs.svg` |
| MAQ-09 | Planification | `docs/links/mockups/MAQ-09-planification.svg` |

**Wireframes :**
| Réf. | Écran | Fichier |
|---|---|---|
| WIR-01 | Connexion | `docs/links/specs/wireframes/wireframe-01-connexion.png` |
| WIR-02 | Dashboard bénéficiaire | `docs/links/specs/wireframes/wireframe-02-dashboard-beneficiaire.png` |
| WIR-03 | Saisie de phase | `docs/links/specs/wireframes/wireframe-03-saisie-phase.png` |
| WIR-04 | Dashboard consultant | `docs/links/specs/wireframes/wireframe-04-dashboard-consultant.png` |
| WIR-05 | Fiche bénéficiaire | `docs/links/specs/wireframes/wireframe-05-fiche-beneficiaire.png` |
| WIR-06 | Dashboard admin | `docs/links/specs/wireframes/wireframe-06-dashboard-admin.png` |
| WIR-07 | Comptes rendus | `docs/links/specs/wireframes/wireframe-07-comptes-rendus.png` |

---

## 2. Palette de couleurs par app

> **Ne pas utiliser la palette générique UNANIMA.** Chaque app a sa propre
> identité définie dans `apps/<app>/src/styles/theme.css` et dans la SFD.

### Links (`apps/links/src/styles/theme.css` — SPC-0003 RT-04)

| Rôle | Variable CSS | Couleur |
|---|---|---|
| Primary | `--color-primary` | `#1E6FC0` |
| Primary dark | `--color-primary-dark` | `#0D3B6E` |
| Secondary | `--color-secondary` | `#0EA5E9` |
| Accent / Warning | `--color-accent` | `#FF6B35` |
| Success | `--color-success` | `#28A745` |
| Background | `--color-background` | `#F5F7FA` |
| Text | `--color-text` | `#4A4A4A` |
| Border | `--color-border` | `#DCE1EB` |
| Font | `--font-family` | `Inter, sans-serif` |

### CREAI (`apps/creai/src/styles/theme.css`)

| Rôle | Variable CSS | Couleur |
|---|---|---|
| Primary | `--color-primary` | `#6D28D9` (violet) |
| Primary dark | `--color-primary-dark` | `#4C1D95` |
| Secondary | `--color-secondary` | `#0D9488` (teal) |
| Accent | `--color-accent` | `#EC4899` (pink) |
| Success | `--color-success` | `#059669` |
| Background | `--color-background` | `#F5F3FF` |
| Text | `--color-text` | `#1E1B4B` |
| Border | `--color-border` | `#DDD6FE` |
| Font | `--font-family` | `Source Sans 3, sans-serif` |

### Omega (`apps/omega/src/styles/theme.css`)

| Rôle | Variable CSS | Couleur |
|---|---|---|
| Primary | `--color-primary` | `#EA580C` (orange) |
| Primary dark | `--color-primary-dark` | `#9A3412` |
| Secondary | `--color-secondary` | `#334155` (slate) |
| Accent | `--color-accent` | `#EAB308` (yellow) |
| Success | `--color-success` | `#16A34A` |
| Background | `--color-background` | `#F8FAFC` |
| Text | `--color-text` | `#0F172A` |
| Border | `--color-border` | `#CBD5E1` |
| Font | `--font-family` | `DM Sans, sans-serif` |

---

## 3. Checklist obligatoire avant toute création/modification d'écran

Avant de coder un composant UI ou de produire une maquette SVG :

- [ ] **Identifier l'app cible** : Links, CREAI ou Omega
- [ ] **Lire la SFD correspondante** : trouver la User Story et les règles de
      gestion de l'écran dans la spécification fonctionnelle de l'app
- [ ] **Consulter la maquette SVG** de l'écran cible (si existante) dans
      `docs/<app>/mockups/`
- [ ] **Consulter le wireframe** de l'écran cible (si existant) dans
      `docs/<app>/specs/wireframes/`
- [ ] **Vérifier la palette de couleurs** de l'app dans
      `apps/<app>/src/styles/theme.css` — ne jamais utiliser la palette
      générique UNANIMA par défaut
- [ ] **Identifier les composants existants réutilisables** dans
      `packages/core/src/components/` et `packages/dashboard/src/`
- [ ] **Vérifier la cohérence** avec les écrans déjà implémentés de la même app

---

## 4. Règles d'utilisation

1. **Ergonomix** : doit consulter cette checklist AVANT toute création ou
   modification de composant UI. La SFD définit les données affichées, les
   actions disponibles, les règles de validation et les rôles autorisés.

2. **Maquettix** : doit consulter cette checklist AVANT toute génération de
   SVG. La palette de l'app cible remplace la palette UNANIMA par défaut.
   Les maquettes existantes définissent le style visuel de référence.

3. **Si aucune SFD ou maquette n'existe** pour l'écran ciblé, le signaler
   explicitement et proposer de créer la maquette en se basant sur la charte
   visuelle de l'app (theme.css) et les conventions des écrans existants.
