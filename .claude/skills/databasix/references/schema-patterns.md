# Patterns de Schéma — Databasix

Patterns de conception de schéma PostgreSQL pour applications métier Supabase.

---

## Table des matières
1. [Multi-tenant complet](#1-multi-tenant-complet)
2. [Soft Delete](#2-soft-delete)
3. [JSONB Avancé](#3-jsonb-avancé)
4. [Full-Text Search](#4-full-text-search)
5. [Hiérarchies et arbres](#5-hiérarchies-et-arbres)
6. [Versionning de données](#6-versionning-de-données)
7. [Tables de statuts et workflows](#7-tables-de-statuts-et-workflows)

---

## 1. Multi-tenant complet

```sql
-- ① Table des organisations
CREATE TABLE public.organizations (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text        NOT NULL UNIQUE,
  name        text        NOT NULL,
  settings    jsonb       NOT NULL DEFAULT '{}',
  plan        text        NOT NULL DEFAULT 'free' CHECK (plan IN ('free','starter','pro','enterprise')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ② Table des membres avec rôles
CREATE TABLE public.org_members (
  org_id      uuid        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text        NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member','viewer')),
  invited_by  uuid        REFERENCES auth.users(id),
  joined_at   timestamptz NOT NULL DEFAULT now(),
  left_at     timestamptz,
  PRIMARY KEY (org_id, user_id)
);
CREATE INDEX idx_org_members_user_id ON public.org_members(user_id) WHERE left_at IS NULL;
CREATE INDEX idx_org_members_org_id  ON public.org_members(org_id)  WHERE left_at IS NULL;

-- ③ Profils utilisateurs (extension de auth.users)
CREATE TABLE public.profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  avatar_url  text,
  timezone    text        NOT NULL DEFAULT 'UTC',
  locale      text        NOT NULL DEFAULT 'fr',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Auto-création du profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles(id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 2. Soft Delete

```sql
-- Pattern complet : deleted_at + vues filtrées

-- ① Colonne sur chaque table
ALTER TABLE public.resources ADD COLUMN deleted_at timestamptz;

-- ② Index partiel (performances)
CREATE INDEX idx_resources_active ON public.resources(org_id, updated_at DESC)
  WHERE deleted_at IS NULL;

-- ③ Vue "active" avec security_invoker (PostgreSQL 15+)
CREATE VIEW public.active_resources
  WITH (security_invoker = true) AS
SELECT * FROM public.resources WHERE deleted_at IS NULL;

-- ④ Fonction de soft-delete
CREATE OR REPLACE FUNCTION public.soft_delete(p_table text, p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  EXECUTE format('UPDATE %I SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL', p_table)
  USING p_id;
END;
$$;

-- ⑤ Nettoyage automatique après 90 jours (pg_cron)
-- SELECT cron.schedule('purge-deleted', '0 2 * * *', $$
--   DELETE FROM public.resources WHERE deleted_at < now() - interval '90 days'
-- $$);
```

---

## 3. JSONB Avancé

```sql
-- Métadonnées flexibles avec validation
CREATE TABLE public.form_submissions (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id     uuid    NOT NULL REFERENCES public.forms(id),
  data        jsonb   NOT NULL DEFAULT '{}',
  submitted_at timestamptz NOT NULL DEFAULT now(),

  -- Validation du schéma JSONB
  CONSTRAINT chk_submission_has_version CHECK (data ? 'form_version'),
  CONSTRAINT chk_submission_data_object CHECK (jsonb_typeof(data) = 'object')
);

-- Index GIN pour requêtes sur les valeurs JSONB
CREATE INDEX idx_form_submissions_data ON public.form_submissions USING GIN(data);

-- Index sur un champ JSONB spécifique (plus efficace que GIN complet)
CREATE INDEX idx_form_submissions_status
  ON public.form_submissions ((data->>'status'));

-- Requêtes JSONB typiques
-- Chercher par valeur d'un champ :
SELECT * FROM public.form_submissions WHERE data->>'status' = 'approved';

-- Chercher dans un tableau JSONB :
SELECT * FROM public.form_submissions WHERE data->'tags' ? 'urgent';

-- Agrégation :
SELECT data->>'category' as category, COUNT(*)
FROM public.form_submissions
GROUP BY data->>'category';
```

---

## 4. Full-Text Search

```sql
-- Colonne générée pour la recherche (PostgreSQL 12+)
CREATE TABLE public.knowledge_base (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text    NOT NULL,
  content     text,
  tags        text[],
  org_id      uuid    NOT NULL REFERENCES public.organizations(id),

  -- Colonne tsvector générée (mise à jour automatique)
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(content, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(array_to_string(tags, ' '), '')), 'C')
  ) STORED
);

-- Index GIN sur le vecteur
CREATE INDEX idx_kb_search ON public.knowledge_base USING GIN(search_vector);

-- Requête de recherche
SELECT id, title,
  ts_rank(search_vector, query) AS rank,
  ts_headline('french', content, query, 'MaxWords=30, MinWords=15') AS excerpt
FROM public.knowledge_base,
     plainto_tsquery('french', 'votre recherche') query
WHERE search_vector @@ query
  AND org_id = $1
ORDER BY rank DESC
LIMIT 20;
```

---

## 5. Hiérarchies et arbres

```sql
-- Pattern ltree pour hiérarchies (catégories, organigrammes, etc.)
CREATE EXTENSION IF NOT EXISTS ltree;

CREATE TABLE public.categories (
  id      uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  path    ltree   NOT NULL,  -- ex: 'root.electronics.phones'
  name    text    NOT NULL,
  org_id  uuid    NOT NULL REFERENCES public.organizations(id)
);

CREATE INDEX idx_categories_path ON public.categories USING GIST(path);
CREATE INDEX idx_categories_org  ON public.categories(org_id);

-- Requêtes ltree
-- Tous les enfants d'une catégorie :
SELECT * FROM public.categories WHERE path <@ 'root.electronics';
-- Ancêtres directs :
SELECT * FROM public.categories WHERE path @> 'root.electronics.phones.iphone';
```

---

## 6. Versionning de données

```sql
-- Table d'historique des versions
CREATE TABLE public.document_versions (
  id          bigserial   PRIMARY KEY,
  document_id uuid        NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version     int         NOT NULL,
  content     jsonb       NOT NULL,
  changed_by  uuid        REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),

  UNIQUE (document_id, version)
);

-- Trigger de versionning automatique
CREATE OR REPLACE FUNCTION public.version_document()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_next_version int;
BEGIN
  SELECT COALESCE(MAX(version), 0) + 1
  INTO v_next_version
  FROM public.document_versions
  WHERE document_id = NEW.id;

  INSERT INTO public.document_versions(document_id, version, content, changed_by)
  VALUES (NEW.id, v_next_version, to_jsonb(NEW), auth.uid());

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_document_versioning
  AFTER UPDATE ON public.documents
  FOR EACH ROW
  WHEN (OLD.content IS DISTINCT FROM NEW.content)
  EXECUTE FUNCTION public.version_document();
```

---

## 7. Tables de statuts et workflows

```sql
-- Table de référence des transitions autorisées
CREATE TABLE public.status_transitions (
  entity_type   text  NOT NULL,
  from_status   text  NOT NULL,
  to_status     text  NOT NULL,
  min_role      text  NOT NULL DEFAULT 'member',
  PRIMARY KEY (entity_type, from_status, to_status)
);

INSERT INTO public.status_transitions VALUES
  ('work_order', 'draft',     'submitted', 'member'),
  ('work_order', 'submitted', 'approved',  'admin'),
  ('work_order', 'submitted', 'rejected',  'admin'),
  ('work_order', 'approved',  'closed',    'member'),
  ('work_order', 'rejected',  'draft',     'member');

-- Fonction de transition validée
CREATE OR REPLACE FUNCTION public.transition_status(
  p_table text,
  p_id uuid,
  p_new_status text,
  p_org_id uuid
) RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_current_status text;
  v_min_role text;
BEGIN
  EXECUTE format('SELECT status FROM %I WHERE id = $1', p_table)
  INTO v_current_status USING p_id;

  SELECT min_role INTO v_min_role
  FROM public.status_transitions
  WHERE entity_type = p_table
    AND from_status = v_current_status
    AND to_status = p_new_status;

  IF v_min_role IS NULL THEN
    RAISE EXCEPTION 'Transition % → % non autorisée pour %', v_current_status, p_new_status, p_table;
  END IF;

  IF NOT public.has_min_role(p_org_id, v_min_role) THEN
    RAISE EXCEPTION 'Rôle insuffisant pour cette transition';
  END IF;

  EXECUTE format('UPDATE %I SET status = $1, updated_at = now() WHERE id = $2', p_table)
  USING p_new_status, p_id;
END;
$$;
```
