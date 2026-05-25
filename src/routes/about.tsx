import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — CrypGuyKy" },
      { name: "description", content: "CrypGuyKy is a transparent crypto alpha desk publishing verified trading calls and a public PnL leaderboard." },
    ],
  }),
});

const pillars = [
  { label: "Transparent", desc: "Every call is timestamped on entry. Every result — win or loss — is published." },
  { label: "Verified", desc: "PnL is tracked against real entry prices, not cherry-picked screenshots." },
  { label: "Disciplined", desc: "Risk management first. We size positions, set stops, and respect the market." },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative py-16 sm:py-28 px-4 sm:px-6 border-b border-border/60 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/2 h-full glow-orb opacity-30 pointer-events-none" />
        <div className="max-w-3xl mx-auto relative">
          <p className="font-mono text-[9px] text-primary uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
            <span className="size-1 rounded-full bg-primary" />
            About
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-[0.9]">
            Transparent<br /><span className="text-primary">by default.</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
            CrypGuyKy was founded by traders tired of opaque "premium" groups screenshotting only their winners.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 px-4 sm:px-6 border-b border-border/60">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-px bg-border/40">
          {pillars.map(({ label, desc }) => (
            <div key={label} className="bg-background p-6 sm:p-8">
              <div className="size-8 border border-primary/30 bg-primary/5 grid place-items-center mb-4">
                <span className="size-1.5 rounded-full bg-primary" />
              </div>
              <p className="font-black uppercase tracking-tight mb-2">{label}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Body */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-6 text-muted-foreground leading-relaxed text-sm sm:text-base">
          <p>
            We trade liquid Solana memecoin markets. Our edge comes from disciplined risk management,
            on-chain flow analysis, and experience through multiple full crypto cycles.
          </p>
          <p>
            This isn't a hype machine. If you can't read a chart, this isn't for you.
            If you can — welcome to the desk.
          </p>
          <div className="pt-4">
            <Link
              to="/calls"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all"
            >
              View Live Calls
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
