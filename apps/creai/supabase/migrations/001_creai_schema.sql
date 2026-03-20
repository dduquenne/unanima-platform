-- Migration 001: Create CREAI business tables
-- App: CREAI Île-de-France — Appui à la transformation de l'offre médico-sociale

-- ============================================================
-- Table: etablissements
-- Établissements médico-sociaux suivis par le CREAI
-- ============================================================
CREATE TABLE public.etablissements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ehpad', 'ime', 'esat', 'mecs', 'savs', 'sessad', 'foyer', 'autre')),
  adresse TEXT,
  siret TEXT UNIQUE,
  capacite INT,
  statut TEXT NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'en_transformation')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.etablissements ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_etablissements_updated_at
  BEFORE UPDATE ON public.etablissements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX idx_etablissements_type ON public.etablissements(type);
CREATE INDEX idx_etablissements_statut ON public.etablissements(statut);

-- ============================================================
-- Table: diagnostics
-- Diagnostics réalisés sur un établissement
-- ============================================================
CREATE TABLE public.diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etablissement_id UUID NOT NULL REFERENCES public.etablissements(id) ON DELETE CASCADE,
  auteur_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  date_diagnostic DATE NOT NULL DEFAULT CURRENT_DATE,
  statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'en_cours', 'finalise', 'valide')),
  synthese TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_diagnostics_updated_at
  BEFORE UPDATE ON public.diagnostics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX idx_diagnostics_etablissement_id ON public.diagnostics(etablissement_id);
CREATE INDEX idx_diagnostics_auteur_id ON public.diagnostics(auteur_id);
CREATE INDEX idx_diagnostics_statut ON public.diagnostics(statut);

-- ============================================================
-- Table: indicateurs
-- Indicateurs quantitatifs d'un établissement
-- ============================================================
CREATE TABLE public.indicateurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etablissement_id UUID NOT NULL REFERENCES public.etablissements(id) ON DELETE CASCADE,
  categorie TEXT NOT NULL CHECK (categorie IN ('qualite', 'rh', 'financier', 'activite', 'satisfaction')),
  nom TEXT NOT NULL,
  valeur NUMERIC NOT NULL,
  unite TEXT,
  periode DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.indicateurs ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_indicateurs_etablissement_id ON public.indicateurs(etablissement_id);
CREATE INDEX idx_indicateurs_categorie ON public.indicateurs(categorie);
CREATE INDEX idx_indicateurs_periode ON public.indicateurs(periode);

-- ============================================================
-- Table: rapports
-- Rapports de diagnostic
-- ============================================================
CREATE TABLE public.rapports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_id UUID NOT NULL REFERENCES public.diagnostics(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  contenu JSONB NOT NULL DEFAULT '{}',
  statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'en_revision', 'publie')),
  date_publication DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rapports ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_rapports_updated_at
  BEFORE UPDATE ON public.rapports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX idx_rapports_diagnostic_id ON public.rapports(diagnostic_id);
CREATE INDEX idx_rapports_statut ON public.rapports(statut);

-- ============================================================
-- Table: recommandations
-- Recommandations issues d'un diagnostic
-- ============================================================
CREATE TABLE public.recommandations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_id UUID NOT NULL REFERENCES public.diagnostics(id) ON DELETE CASCADE,
  priorite TEXT NOT NULL CHECK (priorite IN ('critique', 'haute', 'moyenne', 'basse')),
  description TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'proposee' CHECK (statut IN ('proposee', 'acceptee', 'en_cours', 'realisee', 'rejetee')),
  echeance DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.recommandations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_recommandations_updated_at
  BEFORE UPDATE ON public.recommandations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX idx_recommandations_diagnostic_id ON public.recommandations(diagnostic_id);
CREATE INDEX idx_recommandations_priorite ON public.recommandations(priorite);
CREATE INDEX idx_recommandations_statut ON public.recommandations(statut);
