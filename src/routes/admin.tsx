import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-chrome";
import { statusStyle, fmtSigned, type TradingCall, type Trader } from "@/lib/calls";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — CrypGuyKy" }, { name: "robots", content: "noindex" }] }),
});

type Role = "admin" | "editor" | "viewer";

function AdminPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<"calls" | "traders" | "announcements" | "subscribers">("calls");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.navigate({ to: "/auth" }); return; }
      setUserId(session.user.id);
      const { data: rolesData } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      setRoles((rolesData ?? []).map(r => r.role as Role));
      setChecking(false);
    })();
  }, [router]);

  if (checking) return <div className="min-h-screen grid place-items-center text-muted-foreground font-mono text-xs uppercase">Authenticating…</div>;

  const canEdit = roles.includes("admin") || roles.includes("editor");
  const isAdmin = roles.includes("admin");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="py-12 px-6 border-b border-border">
        <div className="max-w-7xl mx-auto flex justify-between items-end flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs text-primary uppercase tracking-[0.3em] mb-2">/ admin terminal</p>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Control Panel</h1>
            <p className="font-mono text-xs text-muted-foreground mt-2">
              UID: <span className="text-foreground">{userId?.slice(0, 8)}…</span> &nbsp;|&nbsp;
              Roles: <span className="text-primary">{roles.length ? roles.join(", ") : "none — request access"}</span>
            </p>
          </div>
        </div>
      </section>

      {!canEdit ? (
        <div className="max-w-3xl mx-auto py-20 px-6 text-center">
          <p className="font-mono text-xs text-primary uppercase tracking-[0.3em] mb-4">Access denied</p>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">No role assigned</h2>
          <p className="text-muted-foreground mb-6">
            Your account has no admin or editor role. The first admin must be granted in the database. Run:
          </p>
          <pre className="bg-surface border border-border p-4 text-left font-mono text-xs text-primary overflow-x-auto">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('${userId}', 'admin');`}
          </pre>
          <Link to="/" className="inline-block mt-6 text-xs font-mono uppercase tracking-widest text-primary hover:underline">← Back to site</Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex gap-2 mb-8 flex-wrap">
            {(["calls", "traders", "announcements", "subscribers"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-widest border ${tab === t ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground"}`}>
                {t}
              </button>
            ))}
          </div>
          {tab === "calls" && <CallsAdmin />}
          {tab === "traders" && <TradersAdmin />}
          {tab === "announcements" && <AnnouncementsAdmin />}
          {tab === "subscribers" && (isAdmin ? <SubscribersAdmin /> : <p className="text-muted-foreground text-sm">Admin only.</p>)}
        </div>
      )}
    </div>
  );
}

