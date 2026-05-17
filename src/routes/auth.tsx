import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in — CrypGuyKy" }, { name: "robots", content: "noindex" }] }),
});

function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.navigate({ to: "/admin" });
    });
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        router.navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: displayName } },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to verify.");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="font-mono font-bold text-lg tracking-tighter text-primary block mb-10 text-center">
          CRYPGUYKY<span className="text-foreground">.SYS</span>
        </Link>
        <div className="bg-surface border border-border p-8">
          <div className="flex gap-2 mb-8">
            {(["signin", "signup"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 text-[11px] font-mono font-bold uppercase tracking-widest border ${mode === m ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"}`}>
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <Field label="Display name" type="text" value={displayName} onChange={setDisplayName} />
            )}
            <Field label="Email" type="email" value={email} onChange={setEmail} required />
            <Field label="Password" type="password" value={password} onChange={setPassword} required minLength={6} />
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:brightness-110 disabled:opacity-50">
              {loading ? "..." : mode === "signin" ? "Access Terminal" : "Create Account"}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          Admin access requires a granted role. Contact the desk.
        </p>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, required, minLength }: { label: string; type: string; value: string; onChange: (v: string) => void; required?: boolean; minLength?: number }) {
  return (
    <div>
      <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="w-full bg-background border border-border px-3 py-2.5 font-mono text-sm focus:border-primary focus:outline-none"
      />
    </div>
  );
}
