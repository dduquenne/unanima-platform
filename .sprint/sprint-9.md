# Sprint 9 — Links : EPIC-AUTH + Espace Bénéficiaire

**Projet :** Link's Accompagnement — MVP v1
**Période :** Semaines 2-3
**Objectif :** Implémenter l'authentification complète (3 rôles, verrouillage, reset mdp, sessions) et l'espace bénéficiaire intégral (dashboard progression, planning, saisie réponses, autosave, validation des phases).

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Issues | 7 (#109, #110, #111, #112, #113, #114, #115) |
| Phases | 3 |
| Effort total | XL (~2 semaines) |
| Chemin critique | #109 → #112 → #114 → #115 |
| Parallélisme max | Phase 2 (#110 + #111 en parallèle après #109) |

---

## Phase 1 — Connexion (séquentiel, bloquant pour EPIC-BEN)

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 1 | #109 | [US-AUTH-01] Connexion email/mdp + verrouillage 3 tentatives | 🔴 Critique | S | archicodix, securix | Sprint 8 | ⚠️ Review sécurité |

**Détail #109 :**
- LoginForm avec validation email + mdp
- Compteur tentatives avec verrouillage 15 min après 3 échecs
- Redirection post-login par rôle : bénéficiaire→/dashboard, consultant→/beneficiaires, super_admin→/admin
- Journalisation audit_logs : LOGIN_SUCCESS, LOGIN_FAILURE, ACCOUNT_LOCKED

**Point de contrôle Phase 1 :**
- [ ] Connexion réussie sur les 3 rôles avec redirection correcte
- [ ] 3 échecs → verrouillage 15 min testé
- [ ] audit_logs alimenté
- [ ] Tests Playwright : scénarios 1 (3 rôles), 4, 5, 6

---

## Phase 2 — Auth complémentaire (parallélisable après #109)

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 2 | #110 | [US-AUTH-02+03] Reset mot de passe (demande + changement) | 🟠 Haute | S | archicodix, securix | #109 | — |
| 3 | #111 | [US-AUTH-04] Déconnexion sécurisée + sessions 8h + cookies | 🟠 Haute | S | archicodix, securix | #109 | — |

**Détail #110 :**
- Template email reset-password.tsx dans @unanima/email
- Protection anti-énumération (réponse unifiée email existant/inexistant)
- Indicateur force MDP temps réel + critères de complexité

**Détail #111 :**
- Cookies httpOnly, Secure, SameSite=Strict
- Révocation refresh token côté serveur à la déconnexion
- Limite 8h non contournable par renouvellement

**Point de contrôle Phase 2 :**
- [ ] Email reset envoyé via Resend (test sandbox)
- [ ] Réponse identique email existant/inexistant
- [ ] Cookies httpOnly vérifiés (DevTools Network)
- [ ] Session > 8h → révocation + redirection

---

## Phase 3 — Espace Bénéficiaire (séquentiel)

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 4 | #112 | [US-BEN-01] Dashboard bénéficiaire — progression 6 phases | 🔴 Critique | M | ergonomix, archicodix | #109 | — |
| 5 | #113 | [US-BEN-02] Planning séances bénéficiaire (dates + lien visio) | 🟠 Haute | S | ergonomix | #112 | — |
| 6 | #114 | [US-BEN-03+04] Saisie réponses + autosave (blur + 30s) | 🔴 Critique | M | ergonomix, archicodix | #112 | — |
| 7 | #115 | [US-BEN-05+06] Validation phase + dé-validation + modification | 🔴 Critique | S | ergonomix, archicodix | #114 | ⚠️ Review UX |

**Détail #112 :**
- 6 cartes phase avec statuts visuels (gris/bleu/vert)
- Barre de progression globale "X/6 — Y%"
- CTA "Continuer le bilan" → phase en cours ou phase 1
- Palette couleurs : libre #A0AAB9, en cours #1E6FC0, validée #28A745

**Détail #114 :**
- Textarea min 120px, redimensionnable, pas de limite caractères
- Dirty state detection (pas de requête si pas de modif)
- 2 retries en cas d'échec réseau + message persistant orange

**Détail #115 :**
- Modal confirmation avant validation
- Ordre strict : sauvegarde forcée → changement statut → toast
- Bouton "Dé-valider" visible uniquement sur phases validées

**Point de contrôle Sprint 9 :**
- [ ] `pnpm build --filter=@unanima/links` vert
- [ ] `pnpm test --filter=@unanima/links` vert
- [ ] Dashboard bénéficiaire : progression calculée correctement
- [ ] Autosave déclenché sur blur ET sur timer 30s (vérifier Network)
- [ ] Validation → badge vert + progression incrémentée sur /dashboard
- [ ] Contraste WCAG AA vérifié sur les badges de statut

---

## Contraintes d'exécution

1. **Autosave ≠ validation** — distinction stricte à maintenir dans le code
2. **Dirty state** : utiliser un ref ou état pour tracker les modifications non sauvegardées
3. **Supabase Auth** : utiliser le client server-side pour les opérations auth sensibles
4. **Tests unitaires obligatoires** sur : calcul progression, dirty state detection, statuts phases
5. Commits : `feat(links): [AUTH] ...` ou `feat(links): [BEN] ...`
