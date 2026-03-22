---
title: "Guide de configuration et déploiement Vercel — Omega Automotive"
id: GUIDE-DEPLOY-vercel-omega
version: 1.0.0
status: draft
author: Documentalix
created: 2026-03-22
updated: 2026-03-22
reviewers: []
tags: [vercel, deploiement, omega, production, configuration]
related: [deployment-checklist]
---

# Guide de configuration et déploiement Vercel — Omega Automotive

## Table des matières

1. [Prérequis](#1-prérequis)
2. [Création du projet Vercel](#2-création-du-projet-vercel)
3. [Configuration des variables d'environnement](#3-configuration-des-variables-denvironnement)
4. [Configuration Supabase](#4-configuration-supabase)
5. [Configuration du domaine](#5-configuration-du-domaine)
6. [Fonctionnement du build](#6-fonctionnement-du-build)
7. [Mécanisme d'isolation des déploiements](#7-mécanisme-disolation-des-déploiements)
8. [Monitoring et health checks](#8-monitoring-et-health-checks)
9. [Smoke tests post-déploiement](#9-smoke-tests-post-déploiement)
10. [Rollback](#10-rollback)
11. [Dépannage](#11-dépannage)

---

## 1. Prérequis

Avant de configurer le déploiement :

- [ ] Un compte Vercel avec accès au team/organisation
- [ ] Le dépôt GitHub `unanima-platform` connecté à Vercel
- [ ] Un projet Supabase dédié à Omega (ne pas réutiliser celui de Links ou CREAI)
- [ ] Un compte Resend avec un domaine expéditeur vérifié
- [ ] Node.js 20 LTS (utilisé par Vercel en runtime)
- [ ] Accès aux API Salesforce et SAP pour la consolidation des données (si connecteurs activés)

---

## 2. Création du projet Vercel

### 2.1 Importer le dépôt

1. Aller sur [vercel.com/new](https://vercel.com/new)
2. Sélectionner le dépôt GitHub `unanima-platform`
3. Configurer les paramètres suivants :

| Paramètre | Valeur |
|---|---|
| **Project Name** | `unanima-omega` |
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/omega` |
| **Build Command** | *(laisser vide — défini dans `vercel.json`)* |
| **Install Command** | *(laisser vide — défini dans `vercel.json`)* |

> **Important :** Le Root Directory doit pointer vers `apps/omega`, pas vers la racine du monorepo.

### 2.2 Vérifier la configuration `vercel.json`

Le fichier `apps/omega/vercel.json` est déjà configuré :

```json
{
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@unanima/omega",
  "ignoreCommand": "bash ../../scripts/vercel-ignore.sh omega"
}
```

- **installCommand** : Installe toutes les dépendances du monorepo (nécessaire pour les packages partagés)
- **buildCommand** : Remonte à la racine du monorepo puis lance le build via Turborepo, filtré sur Omega uniquement
- **ignoreCommand** : Détermine si le déploiement doit avoir lieu (voir section 7)

> **Ne jamais supprimer l'`ignoreCommand`** — il garantit l'isolation des déploiements entre les 3 apps.

---

## 3. Configuration des variables d'environnement

### 3.1 Variables requises

Dans le dashboard Vercel, aller dans **Settings → Environment Variables** et configurer :

| Variable | Type | Environnements | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Plain text | Production, Preview, Development | URL du projet Supabase Omega (ex: `https://xxxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Plain text | Production, Preview, Development | Clé anonyme (publique, soumise aux RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Encrypted | Production uniquement | Clé service_role (contourne les RLS — **secrète**) |
| `RESEND_API_KEY` | Encrypted | Production uniquement | Clé API Resend pour l'envoi d'e-mails |

### 3.2 Règles de sécurité

- Les variables préfixées `NEXT_PUBLIC_` sont exposées côté client — ne jamais y mettre de secrets
- `SUPABASE_SERVICE_ROLE_KEY` ne doit **jamais** être préfixée `NEXT_PUBLIC_`
- Utiliser des clés de production Resend (pas de test key) pour l'environnement Production
- Chaque environnement (Production, Preview) peut avoir ses propres valeurs

### 3.3 Variables optionnelles

| Variable | Type | Description |
|---|---|---|
| `EMAIL_FROM` | Plain text | Adresse expéditeur des e-mails (ex: `noreply@omega-automotive.fr`) |

> **Note :** Si les connecteurs Salesforce/SAP sont activés ultérieurement, des variables supplémentaires seront nécessaires (credentials API, URLs d'instance). Consulter le guide d'intégration Integratix le moment venu.

### 3.4 Vérification

Utiliser le fichier de référence `apps/omega/.env.local.example` pour vérifier que toutes les variables sont configurées :

```bash
# Contenu attendu :
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_xxxxxxxxxxxx
```

---

## 4. Configuration Supabase

### 4.1 Projet dédié

Omega doit avoir son **propre projet Supabase**, distinct de Links et CREAI. Les clés ne sont jamais partagées entre projets.

### 4.2 Tables à créer

**Tables du socle commun :**
- `profiles` — Extension de `auth.users` avec métadonnées métier
- `audit_logs` — Journal d'audit RGPD

**Tables métier Omega :**
- `interventions` — Interventions SAV (consolidées depuis Salesforce/SAP)
- `affectations` — Affectation des techniciens aux interventions
- `pieces` — Pièces détachées utilisées

### 4.3 Row Level Security (RLS)

Les politiques RLS doivent être activées et configurées pour les rôles Omega :

| Rôle | Permissions |
|---|---|
| `admin` | Accès total à toutes les interventions et affectations |
| `responsable_sav` | Lecture/écriture de toutes les interventions de son périmètre |
| `technicien` | Lecture/écriture de ses propres interventions et affectations |
| `operateur` | Lecture seule du dashboard et des KPIs |

### 4.4 Vérifications

- [ ] RLS activé sur **toutes** les tables (y compris les tables métier)
- [ ] Trigger `handle_updated_at` en place sur les tables avec `updated_at`
- [ ] Les données SAV consolidées sont protégées par des politiques RLS

---

## 5. Configuration du domaine

### 5.1 Ajout du domaine custom

1. Dashboard Vercel → **Settings → Domains**
2. Ajouter le domaine souhaité (ex: `sav.omega-automotive.fr`)
3. Configurer les enregistrements DNS chez le registrar :

| Type | Nom | Valeur |
|---|---|---|
| CNAME | `sav` | `cname.vercel-dns.com` |

Ou pour un domaine apex (sans sous-domaine) :

| Type | Nom | Valeur |
|---|---|---|
| A | `@` | `76.76.21.21` |

### 5.2 SSL/TLS

Le certificat SSL est automatiquement provisionné par Vercel via Let's Encrypt. Aucune action nécessaire.

### 5.3 Vérification

- [ ] Le domaine est accessible en HTTPS
- [ ] La redirection HTTP → HTTPS fonctionne
- [ ] Le header `Strict-Transport-Security` est présent (configuré dans `next.config.js`)

---

## 6. Fonctionnement du build

### 6.1 Pipeline Turborepo

Le build Omega suit ce pipeline (défini dans `turbo.json`) :

```
@unanima/core (build)
@unanima/auth (build)        ─┐
@unanima/db (build)           │
@unanima/dashboard (build)    ├─► @unanima/omega (build) ─► .next/
@unanima/email (build)        │
@unanima/rgpd (build)        ─┘
```

Turborepo détecte les dépendances entre packages et les build dans le bon ordre. Le cache accélère les builds suivants si les packages n'ont pas changé.

### 6.2 Configuration Next.js

Le fichier `apps/omega/next.config.js` configure :

- **transpilePackages** : Les 6 packages du socle (`@unanima/core`, `auth`, `dashboard`, `db`, `email`, `rgpd`)
- **Headers de sécurité** appliqués à toutes les routes :
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `Content-Security-Policy` avec whitelist Supabase (`*.supabase.co`)
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 6.3 Commandes manuelles

```bash
# Build isolé d'Omega (depuis la racine du monorepo)
pnpm build:omega

# Équivalent à :
pnpm turbo run build --filter=@unanima/omega
```

---

## 7. Mécanisme d'isolation des déploiements

### 7.1 Principe

Le script `scripts/vercel-ignore.sh` est appelé automatiquement par Vercel avant chaque déploiement. Il vérifie si les fichiers pertinents à Omega ont changé depuis le dernier déploiement.

### 7.2 Chemins surveillés

Le déploiement Omega se déclenche **uniquement** si l'un de ces chemins a changé :

| Chemin | Raison |
|---|---|
| `apps/omega/` | Code de l'application |
| `packages/core/` | Composants UI partagés |
| `packages/auth/` | Authentification |
| `packages/dashboard/` | Composants de tableau de bord |
| `packages/db/` | Couche d'accès base de données |
| `packages/email/` | E-mail transactionnel |
| `packages/rgpd/` | Conformité RGPD |
| `tooling/` | Configs partagées (TypeScript, ESLint, Tailwind) |
| `package.json` | Dépendances racine |
| `pnpm-lock.yaml` | Lockfile |
| `pnpm-workspace.yaml` | Configuration workspace |
| `tsconfig.base.json` | TypeScript partagé |

### 7.3 Résultat

- **Changement détecté** → Vercel lance le build et déploie
- **Aucun changement pertinent** → Vercel ignore le déploiement (exit code 0)

Cela signifie qu'un commit modifiant uniquement `apps/links/` ne déclenchera **pas** de redéploiement d'Omega.

---

## 8. Monitoring et health checks

### 8.1 Endpoint de santé

L'application expose un endpoint de santé à :

```
GET /api/health
```

Réponse attendue (HTTP 200) :

```json
{
  "status": "ok",
  "app": "omega",
  "timestamp": "2026-03-22T10:00:00.000Z"
}
```

### 8.2 Supervision recommandée

| Service | Configuration |
|---|---|
| **Vercel Analytics** | Activer dans le dashboard Vercel → Analytics |
| **Alertes 5xx** | Vercel → Settings → Notifications → Activer les alertes email |
| **Supabase Dashboard** | Surveiller les métriques (connexions, requêtes, stockage) |
| **Uptime monitoring** | Configurer un service externe (ex: UptimeRobot, Better Uptime) sur `/api/health` |

> **Note Omega :** Si la consolidation Salesforce/SAP est active, surveiller également les logs des tâches de synchronisation et les éventuels timeouts sur les Serverless Functions (limite Vercel : 10s sur le plan Hobby, 60s sur Pro).

---

## 9. Smoke tests post-déploiement

Après chaque mise en production, vérifier manuellement :

1. [ ] `GET /api/health` → retourne HTTP 200 avec `"status": "ok"`
2. [ ] Page `/login` → affiche le formulaire de connexion
3. [ ] Login avec compte de test → redirection vers `/dashboard`
4. [ ] Navigation sidebar → toutes les pages chargent sans erreur
5. [ ] Pages RGPD accessibles :
   - `/mentions-legales`
   - `/confidentialite`
   - `/cookies`
6. [ ] Bandeau cookies s'affiche au premier accès
7. [ ] API RGPD → export des données fonctionne
8. [ ] Dashboard opérationnel → les KPIs s'affichent correctement
9. [ ] Liste des interventions → données visibles et filtrables
10. [ ] Création d'une intervention de test → succès
11. [ ] Suppression de l'intervention de test → succès

---

## 10. Rollback

### 10.1 Procédure

Vercel conserve toutes les versions déployées. En cas de problème :

1. Dashboard Vercel → projet `unanima-omega`
2. Onglet **Deployments**
3. Identifier le dernier déploiement stable
4. Cliquer sur le menu **⋮** → **Promote to Production**

**Temps de rollback : < 1 minute.**

### 10.2 Précautions

- Un rollback ne revient **pas** en arrière sur les migrations Supabase — les changements de schéma sont irréversibles par cette méthode
- Si le problème vient d'une migration, appliquer une migration corrective plutôt qu'un rollback
- Si la synchronisation Salesforce/SAP est en cours lors du rollback, vérifier la cohérence des données après le retour arrière

---

## 11. Dépannage

### 11.1 Le build échoue avec "pnpm-lock.yaml not found"

**Cause :** Le build s'exécute depuis `apps/omega/` et ne trouve pas le lockfile.

**Solution :** Vérifier que `vercel.json` contient bien :
```json
"buildCommand": "cd ../.. && pnpm turbo run build --filter=@unanima/omega"
```

Le `cd ../..` est indispensable pour remonter à la racine du monorepo.

Voir : `docs/platform/reports/RPT-0001-echec-deploiement-lockfile.md`

### 11.2 Le build échoue avec des erreurs de résolution de packages

**Cause :** Le lockfile est désynchronisé avec `package.json`.

**Solution :**
```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "fix: synchronize pnpm lockfile"
git push
```

### 11.3 Déploiement non déclenché après un push

**Cause :** Le script `vercel-ignore.sh` n'a détecté aucun changement pertinent à Omega.

**Vérification :**
```bash
# Voir quels fichiers ont changé dans le dernier commit
git diff --name-only HEAD~1 HEAD
```

Si les changements ne touchent aucun des chemins surveillés (section 7.2), le déploiement est ignoré — c'est le comportement attendu.

### 11.4 Erreur 500 en production

1. Vérifier les logs dans le dashboard Vercel → **Logs**
2. Vérifier que toutes les variables d'environnement sont correctement configurées
3. Vérifier la connectivité Supabase (dashboard Supabase → Health)
4. Si nécessaire, effectuer un rollback (section 10)

### 11.5 Les e-mails ne partent pas

1. Vérifier que `RESEND_API_KEY` est configurée et valide (pas expirée)
2. Vérifier que le domaine expéditeur est vérifié sur Resend
3. Consulter les logs Resend pour les erreurs de livraison

### 11.6 Timeout sur les Serverless Functions

**Cause :** Les fonctions de consolidation Salesforce/SAP dépassent la limite de temps Vercel.

**Solution :**
- Plan Hobby : limite de 10 secondes — insuffisant pour des consolidations lourdes
- Plan Pro : limite de 60 secondes — recommandé pour Omega
- Pour les traitements longs, envisager des Edge Functions Supabase ou des tâches cron externes

---

## Historique

| Version | Date | Auteur | Changement |
|---|---|---|---|
| 1.0.0 | 2026-03-22 | Documentalix | Création initiale |
