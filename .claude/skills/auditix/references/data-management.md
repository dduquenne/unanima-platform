# Référence Audit — Gestion des Données

## State Management (Frontend)

- [ ] Stratégie de state définie (local vs global vs serveur)
- [ ] Server state séparé du client state (React Query, SWR, TanStack Query)
- [ ] Pas de over-fetching (seulement les données nécessaires)
- [ ] Invalidation du cache documentée et cohérente
- [ ] Optimistic updates avec rollback sur erreur
- [ ] Pas de prop drilling excessif (> 3 niveaux sans context/store)

## Persistance et synchronisation

- [ ] Stratégie de sync documentée (pessimistic vs optimistic)
- [ ] Conflits de concurrence gérés (versioning, last-write-wins, ou CRDT)
- [ ] Offline-first si pertinent (PWA)
- [ ] Migrations de schéma gérées (Prisma Migrate, Flyway, Liquibase)
- [ ] Pas de données sensibles dans localStorage

## Caching

- [ ] Stratégie de cache documentée (TTL, invalidation)
- [ ] Cache Redis/Memcached pour les données coûteuses
- [ ] Cache HTTP (Cache-Control, ETags, Last-Modified)
- [ ] CDN pour les assets statiques

## RGPD / Données personnelles

- [ ] Inventaire des données personnelles collectées
- [ ] Durées de conservation définies et respectées
- [ ] Droit à l'effacement implémenté
- [ ] Consentement tracé (cookies, analytics)
- [ ] Données chiffrées au repos et en transit
- [ ] Pas de données PII dans les logs
- [ ] Politique de confidentialité à jour

## Qualité des données

- [ ] Validation côté serveur systématique (zod, class-validator)
- [ ] Contraintes DB (unique, not null, foreign keys) en cohérence avec le métier
- [ ] Pas de données orphelines (cascade delete ou soft delete documenté)
- [ ] Audit trail pour les données critiques (created_at, updated_at, updated_by)
