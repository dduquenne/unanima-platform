-- Migration 001: Schéma BDD complet Links — Bilans de compétences (6 phases)
-- App: Link's Accompagnement
-- Issue: #104 — Sprint 8 Fondations
-- Référence: SPC-0003 Spécifications fonctionnelles

-- ============================================================
-- Extension de la table profiles (socle)
-- Colonnes spécifiques à l'app Links
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS consultant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS date_debut_bilan DATE,
  ADD COLUMN IF NOT EXISTS date_fin_bilan DATE;

CREATE INDEX IF NOT EXISTS idx_profiles_consultant_id ON public.profiles(consultant_id);

-- ============================================================
-- Table: questionnaires
-- Modèles de questionnaires par phase (1-6)
-- Gérés par le super_admin
-- ============================================================
CREATE TABLE public.questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_number INT NOT NULL CHECK (phase_number BETWEEN 1 AND 6),
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_questionnaires_phase_number ON public.questionnaires(phase_number);

-- ============================================================
-- Table: questions
-- Questions associées à un questionnaire de phase
-- ============================================================
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_questions_questionnaire_id ON public.questions(questionnaire_id);
CREATE INDEX idx_questions_sort_order ON public.questions(questionnaire_id, sort_order);

-- ============================================================
-- Table: phase_responses
-- Réponses d'un bénéficiaire aux questions d'une phase
-- Autosave déclenché au blur + toutes les 30s
-- ============================================================
CREATE TABLE public.phase_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  response_text TEXT,
  phase_number INT NOT NULL CHECK (phase_number BETWEEN 1 AND 6),
  phase_status TEXT NOT NULL DEFAULT 'libre' CHECK (phase_status IN ('libre', 'en_cours', 'validee')),
  last_saved_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (beneficiary_id, question_id)
);

ALTER TABLE public.phase_responses ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_phase_responses_beneficiary_id ON public.phase_responses(beneficiary_id);
CREATE INDEX idx_phase_responses_question_id ON public.phase_responses(question_id);
CREATE INDEX idx_phase_responses_phase_number ON public.phase_responses(beneficiary_id, phase_number);

CREATE TRIGGER set_phase_responses_updated_at
  BEFORE UPDATE ON public.phase_responses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Table: phase_validations
-- Statut de validation de chaque phase par bénéficiaire
-- UNIQUE (beneficiary_id, phase_number) — une seule validation par phase
-- ============================================================
CREATE TABLE public.phase_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  phase_number INT NOT NULL CHECK (phase_number BETWEEN 1 AND 6),
  status TEXT NOT NULL DEFAULT 'libre' CHECK (status IN ('libre', 'en_cours', 'validee')),
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (beneficiary_id, phase_number)
);

ALTER TABLE public.phase_validations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_phase_validations_beneficiary_id ON public.phase_validations(beneficiary_id);

CREATE TRIGGER set_phase_validations_updated_at
  BEFORE UPDATE ON public.phase_validations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Table: sessions
-- 6 séances de suivi consultant ↔ bénéficiaire
-- UNIQUE (beneficiary_id, session_number) — une séance par numéro
-- ============================================================
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_number INT NOT NULL CHECK (session_number BETWEEN 1 AND 6),
  scheduled_at TIMESTAMPTZ,
  visio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (beneficiary_id, session_number)
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_sessions_beneficiary_id ON public.sessions(beneficiary_id);

CREATE TRIGGER set_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Table: session_notes
-- Comptes-rendus de séances (confidentiels — consultant uniquement)
-- RG-CON-03 : confidentialité absolue, bénéficiaire sans accès
-- ============================================================
CREATE TABLE public.session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  session_number INT NOT NULL CHECK (session_number BETWEEN 1 AND 6),
  content TEXT,
  max_length INT DEFAULT 10000,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (beneficiary_id, session_number)
);

ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_session_notes_beneficiary_id ON public.session_notes(beneficiary_id);
CREATE INDEX idx_session_notes_consultant_id ON public.session_notes(consultant_id);

CREATE TRIGGER set_session_notes_updated_at
  BEFORE UPDATE ON public.session_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Table: phase_documents
-- Documents mis à disposition par phase (PDF/DOCX)
-- Gérés exclusivement par le super_admin
-- Stockés dans le bucket Supabase Storage "phase-documents"
-- ============================================================
CREATE TABLE public.phase_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_number INT NOT NULL CHECK (phase_number BETWEEN 1 AND 6),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  display_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx')),
  sort_order INT NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.phase_documents ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_phase_documents_phase_number ON public.phase_documents(phase_number, sort_order);

CREATE TRIGGER set_phase_documents_updated_at
  BEFORE UPDATE ON public.phase_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
