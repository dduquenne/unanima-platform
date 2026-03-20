# Référence Audit — Dépendances

## Sécurité des dépendances

```bash
npm audit --audit-level=moderate      # CVE connues
npx snyk test                         # Analyse approfondie
npx license-checker --summary         # Audit des licences
npx depcheck                          # Dépendances inutilisées
```

- [ ] Zéro vulnérabilité critique ou haute
- [ ] Licences compatibles avec l'usage (MIT, Apache 2.0 ✅ / GPL ⚠️)
- [ ] Pas de dépendances abandonnées (dernière release > 2 ans, pas de mainteneur)
- [ ] Dependabot ou Renovate configuré pour les mises à jour automatiques

## Gestion du bundle

- [ ] `devDependencies` séparées des `dependencies`
- [ ] Pas de dépendances lourdes pour une feature mineure (lodash pour un seul helper)
- [ ] Alternatives légères évaluées (date-fns vs moment.js, etc.)
- [ ] Taille des top 10 dépendances vérifiée sur bundlephobia.com

## Versioning

- [ ] `package-lock.json` ou `yarn.lock` commité
- [ ] Versions épinglées ou avec ranges raisonnables (^ acceptable, * interdit)
- [ ] Node.js version épinglée (`.nvmrc`, `engines` dans package.json)
