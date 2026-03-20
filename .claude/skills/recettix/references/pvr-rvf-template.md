# Templates PVR & RVF — Recettix

---

# PROCÈS-VERBAL DE RECETTE (PVR)

## En-tête

| Champ | Valeur |
|---|---|
| Projet | [Nom] |
| Version livrée | [v1.0] |
| Date de recette | YYYY-MM-DD → YYYY-MM-DD |
| Environnement | UAT / Pré-production |
| Rédigé par | [Nom — Recettix] |
| Statut | Brouillon / À signer |

---

## 1. Résumé exécutif

> [2-3 phrases : périmètre testé, verdict global, conditions
> de réception.]

**Décision de réception** :
- [ ] ✅ **Réceptionné sans réserve**
- [ ] ⚠️ **Réceptionné avec réserves** (voir section 4)
- [ ] ❌ **Refusé** — motifs : [...]

---

## 2. Résultats des campagnes de tests

### 2.1 Tests fonctionnels

| Statut | Nombre | % |
|---|---|---|
| ✅ Passé | N | XX % |
| ❌ Échoué | N | XX % |
| ⏸ Bloqué | N | XX % |
| ⬜ Non testé | N | XX % |
| **Total** | **N** | **100 %** |

### 2.2 Tests automatisés

| Type | Outil | Total | Passés | Échoués | Couverture |
|---|---|---|---|---|---|
| Unitaires | Vitest | N | N | 0 | 84 % lignes |
| Intégration | Vitest | N | N | 0 | — |
| E2E | Playwright | N | N | 0 | — |

### 2.3 Performance

| Page | LCP | CLS | INP | Score Perf | Verdict |
|---|---|---|---|---|---|
| Accueil | 1.8 s | 0.04 | 95 ms | 88 | ✅ |
| [Page critique] | ... | ... | ... | ... | ... |

### 2.4 Accessibilité

| Outil | Violations critiques | Violations mineures | Score |
|---|---|---|---|
| axe-core | 0 | 2 | ✅ |
| Lighthouse | — | — | 92 |

### 2.5 Sécurité

| Check | Résultat |
|---|---|
| npm audit (critique) | 0 vulnérabilité |
| Gitleaks | 0 secret détecté |
| OWASP ZAP (actif) | 0 alerte haute |
| Revue RLS Supabase | ✅ Conforme |

---

## 3. Conformité SFD

| UC / Module | Cas testés | Passés | Taux conformité |
|---|---|---|---|
| UC-01 Authentification | 8 | 8 | 100 % |
| UC-02 [Module] | 12 | 11 | 91 % |
| ... | ... | ... | ... |
| **Total** | **N** | **N** | **XX %** |

---

## 4. Anomalies et réserves

### 4.1 Anomalies bloquantes (doivent être levées avant réception)

| ID | Titre | Statut | Date levée |
|---|---|---|---|
| ANO-001 | [Titre] | Levée / En cours | YYYY-MM-DD |

### 4.2 Réserves (anomalies mineures — plan de levée)

| ID | Titre | Criticité | Plan de levée | Responsable |
|---|---|---|---|---|
| ANO-010 | [Titre] | Mineure | Sprint N+1 — YYYY-MM-DD | [Dev] |

### 4.3 Anomalies rejetées (non conformes à la SFD)

| ID | Titre | Motif du rejet |
|---|---|---|
| ANO-015 | [Titre] | Hors périmètre — non prévu en SFD section XX |

---

## 5. Conditions de la réception

[Compléter selon le verdict :]

**Si réceptionné avec réserves :**
> Les réserves listées en section 4.2 seront levées au plus tard
> le [DATE]. Le prestataire transmettra un rapport de levée.
> La non-levée dans les délais entraîne [pénalité/recours].

---

## 6. Signatures

| Rôle | Nom | Date | Signature |
|---|---|---|---|
| Représentant client | | | |
| Chef de projet client | | | |
| Chef de projet prestataire | | | |

---
---

# RAPPORT DE VALIDATION FINALE (RVF)

## En-tête

| Champ | Valeur |
|---|---|
| Projet | [Nom] |
| Version | [v1.0] |
| Date | YYYY-MM-DD |
| Rédigé par | [Nom — Recettix] |

---

## 1. Attestation de conformité

> Le présent RVF atteste que l'ensemble des livrables listés
> dans le Plan de Recette du [DATE] ont été validés conformément
> aux spécifications fonctionnelles détaillées (SFD) version
> [VERSION], référence [REF].

---

## 2. Matrice de couverture finale

| Livrable | SFD couverte | Tests passés | Anomalies résiduelles | Statut |
|---|---|---|---|---|
| LIV-001 [Module] | 100 % | 100 % | 0 | ✅ Validé |
| LIV-002 [Module] | 97 % | 100 % | 1 mineure levée | ✅ Validé |

---

## 3. Historique des corrections

| Sprint | Anomalies corrigées | Régressions | Couverture à J |
|---|---|---|---|
| Sprint N | 3 bloquantes | 0 | 79 % |
| Sprint N+1 | 1 majeure | 0 | 83 % |
| Recette finale | — | 0 | 84 % |

---

## 4. Recommandations post-recette

### Monitoring (à mettre en place dès J+0 production)
- Alertes Sentry sur erreurs 5xx
- Dashboard Vercel Analytics — LCP / CLS en continu
- Alerte trésorerie Supabase (quota RLS)

### Tests de régression (à maintenir)
- Suite Playwright à exécuter à chaque déploiement
- `npm audit` hebdomadaire
- Revue Dependabot mensuelle

### Évolutions surveillées
- [Fonctionnalité à surveiller] : risque de régression identifié
- [Dépendance externe] : mise à jour majeure prévue en [mois]

---

## 5. Déclaration finale

> Les soussignés certifient que le projet [NOM], livré le [DATE],
> est conforme aux engagements contractuels et peut être mis en
> production.

| Rôle | Nom | Date | Signature |
|---|---|---|---|
| Représentant client | | | |
| Chef de projet client | | | |
| Chef de projet prestataire | | | |
| Responsable technique | | | |
