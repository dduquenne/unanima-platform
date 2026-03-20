# Référence Audit — Ergonomie / UX

## Heuristiques de Nielsen (10 principes fondamentaux)

- [ ] **Visibilité du statut** : l'utilisateur sait toujours où il en est (loaders, progress, feedback)
- [ ] **Correspondance système/monde réel** : vocabulaire utilisateur, pas technique
- [ ] **Contrôle et liberté** : annulation possible, retour en arrière, undo/redo
- [ ] **Cohérence et standards** : mêmes actions → mêmes résultats partout
- [ ] **Prévention des erreurs** : validation proactive, confirmation sur actions destructives
- [ ] **Reconnaissance plutôt que rappel** : options visibles, pas à mémoriser
- [ ] **Flexibilité et efficacité** : raccourcis, favoris, préférences pour les utilisateurs avancés
- [ ] **Design minimaliste** : pas d'informations superflues en compétition
- [ ] **Aide à la récupération** : messages d'erreur clairs, solution proposée
- [ ] **Aide et documentation** : disponible, contextuelle, orientée tâche

## Formulaires et saisie

- [ ] Labels visibles et associés aux champs (pas de placeholder seul)
- [ ] Validation inline (pas uniquement au submit)
- [ ] Messages d'erreur sous le champ concerné, en rouge, descriptifs
- [ ] Champs optionnels clairement indiqués (pas uniquement les obligatoires)
- [ ] Ordre des champs logique (du général au spécifique)
- [ ] Pas de reset/clear à côté de submit (erreur fréquente)
- [ ] Autocomplete approprié (`autocomplete="email"`, `"current-password"`, etc.)

## Navigation et orientation

- [ ] Fil d'Ariane sur les pages profondes
- [ ] État actif visible dans la navigation
- [ ] Retour facile vers la page précédente
- [ ] Recherche accessible si contenu > 20 pages
- [ ] URL parlantes et bookmarkables
- [ ] Gestion des 404 avec redirection utile

## Feedback et états

- [ ] États de chargement (skeleton screens > spinners pour le layout)
- [ ] États vides ("empty states") avec call-to-action
- [ ] Confirmation des actions destructives (modale de confirmation)
- [ ] Feedback de succès non bloquant (toast/snackbar)
- [ ] Timeout des sessions avec message clair et conservation des données

## Mobile / Responsive

- [ ] Cibles tactiles ≥ 44×44px (recommandation Apple/Google)
- [ ] Pas de survol requis pour les actions critiques
- [ ] Formulaires adaptés au clavier mobile (type="tel", "email")
- [ ] Pas de scroll horizontal non intentionnel
- [ ] Viewport meta configuré

## Performance perçue

- [ ] Optimistic updates pour les actions rapides
- [ ] Skeleton screens pour les chargements > 300ms
- [ ] Pas de flash de contenu non stylisé (FOUC)
- [ ] Pas de layout shift visible au chargement (CLS < 0.1)
