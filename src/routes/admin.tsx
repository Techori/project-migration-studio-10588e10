import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminAccess } from "@/lib/admin-bootstrap.functions";
import { LogOut, Trash2 } from "lucide-react";
import { z } from "zod";
import { AuthForm } from "@/components/auth-form";
const ProfilesAdmin = lazy(() => import("@/components/profiles-admin").then(m => ({ default: m.ProfilesAdmin })));
const SubmissionsAdmin = lazy(() => import("@/components/submissions-admin").then(m => ({ default: m.SubmissionsAdmin })));
const ReportsAdmin = lazy(() => import("@/components/reports-admin").then(m => ({ default: m.ReportsAdmin })));
const SetupAdmin = lazy(() => import("@/components/setup-admin").then(m => ({ default: m.SetupAdmin })));
import { FirstAdminSetup } from "@/components/first-admin-setup";
const RecordsImportAdmin = lazy(() => import("@/components/records-import-admin").then(m => ({ default: m.RecordsImportAdmin })));
const FilesRestoreAdmin = lazy(() => import("@/components/files-restore-admin").then(m => ({ default: m.FilesRestoreAdmin })));
const AccountProfileAdmin = lazy(() => import("@/components/account-profile-admin").then(m => ({ default: m.AccountProfileAdmin })));
const CountryLogosAdmin = lazy(() => import("@/components/country-logos-admin").then(m => ({ default: m.CountryLogosAdmin })));
const ProgrammeFeesAdmin = lazy(() => import("@/components/programme-fees-admin").then(m => ({ default: m.ProgrammeFeesAdmin })));
const YoungRegistrationsAdmin = lazy(() => import("@/components/young-registrations-admin").then(m => ({ default: m.YoungRegistrationsAdmin })));
const EducationStaffAdmin = lazy(() => import('@/components/education-staff-admin').then(m => ({ default: m.EducationStaffAdmin })));
const EducationSupportAdmin = lazy(() => import("@/components/education-support-admin").then(m => ({ default: m.EducationSupportAdmin })));
const FoundationSubmissionsAdmin = lazy(() => import("@/components/foundation-submissions-admin").then(m => ({ default: m.FoundationSubmissionsAdmin })));
const PrototypeSubmissionsAdmin = lazy(() => import("@/components/prototype-submissions-admin").then(m => ({ default: m.PrototypeSubmissionsAdmin })));
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Admin | Riloyd Applications, Enquiries & People" },
      { name: "description", content: "Riloyd staff area for reviewing registrations and enquiries and managing people and employee records." },
      { property: "og:title", content: "Admin | Riloyd Applications, Enquiries & People" },
      { property: "og:description", content: "Private Riloyd workspace for application review, enquiries and people management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Employee = { id: string; employee_id: string; full_name: string; photo_url: string | null; designation: string; department: string; status: string; valid_until: string | null };

function AdminPage() {
  const queryClient = useQueryClient();
  const access = useServerFn(getAdminAccess);
  const [accessError, setAccessError] = useState("");
  const [setup, setSetup] = useState<string | null>(null);
  const [accessVersion, setAccessVersion] = useState(0);
  const signOut = async () => { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); };
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let current = true;
    setIsAdmin(null); setSetup(null); setAccessError("");
    if (!session) return;
    access().then(result => { if (current) { setIsAdmin(result.admin); setSetup(result.setup); } })
      .catch(error => { if (current) setAccessError(error instanceof Error ? error.message : "Access could not be checked."); });
    return () => { current = false; };
  }, [session?.user.id, accessVersion, access]);

  return <main className="min-h-[70vh] bg-background px-5 py-14 text-foreground sm:px-6 lg:px-12">
    <div className="mx-auto max-w-[1100px]">
      <p className="eyebrow text-[10px] font-bold uppercase">Staff area</p>
      <h1 className="mt-4 text-3xl font-black uppercase sm:text-5xl">Admin Panel</h1>
      <Button asChild variant="outline" className="mt-4"><Link to="/crm">Open employee CRM</Link></Button>
      {!ready ? null : !session ? <AuthForm redirectPath="/admin" /> : accessError ? <div className="mt-8"><p role="alert">{accessError}</p><Button className="mt-3" onClick={() => setAccessVersion(v => v + 1)}>Retry access check</Button></div> : isAdmin === null ? <p className="mt-8 text-sm text-muted-foreground">Checking access…</p> : !isAdmin
        ? setup === "eligible" || setup === "unverified" ? <FirstAdminSetup onComplete={() => setAccessVersion(v => v + 1)} /> : <div className="mt-8"><p>Your account does not have admin access. Employees (BDE, BDM, Sales, Support) work in the CRM.</p><div className="mt-4 flex flex-wrap gap-2"><Button asChild><Link to="/crm">Open my CRM workspace</Link></Button><Button asChild variant="outline"><Link to="/staff">BDE / BDM referrals</Link></Button></div><Button className="mt-4" variant="outline" onClick={() => void signOut()}>Sign out</Button></div>
        : <Suspense fallback={<p className="mt-8 text-sm text-muted-foreground">Loading admin workspace…</p>}><Tabs defaultValue="applications" className="mt-8"><div className="flex flex-wrap items-center justify-between gap-4"><TabsList className="h-auto flex-wrap justify-start"><TabsTrigger value="applications">Applications</TabsTrigger><TabsTrigger value="enquiries">Enquiries</TabsTrigger><TabsTrigger value="reports">Reports</TabsTrigger><TabsTrigger value="employees">Employees</TabsTrigger><TabsTrigger value="profiles">People profiles</TabsTrigger><TabsTrigger value="country-logos">Country logos</TabsTrigger><TabsTrigger value="young-innovators">Young Innovators</TabsTrigger><TabsTrigger value="prototypes">Prototype submissions</TabsTrigger><TabsTrigger value="programme-fees">Registration fees</TabsTrigger><TabsTrigger value="foundation">Foundation forms</TabsTrigger><TabsTrigger value="education-support">Education Support</TabsTrigger><TabsTrigger value="education-staff">BDE / BDM</TabsTrigger><TabsTrigger value="import">Import records</TabsTrigger><TabsTrigger value="files">Restore files</TabsTrigger><TabsTrigger value="account">My account</TabsTrigger><TabsTrigger value="setup">Setup check</TabsTrigger></TabsList><Button variant="outline" onClick={() => void signOut()}><LogOut size={14} /> Sign out</Button></div><TabsContent value="applications"><SubmissionsAdmin kind="applications" /></TabsContent><TabsContent value="enquiries"><SubmissionsAdmin kind="enquiries" /></TabsContent><TabsContent value="reports"><ReportsAdmin /></TabsContent><TabsContent value="employees"><AdminPanel email={session.user.email ?? ""} /></TabsContent><TabsContent value="profiles"><ProfilesAdmin /></TabsContent><TabsContent value="country-logos"><CountryLogosAdmin /></TabsContent><TabsContent value="young-innovators"><YoungRegistrationsAdmin /></TabsContent><TabsContent value="prototypes"><PrototypeSubmissionsAdmin /></TabsContent><TabsContent value="programme-fees"><ProgrammeFeesAdmin /></TabsContent><TabsContent value="foundation"><FoundationSubmissionsAdmin /></TabsContent><TabsContent value="education-support"><EducationSupportAdmin /></TabsContent><TabsContent value="education-staff"><EducationStaffAdmin /></TabsContent><TabsContent value="import"><RecordsImportAdmin /></TabsContent><TabsContent value="files"><FilesRestoreAdmin /></TabsContent><TabsContent value="account"><AccountProfileAdmin /></TabsContent><TabsContent value="setup"><SetupAdmin /></TabsContent></Tabs></Suspense>}
    </div>
  </main>;
}

