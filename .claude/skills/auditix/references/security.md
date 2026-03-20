# Référence Audit — Sécurité TypeScript

## OWASP Top 10 (2021) — Checklist TypeScript/Node.js

### A01 — Contrôle d'accès défaillant
- [ ] Vérification d'autorisation côté serveur (jamais uniquement côté client)
- [ ] Principe du moindre privilège
- [ ] IDOR : vérification que l'utilisateur peut accéder à la ressource demandée
- [ ] CORS configuré strictement (pas de `*` en production)
- [ ] Rate limiting sur les routes sensibles

### A02 — Échecs cryptographiques
- [ ] Secrets jamais en dur dans le code (`process.env.*` uniquement)
- [ ] `.env` dans `.gitignore`, pas de `.env` commité
- [ ] Mots de passe hashés avec bcrypt/argon2 (jamais MD5/SHA1)
- [ ] HTTPS obligatoire en production (HSTS)
- [ ] Chiffrement des données sensibles au repos

### A03 — Injection
- [ ] Requêtes SQL paramétrisées (ORM ou prepared statements)
- [ ] Pas de `eval()` sur des données utilisateur
- [ ] Validation/sanitisation des inputs (zod, joi, class-validator)
- [ ] Échappement HTML (XSS) — DOMPurify côté client
- [ ] Pas d'interpolation de chaînes dans les requêtes

### A04 — Design insécurisé
- [ ] Modélisation des menaces documentée
- [ ] Pas de logique métier sensible côté client
- [ ] Vérification des invariants métier côté serveur

### A05 — Mauvaise configuration
- [ ] Headers de sécurité (Helmet.js ou équivalent)
- [ ] Pas de stack traces exposées en production
- [ ] Désactivation des fonctionnalités inutilisées
- [ ] Comptes/clés de test non présents en production

### A06 — Composants vulnérables
- [ ] `npm audit` sans vulnérabilités critiques/hautes
- [ ] Dépendances à jour (vérifier avec `npm outdated`)
- [ ] Snyk ou Dependabot configuré
- [ ] Licences compatibles avec l'usage

### A07 — Authentification défaillante
- [ ] Sessions avec expiration appropriée
- [ ] JWT : algorithme fort (RS256 > HS256), expiration courte
- [ ] Brute force protection (lockout, captcha)
- [ ] MFA disponible pour les accès sensibles
- [ ] Pas de tokens dans les URLs (logs)

### A08 — Intégrité des données
- [ ] Vérification d'intégrité des mises à jour logicielles
- [ ] Sérialisation/désérialisation sécurisée

### A09 — Logging & Monitoring
- [ ] Logs des événements de sécurité (auth, accès refusés)
- [ ] Pas de données sensibles dans les logs (PII, tokens, mdp)
- [ ] Alerting sur les anomalies
- [ ] Conservation des logs appropriée

### A10 — SSRF
- [ ] Validation des URLs fournies par l'utilisateur
- [ ] Whitelist des domaines autorisés pour les requêtes sortantes
- [ ] Pas d'accès aux ressources internes depuis des inputs utilisateur

## Audit spécifique TypeScript
- [ ] `any` évité sur les données externes (utiliser des types stricts ou zod)
- [ ] `as` (type assertion) évité sur des données non validées
- [ ] Prisma/Mongoose : pas de requêtes construites avec des strings

## Outils recommandés
```bash
npm audit --audit-level=high
npx snyk test
npx retire                          # Vulnérabilités dans les dépendances front
```

## Outils SAST
- ESLint avec `eslint-plugin-security`
- `@typescript-eslint` rules strictes
- Semgrep avec les règles TypeScript/Node
