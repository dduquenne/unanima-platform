-- Migration 002: RLS policies for Omega business tables
-- Roles: admin, responsable_sav, technicien, operateur

-- ============================================================
-- clients_vehicules
-- ============================================================

-- Admin et responsable SAV voient tous les clients/véhicules
CREATE POLICY "clients_vehicules_select_admin_resp" ON public.clients_vehicules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable_sav')
    )
  );

-- Technicien voit les clients liés à ses interventions
CREATE POLICY "clients_vehicules_select_technicien" ON public.clients_vehicules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.interventions
      WHERE client_vehicule_id = clients_vehicules.id AND technicien_id = auth.uid()
    )
  );

-- Opérateur voit tous les clients (lecture seule pour saisie)
CREATE POLICY "clients_vehicules_select_operateur" ON public.clients_vehicules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'operateur'
    )
  );

-- Admin, responsable et opérateur peuvent créer des clients
CREATE POLICY "clients_vehicules_insert" ON public.clients_vehicules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable_sav', 'operateur')
    )
  );

-- Admin et responsable peuvent modifier des clients
CREATE POLICY "clients_vehicules_update" ON public.clients_vehicules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable_sav')
    )
  );

-- ============================================================
-- interventions
-- ============================================================

-- Admin et responsable SAV voient toutes les interventions
CREATE POLICY "interventions_select_admin_resp" ON public.interventions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable_sav')
    )
  );

-- Technicien voit ses propres interventions
CREATE POLICY "interventions_select_technicien" ON public.interventions
  FOR SELECT USING (technicien_id = auth.uid());

-- Opérateur voit toutes les interventions (lecture seule)
CREATE POLICY "interventions_select_operateur" ON public.interventions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'operateur'
    )
  );

-- Admin et responsable peuvent créer des interventions
CREATE POLICY "interventions_insert" ON public.interventions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable_sav')
    )
  );

-- Technicien peut modifier ses interventions (statut, dates)
CREATE POLICY "interventions_update_technicien" ON public.interventions
  FOR UPDATE USING (
    technicien_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable_sav')
    )
  );

-- ============================================================
-- affectations
-- ============================================================

-- Admin et responsable voient toutes les affectations
CREATE POLICY "affectations_select_admin_resp" ON public.affectations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable_sav')
    )
  );

-- Technicien voit ses propres affectations
CREATE POLICY "affectations_select_technicien" ON public.affectations
  FOR SELECT USING (technicien_id = auth.uid());

-- Responsable et admin peuvent créer des affectations
CREATE POLICY "affectations_insert" ON public.affectations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable_sav')
    )
  );

-- ============================================================
-- pieces_detachees
-- ============================================================

-- Tout utilisateur authentifié peut voir les pièces (stock)
CREATE POLICY "pieces_detachees_select_authenticated" ON public.pieces_detachees
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admin et responsable peuvent gérer les pièces
CREATE POLICY "pieces_detachees_insert" ON public.pieces_detachees
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable_sav')
    )
  );

CREATE POLICY "pieces_detachees_update" ON public.pieces_detachees
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable_sav')
    )
  );

-- ============================================================
-- kpis_sav
-- ============================================================

-- Admin, responsable et direction voient les KPIs
CREATE POLICY "kpis_sav_select" ON public.kpis_sav
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'responsable_sav')
    )
  );

-- Admin peut insérer des KPIs (calculs automatiques)
CREATE POLICY "kpis_sav_insert" ON public.kpis_sav
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin peut modifier des KPIs
CREATE POLICY "kpis_sav_update" ON public.kpis_sav
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
