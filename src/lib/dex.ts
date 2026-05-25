export interface DexTokenInfo {
  name: string;
  symbol: string;
  price: number;
  marketCap: string;
  liquidity: string;
  volume24h: string;
  holders: string | null;
  pairAddress: string;
  url: string;
}

export async function fetchDexInfo(ca: string): Promise<DexTokenInfo | null> {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ca}`);
    const json = await res.json();
    const pairs: any[] = json.pairs ?? [];
    if (!pairs.length) return null;

    // Pick the Solana pair with highest liquidity
    const sol = pairs
      .filter((p: any) => p.chainId === "solana")
      .sort((a: any, b: any) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0));
    const p = sol[0] ?? pairs[0];

    const fmt = (n: number) =>
      n >= 1_000_000_000 ? `$${(n / 1_000_000_000).toFixed(2)}B`
      : n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M`
      : n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K`
      : `$${n.toFixed(2)}`;

    return {
      name: p.baseToken?.name ?? "",
      symbol: p.baseToken?.symbol ?? "",
      price: Number(p.priceUsd ?? 0),
      marketCap: p.marketCap ? fmt(p.marketCap) : p.fdv ? fmt(p.fdv) : "—",
      liquidity: p.liquidity?.usd ? fmt(p.liquidity.usd) : "—",
      volume24h: p.volume?.h24 ? fmt(p.volume.h24) : "—",
      holders: null, // DexScreener doesn't provide holders; left for manual entry
      pairAddress: p.pairAddress ?? "",
      url: p.url ?? `https://dexscreener.com/solana/${ca}`,
    };
  } catch {
    return null;
  }
}

export async function fetchLivePrice(ca: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ca}`);
    const json = await res.json();
    const pairs: any[] = json.pairs ?? [];
    if (!pairs.length) return null;
    const sol = pairs
      .filter((p: any) => p.chainId === "solana")
      .sort((a: any, b: any) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0));
    const p = sol[0] ?? pairs[0];
    return Number(p.priceUsd ?? 0) || null;
  } catch {
    return null;
  }
}
