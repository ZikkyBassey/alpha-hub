ALTER TABLE public.trading_calls
  ADD COLUMN IF NOT EXISTS contract_address TEXT;
