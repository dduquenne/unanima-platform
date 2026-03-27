-- Migration 002: RLS policies — Links (nouveau schéma 6 phases)
-- Issue: #105 — Sprint 8 Fondations
-- Rôles: beneficiaire | consultant | super_admin
-- Règles métier: RG-CON-01, RG-CON-03, RG-ADM-01

-- ============================================================
-- Extension profiles : accès selon le rôle
-- ============================================================

-- Bénéficiaire voit son propre profil
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Consultant voit les profils de ses bénéficiaires assignés
-- (profiles.consultant_id = auth.uid() identifie les bénéficiaires d'un consultant)
CREATE POLICY "profiles_select_as_consultant"
  ON public.profiles FOR SELECT
  USING (consultant_id = auth.uid());

-- Super admin voit tous les profils
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- Super admin peut modifier tous les profils (gestion des comptes)
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- ============================================================
-- questionnaires — templates de phase (lecture publique, écriture admin)
-- ============================================================

-- Lecture : tout utilisateur authentifié
CREATE POLICY "questionnaires_select_authenticated"
  ON public.questionnaires FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Écriture (INSERT/UPDATE/DELETE) : super_admin uniquement
CREATE POLICY "questionnaires_all_admin"
  ON public.questionnaires FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================================
-- questions — lecture publique, écriture admin
-- ============================================================

-- Lecture : tout utilisateur authentifié
CREATE POLICY "questions_select_authenticated"
  ON public.questions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Écriture : super_admin uniquement
CREATE POLICY "questions_all_admin"
  ON public.questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================================
-- phase_responses — réponses bénéficiaire aux phases
-- RG-CON-01 : isolation par beneficiary_id
-- ============================================================

-- Bénéficiaire : lecture + écriture de ses propres réponses
CREATE POLICY "phase_responses_select_own"
  ON public.phase_responses FOR SELECT
  USING (beneficiary_id = auth.uid());

CREATE POLICY "phase_responses_insert_own"
  ON public.phase_responses FOR INSERT
  WITH CHECK (beneficiary_id = auth.uid());

CREATE POLICY "phase_responses_update_own"
  ON public.phase_responses FOR UPDATE
  USING (beneficiary_id = auth.uid());

-- Consultant : lecture seule des réponses de ses bénéficiaires assignés
CREATE POLICY "phase_responses_select_consultant"
  ON public.phase_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = phase_responses.beneficiary_id
        AND consultant_id = auth.uid()
    )
  );

-- Super admin : accès complet
CREATE POLICY "phase_responses_all_admin"
  ON public.phase_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================================
-- phase_validations — validation des phases par bénéficiaire
-- ============================================================

-- Bénéficiaire : lecture + gestion de ses propres validations
CREATE POLICY "phase_validations_select_own"
  ON public.phase_validations FOR SELECT
  USING (beneficiary_id = auth.uid());

CREATE POLICY "phase_validations_insert_own"
  ON public.phase_validations FOR INSERT
  WITH CHECK (beneficiary_id = auth.uid());

CREATE POLICY "phase_validations_update_own"
  ON public.phase_validations FOR UPDATE
  USING (beneficiary_id = auth.uid());

-- Consultant : lecture des validations de ses bénéficiaires
CREATE POLICY "phase_validations_select_consultant"
  ON public.phase_validations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = phase_validations.beneficiary_id
        AND consultant_id = auth.uid()
    )
  );

-- Super admin : accès complet (peut forcer la validation/dé-validation)
CREATE POLICY "phase_validations_all_admin"
  ON public.phase_validations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================================
-- sessions — planification des 6 séances
-- ============================================================

-- Bénéficiaire : lecture de ses propres séances
CREATE POLICY "sessions_select_own"
  ON public.sessions FOR SELECT
  USING (beneficiary_id = auth.uid());

-- Consultant : lecture des séances de ses bénéficiaires
CREATE POLICY "sessions_select_consultant"
  ON public.sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = sessions.beneficiary_id
        AND consultant_id = auth.uid()
    )
  );

-- Consultant : création et modification des séances de ses bénéficiaires
CREATE POLICY "sessions_insert_consultant"
  ON public.sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = sessions.beneficiary_id
        AND consultant_id = auth.uid()
    )
  );

CREATE POLICY "sessions_update_consultant"
  ON public.sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = sessions.beneficiary_id
        AND consultant_id = auth.uid()
    )
  );

-- Super admin : accès complet
CREATE POLICY "sessions_all_admin"
  ON public.sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================================
-- session_notes — comptes-rendus de séances (CONFIDENTIELS)
-- RG-CON-03 : consultant voit uniquement ses propres notes
-- Bénéficiaire : AUCUN accès (pas de policy → deny par défaut)
-- ============================================================

-- Consultant : accès exclusif à ses propres notes
CREATE POLICY "session_notes_select_consultant"
  ON public.session_notes FOR SELECT
  USING (consultant_id = auth.uid());

CREATE POLICY "session_notes_insert_consultant"
  ON public.session_notes FOR INSERT
  WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "session_notes_update_consultant"
  ON public.session_notes FOR UPDATE
  USING (consultant_id = auth.uid());

CREATE POLICY "session_notes_delete_consultant"
  ON public.session_notes FOR DELETE
  USING (consultant_id = auth.uid());

-- Super admin : lecture de toutes les notes (supervision)
CREATE POLICY "session_notes_select_admin"
  ON public.session_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================================
-- phase_documents — documents par phase (PDF/DOCX)
-- Lecture publique authentifiée, écriture super_admin uniquement
-- ============================================================

-- Lecture : tout utilisateur authentifié
CREATE POLICY "phase_documents_select_authenticated"
  ON public.phase_documents FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Écriture : super_admin uniquement
CREATE POLICY "phase_documents_all_admin"
  ON public.phase_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================================
-- Storage bucket "phase-documents"
-- À configurer dans Supabase Dashboard ou via CLI :
--   supabase storage create-bucket phase-documents --public false
-- Policies Storage :
--   SELECT : tout utilisateur authentifié
--   INSERT : super_admin uniquement
-- ============================================================
