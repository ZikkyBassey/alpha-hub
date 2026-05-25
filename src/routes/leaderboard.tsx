import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { fmtSigned, type Trader } from "@/lib/calls";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
  head: () => ({
    meta: [
      { title: "PnL Leaderboard — CrypGuyKy" },
      { name: "description", content: "Top crypto traders ranked by verified ROI, win rate, and net PnL." },
    ],
  }),
});

const medals = ["🥇", "🥈", "🥉"];

function LeaderboardPage() {
  const { data: traders } = useQuery({
    queryKey: ["traders", "all"],
    queryFn: async () => {
      const { data } = await supabase.from("traders").select("*").order("rank", { ascending: true, nullsFirst: false });
      return (data ?? []) as Trader[];
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 border-b border-border/60 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <p className="font-mono text-[9px] text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <span className="size-1 rounded-full bg-primary" />
            Rankings
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            Elite <span className="text-primary">Traders</span>
          </h1>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
            Ranked by verified ROI over the active season. Every result is on-chain verifiable.
          </p>
        </div>
      </section>

      {/* Table */}
      <section className="py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="border border-border/60 bg-surface overflow-hidden">
            <table className="w-full text-left">
              <thead className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest border-b border-border/60 bg-background/60">
                <tr>
                  <th className="p-4 sm:p-5 w-16">Rank</th>
                  <th className="p-4 sm:p-5">Trader</th>
                  <th className="p-4 sm:p-5 text-right">Win Rate</th>
                  <th className="p-4 sm:p-5 text-right hidden sm:table-cell">Net PnL</th>
                  <th className="p-4 sm:p-5 text-right">ROI %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {traders?.map((t) => (
                  <tr key={t.id} className="hover:bg-primary/[0.03] transition-colors group">
                    <td className="p-4 sm:p-5 font-mono font-bold text-lg">
                      {t.rank && t.rank <= 3
                        ? medals[(t.rank ?? 1) - 1]
                        : <span className="text-sm text-muted-foreground">{String(t.rank ?? "—").padStart(2, "0")}</span>
                      }
                    </td>
                    <td className="p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <div className="size-9 bg-background border border-border/60 grid place-items-center font-mono text-xs text-primary font-bold shrink-0 group-hover:border-primary/40 transition-colors">
                          {t.handle.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold uppercase tracking-wide text-sm">{t.handle}</p>
                          <p className="font-mono text-[9px] text-muted-foreground sm:hidden">{Number(t.win_rate).toFixed(1)}% win</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-right font-mono text-sm text-muted-foreground">{Number(t.win_rate).toFixed(1)}%</td>
                    <td className="p-4 sm:p-5 text-right font-mono text-sm text-primary hidden sm:table-cell">
                      +${Number(t.total_pnl).toLocaleString()}
                    </td>
                    <td className="p-4 sm:p-5 text-right font-mono font-black text-primary">{fmtSigned(t.roi_percent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!traders?.length && (
              <p className="text-center py-16 text-muted-foreground font-mono text-sm">No traders yet.</p>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
