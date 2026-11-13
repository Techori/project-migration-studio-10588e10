import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Download, FileText, RefreshCw, Save, Sheet, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { summarizeRegistration, type RegistrationAiSummary } from "@/lib/registration-ai.functions";
import { downloadRegistrationDocument, listInbox, reviewInbox } from "@/lib/inbox.functions";
import { reviewStatuses } from "@/lib/submission-schemas";
import { registrationConfigs, type RegistrationCategory } from "@/lib/registration-config";
import type { Database } from "@/integrations/supabase/types";
import { createInboxWorkbook, createSubmissionPdf } from "@/lib/submission-exports";
import { deliverFile } from "@/lib/file-download";

type Application = Database["public"]["Tables"]["registration_applications"]["Row"];
type Enquiry = Database["public"]["Tables"]["contact_submissions"]["Row"];
type Row = Application | Enquiry;
type Status = typeof reviewStatuses[number];
const selectClass = "h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground";

export function SubmissionsAdmin({ kind }: { kind: "applications" | "enquiries" }) {
  const list = useServerFn(listInbox);
  const review = useServerFn(reviewInbox);
  const download = useServerFn(downloadRegistrationDocument);
  const summarize = useServerFn(summarizeRegistration);
  const [ai, setAi] = useState<{ id: string; summary: RegistrationAiSummary | null; error: string | null; loading: boolean } | null>(null);
  const runSummary = async (id: string) => {
    setAi({ id, summary: null, error: null, loading: true });
    try { const result = await summarize({ data: { id } }); setAi({ id, ...result, loading: false }); }
    catch { setAi({ id, summary: null, error: "The AI summary could not be created.", loading: false }); }
  };
  const [rows, setRows] = useState<Row[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | RegistrationCategory>("all");
  const [pdf, setPdf] = useState<{ blob: Blob; name: string } | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excel, setExcel] = useState<Blob | null>(null);
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [status, setStatus] = useState<Status>("new");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setMessage("");
    try {
      const result = await list({ data: { kind, status: filter, category, page } });
      setRows(result.rows); setCount(result.count);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load submissions."); }
    finally { setLoading(false); }
  }, [list, kind, filter, category, page]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    let cancelled = false; setPdf(null);
    if (!selected) return;
    setPdfLoading(true);
    createSubmissionPdf(selected).then(blob => {
      if (!cancelled) setPdf({ blob, name: `${"application_code" in selected ? selected.application_code : selected.id}.pdf` });
    }).catch(() => { if (!cancelled) setMessage("The PDF could not be prepared. Reopen the entry to retry."); })
      .finally(() => { if (!cancelled) setPdfLoading(false); });
    return () => { cancelled = true; };
  }, [selected]);

  async function prepareExcel() {
    setExporting(true); setExcel(null); setMessage("");
    try {
      async function allRows(inboxKind: "applications" | "enquiries") {
        const result: Row[] = [];
        for (let index = 0; ; index++) {
          const batch = await list({ data: { kind: inboxKind, status: "all", category: "all", page: index } });
          result.push(...batch.rows);
          if (result.length >= batch.count || !batch.rows.length) break;
        }
        return result;
      }
      const [applications, enquiries] = await Promise.all([allRows("applications"), allRows("enquiries")]);
      setExcel(await createInboxWorkbook(applications, enquiries));
    } catch (error) { setMessage(error instanceof Error ? error.message : "Excel could not be prepared."); }
    finally { setExporting(false); }
  }

  async function save() {
    if (!selected) return;
    setBusy(true); setMessage("");
    try {
      await review({ data: { kind, id: selected.id, status, notes } });
      setExcel(null);
      setSelected(null); await load(); setMessage("Review saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save review."); }
    finally { setBusy(false); }
  }
  async function downloadDocument() {
    if (!selected) return;
    setBusy(true); setMessage("");
    try {
      const file = await download({ data: { id: selected.id } });
      await deliverFile(new Blob([new Uint8Array(file.bytes)], { type: file.type }), file.name);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not download document."); }
    finally { setBusy(false); }
  }
  const visible = rows.filter(row => `${"full_name" in row ? row.full_name : row.name} ${row.email} ${row.phone} ${"category" in row ? row.category + " " + row.application_code : row.service}`.toLowerCase().includes(search.toLowerCase()));
  const details = selected && "details" in selected && selected.details && typeof selected.details === "object" && !Array.isArray(selected.details) ? selected.details : {};
  const labels = selected && "category" in selected ? Object.fromEntries(registrationConfigs[selected.category as RegistrationCategory].sections.flatMap(section => section.fields.map(field => [field.name, field.label]))) : {};

  return <section className="mt-8">
    <h2 className="text-2xl font-black uppercase">{kind === "applications" ? "Registration applications" : "Contact enquiries"}</h2>
    <div className="my-5 flex flex-wrap items-center gap-3">
      <Input aria-label="Search current page" placeholder="Search current page" value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      <select aria-label="Filter review status" className={selectClass} value={filter} onChange={e => { setFilter(e.target.value as "all" | Status); setPage(0); }}><option value="all">All statuses</option>{reviewStatuses.map(value => <option key={value} value={value}>{value}</option>)}</select>
      <Button variant="outline" size="icon" title="Refresh inbox" aria-label="Refresh inbox" disabled={loading} onClick={() => void load()}><RefreshCw size={16} /></Button>
      <span className="text-sm text-muted-foreground">{count} submissions</span>
      {kind === "applications" && <select aria-label="Filter registration type" className={selectClass} value={category} onChange={e => { setCategory(e.target.value as "all" | RegistrationCategory); setPage(0); }}><option value="all">All registration types</option>{Object.values(registrationConfigs).map(config => <option key={config.category} value={config.category}>{config.title}</option>)}</select>}
      <Button variant="outline" disabled={exporting} onClick={() => void prepareExcel()}><Sheet size={16} /> {exporting ? "Preparing Excel…" : "Export all entries"}</Button>
      {excel && <Button onClick={() => void deliverFile(excel, "Riloyd-all-submissions.xlsx")}><Download size={16} /> Download Excel</Button>}
    </div>
    {message && <p role="status" className="mb-4 text-sm text-primary">{message}</p>}
    <div className="divide-y divide-border border border-border">
      {loading ? <p className="p-6 text-muted-foreground">Loading…</p> : !visible.length ? <p className="p-6 text-muted-foreground">No submissions found.</p> : visible.map(row => <div key={row.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0"><h3 className="font-bold">{"full_name" in row ? row.full_name : row.name}</h3><p className="break-all text-sm text-muted-foreground">{row.email} · {row.phone}</p><p className="mt-1 text-xs text-muted-foreground">{"category" in row ? `${row.category} · ${row.application_code}` : row.service} · {new Date(row.created_at).toLocaleString()}</p></div>
        <div className="flex items-center gap-4"><span className="text-xs font-bold uppercase text-primary">{row.status}</span><Button variant="outline" onClick={() => { setSelected(row); setStatus(row.status as Status); setNotes(row.admin_notes); setMessage(""); }}>Review</Button></div>
      </div>)}
    </div>
    <div className="mt-4 flex items-center justify-end gap-3"><Button variant="outline" size="icon" aria-label="Previous page" disabled={page === 0 || loading} onClick={() => setPage(page - 1)}><ArrowLeft size={16} /></Button><span className="text-sm">Page {page + 1}</span><Button variant="outline" size="icon" aria-label="Next page" disabled={(page + 1) * 25 >= count || loading} onClick={() => setPage(page + 1)}><ArrowRight size={16} /></Button></div>
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) setSelected(null); }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>{selected && ("full_name" in selected ? selected.full_name : selected.name)}</DialogTitle>
        <DialogDescription>{selected?.email} · {selected?.phone}</DialogDescription>
        <Button variant="outline" disabled={!pdf || pdfLoading} onClick={() => { if (pdf) void deliverFile(pdf.blob, pdf.name); }}><FileText size={16} /> {pdfLoading ? "Preparing PDF…" : "Download PDF"}</Button>
        {selected && "category" in selected ? <><p className="text-sm font-bold">{selected.category} · {selected.application_code}</p><div className="rounded-md border border-border bg-surface p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-bold">AI review summary</p><Button size="sm" variant="outline" disabled={ai?.id === selected.id && ai.loading} onClick={() => void runSummary(selected.id)}><Sparkles size={15} /> {ai?.id === selected.id && ai.loading ? "Summarising…" : ai?.id === selected.id && ai.summary ? "Regenerate" : "Summarise with AI"}</Button></div>{ai?.id === selected.id && ai.error && <p role="alert" className="mt-3 text-sm text-destructive">{ai.error}</p>}{ai?.id === selected.id && ai.summary && <div className="mt-3 grid gap-4 text-sm">{([["Key information", ai.summary.keyPoints], ["Missing or unclear details", ai.summary.missingDetails], ["Questions to ask before approval", ai.summary.reviewQuestions]] as const).map(([heading, items]) => <div key={heading}><p className="text-xs font-bold uppercase text-muted-foreground">{heading}</p>{items.length ? <ul className="mt-1 list-disc space-y-1 pl-5">{items.map(item => <li key={item}>{item}</li>)}</ul> : <p className="mt-1 text-muted-foreground">Nothing noted.</p>}</div>)}<p className="text-xs text-muted-foreground">AI-generated from the submitted form (contact details excluded). Verify before deciding.</p></div>}</div><dl className="grid gap-3">{Object.entries(details).filter(([key]) => key !== "consent").map(([key, value]) => <div key={key} className="border-b border-border pb-3"><dt className="text-xs font-bold text-muted-foreground">{labels[key] ?? key}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm">{Array.isArray(value) ? value.join(", ") : String(value ?? "")}</dd></div>)}</dl>{selected.document_path && <Button variant="outline" disabled={busy} onClick={() => void downloadDocument()}><Download size={16} /> {selected.document_name}</Button>}</> : selected ? <dl className="space-y-3"><div><dt className="text-xs text-muted-foreground">Service / Industry</dt><dd>{selected.service} · {selected.industry}</dd></div><div><dt className="text-xs text-muted-foreground">Message</dt><dd className="whitespace-pre-wrap break-words">{selected.message}</dd></div></dl> : null}
        <div className="grid gap-2"><Label htmlFor={`${kind}-status`}>Review status</Label><select id={`${kind}-status`} className={selectClass} value={status} onChange={e => setStatus(e.target.value as Status)}>{reviewStatuses.map(value => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="grid gap-2"><Label htmlFor={`${kind}-notes`}>Private admin notes</Label><Textarea id={`${kind}-notes`} value={notes} maxLength={4000} onChange={e => setNotes(e.target.value)} /></div>
        {message && <p role="alert" className="text-sm text-primary">{message}</p>}
        <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setSelected(null)}><X size={16} /> Cancel</Button><Button disabled={busy} onClick={() => void save()}><Save size={16} /> {busy ? "Saving…" : "Save review"}</Button></div>
      </DialogContent>
    </Dialog>
  </section>;
}