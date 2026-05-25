import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { statusStyle, fmtNum, fmtSigned, type TradingCall, type Trader } from "@/lib/calls";
import { fetchLivePrice } from "@/lib/dex";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "CrypGuyKy — Memecoin Alpha. Real Calls. Real PnL." },
      { name: "description", content: "Live Solana memecoin calls, verified PnL, and transparent results from CrypGuyKy." },
    ],
  }),
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteHeader />
      <Hero />
      <StatsBar />
      <LiveCallsSection />
      <LeaderboardSection />
      <SubscribeCta />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[88vh] flex items-center py-20 px-4 sm:px-6 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 grid-bg opacity-100 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
      {/* Ambient orb */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] glow-orb pointer-events-none opacity-60" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] glow-orb pointer-events-none opacity-30" />

      <div className="max-w-7xl mx-auto relative w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/25 bg-primary/5 mb-8 animate-reveal">
            <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" />
            <span className="font-mono text-[10px] text-primary uppercase tracking-[0.25em] font-bold">Live Signals Active</span>
          </div>

          {/* Headline */}
          <h1
            className="font-black uppercase tracking-tighter leading-[0.85] mb-6 animate-reveal"
            style={{ animationDelay: "80ms", fontSize: "clamp(2.8rem, 8vw, 6rem)" }}
          >
            Solana Meme<br />
            <span className="shimmer-text">Alpha Calls.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed animate-reveal" style={{ animationDelay: "160ms" }}>
            High-conviction memecoin signals with verified entries, live PnL tracking, and zero fluff.
          </p>

          <div className="flex flex-wrap gap-3 animate-reveal" style={{ animationDelay: "240ms" }}>
            <Link
              to="/calls"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground font-black uppercase tracking-[0.12em] text-xs hover:brightness-110 transition-all"
            >
              View All Calls
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-border/80 font-bold uppercase tracking-[0.12em] text-xs hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const { data: calls } = useQuery({
    queryKey: ["calls-stats"],
    queryFn: async () => {
      const { data } = await supabase.from("trading_calls").select("status,pnl_percent");
      return data ?? [];
    },
  });

  const total = calls?.length ?? 0;
  const closed = calls?.filter(c => c.pnl_percent !== null) ?? [];
  const wins = closed.filter(c => (c.pnl_percent ?? 0) > 0).length;
  const winRate = closed.length ? (wins / closed.length) * 100 : 0;
  const avgRoi = closed.length ? closed.reduce((s, c) => s + Number(c.pnl_percent ?? 0), 0) / closed.length : 0;
  const active = calls?.filter(c => c.status === "ACTIVE").length ?? 0;

  return (
    <section className="border-y border-border/60 bg-surface/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border/40">
          <StatCell label="Win Rate" value={`${winRate.toFixed(1)}%`} accent />
          <StatCell label="Avg ROI" value={fmtSigned(avgRoi)} accent />
          <StatCell label="Total Calls" value={`${total}`} />
          <StatCell label="Active Now" value={`${active}`} live />
        </div>
      </div>
    </section>
  );
}

