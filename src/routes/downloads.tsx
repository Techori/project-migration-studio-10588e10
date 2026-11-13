import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useServerFn } from "@tanstack/react-start";
import { Download, FileCheck, FileText, Lock, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findReport } from "@/lib/reports.functions";
import { reportCategories } from "@/lib/report-schemas";

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

export const Route = createFileRoute("/downloads")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Downloads | Riloyd Business Reports & Research" },
    { name: "description", content: "Retrieve your Riloyd business reports, valuation reports, research and documents using your report number and publish date." },
    { property: "og:title", content: "Downloads | Riloyd Business Reports & Research" },
    { property: "og:description", content: "Access your Riloyd reports and documents with matching report details." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: "/downloads" }] }), component: DownloadsPage,
});

function DownloadsPage() {
  const { session, ready } = useSession();
  const lookup = useServerFn(findReport);
  const [reportNumber, setNumber] = useState(""); const [publishDate, setDate] = useState("");
  const [result, setResult] = useState<{ title: string; name: string; url: string } | null>(null);
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function search(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(""); setResult(null);
    try {
      const response = await lookup({ data: { reportNumber, publishDate } });
      if (response.found) setResult(response); else setMessage("No report found with these details. Check both the report number and publish date.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "The report could not be found."); }
    finally { setBusy(false); }
  }
  return <main className="min-h-[65vh] bg-background px-5 py-14 text-foreground sm:px-6 lg:px-12">
    <div className="mx-auto max-w-[1100px]">
      <p className="eyebrow text-xs font-bold uppercase">Riloyd documents</p>
      <h1 className="mt-4 text-4xl font-black uppercase sm:text-5xl">Downloads</h1>
      {!ready ? null : !session ? (
        <div className="mt-10 max-w-xl border border-border bg-surface p-6 sm:p-8">
          <div className="flex items-center gap-3"><Lock className="text-primary" size={22} /><p className="font-extrabold">Sign in to download reports</p></div>
          <p className="mt-2 text-sm text-muted-foreground">Report downloads are available to registered members only. Sign in, then enter your report number and publish date.</p>
          <AuthForm redirectPath="/downloads" />
        </div>
      ) : (
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="text-2xl font-bold">Your business reports</h2>
          <div className="mt-6 divide-y divide-border">{Object.values(reportCategories).map(title => <div key={title} className="flex items-center gap-3 py-5 text-sm"><FileText size={20} className="shrink-0 text-primary" />{title}</div>)}</div>
          <div className="mt-8 border border-border bg-card p-6">
            <h3 className="text-lg font-bold uppercase text-card-foreground">Our research &amp; analysis</h3>
            <p className="mt-2 text-sm leading-relaxed text-card-foreground">Explore Riloyd's studies of startups, businesses and ideas before downloading your reports.</p>
            <Button asChild variant="outline" className="mt-4"><Link to="/research">View research &amp; analysis</Link></Button>
          </div>
        </div>
        <div className="border-y border-border py-6">
          <form onSubmit={event => void search(event)} className="grid gap-5">
            <div className="grid gap-2"><Label htmlFor="download-number">Report number</Label><Input id="download-number" value={reportNumber} required maxLength={100} onChange={event => { setNumber(event.target.value); setResult(null); setMessage(""); }} /></div>
            <div className="grid gap-2"><Label htmlFor="download-date">Publish date</Label><Input id="download-date" type="date" value={publishDate} required onChange={event => { setDate(event.target.value); setResult(null); setMessage(""); }} /></div>
            <Button type="submit" disabled={busy} className="justify-self-start"><Search size={16} />{busy ? "Finding report…" : "Find report"}</Button>
          </form>
          {message && <p role="alert" className="mt-5 text-sm text-primary">{message}</p>}
          {result && <div className="mt-8 border-t border-border pt-6"><h3 className="flex items-center gap-2 font-bold"><FileCheck size={18} className="text-primary" />{result.title}</h3><p className="my-3 break-all text-sm text-muted-foreground">{result.name}</p><Button asChild><a href={result.url}><Download size={16} /> Download report</a></Button></div>}
        </div>
      </div>
      )}
    </div>
  </main>;
}