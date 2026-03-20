# Référence Audit — Accessibilité (WCAG 2.2)

## Niveau AA — Critères essentiels

### Perceptible
- [ ] Images avec texte alternatif (`alt`) — vide si décoratif
- [ ] Vidéos avec sous-titres
- [ ] Contenu non dépendant de la couleur seule
- [ ] Contraste texte ≥ 4.5:1 (normal) / 3:1 (grand)
- [ ] Pas de contenu qui clignote > 3 fois/seconde
- [ ] Texte redimensionnable jusqu'à 200% sans perte de contenu

### Utilisable
- [ ] Navigation entièrement au clavier possible
- [ ] Indicateur de focus visible (`outline` non supprimé)
- [ ] Ordre de tabulation logique (suit le flux visuel)
- [ ] Skip navigation link ("Aller au contenu principal")
- [ ] Titres de page uniques et descriptifs (`<title>`)
- [ ] Liens avec texte descriptif (pas de "cliquez ici")
- [ ] Pas de limites de temps ou avertissement

### Compréhensible
- [ ] `lang` défini sur `<html>`
- [ ] Labels associés aux champs de formulaire
- [ ] Suggestions d'erreur (pas seulement "Erreur")
- [ ] Prévention des erreurs sur les formulaires critiques

### Robuste
- [ ] HTML valide (`W3C Validator`)
- [ ] ARIA utilisé correctement (rôles, états, propriétés)
- [ ] Composants custom avec rôles ARIA appropriés

## ARIA — Pièges fréquents

```html
<!-- ❌ ARIA mal utilisé -->
<div onclick="..." role="button">Click</div> <!-- Manque tabindex, keydown -->

<!-- ✅ Correct -->
<button type="button" onclick="...">Click</button>

<!-- ❌ Alt manquant -->
<img src="logo.png">

<!-- ✅ Correct -->
<img src="logo.png" alt="Logo Entreprise">
<!-- ou si décoratif : -->
<img src="decoration.png" alt="" role="presentation">
```

## Outils de test
```bash
npx axe-core                         # Via navigateur ou CLI
npx pa11y https://votre-app.com
npx lighthouse --only-categories=accessibility
```

- Extensions navigateur : axe DevTools, WAVE
- Lecteur d'écran : NVDA (Windows), VoiceOver (Mac), JAWS
- Test manuel au clavier (Tab, Shift+Tab, Entrée, Espace, Échap)

## RGAA (France)
Pour les organismes publics français, le RGAA 4.1 est obligatoire.
Référence : https://accessibilite.numerique.gouv.fr/
