-- Migration 001: Create Links business tables
-- App: Link's Accompagnement — Bilans de compétences

-- ============================================================
-- Table: beneficiaires
-- Bénéficiaires suivis par un consultant
-- ============================================================
CREATE TABLE public.beneficiaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  statut TEXT NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif', 'en_pause', 'termine', 'abandonne')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.beneficiaires ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_beneficiaires_updated_at
  BEFORE UPDATE ON public.beneficiaires
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX idx_beneficiaires_profile_id ON public.beneficiaires(profile_id);
CREATE INDEX idx_beneficiaires_consultant_id ON public.beneficiaires(consultant_id);
CREATE INDEX idx_beneficiaires_statut ON public.beneficiaires(statut);

-- ============================================================
-- Table: bilans
-- Bilans de compétences d'un bénéficiaire
-- ============================================================
CREATE TABLE public.bilans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiaire_id UUID NOT NULL REFERENCES public.beneficiaires(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('initial', 'intermediaire', 'final')),
  statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'en_cours', 'termine', 'valide')),
  date_debut DATE,
  date_fin DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bilans ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_bilans_updated_at
  BEFORE UPDATE ON public.bilans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX idx_bilans_beneficiaire_id ON public.bilans(beneficiaire_id);
CREATE INDEX idx_bilans_statut ON public.bilans(statut);

-- ============================================================
-- Table: questionnaires
-- Modèles de questionnaires (gérés par les consultants)
-- ============================================================
CREATE TABLE public.questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  description TEXT,
  version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Table: questions
-- Questions d'un questionnaire
-- ============================================================
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  ordre INT NOT NULL,
  texte TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'textarea', 'select', 'multiselect', 'radio', 'checkbox', 'scale')),
  options JSONB DEFAULT '[]',
  required BOOLEAN DEFAULT false,
  UNIQUE (questionnaire_id, ordre)
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_questions_questionnaire_id ON public.questions(questionnaire_id);

-- ============================================================
-- Table: responses
-- Réponses d'un bénéficiaire à un questionnaire (dans un bilan)
-- ============================================================
CREATE TABLE public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bilan_id UUID NOT NULL REFERENCES public.bilans(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
  valeur JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (bilan_id, question_id)
);

ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_responses_bilan_id ON public.responses(bilan_id);
CREATE INDEX idx_responses_question_id ON public.responses(question_id);

-- ============================================================
-- Table: documents
-- Documents uploadés par/pour un bénéficiaire
-- ============================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiaire_id UUID NOT NULL REFERENCES public.beneficiaires(id) ON DELETE CASCADE,
  bilan_id UUID REFERENCES public.bilans(id) ON DELETE SET NULL,
  nom TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cv', 'lettre_motivation', 'synthese', 'attestation', 'autre')),
  storage_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_documents_beneficiaire_id ON public.documents(beneficiaire_id);
CREATE INDEX idx_documents_bilan_id ON public.documents(bilan_id);
