# Recettes RLS de Production — Databasix

Recettes RLS testées sur 100+ déploiements pour des applications métier Supabase.

---

## Table des matières
1. [RLS de base — possession utilisateur](#1-rls-de-base--possession-utilisateur)
2. [Multi-tenant — accès par organisation](#2-multi-tenant--accès-par-organisation)
3. [RBAC — rôles hiérarchiques](#3-rbac--rôles-hiérarchiques)
4. [Héritage parent → enfant](#4-héritage-parent--enfant)
5. [Soft Delete + RLS](#5-soft-delete--rls)
6. [Rate Limiting par IP](#6-rate-limiting-par-ip)
7. [Accès public conditionnel](#7-accès-public-conditionnel)

---

## 1. RLS de base — possession utilisateur

```sql
-- Table possédée par un utilisateur unique
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "UserPrefs — propriétaire uniquement"
  ON public.user_preferences
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

---

## 2. Multi-tenant — accès par organisation

```sql
-- Fonction helper centrale (à créer une seule fois)
CREATE OR REPLACE FUNCTION public.get_user_orgs()
RETURNS SETOF uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT org_id FROM public.org_members
  WHERE user_id = auth.uid() AND left_at IS NULL
$$;

-- Application sur toutes les tables de l'org
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- SELECT : membres de l'org
CREATE POLICY "Projects — membres peuvent lire"
  ON public.projects FOR SELECT
  USING (org_id = ANY(ARRAY(SELECT public.get_user_orgs())));

-- INSERT : membres actifs seulement
CREATE POLICY "Projects — membres peuvent créer"
  ON public.projects FOR INSERT
  WITH CHECK (org_id = ANY(ARRAY(SELECT public.get_user_orgs())));

-- UPDATE : membres peuvent modifier leurs propres projets
CREATE POLICY "Projects — auteur peut modifier"
  ON public.projects FOR UPDATE
  USING (org_id = ANY(ARRAY(SELECT public.get_user_orgs())) AND owner_id = auth.uid())
  WITH CHECK (org_id = ANY(ARRAY(SELECT public.get_user_orgs())));

-- DELETE : uniquement admins et propriétaire
CREATE POLICY "Projects — admin peut supprimer"
  ON public.projects FOR DELETE
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
```

---

## 3. RBAC — rôles hiérarchiques

```sql
-- Hiérarchie : owner > admin > member > viewer
CREATE OR REPLACE FUNCTION public.has_min_role(p_org_id uuid, p_min_role text)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = p_org_id
      AND user_id = auth.uid()
      AND CASE p_min_role
            WHEN 'viewer' THEN role IN ('owner','admin','member','viewer')
            WHEN 'member' THEN role IN ('owner','admin','member')
            WHEN 'admin'  THEN role IN ('owner','admin')
            WHEN 'owner'  THEN role = 'owner'
            ELSE false
          END
  )
$$;

-- Utilisation
CREATE POLICY "Contracts — viewer+ peut lire"
  ON public.contracts FOR SELECT
  USING (public.has_min_role(org_id, 'viewer'));

CREATE POLICY "Contracts — member+ peut créer"
  ON public.contracts FOR INSERT
  WITH CHECK (public.has_min_role(org_id, 'member'));

CREATE POLICY "Contracts — admin+ peut supprimer"
  ON public.contracts FOR DELETE
  USING (public.has_min_role(org_id, 'admin'));
```

---

## 4. Héritage parent → enfant

```sql
-- Les items héritent de l'accès à leur work_order parent
ALTER TABLE public.work_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "WOItems — accès hérité du parent"
  ON public.work_order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.work_orders wo
      WHERE wo.id = work_order_id
        AND wo.org_id = ANY(ARRAY(SELECT public.get_user_orgs()))
        AND wo.deleted_at IS NULL
    )
  );
```

---

## 5. Soft Delete + RLS

```sql
-- Filtre automatique des enregistrements supprimés dans TOUTES les politiques
CREATE POLICY "Documents — membres voient les actifs"
  ON public.documents FOR SELECT
  USING (
    deleted_at IS NULL
    AND org_id = ANY(ARRAY(SELECT public.get_user_orgs()))
  );

-- Politique de "suppression" = mise à jour de deleted_at uniquement
CREATE POLICY "Documents — membres peuvent archiver"
  ON public.documents FOR UPDATE
  USING (
    deleted_at IS NULL
    AND org_id = ANY(ARRAY(SELECT public.get_user_orgs()))
  )
  WITH CHECK (org_id = ANY(ARRAY(SELECT public.get_user_orgs())));

-- Bloquer les vraies DELETE
CREATE POLICY "Documents — DELETE interdit"
  ON public.documents FOR DELETE
  USING (false);  -- jamais autorisé via API
```

---

## 6. Rate Limiting par IP

```sql
-- Table dans le schéma private (non exposé PostgREST)
CREATE TABLE private.rate_limits (
  ip_address  inet        NOT NULL,
  action      text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_rate_limits_ip ON private.rate_limits(ip_address, created_at);

-- Fonction de vérification (appelée via db_pre_request ou RLS)
CREATE OR REPLACE FUNCTION private.check_rate_limit(p_action text, p_max int, p_window interval)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_ip inet := inet(current_setting('request.headers', true)::json->>'x-forwarded-for');
  v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM private.rate_limits
  WHERE ip_address = v_ip
    AND action = p_action
    AND created_at > now() - p_window;

  IF v_count >= p_max THEN
    RAISE EXCEPTION 'rate_limit_exceeded' USING ERRCODE = '429';
  END IF;

  INSERT INTO private.rate_limits(ip_address, action) VALUES (v_ip, p_action);
  RETURN true;
END;
$$;
```

---

## 7. Accès public conditionnel

```sql
-- Certains enregistrements publics, d'autres privés
CREATE POLICY "Articles — publics visibles par tous"
  ON public.articles FOR SELECT
  USING (
    is_published = true
    OR owner_id = auth.uid()
    OR org_id = ANY(ARRAY(SELECT public.get_user_orgs()))
  );
```

---

## Checklist RLS

- [ ] RLS activé (`ALTER TABLE … ENABLE ROW LEVEL SECURITY`)
- [ ] Index sur `user_id`, `org_id`, `owner_id` dans chaque table
- [ ] Fonctions helper `SECURITY DEFINER STABLE` pour éviter les scans répétés
- [ ] Wrap des fonctions RLS dans `ANY(ARRAY(...))` pour forcer le cache
- [ ] Jamais `user_metadata` dans les politiques (modifiable par l'utilisateur)
- [ ] Rôle `authenticated` explicitement requis (pas juste `anon` exclusion)
- [ ] Tests pgTAP couvrant chaque politique
- [ ] `EXPLAIN ANALYZE` < 50ms avec RLS activé
