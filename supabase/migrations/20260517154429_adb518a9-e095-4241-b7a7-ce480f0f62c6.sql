
DROP POLICY "Anyone can subscribe" ON public.subscribers;
CREATE POLICY "Anyone can subscribe" ON public.subscribers FOR INSERT
  WITH CHECK (email IS NOT NULL AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND length(email) <= 255);
