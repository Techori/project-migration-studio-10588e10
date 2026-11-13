import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { peopleGroups, slugify, type PersonGroup, type PersonProfile } from "@/lib/people-config";

const schema = z.object({
  person_group: z.enum(["investors", "mentors", "team", "startups", "businesses"]),
  name: z.string().trim().min(1, "Enter the name").max(120),
  role: z.string().trim().max(120),
  location: z.string().trim().max(80),
  focus: z.string().max(400),
  summary: z.string().trim().max(300),
  bio: z.string().trim().max(3000),
  photo_url: z.string().trim().max(500).refine((v) => v === "" || /^https:\/\//.test(v), "Photo link must start with https://"),
  sort_order: z.coerce.number().int().min(0).max(9999),
});

const empty = { person_group: "investors" as PersonGroup, name: "", role: "", location: "", focus: "", summary: "", bio: "", photo_url: "", sort_order: "0" };

export function ProfilesAdmin() {
  const [rows, setRows] = useState<PersonProfile[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("people_profiles").select("*").order("person_group").order("sort_order").order("name");
    setRows((data as PersonProfile[]) ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    const p = schema.safeParse(form);
    if (!p.success) { setMsg(p.error.issues[0]?.message ?? "Check the details"); return; }
    const d = p.data;
    const payload = { ...d, photo_url: d.photo_url || null, focus: d.focus.split(",").map((f) => f.trim()).filter(Boolean).slice(0, 12) };
    setBusy(true);
    const { error } = editId
      ? await supabase.from("people_profiles").update(payload).eq("id", editId)
      : await supabase.from("people_profiles").insert({ ...payload, slug: `${slugify(d.name) || "profile"}-${crypto.randomUUID().slice(0, 6)}` });
    setBusy(false);
    if (error) { setMsg("Couldn't save. Please try again."); return; }
    setMsg(editId ? "Profile updated." : "Profile added."); setForm(empty); setEditId(null); load();
  }

  async function remove(r: PersonProfile) {
    if (!confirm(`Remove ${r.name}?`)) return;
    await supabase.from("people_profiles").delete().eq("id", r.id); load();
  }

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  return <section className="mt-14">
    <h2 className="text-2xl font-black uppercase sm:text-3xl">Investors, Mentors & Team profiles</h2>
    <p className="mt-2 text-sm text-muted-foreground">Profiles added here appear on their pages for signed-in visitors only.</p>
    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <form onSubmit={save} className="grid content-start gap-3 border border-border bg-surface p-6">
        <h3 className="text-lg font-extrabold">{editId ? "Edit profile" : "Add profile"}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5"><Label htmlFor="p-g">Page</Label><select id="p-g" value={form.person_group} onChange={set("person_group")} className="h-9 rounded-md border border-input bg-background px-3 text-sm">{(Object.keys(peopleGroups) as PersonGroup[]).map((g) => <option key={g} value={g}>{peopleGroups[g].label}</option>)}</select></div>
          <div className="grid gap-1.5"><Label htmlFor="p-o">Display order</Label><Input id="p-o" type="number" min={0} value={form.sort_order} onChange={set("sort_order")} /></div>
        </div>
        <div className="grid gap-1.5"><Label htmlFor="p-n">Full name</Label><Input id="p-n" value={form.name} onChange={set("name")} /></div>
        <div className="grid grid-cols-2 gap-3"><div className="grid gap-1.5"><Label htmlFor="p-r">Role / title</Label><Input id="p-r" value={form.role} onChange={set("role")} /></div><div className="grid gap-1.5"><Label htmlFor="p-l">Location</Label><Input id="p-l" value={form.location} onChange={set("location")} /></div></div>
        <div className="grid gap-1.5"><Label htmlFor="p-ph">Photo link (optional)</Label><Input id="p-ph" value={form.photo_url} onChange={set("photo_url")} placeholder="https://…" /></div>
        <div className="grid gap-1.5"><Label htmlFor="p-f">Focus areas (comma separated)</Label><Input id="p-f" value={form.focus} onChange={set("focus")} /></div>
        <div className="grid gap-1.5"><Label htmlFor="p-s">Short summary</Label><Input id="p-s" value={form.summary} onChange={set("summary")} maxLength={300} /></div>
        <div className="grid gap-1.5"><Label htmlFor="p-b">Full bio</Label><Textarea id="p-b" rows={5} value={form.bio} onChange={set("bio")} maxLength={3000} /></div>
        {msg && <p role="status" className="text-sm text-muted-foreground">{msg}</p>}
        <div className="flex gap-2"><Button type="submit" disabled={busy}>{busy ? "Saving…" : editId ? "Save changes" : "Add profile"}</Button>{editId && <Button type="button" variant="outline" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</Button>}</div>
      </form>
      <div className="border border-border">
        <div className="bg-surface px-5 py-3 text-xs font-bold uppercase">{rows.length} profile{rows.length === 1 ? "" : "s"}</div>
        {rows.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No profiles yet.</p> : rows.map((r) => <div key={r.id} className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
          <button type="button" className="text-left" onClick={() => { setEditId(r.id); setMsg(null); setForm({ person_group: r.person_group, name: r.name, role: r.role, location: r.location, focus: r.focus.join(", "), summary: r.summary, bio: r.bio, photo_url: r.photo_url ?? "", sort_order: String(r.sort_order) }); }}>
            <p className="text-sm font-bold">{r.name} <span className="font-normal text-muted-foreground">· {peopleGroups[r.person_group].singular}</span></p>
            <p className="text-xs text-muted-foreground">{r.role}{r.location ? ` · ${r.location}` : ""}</p>
          </button>
          <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${r.name}`} onClick={() => remove(r)}><Trash2 size={15} /></Button>
        </div>)}
      </div>
    </div>
  </section>;
}
