# Sprint 7 — Hardening sécurité, RGPD et qualité de code

**Projet :** Roadmap Unanima Platform
**Période :** 2026-03-22 → 2026-04-05
**Objectif :** Corriger les vulnérabilités critiques identifiées par l'audit (Sprint 6), renforcer la conformité RGPD, améliorer la qualité de code et augmenter la couverture de tests.

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Issues | 8 (#43, #46, #47, #48, #49, #50, #58, #59) |
| Phases | 4 |
| Effort total | XL (~2 semaines) |
| Chemin critique | #43 → #49 → #46 |
| Parallélisme max | Phase 2 (3 issues) + Phase 3 (2 issues) |

---

## Phase 1 — Sécurité critique (séquentiel, bloquant)

Corriger en priorité absolue la vulnérabilité d'injection identifiée P0.

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 1 | #43 | Noms de tables non validés dans les fonctions RGPD (injection) | 🔴 P0 | S | securix, rgpdix, soclix | — | ⚠️ Review sécurité |

**Détail #43 :**
- Ajouter une whitelist de tables autorisées dans `packages/rgpd/src/api/export-data.ts` et `delete-account.ts`
- Valider `additionalTables` contre cette whitelist avant tout appel `supabase.from(table)`
- Rejeter avec erreur explicite toute table non whitelistée
- Ajouter des tests unitaires pour la validation

**Point de contrôle Phase 1 :**
- [ ] `pnpm build` passe
- [ ] `pnpm test --filter=@unanima/rgpd` passe
- [ ] La whitelist est en place et testée
- [ ] Aucune table arbitraire ne peut être requêtée

---

## Phase 2 — Hardening sécurité & RGPD (parallélisable)

Corrections des vulnérabilités P1 dans les modules auth, email et RGPD.

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 2 | #47 | Absence de validation des entrées dans le module email | 🟠 P1 | S | securix, soclix | — | — |
| 3 | #49 | Suppression de compte non atomique (risque d'état inconsistant) | 🟠 P1 | M | rgpdix, databasix, soclix | #43 | ⚠️ Review RGPD |
| 4 | #50 | Pas de rate limiting sur le reset de mot de passe | 🟠 P1 | S | securix, archicodix, soclix | — | — |

**Détail #47 :**
- Valider le format email (regex + longueur max) dans `sendEmail` et `sendBatch`
- Limiter la longueur du sujet (255 chars)
- Valider l'adresse `from` contre une whitelist de domaines autorisés
- Ajouter des tests unitaires pour chaque validation

**Détail #49 :**
- Encapsuler la suppression multi-tables dans une transaction Supabase (`rpc` ou fonction PostgreSQL)
- En cas d'erreur, rollback complet — aucune donnée partiellement supprimée
- Logger l'opération dans `audit_logs` avant et après
- Ajouter des tests d'intégration

**Détail #50 :**
- Implémenter un rate limiting côté serveur sur le endpoint de reset password
- Limite suggérée : 3 demandes par email par heure, 10 par IP par heure
- Stocker les compteurs en base (table dédiée ou cache)
- Retourner HTTP 429 avec `Retry-After` header

**Point de contrôle Phase 2 :**
- [ ] `pnpm build` passe
- [ ] `pnpm test --filter=@unanima/email` passe
- [ ] `pnpm test --filter=@unanima/rgpd` passe
- [ ] `pnpm test --filter=@unanima/auth` passe
- [ ] Rate limiting fonctionnel et testé
- [ ] Suppression de compte atomique vérifiée

---

## Phase 3 — RGPD & qualité de code (parallélisable)

Conformité CNIL pour les cookies et corrections qualité.

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 5 | #48 | Consentement cookies non tracé côté serveur (non conforme CNIL) | 🟠 P1 | S | rgpdix, databasix, soclix | — | ⚠️ Review RGPD |
| 6 | #58 | formatDate ne valide pas les dates invalides | 🟡 P2 | XS | archicodix, soclix | — | — |
| 7 | #59 | Duplication error.tsx/loading.tsx/not-found.tsx dans les 3 apps | 🟡 P2 | S | soclix, archicodix | — | — |

**Détail #48 :**
- Créer une table `cookie_consents` (user_id nullable, session_id, categories JSONB, consented_at, ip_address)
- Persister le consentement côté serveur via un route handler `/api/rgpd/cookie-consent`
- Conserver le localStorage comme cache client, mais la source de vérité est le serveur
- Ajouter un timestamp et les catégories (nécessaire, analytique, marketing)

**Détail #58 :**
- Ajouter une validation `isNaN(d.getTime())` après le `new Date(string)`
- Retourner une valeur par défaut explicite ou lever une erreur
- Ajouter des tests pour les cas limites (string invalide, undefined, null)

**Détail #59 :**
- Extraire `error.tsx`, `loading.tsx`, `not-found.tsx` dans `@unanima/core`
- Chaque app réimporte depuis le socle
- Permettre une surcharge par app si nécessaire (re-export avec customisation)

**Point de contrôle Phase 3 :**
- [ ] `pnpm build` passe
- [ ] `pnpm test --filter=@unanima/core` passe
- [ ] `pnpm test --filter=@unanima/rgpd` passe
- [ ] Les 3 apps compilent avec les composants factorisés
- [ ] Le consentement cookies est tracé en base

---

## Phase 4 — Couverture de tests (séquentiel, effort XL)

Augmentation significative de la couverture de tests sur l'ensemble du monorepo.

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 8 | #46 | Couverture de tests superficielle (~40%, aucun test d'intégration) | 🟠 P1 | XL | testix, recettix | #43, #47, #48, #49, #50, #58, #59 | — |

**Détail #46 :**
Cette issue est placée en dernier car elle dépend de toutes les corrections précédentes — les tests doivent couvrir le code **corrigé**, pas le code vulnérable.

Sous-tâches :
1. Tests d'intégration RGPD : export, delete (avec transaction), cookie consent
2. Tests du middleware auth (protection de routes, redirection)
3. Tests de rendering React (jsdom) pour les composants critiques (LoginForm, CookieBanner, ResetPasswordForm)
4. Tests des fonctions email avec validation
5. Tests du rate limiting
6. Tests unitaires pour les 3 apps (au moins les route handlers critiques)

Objectif de couverture : passer de ~40% à ≥ 70% sur les packages du socle.

**Point de contrôle Phase 4 :**
- [ ] `pnpm build` passe
- [ ] `pnpm test` passe (tous les packages)
- [ ] Couverture ≥ 70% sur les packages du socle
- [ ] Aucun `--passWithNoTests` dans les apps

---

## Contraintes d'exécution

1. **Socle impacté** : les issues #43, #47, #48, #49, #50, #58, #59 touchent des packages partagés → invoquer **soclix** pour valider l'absence de régression cross-app
2. **Review sécurité** : #43 (P0) et #50 (rate limiting) nécessitent une review humaine avant merge
3. **Review RGPD** : #48 (cookies) et #49 (suppression atomique) nécessitent une validation de conformité
4. **Ordre strict Phase 1** : #43 doit être corrigé et mergé AVANT toute autre issue
5. **Tests en dernier** : #46 est exécuté après toutes les corrections pour tester le code final

---

## Graphe de dépendances

```
Phase 1:  #43 (P0 injection) ─────────────────────────────┐
                                                           │
Phase 2:  #47 (email) ──┐                                 │
          #49 (delete) ──┤── dépend de #43                 │
          #50 (rate) ────┘                                 │
                                                           │
Phase 3:  #48 (cookies) ──┐                                │
          #58 (format) ───┤── indépendants                 │
          #59 (dedup) ────┘                                │
                                                           ▼
Phase 4:  #46 (tests XL) ◄── dépend de TOUTES les issues
```
