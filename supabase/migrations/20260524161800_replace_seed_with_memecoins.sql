-- Replace BTC/SOL/ETH seed calls with memecoin calls
DELETE FROM public.trading_calls WHERE created_by IS NULL;

INSERT INTO public.trading_calls (pair, direction, leverage, entry_price, target_price, stop_loss, status, pnl_percent, notes) VALUES
('PEPE/USDT',  'LONG',  '20x', 0.00001142, 0.00001600, 0.00000980, 'ACTIVE',     NULL,   'Breakout above 30D range. Volume spike confirmed on 1H.'),
('WIF/USDT',   'LONG',  '10x', 2.84,        3.60,        2.50,        'TARGET_HIT', 26.76,  'TP1 hit. Trailed remainder to TP2. Clean momentum play.'),
('BONK/USDT',  'SHORT', '10x', 0.00003540,  0.00002800,  0.00003750,  'ACTIVE',     NULL,   'Bearish divergence on 4H. Fading the pump into resistance.'),
('FLOKI/USDT', 'LONG',  '5x',  0.000184,    0.000240,    0.000160,    'ACTIVE',     NULL,   'Weekly support reclaim. Watching for continuation.'),
('MEME/USDT',  'LONG',  '10x', 0.03420,     0.04500,     0.03100,     'PENDING',    NULL,   'Waiting for retest of breakout level before entry.'),
('POPCAT/USDT','SHORT', '5x',  0.8240,      0.6500,      0.8900,      'STOPPED',   -5.80,  'Invalidated by sudden volume spike. Stopped out at plan.');
