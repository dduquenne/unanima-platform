-- Migration 008: handle_new_user trigger + INSERT policy on profiles
--
-- Cause : GoTrue (Supabase Auth) lève "Database error querying schema"
-- lorsqu'un Auth Hook ou un trigger référence public.handle_new_user()
-- mais que cette fonction n'existe pas dans le schéma.
-- Sans trigger, les utilisateurs créés dans auth.users n'ont aucune
-- entrée dans public.profiles, ce qui bloque l'authentification.
--
-- Corrections :
--   1. Fonction handle_new_user() SECURITY DEFINER
--   2. Trigger AFTER INSERT ON auth.users
--   3. Politique INSERT sur profiles (utilisateur crée son propre profil)
--   4. Valeur par défaut pour full_name (contourne la contrainte NOT NULL
--      lors de la création automatique — le profil est complété ensuite)

-- ============================================================
-- 1. Fonction de création automatique du profil
-- SECURITY DEFINER : s'exécute avec les droits du propriétaire
-- de la fonction (postgres), pas ceux de l'appelant (GoTrue).
-- Cela contourne RLS pour l'insertion initiale du profil.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'beneficiaire')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. Trigger sur auth.users — se déclenche à chaque inscription
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. Politique INSERT : un utilisateur authentifié peut créer
-- son propre profil (nécessaire pour les inscriptions manuelles
-- et les flux où le profil n'est pas créé via le trigger)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'profiles_insert_own'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "profiles_insert_own"
        ON public.profiles FOR INSERT
        WITH CHECK (id = auth.uid())
    $policy$;
  END IF;
END;
$$;
