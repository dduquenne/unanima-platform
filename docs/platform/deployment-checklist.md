# Checklist de déploiement production — Unanima Platform

**Sprint 6 — Mise en production des 3 apps**
**Date :** 2026-03-20
**Statut :** En attente de validation humaine

---

## Prérequis avant déploiement

### Code
- [x] Tests unitaires passent (257 tests, 18 tasks)
- [x] Build passe pour les 3 apps
- [x] Tests E2E Playwright écrits et configurés
- [x] Audit sécurité OWASP réalisé (0 faille critique/haute)
- [x] Headers HTTP de sécurité configurés (CSP, HSTS, X-Frame-Options...)
- [x] Pages RGPD en place (mentions légales, confidentialité, cookies)
- [x] API RGPD (export/suppression) fonctionnelle
- [x] Bandeau cookies intégré

---

## Par application

### 1. Link's Accompagnement

#### Vercel
- [ ] Projet Vercel créé : `unanima-links`
- [ ] Root Directory : `apps/links`
- [ ] Framework Preset : Next.js
- [ ] Build Command : `cd ../.. && pnpm turbo run build --filter=@unanima/links`
- [ ] Install Command : `pnpm install`
- [ ] `ignoreCommand` en place dans `vercel.json` : **oui**

#### Variables d'environnement (Production)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` → URL du projet Supabase Links
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Clé anonyme du projet Links
- [ ] `SUPABASE_SERVICE_ROLE_KEY` → Clé service_role (secrète)
- [ ] `RESEND_API_KEY` → Clé API Resend (secrète)

#### Supabase (Projet Links)
- [ ] Tables créées : `profiles`, `audit_logs`, `beneficiaires`, `bilans`, `responses`, `documents`, `questionnaires`
- [ ] RLS activé sur toutes les tables
- [ ] Politiques RLS configurées pour chaque rôle (beneficiaire, consultant, super_admin)
- [ ] Trigger `handle_updated_at` en place
- [ ] Storage buckets créés (documents)

#### Domaine
- [ ] Domaine configuré sur Vercel
- [ ] DNS propagé (CNAME ou A record)
- [ ] SSL/TLS actif (automatique Vercel)

---

### 2. CREAI Île-de-France

#### Vercel
- [ ] Projet Vercel créé : `unanima-creai`
- [ ] Root Directory : `apps/creai`
- [ ] Framework Preset : Next.js
- [ ] `ignoreCommand` en place dans `vercel.json` : **oui**

#### Variables d'environnement (Production)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` → URL du projet Supabase CREAI
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Clé anonyme du projet CREAI
- [ ] `SUPABASE_SERVICE_ROLE_KEY` → Clé service_role (secrète)
- [ ] `RESEND_API_KEY` → Clé API Resend (secrète)

#### Supabase (Projet CREAI)
- [ ] Tables créées : `profiles`, `audit_logs`, `etablissements`, `diagnostics`, `indicateurs`, `recommandations`, `rapports`
- [ ] RLS activé sur toutes les tables
- [ ] Politiques RLS configurées pour chaque rôle (admin_creai, direction, coordonnateur, professionnel)

#### Domaine
- [ ] Domaine configuré sur Vercel
- [ ] DNS propagé
- [ ] SSL/TLS actif

---

### 3. Omega Automotive

#### Vercel
- [ ] Projet Vercel créé : `unanima-omega`
- [ ] Root Directory : `apps/omega`
- [ ] Framework Preset : Next.js
- [ ] `ignoreCommand` en place dans `vercel.json` : **oui**

#### Variables d'environnement (Production)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` → URL du projet Supabase Omega
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Clé anonyme du projet Omega
- [ ] `SUPABASE_SERVICE_ROLE_KEY` → Clé service_role (secrète)
- [ ] `RESEND_API_KEY` → Clé API Resend (secrète)

#### Supabase (Projet Omega)
- [ ] Tables créées : `profiles`, `audit_logs`, `interventions`, `affectations`, `pieces`
- [ ] RLS activé sur toutes les tables
- [ ] Politiques RLS configurées pour chaque rôle (admin, responsable_sav, technicien, operateur)

#### Domaine
- [ ] Domaine configuré sur Vercel
- [ ] DNS propagé
- [ ] SSL/TLS actif

---

## Monitoring

### Health checks
- [ ] `GET /api/health` → 200 sur Links production
- [ ] `GET /api/health` → 200 sur CREAI production
- [ ] `GET /api/health` → 200 sur Omega production

### Alertes
- [ ] Monitoring Vercel activé (Analytics)
- [ ] Alertes email configurées pour les erreurs 5xx
- [ ] Dashboard Supabase accessible pour chaque projet

---

## Resend (Email)

- [ ] Domaine expéditeur vérifié sur Resend
- [ ] Clé API de production (pas de test key)
- [ ] Templates email testés (welcome, reset-password, notification)

---

## Smoke tests post-déploiement

Pour chaque app déployée, vérifier :

1. [ ] `GET /api/health` → 200
2. [ ] Page `/login` → affiche le formulaire
3. [ ] Login avec compte de test → redirection `/dashboard`
4. [ ] Navigation sidebar → toutes les pages chargent
5. [ ] Pages RGPD accessibles (`/mentions-legales`, `/confidentialite`, `/cookies`)
6. [ ] Bandeau cookies s'affiche au premier accès
7. [ ] API RGPD → export fonctionne
8. [ ] Création d'un enregistrement de test → succès
9. [ ] Suppression de l'enregistrement de test → succès

---

## Rollback plan

Chaque déploiement Vercel conserve les versions précédentes.
En cas de problème :
1. Aller sur le dashboard Vercel du projet concerné
2. Onglet "Deployments"
3. Cliquer sur le déploiement précédent
4. "Promote to Production"

**Temps de rollback estimé : < 1 minute**
