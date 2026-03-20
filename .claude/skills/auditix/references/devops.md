# Référence Audit — CI/CD & DevOps

## Pipeline CI

- [ ] CI configuré (GitHub Actions, GitLab CI, CircleCI...)
- [ ] Lint + tests exécutés sur chaque PR
- [ ] Build vérifié avant merge
- [ ] Analyse de sécurité dans le pipeline (npm audit, Snyk)
- [ ] Couverture de tests vérifiée (seuil minimal configuré)
- [ ] Type-check TypeScript (`tsc --noEmit`)

## Déploiement

- [ ] Environnements distincts (dev, staging, production)
- [ ] Déploiement automatisé (pas de FTP manuel)
- [ ] Rollback possible rapidement
- [ ] Zero-downtime deployment (blue/green, canary)
- [ ] Variables d'environnement gérées en dehors du code (Vault, services cloud)

## Monitoring & Observabilité

- [ ] Logs structurés (JSON) avec niveaux (debug/info/warn/error)
- [ ] Traces distribuées (OpenTelemetry, Datadog APM)
- [ ] Métriques applicatives (uptime, latence, taux d'erreur)
- [ ] Alerting configuré sur les métriques critiques
- [ ] Error tracking (Sentry, Bugsnag)
- [ ] Dashboard de santé accessible à l'équipe

## Infrastructure

- [ ] IaC utilisé si infra cloud (Terraform, CDK, Pulumi)
- [ ] Pas de configuration manuelle non documentée
- [ ] Backups automatiques et testés
- [ ] Plan de reprise d'activité documenté (RPO/RTO)
