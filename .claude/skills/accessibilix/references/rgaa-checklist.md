# Checklist RGAA — Correspondance WCAG et composants Unanima

## Correspondance RGAA / WCAG

Le RGAA (Référentiel Général d'Amélioration de l'Accessibilité) est l'implémentation française
du WCAG. Pour les applications métier françaises comme celles d'Unanima, la conformité RGAA
peut être exigée contractuellement.

| Thématique RGAA | Critères WCAG | Composants Unanima concernés |
|-----------------|---------------|------------------------------|
| 1. Images | 1.1.1 | KPICard, ChartWrapper, maquettes |
| 3. Couleurs | 1.4.1, 1.4.3 | StatusBadge, AlertPanel, thèmes |
| 5. Tableaux | 1.3.1 | DataTable |
| 7. Scripts | 2.1.1, 4.1.2 | Tous les composants interactifs |
| 8. Éléments obligatoires | 3.1.1, 4.1.1 | Layout, pages |
| 11. Formulaires | 1.3.1, 3.3.2 | LoginForm, tous les formulaires métier |
| 12. Navigation | 2.4.1, 3.2.3 | Sidebar, SearchBar, Layout |

## Déclaration d'accessibilité

Chaque app doit publier une page `/accessibilite` contenant :
- Niveau de conformité visé (WCAG 2.1 AA)
- Liste des non-conformités connues avec plan de correction
- Coordonnées pour signaler un problème d'accessibilité
- Date du dernier audit
