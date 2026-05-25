-- Add memecoin gem call fields to trading_calls
ALTER TABLE public.trading_calls
  ADD COLUMN IF NOT EXISTS market_cap TEXT,
  ADD COLUMN IF NOT EXISTS potential TEXT,
  ADD COLUMN IF NOT EXISTS entry_zone TEXT,
  ADD COLUMN IF NOT EXISTS caller TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS twitter TEXT,
  ADD COLUMN IF NOT EXISTS telegram TEXT,
  ADD COLUMN IF NOT EXISTS narrative TEXT,
  ADD COLUMN IF NOT EXISTS bullish_reasons TEXT[],
  ADD COLUMN IF NOT EXISTS strategy TEXT,
  ADD COLUMN IF NOT EXISTS holders TEXT,
  ADD COLUMN IF NOT EXISTS liquidity TEXT,
  ADD COLUMN IF NOT EXISTS volume_24h TEXT,
  ADD COLUMN IF NOT EXISTS ath TEXT,
  ADD COLUMN IF NOT EXISTS risk_level TEXT;

-- Re-seed with memecoin gem calls using new format
DELETE FROM public.trading_calls WHERE created_by IS NULL;

INSERT INTO public.trading_calls (pair, direction, status, entry_price, market_cap, potential, entry_zone, caller, website, twitter, telegram, narrative, bullish_reasons, strategy, holders, liquidity, volume_24h, ath, risk_level, notes) VALUES
(
  'PEPE/USDT', 'LONG', 'ACTIVE', 0.00001142,
  '$420M', '5-10x',
  '0.0000110 – 0.0000120',
  'CrypGuyKy',
  'https://pepe.vip', 'https://x.com/pepecoineth', 'https://t.me/pepecoin',
  'OG memecoin with the strongest brand recognition outside DOGE. Cycle rotation into memes is early.',
  ARRAY['Top 5 memecoin by market cap', 'CEX listings still incoming', 'Community-driven with no team tokens', 'Historically outperforms in bull runs'],
  'Scale in across entry zone. Take 50% at 2x, let rest ride with trailing stop.',
  '180,000+', '$12M', '$280M', '0.00001716',
  'HIGH',
  NULL
),
(
  'WIF/USDT', 'LONG', 'TARGET_HIT', 2.84,
  '$2.8B', '3-5x',
  '2.70 – 2.90',
  'CrypGuyKy',
  'https://dogwifcoin.org', 'https://x.com/dogwifcoin', 'https://t.me/dogwifhat',
  'Solana''s flagship memecoin. Institutional interest growing. Coinbase listing catalyst played out.',
  ARRAY['Coinbase listing confirmed', 'Solana ecosystem tailwind', 'Strong holder base', 'Vegas sphere campaign'],
  'TP1 hit at 3.60. Trailed remainder to TP2. Closed full position.',
  '95,000+', '$45M', '$620M', '4.83',
  'MEDIUM',
  'TP1 hit clean. Trailing remainder to TP2.'
),
(
  'BONK/USDT', 'LONG', 'ACTIVE', 0.00003540,
  '$2.1B', '3-4x',
  '0.0000340 – 0.0000370',
  'CrypGuyKy',
  'https://bonkcoin.com', 'https://x.com/bonk_inu', 'https://t.me/bonkcoincommunity',
  'Solana''s community memecoin. Deeply integrated into the Solana DeFi ecosystem with real utility.',
  ARRAY['Native Solana memecoin with DeFi integrations', 'BONK burn mechanism active', 'Listed on all major CEXs', 'Solana season incoming'],
  'DCA into entry zone. First target at 0.000050, second at ATH retest.',
  '800,000+', '$38M', '$410M', '0.00005891',
  'MEDIUM',
  NULL
),
(
  'FLOKI/USDT', 'LONG', 'PENDING', 0.000184,
  '$1.7B', '4-8x',
  '0.000175 – 0.000190',
  'CrypGuyKy',
  'https://floki.com', 'https://x.com/RealFlokiInu', 'https://t.me/flokiinuofficial',
  'Floki has evolved beyond a memecoin — Valhalla metaverse, FlokiFi DeFi suite, and aggressive global marketing.',
  ARRAY['Real utility: metaverse + DeFi', 'Massive marketing budget', 'Token burn ongoing', 'EU billboard campaigns running'],
  'Waiting for retest of breakout level. Entry on confirmation only.',
  '430,000+', '$22M', '$95M', '0.000340',
  'MEDIUM',
  'Waiting for retest entry.'
),
(
  'POPCAT/USDT', 'LONG', 'ACTIVE', 0.8240,
  '$820M', '3-5x',
  '0.80 – 0.86',
  'CrypGuyKy',
  NULL, 'https://x.com/popcatsolana', 'https://t.me/popcatsolana',
  'Pure culture play on Solana. No utility, no roadmap — just vibes and the strongest meme format of the cycle.',
  ARRAY['Top Solana memecoin by mindshare', 'Binance listed', 'Low float relative to peers', 'Cat meta still strong'],
  'Spot only. Buy zone, target ATH retest. No leverage on pure meme plays.',
  '65,000+', '$8M', '$180M', '1.98',
  'HIGH',
  NULL
);
