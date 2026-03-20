# Exemples de messages de commit par domaine

## Frontend

```
feat(ui): ajouter le composant Modal avec accessibilité ARIA
fix(ui): corriger le z-index du menu mobile sur iOS Safari
style(css): migrer les couleurs vers les variables CSS custom properties
perf(images): passer au format WebP avec lazy loading
refactor(forms): extraire la logique de validation dans un hook useForm
```

## Backend / API

```
feat(api): implémenter l'endpoint PATCH /users/:id avec validation Zod
fix(auth): corriger la vérification du token de rafraîchissement expiré
perf(db): ajouter un index composite sur (user_id, created_at)
refactor(repository): séparer la couche DAO de la logique métier
feat(api)!: changer le format de pagination (cursor-based remplace offset)

BREAKING CHANGE: L'API de pagination passe de ?page=N à ?cursor=TOKEN.
Mettre à jour tous les clients avant de déployer.
```

## Base de données

```
feat(db): ajouter la table user_preferences avec migration
fix(db): corriger la contrainte unique sur email (case-insensitive)
refactor(db): renommer la colonne created_date en created_at (snake_case)
```

## CI/CD & Infrastructure

```
ci: ajouter le scan de vulnérabilités Trivy sur les images Docker
build(docker): optimiser le multi-stage build (image 340MB → 45MB)
ci: activer le cache npm pour réduire le temps de CI de 4min à 1min
ci: ajouter le déploiement automatique sur staging après merge develop
```

## Documentation

```
docs: ajouter le guide d'installation pour Windows
docs(api): documenter les codes d'erreur de l'API avec exemples
docs: créer le CONTRIBUTING.md avec les conventions de code
docs(changelog): ajouter les notes de release pour v2.1.0
```

## Tests

```
test(auth): ajouter les tests d'intégration pour le flux OAuth2
test(api): couvrir les cas d'erreur 400/401/403 sur /users
test: configurer Jest pour les tests de snapshot React
fix(test): corriger le test flaky dû à une dépendance temporelle
```

## Sécurité

```
fix(security): corriger l'XSS dans le rendu des commentaires utilisateur
fix(security): mettre à jour lodash 4.17.15 → 4.17.21 (CVE-2021-23337)
feat(security): ajouter les headers de sécurité CSP et HSTS
```

## Maintenance / Chore

```
chore(deps): mettre à jour les dépendances mineurs (npm audit fix)
chore: supprimer les fichiers de configuration obsolètes webpack v4
chore(release): préparer la version 2.0.0
revert: annuler "feat(api): nouveau système de cache" (perf régression)

Reverts commit abc1234.
Cause : augmentation de la latence p99 de 200ms → 800ms en production.
```
