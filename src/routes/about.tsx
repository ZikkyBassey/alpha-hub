import { createFileRoute } from "@tanstack/react-router";
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

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="py-24 px-6 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs text-primary uppercase tracking-[0.3em] mb-6">/ about</p>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-10">
            Transparent <span className="text-primary">by default.</span>
          </h1>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p>CrypGuyKy was founded by traders tired of opaque "premium" groups screenshotting only their winners. Every call we publish is timestamped on entry. Every result — win or loss — is added to the leaderboard.</p>
            <p>We trade liquid perp markets across the top 50 pairs. Our edge comes from disciplined risk management, on-chain flow analysis, and decades of combined experience through three full crypto cycles.</p>
            <p>This isn't a hype machine. If you can't read a chart, this isn't for you. If you can, welcome to the desk.</p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
