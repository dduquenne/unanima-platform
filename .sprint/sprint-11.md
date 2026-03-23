# Sprint 11 — Links : Espace Super Admin + Qualité + Déploiement

**Projet :** Link's Accompagnement — MVP v1
**Période :** Semaine 6 (sprint final)
**Objectif :** Implémenter l'espace super admin complet, finaliser les tests (E2E + unitaires), déployer en production et livrer la recette au client.

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Issues | 8 (#123, #124, #125, #126, #127, #128, #129, #130) |
| Phases | 3 |
| Effort total | XL (~1 semaine intensive) |
| Chemin critique | #123 → #124 → #125 → #130 |
| Parallélisme max | Phase 2 (#126 + #127 + #128 + #129 en parallèle) |

---

## Prérequis avant démarrage Sprint 11

- [ ] Sprint 8 complet (BDD + RLS en place)
- [ ] Sprint 9 complet (Auth + Espace bénéficiaire)
- [ ] Sprint 10 complet (Espace consultant)
- [ ] Credentials Supabase de production disponibles
- [ ] Domaine client configuré et pointant vers Vercel

---

## Phase 1 — Fondations Admin (séquentiel, bloquant)

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 1 | #123 | [US-ADM-02] Création comptes utilisateurs (Admin API Supabase) | 🔴 Critique | M | archicodix, securix | Sprint 8 | ⚠️ Review Service Role |
| 2 | #124 | [US-ADM-05] Attribution bénéficiaire ↔ consultant (RLS) | 🔴 Critique | S | archicodix, databasix | #123 | ⚠️ Review RLS |
| 3 | #125 | [US-ADM-06] Gestion documents par phase (upload Storage) | 🔴 Critique | L | archicodix, securix | Sprint 8 | ⚠️ Review Storage |

**Détail #123 — CRITIQUE SÉCURITÉ :**
- `supabase.auth.admin.createUser()` via Route Handler (Service Role Key côté serveur UNIQUEMENT)
- Génération mot de passe temporaire 12 caractères
- Admin ne peut pas créer un autre super_admin

**Détail #124 :**
- Update consultant_id → RLS immédiatement mise à jour (ancienne consultante perd l'accès)
- Seules les consultantes actives dans le select

**Détail #125 :**
- Upload via Route Handler (Service Role Key) vers bucket `phase-documents`
- Validation : .pdf/.docx uniquement, max 10 Mo, max 3/phase
- Suppression atomique : Storage + BDD

**Point de contrôle Phase 1 :**
- [ ] Création compte → mot de passe temporaire affiché (jamais en clair en BDD)
- [ ] Attribution → consultante voit le bénéficiaire immédiatement
- [ ] Réassignation → ancienne consultante perd l'accès (test avec 2 sessions)
- [ ] Upload document → bénéficiaire peut le télécharger
- [ ] Service Role Key : vérifier qu'elle n'est pas dans les bundles client (pnpm build --analyze)

---

## Phase 2 — Admin complémentaire + Qualité (parallélisable)

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 4 | #126 | [US-ADM-03+04] Modification compte + suppression RGPD | 🟠 Haute | M | archicodix, rgpdix | #123 | ⚠️ Review RGPD |
| 5 | #127 | [US-ADM-01] Dashboard KPIs + supervision globale | 🟠 Haute | M | ergonomix, archicodix | #123 | — |
| 6 | #128 | [links] Tests E2E Playwright — parcours ben + consultant | 🟠 Haute | M | testix | Sprint 10 | — |
| 7 | #129 | [links] Tests unitaires — Zod + logique métier | 🟠 Haute | S | testix | Sprint 10 | — |

**Détail #126 — CRITIQUE RGPD :**
- Double confirmation suppression : modal + saisie nom complet
- Suppression physique via `admin.auth.deleteUser()` + CASCADE BDD
- audit_logs conservés même après effacement (obligation légale)
- Impossible de supprimer le dernier super_admin

**Détail #127 :**
- 4 KPIs calculés via requête SQL optimisée (CTE)
- Alerte inactivité > 14 jours (badge rouge)
- Performance < 3s (RT-10)

**Détail #128 — Parcours à couvrir :**
- Bénéficiaire : connexion → saisie réponses → validation phase → dashboard
- Consultant : login → dossier → CR → export PDF
- RBAC : bénéficiaire→403 /beneficiaires, consultant→403 /admin

**Détail #129 :**
- Couverture > 80% sur src/lib/api/
- Schémas Zod : upload, réponses, sessions, notes

**Point de contrôle Phase 2 :**
- [ ] Suppression compte avec double confirmation → données effacées, audit_logs conservés
- [ ] Dernier super_admin : suppression bloquée
- [ ] `pnpm test --filter=@unanima/links` 100% vert
- [ ] Tests E2E Playwright : tous passing
- [ ] Couverture > 80% générée

---

## Phase 3 — Déploiement production (bloquant : tout le sprint terminé)

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 8 | #130 | [links] Déploiement production + recette + CLAUDE.md | 🔴 Critique | S | deploix | Tout | ⚠️ Review client |

**Checklist déploiement #130 :**
1. Variables d'environnement Vercel production configurées
2. Migrations appliquées sur Supabase production
3. Bucket `phase-documents` créé avec RLS policies
4. Compte super_admin initial créé
5. Domaine client configuré (HTTPS via Let's Encrypt)
6. `GET /api/health` → 200 en production
7. Recette client : parcours complet sur 3 rôles
8. CLAUDE.md `apps/links/` complété et livré
9. Guide utilisateur super admin rédigé

**Point de contrôle final Sprint 11 :**
- [ ] Application accessible en HTTPS sur domaine client
- [ ] `pnpm test --filter=@unanima/links` vert en CI
- [ ] Rapport de recette signé par le client
- [ ] CLAUDE.md à jour
- [ ] Aucune vulnérabilité critique dans les logs Vercel

---

## Contraintes d'exécution

1. **Ne jamais pousser la Service Role Key en production** avant vérification Vercel env vars
2. **Double confirmation RGPD obligatoire** — ne pas simplifier le flow de suppression
3. **Tests E2E** : s'assurer que les fixtures de test sont chargées avant l'exécution
4. **Rapport de recette** : documenter tous les scénarios testés avec le client
5. Commits : `feat(links): [ADM] ...`, `test(links): ...`, `chore(links): deploy ...`