const empSchema = z.object({
  employeeId: z.string().trim().min(2, "Enter the Employee ID").max(40),
  code: z.string().trim().max(64),
  fullName: z.string().trim().min(1, "Enter the full name").max(120),
  photoUrl: z.string().trim().max(500).refine((v) => v === "" || /^https:\/\//.test(v), "Photo link must start with https://"),
  designation: z.string().trim().min(1, "Enter the designation").max(120),
  department: z.string().trim().min(1, "Enter the department").max(120),
  status: z.enum(["active", "inactive"]),
  validUntil: z.string(),
});

const empty = { employeeId: "", code: "", fullName: "", photoUrl: "", designation: "", department: "", status: "active" as "active" | "inactive", validUntil: "" };

function AdminPanel({ email }: { email: string }) {
  const [rows, setRows] = useState<Employee[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("employees").select("id, employee_id, full_name, photo_url, designation, department, status, valid_until").order("employee_id");
    setRows((data as Employee[]) ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    const p = empSchema.safeParse(form);
    if (!p.success) { setMsg(p.error.issues[0]?.message ?? "Check the details"); return; }
    if (!editing && p.data.code.length < 6) { setMsg("Employee Code must be at least 6 characters"); return; }
    setBusy(true);
    const { error } = await supabase.rpc("admin_save_employee", {
      _employee_id: p.data.employeeId, _code: p.data.code, _full_name: p.data.fullName, _photo_url: p.data.photoUrl,
      _designation: p.data.designation, _department: p.data.department, _status: p.data.status, _valid_until: p.data.validUntil || null,
    } as never);
    setBusy(false);
    if (error) { setMsg("Couldn't save. Please check the details and try again."); return; }
    setMsg(editing ? "Employee updated." : "Employee added."); setForm(empty); setEditing(false); load();
  }

  async function remove(r: Employee) {
    if (!confirm(`Remove ${r.full_name} (${r.employee_id})?`)) return;
    await supabase.from("employees").delete().eq("id", r.id); load();
  }

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  return <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
    <form onSubmit={save} className="grid content-start gap-3 border border-border bg-surface p-6">
      <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">{editing ? "Edit employee" : "Add employee"}</h2><button type="button" className="flex items-center gap-1 text-xs text-muted-foreground" onClick={() => supabase.auth.signOut()} title={email}><LogOut size={13} /> Sign out</button></div>
      <div className="grid gap-1.5"><Label htmlFor="f-id">Employee ID</Label><Input id="f-id" value={form.employeeId} onChange={set("employeeId")} disabled={editing} placeholder="e.g. RLY-1024" /></div>
      <div className="grid gap-1.5"><Label htmlFor="f-code">Employee Code {editing && <span className="text-muted-foreground">(leave blank to keep)</span>}</Label><Input id="f-code" type="password" value={form.code} onChange={set("code")} autoComplete="new-password" /></div>
      <div className="grid gap-1.5"><Label htmlFor="f-name">Full name</Label><Input id="f-name" value={form.fullName} onChange={set("fullName")} /></div>
      <div className="grid gap-1.5"><Label htmlFor="f-photo">Photo link (optional)</Label><Input id="f-photo" value={form.photoUrl} onChange={set("photoUrl")} placeholder="https://…" /></div>
      <div className="grid grid-cols-2 gap-3"><div className="grid gap-1.5"><Label htmlFor="f-des">Designation</Label><Input id="f-des" value={form.designation} onChange={set("designation")} /></div><div className="grid gap-1.5"><Label htmlFor="f-dep">Department</Label><Input id="f-dep" value={form.department} onChange={set("department")} /></div></div>
      <div className="grid grid-cols-2 gap-3"><div className="grid gap-1.5"><Label htmlFor="f-st">Status</Label><select id="f-st" value={form.status} onChange={set("status")} className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option></select></div><div className="grid gap-1.5"><Label htmlFor="f-vu">Valid until</Label><Input id="f-vu" type="date" value={form.validUntil} onChange={set("validUntil")} /></div></div>
      {msg && <p role="status" className="text-sm text-muted-foreground">{msg}</p>}
      <div className="flex gap-2"><Button type="submit" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Add employee"}</Button>{editing && <Button type="button" variant="outline" onClick={() => { setEditing(false); setForm(empty); }}>Cancel</Button>}</div>
    </form>
    <div className="border border-border">
      <div className="bg-surface px-5 py-3 text-xs font-bold uppercase">{rows.length} employee{rows.length === 1 ? "" : "s"}</div>
      {rows.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No employees yet. Add the first one using the form.</p> : rows.map((r) => <div key={r.id} className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
        <button type="button" className="text-left" onClick={() => { setEditing(true); setMsg(null); setForm({ employeeId: r.employee_id, code: "", fullName: r.full_name, photoUrl: r.photo_url ?? "", designation: r.designation, department: r.department, status: r.status as "active" | "inactive", validUntil: r.valid_until ?? "" }); }}>
          <p className="text-sm font-bold">{r.full_name} <span className="font-normal text-muted-foreground">· {r.employee_id}</span></p>
          <p className="text-xs text-muted-foreground">{r.designation}, {r.department} · {r.status}{r.valid_until ? ` · until ${r.valid_until}` : ""}</p>
        </button>
        <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${r.full_name}`} onClick={() => remove(r)}><Trash2 size={15} /></Button>
      </div>)}
    </div>
  </div>;
}