function StatCell({ label, value, accent, live }: { label: string; value: string; accent?: boolean; live?: boolean }) {
  return (
    <div className="px-6 py-8 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {live && <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" />}
        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      </div>
      <p className={`text-3xl sm:text-4xl font-black tracking-tight ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function LiveCallsSection() {
  const { data: calls, isLoading } = useQuery({
    queryKey: ["calls", "recent"],
    queryFn: async () => {
      const { data } = await supabase
        .from("trading_calls")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      return (data ?? []) as TradingCall[];
    },
  });

  return (
    <section className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
          <div>
            <p className="font-mono text-[9px] text-primary uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
              <span className="size-1 rounded-full bg-primary" />
              Live feed
            </p>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">Active Calls</h2>
          </div>
          <Link to="/calls" className="group inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            All signals
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-surface border border-border/60 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calls?.map((c, i) => <CallCard key={c.id} call={c} delay={i * 60} />)}
          </div>
        )}
      </div>
    </section>
  );
}

export function CallCard({ call, delay = 0 }: { call: TradingCall; delay?: number }) {
  const [livePrice, setLivePrice] = useState<number | null>(null);

  useEffect(() => {
    if (!call.contract_address || call.status !== "ACTIVE") return;
    let cancelled = false;
    const load = async () => {
      const p = await fetchLivePrice(call.contract_address!);
      if (!cancelled) setLivePrice(p);
    };
    load();
    const id = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [call.contract_address, call.status]);

  const livePnl = livePrice && call.entry_price
    ? ((livePrice - Number(call.entry_price)) / Number(call.entry_price)) * 100
    : null;

  const displayPnl = livePnl ?? (call.pnl_percent !== null ? Number(call.pnl_percent) : null);
  const isLive = livePnl !== null;
  const pnlPositive = displayPnl !== null && displayPnl >= 0;

  const riskColor =
    call.risk_level === "LOW" ? "text-primary border-primary/25 bg-primary/5" :
    call.risk_level === "MEDIUM" ? "text-yellow-400 border-yellow-400/25 bg-yellow-400/5" :
    "text-bear border-bear/25 bg-bear/5";

  return (
    <div
      className="group relative bg-surface border border-border/60 hover:border-primary/30 transition-all duration-300 flex flex-col card-gold-top overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border/40 flex items-start justify-between gap-3 relative">
        <div className="min-w-0">
          <p className="text-base font-black tracking-tight truncate mb-0.5">💎 {call.pair}</p>
          <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
            {call.caller ? `by ${call.caller}` : "Solana"}
          </p>
        </div>
        <span className={`shrink-0 px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-wider border ${statusStyle(call.status)}`}>
          {call.status.replace("_", " ")}
        </span>
      </div>

      {/* PnL hero */}
      {displayPnl !== null && (
        <div className={`mx-5 mt-4 flex items-center justify-between px-4 py-3 border ${pnlPositive ? "border-primary/20 bg-primary/5" : "border-bear/20 bg-bear/5"}`}>
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            {isLive && <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" />}
            {isLive ? "Live PnL" : "PnL"}
          </span>
          <span className={`font-black text-xl tracking-tight ${pnlPositive ? "text-primary" : "text-bear"}`}>
            {fmtSigned(displayPnl)}
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="px-5 py-4 flex-1 grid grid-cols-2 gap-x-4 gap-y-3.5">
        {call.market_cap && <Stat label="Mkt Cap" value={call.market_cap} />}
        {call.potential && <Stat label="Target" value={call.potential} accent />}
        {call.entry_zone && <Stat label="Entry Zone" value={call.entry_zone} />}
        {isLive && livePrice && <Stat label="Live Price" value={fmtNum(livePrice)} accent />}
        {call.liquidity && <Stat label="Liquidity" value={call.liquidity} />}
        {call.volume_24h && <Stat label="Vol 24h" value={call.volume_24h} />}
        {call.ath && <Stat label="ATH" value={call.ath} />}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 flex items-center justify-between">
        {call.risk_level ? (
          <span className={`px-2.5 py-1 border text-[9px] font-mono font-bold uppercase tracking-widest ${riskColor}`}>
            {call.risk_level} RISK
          </span>
        ) : <span />}
        <span className="font-mono text-[8px] text-muted-foreground/30 uppercase tracking-widest">NFA</span>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground/70 mb-0.5">{label}</p>
      <p className={`text-xs font-bold leading-tight ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function LeaderboardSection() {
  const { data: traders } = useQuery({
    queryKey: ["traders", "top"],
    queryFn: async () => {
      const { data } = await supabase
        .from("traders")
        .select("*")
        .order("rank", { ascending: true, nullsFirst: false })
        .limit(5);
      return (data ?? []) as Trader[];
    },
  });

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <section className="py-20 px-4 sm:px-6 border-t border-border/60 bg-surface/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
          <div>
            <p className="font-mono text-[9px] text-primary uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
              <span className="size-1 rounded-full bg-primary" />
              Rankings
            </p>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">PnL Leaderboard</h2>
          </div>
          <Link to="/leaderboard" className="group inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            Full rankings
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="border border-border/60 bg-surface overflow-hidden">
          <table className="w-full text-left">
            <thead className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest border-b border-border/60 bg-background/60">
              <tr>
                <th className="px-5 py-3.5 w-16">#</th>
                <th className="px-5 py-3.5">Trader</th>
                <th className="px-5 py-3.5 text-right">Win Rate</th>
                <th className="px-5 py-3.5 text-right hidden sm:table-cell">Net PnL</th>
                <th className="px-5 py-3.5 text-right">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {traders?.map((t) => (
                <tr key={t.id} className="hover:bg-primary/[0.03] transition-colors group">
                  <td className="px-5 py-4 font-mono font-bold text-sm">
                    {t.rank && t.rank <= 3
                      ? <span className="text-base">{medals[(t.rank ?? 1) - 1]}</span>
                      : <span className="text-muted-foreground">{String(t.rank ?? "—").padStart(2, "0")}</span>
                    }
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 bg-background border border-border/60 grid place-items-center font-mono text-[10px] text-primary font-bold shrink-0 group-hover:border-primary/40 transition-colors">
                        {t.handle.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm uppercase tracking-wide">{t.handle}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-sm text-muted-foreground">{Number(t.win_rate).toFixed(1)}%</td>
                  <td className="px-5 py-4 text-right font-mono text-sm text-primary hidden sm:table-cell">
                    +${Number(t.total_pnl).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-sm text-primary font-black">{fmtSigned(t.roi_percent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function SubscribeCta() {
  const [email, setEmail] = useState("");
  const m = useMutation({
    mutationFn: async (e: string) => {
      const { error } = await supabase.from("subscribers").insert({ email: e });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("You're on the list."); setEmail(""); },
    onError: (e: Error) => { toast.error(e.message.includes("duplicate") ? "Already subscribed." : e.message); },
  });

  return (
    <section className="py-24 px-4 sm:px-6 border-t border-border/60 relative overflow-hidden">
      <div className="absolute inset-0 glow-orb opacity-40 pointer-events-none" />
      <div className="max-w-xl mx-auto text-center relative">
        <p className="font-mono text-[9px] text-primary uppercase tracking-[0.3em] mb-5 flex items-center justify-center gap-2">
          <span className="size-1 rounded-full bg-primary" />
          Alerts
        </p>
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-4">
          Get Every Call <span className="text-primary">First.</span>
        </h2>
        <p className="text-muted-foreground text-sm mb-10 leading-relaxed">
          Signal alerts straight to your inbox before the move.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); if (email) m.mutate(email); }}
          className="flex gap-0 border border-border/60 focus-within:border-primary/50 transition-colors"
        >
          <input
            type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-transparent px-4 py-3.5 font-mono text-sm focus:outline-none placeholder:text-muted-foreground/40 min-w-0"
          />
          <button
            type="submit" disabled={m.isPending}
            className="px-6 py-3.5 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:brightness-110 disabled:opacity-50 shrink-0 transition-all"
          >
            {m.isPending ? "…" : "Join"}
          </button>
        </form>
        <p className="mt-4 text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">
          No spam. Not financial advice.
        </p>
      </div>
    </section>
  );
}
