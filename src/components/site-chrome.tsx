import { useUser, useClerk } from "@clerk/clerk-react";
import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";

export function useAuth() {
  const { user, isLoaded } = useUser();
  return { user, loading: !isLoaded };
}

export function SiteHeader() {
  const { user, loading } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="size-7 bg-primary grid place-items-center shrink-0">
              <span className="text-primary-foreground font-black text-[10px] tracking-tighter">CK</span>
            </div>
            <span className="font-mono font-black text-sm tracking-tighter text-foreground group-hover:text-primary transition-colors">
              CRYPGUYKY
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest">
            {[
              { to: "/calls", label: "Signals" },
              { to: "/leaderboard", label: "Leaderboard" },
              { to: "/about", label: "About" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: true }}
                className="px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors relative group"
                activeProps={{ className: "px-3 py-1.5 text-primary relative group" }}
              >
                {label}
                <span className="absolute bottom-0 left-3 right-3 h-px bg-primary scale-x-0 group-[.active]:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Live pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
            <span className="size-1.5 rounded-full bg-primary animate-pulse-dot" />
            <span className="text-[9px] font-mono text-primary uppercase font-bold tracking-widest">Live</span>
          </div>

          {!loading && user && (
            <>
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest border border-border hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-all"
              >
                Admin
              </Link>
              <button
                onClick={() => signOut(() => router.navigate({ to: "/" }))}
                className="hidden md:block text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign out
              </button>
            </>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setOpen(o => !o)}
            className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8 text-muted-foreground hover:text-foreground"
            aria-label="Toggle menu"
          >
            <span className={`block h-px bg-current transition-all duration-300 ${open ? "rotate-45 translate-y-[7px] w-5" : "w-5"}`} />
            <span className={`block h-px bg-current transition-all duration-300 ${open ? "opacity-0 w-3" : "w-3"}`} />
            <span className={`block h-px bg-current transition-all duration-300 ${open ? "-rotate-45 -translate-y-[7px] w-5" : "w-5"}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-64" : "max-h-0"}`}>
        <div className="border-t border-border/60 bg-background/98 px-4 py-5 flex flex-col gap-1">
          {[
            { to: "/calls", label: "Signals" },
            { to: "/leaderboard", label: "Leaderboard" },
            { to: "/about", label: "About" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: true }}
              className="px-3 py-2.5 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
              activeProps={{ className: "px-3 py-2.5 text-[11px] font-mono uppercase tracking-widest text-primary bg-primary/5" }}
            >
              {label}
            </Link>
          ))}
          {!loading && user && (
            <>
              <Link to="/admin" onClick={() => setOpen(false)} className="px-3 py-2.5 text-[11px] font-mono uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors">
                Admin
              </Link>
              <button
                onClick={() => { setOpen(false); signOut(() => router.navigate({ to: "/" })); }}
                className="text-left px-3 py-2.5 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mt-1 border-t border-border/40 pt-3"
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
    <footer className="border-t border-border/60 bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="size-6 bg-primary grid place-items-center shrink-0">
                <span className="text-primary-foreground font-black text-[9px]">CK</span>
              </div>
              <span className="font-mono font-black text-sm tracking-tighter text-primary">CRYPGUYKY</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Transparent memecoin alpha. Every call timestamped. Every result published.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-3">Navigate</p>
              <div className="flex flex-col gap-2">
                {[
                  { to: "/calls", label: "Signals" },
                  { to: "/leaderboard", label: "Leaderboard" },
                  { to: "/about", label: "About" },
                ].map(({ to, label }) => (
                  <Link key={to} to={to} className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors">{label}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
            © {new Date().getFullYear()} CrypGuyKy
          </span>
          <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
            Not financial advice — Always DYOR
          </span>
        </div>
      </div>
    </footer>
  );
}
