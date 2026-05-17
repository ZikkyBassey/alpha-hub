
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles)) $$;

CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trading calls
CREATE TABLE public.trading_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('LONG','SHORT')),
  leverage TEXT,
  entry_price NUMERIC NOT NULL,
  target_price NUMERIC,
  stop_loss NUMERIC,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','TARGET_HIT','STOPPED','PENDING','CLOSED')),
  pnl_percent NUMERIC,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trading_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Calls viewable by all" ON public.trading_calls FOR SELECT USING (true);
CREATE POLICY "Editors manage calls" ON public.trading_calls FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin','editor']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','editor']::app_role[]));

-- Traders (leaderboard)
CREATE TABLE public.traders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL,
  avatar_url TEXT,
  win_rate NUMERIC NOT NULL DEFAULT 0,
  roi_percent NUMERIC NOT NULL DEFAULT 0,
  total_pnl NUMERIC NOT NULL DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.traders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Traders viewable by all" ON public.traders FOR SELECT USING (true);
CREATE POLICY "Editors manage traders" ON public.traders FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin','editor']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','editor']::app_role[]));

-- Announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Announcements viewable by all" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Editors manage announcements" ON public.announcements FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin','editor']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','editor']::app_role[]));

-- Subscribers
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view subscribers" ON public.subscribers FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete subscribers" ON public.subscribers FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_calls_updated BEFORE UPDATE ON public.trading_calls FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_traders_updated BEFORE UPDATE ON public.traders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed data
INSERT INTO public.trading_calls (pair, direction, leverage, entry_price, target_price, stop_loss, status, pnl_percent, notes) VALUES
('BTC/USDT','LONG','20x',68420.50,72000.00,67100.00,'ACTIVE',NULL,'Breakout above prior range high. Volume confirmation.'),
('SOL/USDT','LONG','10x',142.15,168.00,134.10,'TARGET_HIT',18.21,'TP1 hit clean. Trailing remainder.'),
('ETH/USDT','SHORT','15x',3540.20,3200.00,3610.00,'ACTIVE',NULL,'Bearish divergence on 4H. Risk-defined short.'),
('AVAX/USDT','LONG','5x',38.40,46.00,35.10,'ACTIVE',NULL,'Reclaim of weekly support.'),
('DOGE/USDT','LONG','10x',0.142,0.180,0.128,'PENDING',NULL,'Waiting for retest entry.'),
('LINK/USDT','SHORT','5x',22.40,19.50,23.80,'STOPPED',-6.25,'Invalidated by news catalyst.');

INSERT INTO public.traders (handle, win_rate, roi_percent, total_pnl, rank) VALUES
('KyTerminal_01', 92.4, 4284.0, 412094, 1),
('AlphaViper', 88.1, 3110.2, 289210, 2),
('Liquid_Ghost', 84.5, 2840.4, 192445, 3),
('VoidScalp', 76.4, 1180.0, 89210, 4),
('EtherMaxi', 74.2, 890.0, 62445, 5);

INSERT INTO public.announcements (title, body) VALUES
('Q2 Performance Update', 'The desk closed Q2 with a verified ROI of 1,420%. Onboarding for the elite cohort is now open.'),
('New Pair Coverage', 'We now cover the top 50 perp markets including new launches within 24h of listing.');
