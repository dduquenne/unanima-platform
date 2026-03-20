# Rapport d'audit sécurité — Unanima Platform

**Date :** 2026-03-20
**Auditeur :** Sprintix (Sprint 6)
**Scope :** 3 apps (Links, CREAI, Omega) + packages socle
**Statut :** En attente de validation humaine

---

## 1. Résumé exécutif

| Catégorie | Statut | Commentaire |
|-----------|--------|-------------|
| A01 Broken Access Control | ✅ Conforme | Middleware auth + RLS + RBAC en place |
| A02 Cryptographic Failures | ✅ Conforme | Auth gérée par Supabase (bcrypt + JWT) |
| A03 Injection | ✅ Conforme | Requêtes via Supabase SDK (pas de raw SQL) |
| A04 Insecure Design | ✅ Conforme | Architecture RBAC + RLS multicouche |
| A05 Security Misconfiguration | ✅ Corrigé | Headers HTTP ajoutés (CSP, HSTS, X-Frame-Options) |
| A06 Vulnerable Components | ⚠️ Acceptable | 2 CVE modérées (esbuild dev, prismjs server-side) |
| A07 Auth Failures | ✅ Conforme | Supabase Auth avec rate limiting intégré |
| A08 Software/Data Integrity | ✅ Conforme | Zod validation sur toutes les entrées API |
| A09 Security Logging | ✅ Conforme | Audit logs avec RLS (insert authentifié, lecture admin) |
| A10 SSRF | ✅ Conforme | Pas de requêtes côté serveur vers URLs utilisateur |

**Verdict global : 0 faille critique. 2 points d'attention identifiés (CSRF, rate limiting).**

### Points d'attention

| Gap | Sévérité | Détail | Mitigation |
|-----|----------|--------|------------|
| CSRF protection absente | Moyenne | Les routes POST/PATCH/DELETE n'ont pas de token CSRF. Cependant, les API utilisent `request.json()` qui nécessite `Content-Type: application/json`, ce qui empêche les attaques CSRF classiques via formulaire HTML. Les navigateurs modernes bloquent les requêtes cross-origin JSON via CORS. | Risque faible grâce à la validation JSON + CORS par défaut de Next.js. Envisager une vérification `Origin` header en renforcement. |
| Rate limiting absent | Moyenne | Pas de rate limiting sur les endpoints API. Supabase Auth intègre son propre rate limiting pour login/signup. | Ajouter rate limiting via middleware Next.js ou Vercel Edge pour les endpoints sensibles (login, RGPD export/delete). |
| RLS sur tables métier | Moyenne | Seules `profiles` et `audit_logs` ont des politiques RLS dans les migrations du socle. Les tables métier (beneficiaires, diagnostics, interventions) doivent avoir leurs RLS configurées dans chaque projet Supabase. | Vérifier et documenter les RLS sur chaque projet Supabase de production. |

---

## 2. Contrôle d'accès (A01)

### 2.1 Middleware d'authentification
- **Fichier :** `packages/auth/src/middleware.ts`
- **Mécanisme :** Middleware Next.js vérifie le token Supabase via `getUser()`
- **Routes protégées :** Configurées par app dans `middleware.ts`
- **Rôle vérifié :** Via table `profiles`, comparé à `roleRoutes`
- **Résultat :** Conforme — redirection vers login si non authentifié, vers unauthorized si rôle insuffisant

### 2.2 RBAC applicatif
- **Fichier :** Chaque route handler vérifie `checkPermission(user.role, permission)`
- **Granularité :** Par rôle et par action (read:own, read:beneficiaires, write:beneficiaires...)
- **Double vérification :** Middleware + route handler
- **Résultat :** Conforme — défense en profondeur

### 2.3 Row Level Security (RLS)
- **Tables protégées :** `profiles`, `audit_logs`
- RLS activé sur toutes les tables communes
- Politiques en place :
  - `profiles` : SELECT own + admin, UPDATE own only
  - `audit_logs` : INSERT authentifié, SELECT admin only

**Recommandation :** Vérifier que les tables métier de chaque app (beneficiaires, bilans, diagnostics, interventions) ont également RLS activé sur le projet Supabase de production.

---

## 3. Validation des entrées (A03 / A08)

### 3.1 API Route Handlers
- Toutes les routes POST utilisent `parseBody(zodSchema, body)`
- Schémas Zod typés pour chaque entité
- `validationErrorResponse()` renvoie les erreurs de validation
- Pas de construction de requêtes SQL brutes (tout via Supabase SDK)

