import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { statusStyle, fmtNum, fmtSigned, type TradingCall, type Trader } from "@/lib/calls";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "CrypGuyKy — Real Alpha. Real Trades. Real PnL." },
      { name: "description", content: "Live crypto trading calls, verified PnL leaderboard, and transparent desk performance from CrypGuyKy." },
    ],
  }),
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* CRT scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-[0.04]">
        <div className="w-full h-32 bg-primary animate-scanline" />
      </div>

      <SiteHeader />
      <Hero />
      <StatsBar />
      <LiveCallsSection />
      <LeaderboardSection />
      <AboutSection />
      <SubscribeCta />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative py-24 lg:py-32 px-6 border-b border-border overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <div className="animate-reveal max-w-4xl">
          <div className="font-mono text-primary text-xs mb-6 uppercase tracking-[0.3em] flex items-center gap-3">
            <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" />
            System Status: Bullish
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
            Real Alpha.<br />
            Real Trades.<br />
            <span className="text-primary text-glow">Real PnL.</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mb-12 text-pretty">
            The institutional-grade terminal for high-conviction crypto signals. Verified entries, transparent results, and a leaderboard that doesn't lie.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <Link to="/calls" className="px-8 py-4 bg-primary text-primary-foreground font-black uppercase tracking-[0.15em] text-xs hover:scale-[1.02] transition-transform">
              View Live Signals
            </Link>
            <Link to="/leaderboard" className="px-8 py-4 bg-surface border border-border font-bold uppercase tracking-[0.15em] text-xs hover:border-primary transition-colors">
              See the Leaderboard
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
    <section className="border-b border-border bg-surface/30">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
        <Stat label="Win Rate" value={`${winRate.toFixed(1)}%`} accent />
        <Stat label="Avg Closed ROI" value={fmtSigned(avgRoi)} accent />
        <Stat label="Total Signals" value={`${total}`} />
        <Stat label="Active Now" value={`${active}`} />
      </div>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <p className={`text-4xl font-black tracking-tight ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
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
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter">Live Trading Feed</h2>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-2">Real-time signals from the desk</p>
          </div>
          <Link to="/calls" className="text-xs font-mono uppercase tracking-widest text-primary hover:underline">
            View all signals →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-surface border border-border animate-pulse" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calls?.map((c, i) => <CallCard key={c.id} call={c} delay={i * 80} />)}
          </div>
        )}
      </div>
    </section>
  );
}

export function CallCard({ call, delay = 0 }: { call: TradingCall; delay?: number }) {
  return (
    <div
      className="bg-surface border border-border p-6 hover:border-primary/50 transition-colors animate-reveal"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-black tracking-tight">{call.pair}</h3>
          <p className={`font-mono text-[11px] uppercase font-bold tracking-widest mt-1 ${call.direction === "LONG" ? "text-primary" : "text-bear"}`}>
            {call.direction} {call.leverage ? `• ${call.leverage}` : ""}
          </p>
        </div>
        <span className={`px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border ${statusStyle(call.status)}`}>
          {call.status.replace("_", " ")}
        </span>
      </div>
      <div className="space-y-3 font-mono text-sm">
        <Row label="Entry" value={fmtNum(call.entry_price)} />
        <Row label="Target" value={fmtNum(call.target_price)} valueClass="text-primary" />
        <Row label="Stop" value={fmtNum(call.stop_loss)} valueClass="text-bear" />
        {call.pnl_percent !== null && (
          <Row
            label="PnL"
            value={fmtSigned(call.pnl_percent)}
            valueClass={Number(call.pnl_percent) >= 0 ? "text-primary font-bold" : "text-bear font-bold"}
          />
        )}
      </div>
      {call.notes && (
        <p className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground line-clamp-2">{call.notes}</p>
      )}
    </div>
  );
}

function Row({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between border-b border-border/40 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-bold ${valueClass}`}>{value}</span>
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

  return (
    <section className="py-24 px-6 bg-surface/30 border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter">PnL Leaderboard</h2>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-2">Top traders by verified ROI</p>
          </div>
          <Link to="/leaderboard" className="text-xs font-mono uppercase tracking-widest text-primary hover:underline">
            Full rankings →
          </Link>
        </div>

        <div className="border border-border bg-surface overflow-x-auto">
          <table className="w-full text-left">
            <thead className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest border-b border-border">
              <tr>
                <th className="p-4 w-16">Rank</th>
                <th className="p-4">Trader</th>
                <th className="p-4 text-right">Win Rate</th>
                <th className="p-4 text-right hidden sm:table-cell">Net PnL</th>
                <th className="p-4 text-right">ROI %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {traders?.map((t) => (
                <tr key={t.id} className="hover:bg-primary/5 transition-colors">
                  <td className="p-4 font-mono font-bold">
                    <span className={t.rank === 1 ? "text-primary" : "text-muted-foreground"}>
                      {String(t.rank ?? "—").padStart(2, "0")}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded bg-background border border-border grid place-items-center font-mono text-xs text-primary font-bold">
                        {t.handle.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold uppercase tracking-wide">{t.handle}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono">{Number(t.win_rate).toFixed(1)}%</td>
                  <td className="p-4 text-right font-mono text-primary hidden sm:table-cell">
                    +${Number(t.total_pnl).toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-mono text-primary font-bold">{fmtSigned(t.roi_percent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="font-mono text-xs text-primary uppercase tracking-[0.3em] mb-4">About</p>
          <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-6 leading-tight">
            Built by traders.<br /><span className="text-primary">Not influencers.</span>
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            CrypGuyKy was forged in the trenches of three full market cycles. We don't sell hope — we publish receipts. Every call is timestamped on entry, every result is verifiable.
          </p>
          <ul className="space-y-3 font-mono text-sm">
            {[
              "No hidden track record",
              "Public entries, targets, stops — before the move",
              "Transparent PnL on every closed trade",
              "Built for traders who can read a chart",
            ].map((x) => (
              <li key={x} className="flex items-center gap-3">
                <span className="text-primary font-bold">[+]</span>
                <span className="uppercase tracking-wide">{x}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="bg-surface border border-border p-8 font-mono text-xs">
            <div className="text-primary mb-4">{">"} ./desk.stats --live</div>
            <DataLine k="active_signals" v="6" />
            <DataLine k="closed_30d" v="42" />
            <DataLine k="best_call" v="+412%" />
            <DataLine k="avg_rr_ratio" v="1:4.2" />
            <DataLine k="account_grow_ytd" v="+1,420%" highlight />
            <DataLine k="signal_latency" v="< 200ms" />
            <div className="text-muted-foreground mt-4">{">"} _</div>
          </div>
          <div className="absolute -inset-1 -z-10 bg-primary/10 blur-2xl" />
        </div>
      </div>
    </section>
  );
}

function DataLine({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className={highlight ? "text-primary font-bold" : "text-foreground"}>{v}</span>
    </div>
  );
}

function SubscribeCta() {
  const [email, setEmail] = useState("");
  const m = useMutation({
    mutationFn: async (e: string) => {
      const { error } = await supabase.from("subscribers").insert({ email: e });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("You're on the list. Welcome to the desk."); setEmail(""); },
    onError: (e: Error) => { toast.error(e.message.includes("duplicate") ? "You're already subscribed." : e.message); },
  });

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block mb-8 py-1 px-4 border border-primary text-primary font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse-dot">
          Enrollment Open
        </div>
        <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-6">
          Secure the <span className="text-primary">Alpha.</span>
        </h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
          Join the desk's signal alerts. Get every trade in your inbox before it moves.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); if (email) m.mutate(email); }}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourdomain.com"
            className="flex-1 bg-surface border border-border px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={m.isPending}
            className="px-8 py-3 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:brightness-110 disabled:opacity-50"
          >
            {m.isPending ? "..." : "Join"}
          </button>
        </form>
        <p className="mt-6 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          No spam. Unsubscribe anytime. Not financial advice.
        </p>
      </div>
    </section>
  );
}
