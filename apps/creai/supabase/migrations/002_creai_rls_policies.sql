-- Migration 002: RLS policies for CREAI business tables
-- Roles: admin_creai, direction, coordonnateur, professionnel

-- ============================================================
-- etablissements
-- ============================================================

-- Direction et admin voient tous les établissements
CREATE POLICY "etablissements_select_admin_direction" ON public.etablissements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_creai', 'direction')
    )
  );

-- Coordonnateur voit les établissements (lecture globale pour coordination)
CREATE POLICY "etablissements_select_coordonnateur" ON public.etablissements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coordonnateur'
    )
  );

-- Professionnel voit les établissements liés à ses diagnostics
CREATE POLICY "etablissements_select_professionnel" ON public.etablissements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.diagnostics
      WHERE etablissement_id = etablissements.id AND auteur_id = auth.uid()
    )
  );

-- Admin et coordonnateur peuvent créer des établissements
CREATE POLICY "etablissements_insert_admin_coord" ON public.etablissements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_creai', 'coordonnateur')
    )
  );

-- Admin et coordonnateur peuvent modifier des établissements
CREATE POLICY "etablissements_update_admin_coord" ON public.etablissements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_creai', 'coordonnateur')
    )
  );

-- ============================================================
-- diagnostics
-- ============================================================

-- Auteur voit ses propres diagnostics
CREATE POLICY "diagnostics_select_own" ON public.diagnostics
  FOR SELECT USING (auteur_id = auth.uid());

-- Admin et direction voient tous les diagnostics
CREATE POLICY "diagnostics_select_admin_direction" ON public.diagnostics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_creai', 'direction')
    )
  );

-- Coordonnateur voit tous les diagnostics
CREATE POLICY "diagnostics_select_coordonnateur" ON public.diagnostics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coordonnateur'
    )
  );

-- Professionnel et coordonnateur peuvent créer des diagnostics
CREATE POLICY "diagnostics_insert_auteur" ON public.diagnostics
  FOR INSERT WITH CHECK (
    auteur_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_creai', 'coordonnateur', 'professionnel')
    )
  );

-- Auteur peut modifier son diagnostic (tant que non validé)
CREATE POLICY "diagnostics_update_own" ON public.diagnostics
  FOR UPDATE USING (
    auteur_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_creai', 'coordonnateur')
    )
  );

-- ============================================================
-- indicateurs
-- ============================================================

-- Tout utilisateur authentifié peut lire les indicateurs
CREATE POLICY "indicateurs_select_authenticated" ON public.indicateurs
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admin et coordonnateur peuvent insérer des indicateurs
CREATE POLICY "indicateurs_insert_admin_coord" ON public.indicateurs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_creai', 'coordonnateur', 'professionnel')
    )
  );

-- Admin peut modifier des indicateurs
CREATE POLICY "indicateurs_update_admin" ON public.indicateurs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_creai', 'coordonnateur')
    )
  );

-- ============================================================
-- rapports
-- ============================================================

-- Auteur du diagnostic voit le rapport
CREATE POLICY "rapports_select_auteur" ON public.rapports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.diagnostics
      WHERE id = rapports.diagnostic_id AND auteur_id = auth.uid()
    )
  );

-- Admin, direction, coordonnateur voient tous les rapports
CREATE POLICY "rapports_select_admin_direction_coord" ON public.rapports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_creai', 'direction', 'coordonnateur')
    )
  );

-- Auteur du diagnostic et admin peuvent créer des rapports
CREATE POLICY "rapports_insert_auteur" ON public.rapports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.diagnostics
      WHERE id = rapports.diagnostic_id AND auteur_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_creai', 'coordonnateur')
    )
  );

-- Auteur et admin peuvent modifier des rapports
CREATE POLICY "rapports_update_auteur" ON public.rapports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.diagnostics
      WHERE id = rapports.diagnostic_id AND auteur_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_creai', 'coordonnateur')
    )
  );

-- ============================================================
-- recommandations
-- ============================================================

-- Auteur du diagnostic voit les recommandations
CREATE POLICY "recommandations_select_auteur" ON public.recommandations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.diagnostics
      WHERE id = recommandations.diagnostic_id AND auteur_id = auth.uid()
    )
  );

-- Admin, direction, coordonnateur voient toutes les recommandations
CREATE POLICY "recommandations_select_admin_direction_coord" ON public.recommandations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_creai', 'direction', 'coordonnateur')
    )
  );

-- Auteur et admin peuvent créer des recommandations
CREATE POLICY "recommandations_insert_auteur" ON public.recommandations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.diagnostics
      WHERE id = recommandations.diagnostic_id AND auteur_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_creai', 'coordonnateur')
    )
  );

-- Auteur et admin peuvent modifier des recommandations
CREATE POLICY "recommandations_update_auteur" ON public.recommandations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.diagnostics
      WHERE id = recommandations.diagnostic_id AND auteur_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_creai', 'coordonnateur')
    )
  );
