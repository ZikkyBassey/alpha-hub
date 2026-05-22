import { useEffect, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function SiteHeader() {
  const { user, loading } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-mono font-bold text-lg tracking-tighter text-primary text-glow">
            CRYPGUYKY
          </Link>
          <nav className="hidden md:flex gap-6 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <Link to="/calls" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>Signals</Link>
            <Link to="/leaderboard" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>Leaderboard</Link>
            <Link to="/about" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>About</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded border border-primary/30 bg-primary/10">
            <div className="size-1.5 rounded-full bg-primary animate-pulse-dot" />
            <span className="text-[10px] font-mono text-primary uppercase font-bold tracking-widest">Market Open</span>
          </div>
          {!loading && user && (
            <>
              <Link to="/admin" className="px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-widest border border-border hover:border-primary hover:text-primary transition-colors">
                Admin
              </Link>
              <button
                onClick={async () => { await supabase.auth.signOut(); router.navigate({ to: "/" }); }}
                className="px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="py-12 px-6 border-t border-border mt-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-mono font-bold text-sm tracking-tighter text-primary text-glow">
          CRYPGUYKY
        </div>
        <div className="flex gap-8 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          <Link to="/calls" className="hover:text-primary">Signals</Link>
          <Link to="/leaderboard" className="hover:text-primary">Leaderboard</Link>
          <Link to="/about" className="hover:text-primary">About</Link>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground uppercase">
          © {new Date().getFullYear()} CrypGuyKy.com — Not financial advice.
        </div>
      </div>
    </footer>
  );
}
