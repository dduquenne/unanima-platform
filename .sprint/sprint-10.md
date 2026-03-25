# Sprint 10 — Links : Espace Bénéficiaire (fin) + Espace Consultant

**Projet :** Link's Accompagnement — MVP v1
**Période :** Semaines 4-5
**Objectif :** Compléter l'espace bénéficiaire (téléchargement documents) et implémenter l'espace consultant complet : dashboard portefeuille, dossiers bénéficiaires, planification, comptes-rendus confidentiels, export PDF, notification email.

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Issues | 7 (#116, #117, #118, #119, #120, #121, #122) |
| Phases | 3 |
| Effort total | XL (~2 semaines) |
| Chemin critique | #117 → #118 → #119 → #120 → #121 |
| Parallélisme max | #116 (après #125), #122 (après #119) |

---

## Prérequis avant démarrage Sprint 10

- [ ] Sprint 9 complet (#109 à #115 tous en Terminé)
- [ ] US-ADM-05 (#124) — Attribution bénéficiaire↔consultant démarrée (données de test disponibles)
- [ ] US-ADM-06 (#125) — Upload documents démarré (pour tester #116)
- [ ] **Décision H1/H2 notification email confirmée par le client** (pour #122)

---

## Phase 1 — Dashboard consultant (bloquant pour la suite)

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 1 | #117 | [US-CON-01] Dashboard consultant — portefeuille bénéficiaires | 🔴 Critique | M | ergonomix, archicodix | Sprint 9 + #124 | ⚠️ Review RLS |

**Détail #117 :**
- Tableau bénéficiaires assignés : nom, progression N/6, 6 pastilles, prochaine séance
- Tri ASC par prochaine séance (urgents en premier)
- Badge rouge si inactif > 7 jours
- **RLS critique** : consultante A ne voit PAS les bénéficiaires de consultante B → tester avec 2 sessions

**Point de contrôle Phase 1 :**
- [x] RLS validée (test 2 sessions consultant simultanées)
- [x] Progression calculée correctement pour chaque bénéficiaire
- [x] Tri par séance fonctionnel

---

## Phase 2 — Dossier bénéficiaire + planification + comptes-rendus (séquentiel)

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 2 | #118 | [US-CON-02+03] Dossier bénéficiaire + réponses (lecture seule) | 🟠 Haute | S | ergonomix, archicodix | #117 | — |
| 3 | #119 | [US-CON-04+05] Planification 6 séances + lien visioconférence | 🔴 Critique | M | ergonomix, archicodix | #118 | — |
| 4 | #120 | [US-CON-06] Comptes-rendus de séances (confidentiels) | 🔴 Critique | M | archicodix, securix | #118 | ⚠️ Review confidentialité |
| 5 | #121 | [US-CON-07] Export PDF comptes-rendus (génération serveur) | 🟠 Haute | M | archicodix | #120 | — |

**Détail #118 :**
- Navigation par onglets : phases 1-6 + Planification + Comptes-rendus
- Accès refusé si bénéficiaire non assigné → 403

**Détail #119 :**
- 6 champs datetime + champ URL visio
- Après sauvegarde → visible immédiatement dans /dashboard bénéficiaire

**Détail #120 — CRITIQUE SÉCURITÉ :**
- RLS session_notes : `consultant_id = auth.uid()` (consultante ne voit que ses propres notes)
- Super admin : lecture de toutes les notes
- Bénéficiaire : **AUCUN accès** — tester explicitement

**Détail #121 :**
- Bibliothèque recommandée : @react-pdf/renderer
- Génération Route Handler POST (jamais côté client)
- Fiches vides → "Séance N : compte-rendu non saisi"

**Point de contrôle Phase 2 :**
- [x] Lecture seule : tentative de modification d'une réponse bénéficiaire → bloquée
- [x] Dates planification → synchronisées côté bénéficiaire
- [x] Bénéficiaire → 0 accès aux comptes-rendus (test session bénéficiaire)
- [x] Super admin → peut lire les comptes-rendus
- [x] Export PDF : fichier téléchargeable, fiches vides gérées

---

## Phase 3 — Compléments (parallélisables)

| Ordre | Issue | Titre | Priorité | Effort | Skills | Dépend de | Review |
|-------|-------|-------|----------|--------|--------|-----------|--------|
| 6 | #116 | [US-BEN-07] Téléchargement documents (URLs signées) | 🟠 Haute | S | archicodix | #125 (ADM-06) | — |
| 7 | #122 | [US-CON-08] Notification email planification (Resend H1) | 🟡 Moyenne | S | integratix | #119 | — |

**Détail #116 :**
- Route Handler GET /api/documents/[id]/download → URL signée Supabase (60 min)
- Service Role Key côté serveur uniquement
- Nécessite que des documents aient été uploadés via #125

**Détail #122 :**
- ⚠️ Implémenter uniquement si hypothèse H1 confirmée par le client
- Email non bloquant : échec Resend → dates sauvegardées quand même

**Point de contrôle Sprint 10 :**
- [x] `pnpm build --filter=@unanima/links` vert
- [x] `pnpm test --filter=@unanima/links` vert (114 tests)
- [x] Parcours consultant complet : login → dossier → CR → export PDF
- [x] Email de planification reçu (si H1)
- [x] Documents téléchargeables depuis la page de phase

---

## Contraintes d'exécution

1. **Confidentialité comptes-rendus** : toujours tester avec une session bénéficiaire après implémentation
2. **Export PDF côté serveur** : ne jamais utiliser une bibliothèque client-side pour générer le PDF
3. **URLs signées** : toujours générées via Route Handler (Service Role Key), jamais côté client
4. **Décision H1/H2** : ne pas implémenter #122 avant confirmation du client
5. Commits : `feat(links): [CON] ...` ou `feat(links): [BEN] ...`
