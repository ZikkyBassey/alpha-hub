import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { CallCard } from "./index";
import type { TradingCall } from "@/lib/calls";

export const Route = createFileRoute("/calls")({
  component: CallsPage,
  head: () => ({
    meta: [
      { title: "Signals — CrypGuyKy" },
      { name: "description", content: "Every live and historical CrypGuyKy memecoin call with entry, target, and live PnL." },
    ],
  }),
});

const FILTERS = ["ALL", "ACTIVE", "TARGET_HIT", "PENDING", "STOPPED"] as const;
type Filter = typeof FILTERS[number];

function CallsPage() {
  const [filter, setFilter] = useState<Filter>("ALL");

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

  const filtered = filter === "ALL" ? calls : calls?.filter(c => c.status === filter);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative py-14 sm:py-20 px-4 sm:px-6 border-b border-border/60 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <p className="font-mono text-[9px] text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <span className="size-1 rounded-full bg-primary" />
            Signals
          </p>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter">All Calls</h1>
        </div>
      </section>

      <section className="py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Filter tabs */}
          <div className="flex gap-1.5 flex-wrap mb-10">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3.5 py-2 text-[10px] font-mono font-bold uppercase tracking-widest border transition-all ${
                  filter === f
                    ? "border-primary/60 text-primary bg-primary/8"
                    : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                }`}>
                {f.replace("_", " ")}
                {f !== "ALL" && calls && (
                  <span className="ml-1.5 opacity-40">{calls.filter(c => c.status === f).length}</span>
                )}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-surface border border-border/60 animate-pulse" />)}
            </div>
          ) : filtered?.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c, i) => <CallCard key={c.id} call={c} delay={i * 40} />)}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="text-muted-foreground font-mono text-sm">No calls found.</p>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