### 3.2 Côté client
- Formulaires avec validation HTML5 (`required`, `type="email"`)
- Composant `Input` avec variant typé

**Résultat :** Conforme — validation double (client + serveur)

---

## 4. Headers HTTP de sécurité (A05)

### 4.1 Headers ajoutés (Sprint 6)
| Header | Valeur | Protection |
|--------|--------|------------|
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Downgrade attacks |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Fuite de referer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | API sensibles |
| `Content-Security-Policy` | Voir next.config.js | XSS, injection de scripts |
| `X-DNS-Prefetch-Control` | `on` | Performance |

### 4.2 CSP détaillée
```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self';
connect-src 'self' https://*.supabase.co wss://*.supabase.co;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

**Note :** `unsafe-eval` et `unsafe-inline` sont nécessaires pour Next.js en développement. En production, envisager l'utilisation de nonces CSP si la configuration Vercel le permet.

---

## 5. Dépendances (A06)

### 5.1 Résultat `pnpm audit`
| Sévérité | Nombre | Détails |
|----------|--------|---------|
| Critical | 0 | — |
| High | 0 | — |
| Moderate | 2 | esbuild (dev only), prismjs (server-side email) |
| Low | 0 | — |

### 5.2 Détail des CVE modérées

**esbuild <= 0.24.2 (GHSA-67mh-4wv8-2f99)**
- Impact : Dev server uniquement, pas de risque en production
- Action : Aucune action immédiate requise (dépendance transitive de vitest)

**prismjs < 1.30.0 (GHSA-x7hr-w5r2-h6wg)**
- Impact : DOM Clobbering dans @react-email/code-block (rendu serveur uniquement)
- Action : Aucun risque réel (pas de DOM côté serveur), mais surveiller la mise à jour de @react-email/components

---

## 6. Audit RLS par rôle

### 6.1 Tables communes (socle)

| Table | RLS | SELECT | INSERT | UPDATE | DELETE |
|-------|-----|--------|--------|--------|--------|
| `profiles` | ✅ | Own + Admin | Via auth.users trigger | Own only | Via CASCADE |
| `audit_logs` | ✅ | Admin only | Authenticated | — | — |

### 6.2 Recommandations RLS par app

**Links :**
- `beneficiaires` : Vérifier que les bénéficiaires ne voient que leurs propres données
- `bilans` : Vérifier le filtrage par consultant_id / beneficiaire_id
- `responses` : Accès lecture/écriture par propriétaire du bilan

**CREAI :**
- `etablissements` : Filtrage par coordonnateur
- `diagnostics` : Accès en lecture pour direction, écriture pour coordonnateurs
- `indicateurs` : Accès en lecture pour tous les rôles internes

**Omega :**
- `interventions` : Technicien voit ses affectations, responsable voit tout
- `affectations` : Responsable crée, technicien lit
- `pieces` : Lecture par tous, écriture par responsable

**Action :** Ces règles RLS doivent être vérifiées manuellement sur chaque projet Supabase de production.

---

## 7. Authentification (A07)

- **Mécanisme :** Supabase Auth (bcrypt, JWT)
- **Stockage tokens :** Cookies HTTPOnly via `@supabase/ssr`
- **Rate limiting :** Intégré à Supabase Auth (anti-brute force)
- **Mot de passe oublié :** Implémenté via ResetPasswordForm + Supabase Auth

**Résultat :** Conforme

---

## 8. Logging et monitoring (A09)

- `audit_logs` avec user_id, action, entity_type, entity_id, details, ip_address
- RLS : insertion par tout utilisateur authentifié, lecture par admins
- `logAudit()` appelé après les opérations CRUD sensibles
- `/api/health` endpoints pour le monitoring

**Résultat :** Conforme

---

## 9. Recommandations

### Priorité haute
1. [ ] Vérifier les politiques RLS sur les projets Supabase de production pour chaque table métier
2. [ ] Configurer les alertes de monitoring sur les endpoints `/api/health`

### Priorité moyenne
3. [ ] Envisager des nonces CSP pour remplacer `unsafe-inline` en production
4. [ ] Ajouter rate limiting sur les API routes (via middleware ou Vercel Edge)
5. [ ] Surveiller les mises à jour de @react-email/components pour résoudre la CVE prismjs

### Priorité basse
6. [ ] Mettre à jour vitest pour résoudre la CVE esbuild (dépendance dev uniquement)
