# Référence Audit — UI / Design System

## Cohérence visuelle

- [ ] Design tokens définis (couleurs, typographie, espacement, ombres, radius)
- [ ] Palette de couleurs limitée et documentée (5-8 couleurs max + nuances)
- [ ] Typographie hiérarchisée (h1 > h2 > h3 > body > caption)
- [ ] Espacement basé sur une grille (4px, 8px, 16px, 24px, 32px...)
- [ ] Icônes issues d'une seule bibliothèque cohérente
- [ ] Composants réutilisables (pas de CSS inline répété)
- [ ] Storybook ou équivalent pour documenter les composants

## Contraste et lisibilité (WCAG)

| Contexte | Ratio minimum AA | Ratio AAA |
|---|---|---|
| Texte normal (< 18px) | 4.5:1 | 7:1 |
| Grand texte (≥ 18px / 14px bold) | 3:1 | 4.5:1 |
| Composants UI / graphiques | 3:1 | — |

- [ ] Tous les textes respectent AA minimum
- [ ] Liens distinguables sans la couleur seule (underline ou icône)
- [ ] Pas d'information véhiculée uniquement par la couleur

## Responsive design

- [ ] Breakpoints cohérents et documentés
- [ ] Mobile-first ou graceful degradation documenté
- [ ] Pas de media queries "magic numbers" (utiliser les tokens)

## Animations et transitions

- [ ] Durées cohérentes (micro: 100-200ms, transitions: 200-500ms)
- [ ] `prefers-reduced-motion` respecté
- [ ] Animations non bloquantes (CSS transform/opacity)
- [ ] Pas d'animations purement décoratives sur le chemin critique
