import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ArrowLeft, ArrowRight, BadgeCheck, Briefcase, Lock, LogOut, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthForm } from "@/components/auth-form";
import { initials, peopleGroups, type PersonGroup, type PersonProfile } from "@/lib/people-config";

const profileRoutes = { investors: "/investors/$slug", mentors: "/mentors/$slug", team: "/team/$slug", startups: "/startups/$slug", businesses: "/businesses/$slug" } as const;
const listRoutes = { investors: "/investors", mentors: "/mentors", team: "/team", startups: "/startups", businesses: "/businesses" } as const;

function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);
  return { session, ready };
}

// Never show contact details: strip any email, phone number or URL that slipped into profile text.
export function redactContacts(text: string) {
  return (text ?? "")
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "")
    .replace(/(https?:\/\/|www\.)\S+/gi, "")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function Avatar({ p, big }: { p: PersonProfile; big?: boolean }) {
  const cls = big ? "aspect-[4/5] w-full rounded-2xl text-7xl" : "h-16 w-16 shrink-0 rounded-full text-xl ring-2 ring-primary/30 ring-offset-2 ring-offset-surface";
  return p.photo_url
    ? <img src={p.photo_url} alt={p.name} loading="lazy" decoding="async" className={`${cls} object-cover`} />
    : <span className={`${cls} flex items-center justify-center bg-gradient-to-br from-primary to-primary/60 font-black text-primary-foreground`}>{initials(p.name)}</span>;
}

function Verified() {
  return <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary"><BadgeCheck size={12} /> Verified by Riloyd</span>;
}

function Fact({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return <div className="flex items-start gap-3 rounded-xl border border-border bg-background/60 p-4">
    <Icon size={18} className="mt-0.5 shrink-0 text-primary" />
    <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-soft">{label}</p><p className="mt-1 text-sm font-semibold break-words">{value}</p></div>
  </div>;
}

function Locked({ group }: { group: PersonGroup }) {
  return <div className="mt-9 border border-border bg-surface p-6 sm:p-8">
    <div className="flex items-center gap-3"><Lock className="text-primary" size={22} /><p className="font-extrabold">Sign in to view {peopleGroups[group].label.toLowerCase()}</p></div>
    <p className="mt-2 text-sm text-muted-foreground">Profiles are available to registered members only.</p>
    <AuthForm redirectPath={listRoutes[group]} />
  </div>;
}

export function ProfileGrid({ group }: { group: PersonGroup }) {
  const config = peopleGroups[group];
  const { session, ready } = useSession();
  const [rows, setRows] = useState<PersonProfile[] | null>(null);

  useEffect(() => {
    if (!session) { setRows(null); return; }
    supabase.from("people_profiles").select("*").eq("person_group", group).order("sort_order").order("name")
      .then(({ data }) => setRows((data as PersonProfile[]) ?? []));
  }, [session, group]);

  return <section className="border-b border-border py-14 sm:py-20">
    <div className="mx-auto max-w-[1380px] px-5 sm:px-6 lg:px-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow text-[10px] font-bold uppercase text-soft">Profiles</p><h2 className="mt-4 text-3xl font-black uppercase sm:text-5xl">{config.label}</h2></div>
        {session && <button type="button" onClick={() => supabase.auth.signOut()} className="flex items-center gap-1 text-xs text-muted-foreground"><LogOut size={13} /> Sign out</button>}
      </div>
      {!ready ? null : !session ? <Locked group={group} /> : rows === null ? <p className="mt-9 text-sm text-muted-foreground">Loading…</p> : rows.length === 0
        ? <p className="mt-9 text-sm text-muted-foreground">Profiles will be published here soon.</p>
        : <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => <Link key={p.id} to={profileRoutes[group]} params={{ slug: p.slug }} className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/30" />
            <div className="flex items-center gap-4"><Avatar p={p} /><div className="min-w-0"><h3 className="truncate text-lg font-extrabold">{p.name}</h3><p className="text-xs font-semibold text-primary">{p.role || config.singular}</p>{p.location && <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin size={11} /> {p.location}</p>}</div></div>
            <div className="mt-4"><Verified /></div>
            <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{redactContacts(p.summary) || `${config.singular} profile verified by Riloyd.`}</p>
            {p.focus.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{p.focus.slice(0, 3).map((f) => <span key={f} className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold">{f}</span>)}{p.focus.length > 3 && <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold">+{p.focus.length - 3}</span>}</div>}
            <span className="mt-auto inline-flex items-center gap-1 pt-5 text-xs font-bold text-primary">View full profile <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></span>
          </Link>)}
        </div>}
    </div>
  </section>;
}

export function ProfileDetail({ group, slug }: { group: PersonGroup; slug: string }) {
  const config = peopleGroups[group];
  const { session, ready } = useSession();
  const [profile, setProfile] = useState<PersonProfile | null | undefined>(undefined);

  useEffect(() => {
    if (!session) return;
    supabase.from("people_profiles").select("*").eq("person_group", group).eq("slug", slug).maybeSingle()
      .then(({ data }) => setProfile((data as PersonProfile | null) ?? null));
  }, [session, group, slug]);

  return <main className="bg-background text-foreground">
    <section className="border-b border-border py-14 sm:py-20">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-6">
        <Link to={listRoutes[group]} className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary"><ArrowLeft size={14} /> Back to {config.label}</Link>
        {!ready ? null : !session ? <Locked group={group} /> : profile === undefined ? <p className="mt-8 text-sm text-muted-foreground">Loading…</p> : profile === null ? <p className="mt-8 text-sm">Profile not found.</p> :
          <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-surface shadow-xl">
            <div className="h-2 bg-gradient-to-r from-primary via-primary/60 to-primary/20" />
            <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[260px_1fr]">
              <div><Avatar p={profile} big /><div className="mt-4 flex justify-center"><Verified /></div></div>
              <div className="min-w-0">
                <p className="eyebrow text-[10px] font-bold uppercase text-soft">{config.singular}</p>
                <h1 className="mt-3 text-4xl font-black uppercase leading-[.95] sm:text-5xl">{profile.name}</h1>
                <p className="mt-3 text-lg font-bold text-primary">{profile.role || config.singular}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Fact icon={Briefcase} label="Role" value={profile.role || config.singular} />
                  <Fact icon={MapPin} label="Location" value={profile.location || "Not specified"} />
                </div>
                {redactContacts(profile.summary) && <p className="mt-6 border-l-2 border-primary pl-4 text-base font-medium leading-relaxed">{redactContacts(profile.summary)}</p>}
                <h2 className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-wider"><Sparkles size={14} className="text-primary" /> About</h2>
                <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{redactContacts(profile.bio) || redactContacts(profile.summary) || "Detailed profile coming soon."}</p>
                {profile.focus.length > 0 && <><h2 className="mt-8 text-xs font-black uppercase tracking-wider">Areas of focus</h2>
                <div className="mt-3 flex flex-wrap gap-2">{profile.focus.map((f) => <span key={f} className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-bold">{f}</span>)}</div></>}
                <div className="mt-8 flex items-start gap-3 rounded-xl bg-muted p-4 text-xs text-muted-foreground"><ShieldCheck size={18} className="shrink-0 text-primary" /><p>This profile has been reviewed and verified by Riloyd. Personal contact details are kept private — all introductions are handled through Riloyd.</p></div>
                <Button asChild className="mt-6 rounded-full px-6 font-bold"><Link to="/contact">Request an introduction <ArrowRight size={15} /></Link></Button>
              </div>
            </div>
          </div>}
      </div>
    </section>
  </main>;
}
