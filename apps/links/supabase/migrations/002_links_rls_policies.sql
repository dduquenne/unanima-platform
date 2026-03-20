-- Migration 002: RLS policies for Links business tables
-- Roles: beneficiaire, consultant, super_admin

-- ============================================================
-- beneficiaires
-- ============================================================

-- Bénéficiaire voit son propre enregistrement
CREATE POLICY "beneficiaires_select_own" ON public.beneficiaires
  FOR SELECT USING (profile_id = auth.uid());

-- Consultant voit ses bénéficiaires assignés
CREATE POLICY "beneficiaires_select_consultant" ON public.beneficiaires
  FOR SELECT USING (consultant_id = auth.uid());

-- Super admin voit tout
CREATE POLICY "beneficiaires_select_admin" ON public.beneficiaires
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Consultant peut créer des bénéficiaires
CREATE POLICY "beneficiaires_insert_consultant" ON public.beneficiaires
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('consultant', 'super_admin')
    )
  );

-- Consultant peut modifier ses bénéficiaires
CREATE POLICY "beneficiaires_update_consultant" ON public.beneficiaires
  FOR UPDATE USING (
    consultant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================================
-- bilans
-- ============================================================

-- Bénéficiaire voit ses propres bilans
CREATE POLICY "bilans_select_own" ON public.bilans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.beneficiaires
      WHERE id = bilans.beneficiaire_id AND profile_id = auth.uid()
    )
  );

-- Consultant voit les bilans de ses bénéficiaires
CREATE POLICY "bilans_select_consultant" ON public.bilans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.beneficiaires
      WHERE id = bilans.beneficiaire_id AND consultant_id = auth.uid()
    )
  );

-- Super admin voit tout
CREATE POLICY "bilans_select_admin" ON public.bilans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Consultant peut créer des bilans pour ses bénéficiaires
CREATE POLICY "bilans_insert_consultant" ON public.bilans
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.beneficiaires
      WHERE id = bilans.beneficiaire_id AND consultant_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Consultant peut modifier les bilans de ses bénéficiaires
CREATE POLICY "bilans_update_consultant" ON public.bilans
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.beneficiaires
      WHERE id = bilans.beneficiaire_id AND consultant_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================================
-- questionnaires
-- ============================================================

-- Tout utilisateur authentifié peut lire les questionnaires actifs
CREATE POLICY "questionnaires_select_authenticated" ON public.questionnaires
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Consultant et admin peuvent créer/modifier des questionnaires
CREATE POLICY "questionnaires_insert_consultant" ON public.questionnaires
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('consultant', 'super_admin')
    )
  );

CREATE POLICY "questionnaires_update_consultant" ON public.questionnaires
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('consultant', 'super_admin')
    )
  );

-- ============================================================
-- questions
-- ============================================================

-- Tout utilisateur authentifié peut lire les questions
CREATE POLICY "questions_select_authenticated" ON public.questions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Consultant et admin peuvent gérer les questions
CREATE POLICY "questions_insert_consultant" ON public.questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('consultant', 'super_admin')
    )
  );

CREATE POLICY "questions_update_consultant" ON public.questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('consultant', 'super_admin')
    )
  );

CREATE POLICY "questions_delete_consultant" ON public.questions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('consultant', 'super_admin')
    )
  );

-- ============================================================
-- responses
-- ============================================================

-- Bénéficiaire voit ses propres réponses
CREATE POLICY "responses_select_own" ON public.responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bilans b
      JOIN public.beneficiaires ben ON b.beneficiaire_id = ben.id
      WHERE b.id = responses.bilan_id AND ben.profile_id = auth.uid()
    )
  );

-- Consultant voit les réponses de ses bénéficiaires
CREATE POLICY "responses_select_consultant" ON public.responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bilans b
      JOIN public.beneficiaires ben ON b.beneficiaire_id = ben.id
      WHERE b.id = responses.bilan_id AND ben.consultant_id = auth.uid()
    )
  );

-- Super admin voit tout
CREATE POLICY "responses_select_admin" ON public.responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Bénéficiaire peut répondre aux questions de ses bilans
CREATE POLICY "responses_insert_own" ON public.responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bilans b
      JOIN public.beneficiaires ben ON b.beneficiaire_id = ben.id
      WHERE b.id = responses.bilan_id AND ben.profile_id = auth.uid()
    )
  );

-- Bénéficiaire peut modifier ses propres réponses
CREATE POLICY "responses_update_own" ON public.responses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.bilans b
      JOIN public.beneficiaires ben ON b.beneficiaire_id = ben.id
      WHERE b.id = responses.bilan_id AND ben.profile_id = auth.uid()
    )
  );

-- ============================================================
-- documents
-- ============================================================

-- Bénéficiaire voit ses propres documents
CREATE POLICY "documents_select_own" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.beneficiaires
      WHERE id = documents.beneficiaire_id AND profile_id = auth.uid()
    )
  );

-- Consultant voit les documents de ses bénéficiaires
CREATE POLICY "documents_select_consultant" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.beneficiaires
      WHERE id = documents.beneficiaire_id AND consultant_id = auth.uid()
    )
  );

-- Super admin voit tout
CREATE POLICY "documents_select_admin" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Consultant et bénéficiaire peuvent uploader des documents
CREATE POLICY "documents_insert_authenticated" ON public.documents
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM public.beneficiaires
        WHERE id = documents.beneficiaire_id
        AND (profile_id = auth.uid() OR consultant_id = auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin'
      )
    )
  );

-- Consultant peut supprimer les documents de ses bénéficiaires
CREATE POLICY "documents_delete_consultant" ON public.documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.beneficiaires
      WHERE id = documents.beneficiaire_id AND consultant_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
