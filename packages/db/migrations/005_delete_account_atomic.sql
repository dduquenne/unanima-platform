-- Atomic account deletion function
-- Wraps all delete operations in a single transaction
-- Called via supabase.rpc('delete_user_account', { target_user_id, additional_tables })

CREATE OR REPLACE FUNCTION public.delete_user_account(
  target_user_id UUID,
  additional_tables TEXT[] DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tbl TEXT;
  allowed_pattern TEXT := '^[a-z][a-z0-9_]{0,62}$';
BEGIN
  -- Validate all table names
  FOREACH tbl IN ARRAY additional_tables
  LOOP
    IF tbl !~ allowed_pattern THEN
      RAISE EXCEPTION 'Invalid table name: %', tbl;
    END IF;
  END LOOP;

  -- Log deletion request before deleting data
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    target_user_id,
    'rgpd_delete_executed',
    'profiles',
    target_user_id::TEXT,
    jsonb_build_object('tables', additional_tables, 'timestamp', now())
  );

  -- Delete from additional tables
  FOREACH tbl IN ARRAY additional_tables
  LOOP
    EXECUTE format('DELETE FROM public.%I WHERE user_id = $1', tbl)
    USING target_user_id;
  END LOOP;

  -- Delete audit logs
  DELETE FROM public.audit_logs WHERE user_id = target_user_id;

  -- Delete profile
  DELETE FROM public.profiles WHERE id = target_user_id;

  RETURN jsonb_build_object('success', true, 'user_id', target_user_id);
END;
$$;

-- Only service_role can call this function
REVOKE ALL ON FUNCTION public.delete_user_account FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_user_account FROM anon;
REVOKE ALL ON FUNCTION public.delete_user_account FROM authenticated;
