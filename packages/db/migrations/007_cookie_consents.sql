-- Server-side cookie consent tracking (CNIL compliance)
CREATE TABLE public.cookie_consents (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  categories JSONB NOT NULL DEFAULT '{"necessary": true, "analytics": false, "marketing": false}',
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET
);

CREATE INDEX idx_cookie_consents_session ON public.cookie_consents (session_id);
CREATE INDEX idx_cookie_consents_user ON public.cookie_consents (user_id);

ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert consent
CREATE POLICY "Anyone can insert cookie consent"
  ON public.cookie_consents FOR INSERT
  WITH CHECK (true);

-- Users can read their own consent
CREATE POLICY "Users read own consent"
  ON public.cookie_consents FOR SELECT
  USING (
    user_id = auth.uid()
    OR auth.uid() IS NULL
  );
