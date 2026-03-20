-- Migration 001: Create Omega business tables
-- App: Omega Automotive — Dashboard opérationnel SAV

-- ============================================================
-- Table: clients_vehicules
-- Clients et leurs véhicules
-- ============================================================
CREATE TABLE public.clients_vehicules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raison_sociale TEXT NOT NULL,
  contact TEXT,
  vehicule_marque TEXT NOT NULL,
  vehicule_modele TEXT NOT NULL,
  immatriculation TEXT,
  vin TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clients_vehicules ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_clients_vehicules_updated_at
  BEFORE UPDATE ON public.clients_vehicules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX idx_clients_vehicules_raison_sociale ON public.clients_vehicules(raison_sociale);
CREATE INDEX idx_clients_vehicules_immatriculation ON public.clients_vehicules(immatriculation);

-- ============================================================
-- Table: interventions
-- Interventions SAV sur un véhicule client
-- ============================================================
CREATE TABLE public.interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_vehicule_id UUID NOT NULL REFERENCES public.clients_vehicules(id) ON DELETE RESTRICT,
  technicien_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('garantie', 'maintenance', 'reparation', 'rappel', 'diagnostic')),
  statut TEXT NOT NULL DEFAULT 'planifiee' CHECK (statut IN ('planifiee', 'en_cours', 'en_attente_pieces', 'terminee', 'annulee')),
  priorite TEXT NOT NULL DEFAULT 'normale' CHECK (priorite IN ('critique', 'haute', 'normale', 'basse')),
  description TEXT,
  date_planifiee DATE,
  date_debut TIMESTAMPTZ,
  date_fin TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_interventions_updated_at
  BEFORE UPDATE ON public.interventions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX idx_interventions_client_vehicule_id ON public.interventions(client_vehicule_id);
CREATE INDEX idx_interventions_technicien_id ON public.interventions(technicien_id);
CREATE INDEX idx_interventions_statut ON public.interventions(statut);
CREATE INDEX idx_interventions_priorite ON public.interventions(priorite);
CREATE INDEX idx_interventions_date_planifiee ON public.interventions(date_planifiee);

-- ============================================================
-- Table: affectations
-- Affectation d'un technicien à une intervention (historique)
-- ============================================================
CREATE TABLE public.affectations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id UUID NOT NULL REFERENCES public.interventions(id) ON DELETE CASCADE,
  technicien_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  responsable_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  date_affectation TIMESTAMPTZ DEFAULT now(),
  commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.affectations ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_affectations_intervention_id ON public.affectations(intervention_id);
CREATE INDEX idx_affectations_technicien_id ON public.affectations(technicien_id);

-- ============================================================
-- Table: pieces_detachees
-- Stock de pièces détachées
-- ============================================================
CREATE TABLE public.pieces_detachees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  designation TEXT NOT NULL,
  stock_actuel INT NOT NULL DEFAULT 0 CHECK (stock_actuel >= 0),
  seuil_alerte INT NOT NULL DEFAULT 5,
  prix_unitaire NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pieces_detachees ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_pieces_detachees_updated_at
  BEFORE UPDATE ON public.pieces_detachees
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX idx_pieces_detachees_reference ON public.pieces_detachees(reference);
CREATE INDEX idx_pieces_detachees_stock_alerte ON public.pieces_detachees(stock_actuel) WHERE stock_actuel <= seuil_alerte;

-- ============================================================
-- Table: kpis_sav
-- KPIs SAV agrégés par période
-- ============================================================
CREATE TABLE public.kpis_sav (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periode DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('delai_moyen', 'taux_resolution', 'satisfaction', 'interventions_total', 'pieces_consommees', 'cout_moyen')),
  valeur NUMERIC NOT NULL,
  objectif NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (periode, type)
);

ALTER TABLE public.kpis_sav ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_kpis_sav_periode ON public.kpis_sav(periode);
CREATE INDEX idx_kpis_sav_type ON public.kpis_sav(type);
