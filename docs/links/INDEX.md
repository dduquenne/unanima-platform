# Base documentaire — Link's Accompagnement

## Index des documents

| Réf. | Titre | Type | Statut | Version | Mise à jour |
|---|---|---|---|---|---|
| RPT-0001 | Étude de faisabilité — Intégration API EduSign | RPT | accepted | 1.0 | 2026-03-10 |
| SPC-0001 | Note de cadrage — Plateforme digitale de suivi des bilans de compétences | SPC | accepted | 1.15 | 2026-03-23 |
| SPC-0002 | Proposition commerciale — Plateforme digitale de suivi des bilans de compétences | SPC | accepted | 1.4 | 2026-03-23 |
| SPC-0003 | Spécifications fonctionnelles détaillées — Plateforme Link's Accompagnement | SPC | draft | 1.0 | 2026-03-23 |

## Maquettes d'écrans (MAQ)

| Réf. | Écran | Rôle | Format | Version | Mise à jour |
|---|---|---|---|---|---|
| MAQ-01 | Page de connexion | Tous | SVG | 1.1 | 2026-03-23 |
| MAQ-02 | Dashboard bénéficiaire | Bénéficiaire | SVG | 1.0 | 2026-03-23 |
| MAQ-03 | Saisie de phase | Bénéficiaire | SVG | 1.0 | 2026-03-23 |
| MAQ-04 | Dashboard consultant | Consultant | SVG | 1.0 | 2026-03-23 |
| MAQ-05 | Fiche bénéficiaire (vue consultant) | Consultant | SVG | 1.0 | 2026-03-23 |
| MAQ-06 | Comptes-rendus de séances | Consultant | SVG | 1.0 | 2026-03-23 |
| MAQ-07 | Dashboard super admin | Super Admin | SVG | 1.0 | 2026-03-23 |
| MAQ-08 | Gestion des utilisateurs | Super Admin | SVG | 1.0 | 2026-03-23 |
| MAQ-09 | Planification des rendez-vous | Consultant | SVG | 1.0 | 2026-03-23 |

## Structure des dossiers

```
docs/links/
├── INDEX.md                          ← Ce fichier
├── specs/
│   ├── SPC-0001-note-cadrage-links-v1.15.md
│   ├── SPC-0002-proposition-commerciale-links-v1.4.md
│   └── SPC-0003-specifications-fonctionnelles-links-v1.0.md
└── mockups/
    ├── MAQ-01-login.svg
    ├── MAQ-02-dashboard-beneficiaire.svg
    ├── MAQ-03-saisie-phase.svg
    ├── MAQ-04-dashboard-consultant.svg
    ├── MAQ-05-fiche-beneficiaire-consultant.svg
    ├── MAQ-06-comptes-rendus.svg
    ├── MAQ-07-dashboard-admin.svg
    ├── MAQ-08-gestion-utilisateurs.svg
    └── MAQ-09-planification.svg
```

## Liens entre documents

| Document | Basé sur | Complété par |
|---|---|---|
| SPC-0001 | — | SPC-0002, SPC-0003 |
| SPC-0002 | SPC-0001 | — |
| SPC-0003 | SPC-0001 | MAQ-01 à MAQ-09 |
| MAQ-01 à MAQ-09 | SPC-0003 | — |
| RPT-0001 | — | — |
