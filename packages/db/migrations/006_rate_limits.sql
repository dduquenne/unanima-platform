-- Rate limiting table for serverless environments
CREATE TABLE public.rate_limits (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count INTEGER NOT NULL DEFAULT 1,
  UNIQUE (key)
);

CREATE INDEX idx_rate_limits_key ON public.rate_limits (key);
CREATE INDEX idx_rate_limits_window ON public.rate_limits (window_start);

-- RLS: only service_role can access
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Cleanup function for expired entries
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  rate_key TEXT,
  max_requests INTEGER,
  window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  window_start_time TIMESTAMPTZ;
BEGIN
  window_start_time := now() - (window_seconds || ' seconds')::INTERVAL;

  -- Clean up expired entry if exists
  DELETE FROM public.rate_limits
  WHERE key = rate_key AND window_start < window_start_time;

  -- Try to increment existing counter
  UPDATE public.rate_limits
  SET request_count = request_count + 1
  WHERE key = rate_key AND window_start >= window_start_time
  RETURNING request_count INTO current_count;

  -- If no row was updated, insert a new one
  IF current_count IS NULL THEN
    INSERT INTO public.rate_limits (key, window_start, request_count)
    VALUES (rate_key, now(), 1)
    ON CONFLICT (key) DO UPDATE
    SET request_count = rate_limits.request_count + 1
    RETURNING request_count INTO current_count;
  END IF;

  -- Return true if within limit
  RETURN current_count <= max_requests;
END;
$$;
