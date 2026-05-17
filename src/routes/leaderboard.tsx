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
      <section className="py-20 px-6 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs text-primary uppercase tracking-[0.3em] mb-4">/ leaderboard</p>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">Elite Traders</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">Ranked by verified ROI over the active season.</p>
        </div>
      </section>
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto border border-border bg-surface overflow-x-auto">
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
                    <span className={t.rank === 1 ? "text-primary text-glow" : "text-muted-foreground"}>
                      {String(t.rank ?? "—").padStart(2, "0")}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded bg-background border border-border grid place-items-center font-mono text-xs text-primary font-bold">
                        {t.handle.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold uppercase tracking-wide">{t.handle}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono">{Number(t.win_rate).toFixed(1)}%</td>
                  <td className="p-4 text-right font-mono text-primary hidden sm:table-cell">+${Number(t.total_pnl).toLocaleString()}</td>
                  <td className="p-4 text-right font-mono text-primary font-bold">{fmtSigned(t.roi_percent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