/* ---------- Calls ---------- */
function CallsAdmin() {
  const qc = useQueryClient();
  const { data: calls } = useQuery({
    queryKey: ["admin", "calls"],
    queryFn: async () => {
      const { data } = await supabase.from("trading_calls").select("*").order("created_at", { ascending: false });
      return (data ?? []) as TradingCall[];
    },
  });

  const blank = { pair: "", direction: "LONG", leverage: "", entry_price: "", target_price: "", stop_loss: "", status: "ACTIVE", pnl_percent: "", notes: "" };
  const [form, setForm] = useState<Record<string, string>>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        pair: form.pair, direction: form.direction, leverage: form.leverage || null,
        entry_price: Number(form.entry_price),
        target_price: form.target_price ? Number(form.target_price) : null,
        stop_loss: form.stop_loss ? Number(form.stop_loss) : null,
        status: form.status,
        pnl_percent: form.pnl_percent ? Number(form.pnl_percent) : null,
        notes: form.notes || null,
      };
      if (editingId) {
        const { error } = await supabase.from("trading_calls").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("trading_calls").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Saved."); setForm(blank); setEditingId(null); qc.invalidateQueries({ queryKey: ["admin", "calls"] }); qc.invalidateQueries({ queryKey: ["calls"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("trading_calls").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["admin", "calls"] }); qc.invalidateQueries({ queryKey: ["calls"] }); },
  });

  const startEdit = (c: TradingCall) => {
    setEditingId(c.id);
    setForm({
      pair: c.pair, direction: c.direction, leverage: c.leverage ?? "",
      entry_price: String(c.entry_price), target_price: c.target_price ? String(c.target_price) : "",
      stop_loss: c.stop_loss ? String(c.stop_loss) : "", status: c.status,
      pnl_percent: c.pnl_percent !== null ? String(c.pnl_percent) : "", notes: c.notes ?? "",
    });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="bg-surface border border-border p-6 space-y-3 h-fit sticky top-20">
        <h3 className="font-black uppercase tracking-tight mb-2">{editingId ? "Edit call" : "New call"}</h3>
        <AdminInput label="Pair" value={form.pair} onChange={(v) => setForm({ ...form, pair: v })} required />
        <AdminSelect label="Direction" value={form.direction} options={["LONG", "SHORT"]} onChange={(v) => setForm({ ...form, direction: v })} />
        <AdminInput label="Leverage" value={form.leverage} onChange={(v) => setForm({ ...form, leverage: v })} placeholder="e.g. 10x" />
        <AdminInput label="Entry" type="number" step="any" value={form.entry_price} onChange={(v) => setForm({ ...form, entry_price: v })} required />
        <AdminInput label="Target" type="number" step="any" value={form.target_price} onChange={(v) => setForm({ ...form, target_price: v })} />
        <AdminInput label="Stop loss" type="number" step="any" value={form.stop_loss} onChange={(v) => setForm({ ...form, stop_loss: v })} />
        <AdminSelect label="Status" value={form.status} options={["ACTIVE","PENDING","TARGET_HIT","STOPPED","CLOSED"]} onChange={(v) => setForm({ ...form, status: v })} />
        <AdminInput label="PnL %" type="number" step="any" value={form.pnl_percent} onChange={(v) => setForm({ ...form, pnl_percent: v })} />
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
            className="w-full bg-background border border-border px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none" />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={save.isPending} className="flex-1 py-2 bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest disabled:opacity-50">
            {editingId ? "Update" : "Create"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(blank); }} className="px-4 py-2 border border-border font-mono text-xs uppercase">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-2">
        {calls?.map((c) => (
          <div key={c.id} className="bg-surface border border-border p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <span className={`px-2 py-1 text-[10px] font-mono font-bold uppercase border ${statusStyle(c.status)}`}>{c.status.replace("_"," ")}</span>
              <div>
                <p className="font-bold tracking-tight">{c.pair}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{c.direction} • Entry {c.entry_price} {c.pnl_percent !== null && <span className={Number(c.pnl_percent) >= 0 ? "text-primary" : "text-bear"}>{" "}{fmtSigned(c.pnl_percent)}</span>}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(c)} className="px-3 py-1.5 text-[11px] font-mono uppercase border border-border hover:border-primary">Edit</button>
              <button onClick={() => confirm("Delete this call?") && del.mutate(c.id)} className="px-3 py-1.5 text-[11px] font-mono uppercase border border-border hover:border-bear hover:text-bear">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Traders ---------- */
function TradersAdmin() {
  const qc = useQueryClient();
  const { data: traders } = useQuery({
    queryKey: ["admin", "traders"],
    queryFn: async () => {
      const { data } = await supabase.from("traders").select("*").order("rank", { ascending: true, nullsFirst: false });
      return (data ?? []) as Trader[];
    },
  });
  const blank = { handle: "", win_rate: "", roi_percent: "", total_pnl: "", rank: "" };
  const [form, setForm] = useState<Record<string, string>>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        handle: form.handle,
        win_rate: Number(form.win_rate) || 0,
        roi_percent: Number(form.roi_percent) || 0,
        total_pnl: Number(form.total_pnl) || 0,
        rank: form.rank ? Number(form.rank) : null,
      };
      if (editingId) {
        const { error } = await supabase.from("traders").update(payload).eq("id", editingId); if (error) throw error;
      } else {
        const { error } = await supabase.from("traders").insert(payload); if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Saved."); setForm(blank); setEditingId(null); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("traders").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries(),
  });

  return (
    <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="bg-surface border border-border p-6 space-y-3 h-fit sticky top-20">
        <h3 className="font-black uppercase tracking-tight mb-2">{editingId ? "Edit trader" : "New trader"}</h3>
        <AdminInput label="Handle" value={form.handle} onChange={(v) => setForm({ ...form, handle: v })} required />
        <AdminInput label="Win rate %" type="number" step="any" value={form.win_rate} onChange={(v) => setForm({ ...form, win_rate: v })} />
        <AdminInput label="ROI %" type="number" step="any" value={form.roi_percent} onChange={(v) => setForm({ ...form, roi_percent: v })} />
        <AdminInput label="Total PnL ($)" type="number" step="any" value={form.total_pnl} onChange={(v) => setForm({ ...form, total_pnl: v })} />
        <AdminInput label="Rank" type="number" value={form.rank} onChange={(v) => setForm({ ...form, rank: v })} />
        <button type="submit" disabled={save.isPending} className="w-full py-2 bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest disabled:opacity-50">{editingId ? "Update" : "Create"}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(blank); }} className="w-full py-2 border border-border font-mono text-xs uppercase">Cancel</button>}
      </form>
      <div className="space-y-2">
        {traders?.map((t) => (
          <div key={t.id} className="bg-surface border border-border p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <span className="font-mono text-primary font-bold w-8">{String(t.rank ?? "—").padStart(2,"0")}</span>
              <div>
                <p className="font-bold uppercase tracking-wide">{t.handle}</p>
                <p className="font-mono text-[11px] text-muted-foreground">Win {Number(t.win_rate).toFixed(1)}% • ROI {fmtSigned(t.roi_percent)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditingId(t.id); setForm({ handle: t.handle, win_rate: String(t.win_rate), roi_percent: String(t.roi_percent), total_pnl: String(t.total_pnl), rank: t.rank ? String(t.rank) : "" }); }} className="px-3 py-1.5 text-[11px] font-mono uppercase border border-border hover:border-primary">Edit</button>
              <button onClick={() => confirm("Delete?") && del.mutate(t.id)} className="px-3 py-1.5 text-[11px] font-mono uppercase border border-border hover:border-bear hover:text-bear">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Announcements ---------- */
function AnnouncementsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: async () => (await supabase.from("announcements").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const [title, setTitle] = useState(""); const [body, setBody] = useState("");
  const save = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("announcements").insert({ title, body }); if (error) throw error; },
    onSuccess: () => { toast.success("Posted."); setTitle(""); setBody(""); qc.invalidateQueries({ queryKey: ["admin", "announcements"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("announcements").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "announcements"] }),
  });
  return (
    <div className="space-y-6 max-w-3xl">
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="bg-surface border border-border p-6 space-y-3">
        <h3 className="font-black uppercase tracking-tight">New announcement</h3>
        <AdminInput label="Title" value={title} onChange={setTitle} required />
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={4} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none" />
        </div>
        <button type="submit" disabled={save.isPending} className="px-6 py-2 bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest disabled:opacity-50">Post</button>
      </form>
      <div className="space-y-2">
        {data?.map((a) => (
          <div key={a.id} className="bg-surface border border-border p-4">
            <div className="flex justify-between gap-4 mb-2">
              <p className="font-bold">{a.title}</p>
              <button onClick={() => confirm("Delete?") && del.mutate(a.id)} className="text-[11px] font-mono uppercase text-muted-foreground hover:text-bear">Delete</button>
            </div>
            <p className="text-sm text-muted-foreground">{a.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Subscribers ---------- */
function SubscribersAdmin() {
  const { data } = useQuery({
    queryKey: ["admin", "subscribers"],
    queryFn: async () => (await supabase.from("subscribers").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <div className="bg-surface border border-border max-w-3xl">
      <div className="px-4 py-3 border-b border-border font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {data?.length ?? 0} subscribers
      </div>
      <div className="divide-y divide-border/40">
        {data?.map((s) => (
          <div key={s.id} className="px-4 py-3 flex justify-between font-mono text-sm">
            <span>{s.email}</span>
            <span className="text-muted-foreground text-xs">{new Date(s.created_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- shared inputs ---------- */
function AdminInput({ label, value, onChange, type = "text", required, placeholder, step }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string; step?: string }) {
  return (
    <div>
      <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder} step={step}
        className="w-full bg-background border border-border px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none" />
    </div>
  );
}
function AdminSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-background border border-border px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
