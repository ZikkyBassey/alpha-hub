import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { CallCard } from "./index";
import type { TradingCall } from "@/lib/calls";

export const Route = createFileRoute("/calls")({
  component: CallsPage,
  head: () => ({
    meta: [
      { title: "Live Trading Signals — CrypGuyKy" },
      { name: "description", content: "Browse every live and historical CrypGuyKy trading call with entry, target, stop, and PnL." },
    ],
  }),
});

function CallsPage() {
  const { data: calls, isLoading } = useQuery({
    queryKey: ["calls", "all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("trading_calls")
        .select("*")
        .order("created_at", { ascending: false });
      return (data ?? []) as TradingCall[];
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="py-20 px-6 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs text-primary uppercase tracking-[0.3em] mb-4">/ signals</p>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">Live Trading Calls</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">Every signal, timestamped. Filter by status coming soon.</p>
        </div>
      </section>
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-surface border border-border animate-pulse" />)}
            </div>
          ) : calls && calls.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calls.map((c, i) => <CallCard key={c.id} call={c} delay={i * 50} />)}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-20">No signals yet.</p>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
