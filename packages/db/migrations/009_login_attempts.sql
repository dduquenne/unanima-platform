-- Login attempt tracking: check + reset functions
-- Reuses the existing rate_limits table for storage

-- check_login_attempt: returns attempt info instead of just boolean
CREATE OR REPLACE FUNCTION public.check_login_attempt(
  attempt_email TEXT,
  max_attempts INTEGER DEFAULT 3,
  lockout_seconds INTEGER DEFAULT 900
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  lock_start TIMESTAMPTZ;
  rate_key TEXT;
  window_start_time TIMESTAMPTZ;
BEGIN
  rate_key := 'login:' || attempt_email;
  window_start_time := now() - (lockout_seconds || ' seconds')::INTERVAL;

  -- Clean up expired entry
  DELETE FROM public.rate_limits
  WHERE key = rate_key AND window_start < window_start_time;

  -- Check current state WITHOUT incrementing
  SELECT request_count, window_start INTO current_count, lock_start
  FROM public.rate_limits
  WHERE key = rate_key AND window_start >= window_start_time;

  -- If already at max, return locked
  IF current_count IS NOT NULL AND current_count >= max_attempts THEN
    RETURN jsonb_build_object(
      'locked', true,
      'attempts_remaining', 0,
      'locked_until', lock_start + (lockout_seconds || ' seconds')::INTERVAL
    );
  END IF;

  RETURN jsonb_build_object(
    'locked', false,
    'attempts_remaining', max_attempts - COALESCE(current_count, 0),
    'locked_until', null
  );
END;
$$;

-- increment_login_failure: called after a failed login attempt
CREATE OR REPLACE FUNCTION public.increment_login_failure(
  attempt_email TEXT,
  lockout_seconds INTEGER DEFAULT 900
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  rate_key TEXT;
  window_start_time TIMESTAMPTZ;
BEGIN
  rate_key := 'login:' || attempt_email;
  window_start_time := now() - (lockout_seconds || ' seconds')::INTERVAL;

  -- Clean up expired entry
  DELETE FROM public.rate_limits
  WHERE key = rate_key AND window_start < window_start_time;

  -- Try to increment existing counter
  UPDATE public.rate_limits
  SET request_count = request_count + 1
  WHERE key = rate_key AND window_start >= window_start_time
  RETURNING request_count INTO current_count;

  -- If no row updated, insert new one
  IF current_count IS NULL THEN
    INSERT INTO public.rate_limits (key, window_start, request_count)
    VALUES (rate_key, now(), 1)
    ON CONFLICT (key) DO UPDATE
    SET request_count = rate_limits.request_count + 1,
        window_start = CASE
          WHEN rate_limits.window_start < (now() - (lockout_seconds || ' seconds')::INTERVAL)
          THEN now()
          ELSE rate_limits.window_start
        END
    RETURNING request_count INTO current_count;
  END IF;

  RETURN jsonb_build_object(
    'count', current_count,
    'locked', current_count >= 3
  );
END;
$$;

-- reset_login_attempts: called after successful login
CREATE OR REPLACE FUNCTION public.reset_login_attempts(
  attempt_email TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE key = 'login:' || attempt_email;
END;
$$;
