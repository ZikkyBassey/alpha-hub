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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back.");
      router.navigate({ to: "/admin" });
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
          <p className="font-mono text-xs text-primary uppercase tracking-[0.3em] mb-6">/ admin terminal</p>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Email" type="email" value={email} onChange={setEmail} required />
            <Field label="Password" type="password" value={password} onChange={setPassword} required minLength={6} />
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:brightness-110 disabled:opacity-50">
              {loading ? "..." : "Access Terminal"}
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
