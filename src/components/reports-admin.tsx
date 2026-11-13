import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { listReports, setReportActive, uploadReport } from "@/lib/reports.functions";
import { reportCategories } from "@/lib/report-schemas";
import type { Database } from "@/integrations/supabase/types";
type Report = Database["public"]["Tables"]["customer_reports"]["Row"];

export function ReportsAdmin() {
  const list = useServerFn(listReports); const upload = useServerFn(uploadReport); const setActive = useServerFn(setReportActive);
  const [rows, setRows] = useState<Report[]>([]); const [busy, setBusy] = useState(false); const [loading, setLoading] = useState(true); const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    try { setRows(await list()); } catch (error) { setMessage(error instanceof Error ? error.message : "Reports could not be loaded."); }
    finally { setLoading(false); }
  }, [list]);
  useEffect(() => { void load(); }, [load]);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; setBusy(true); setMessage("");
    try { await upload({ data: new FormData(form) }); form.reset(); await load(); setMessage("Report uploaded."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Report upload failed."); }
    finally { setBusy(false); }
  }
  async function toggle(row: Report, active: boolean) {
    setBusy(true); setMessage("");
    try { await setActive({ data: { id: row.id, active } }); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Report status could not be changed."); }
    finally { setBusy(false); }
  }
  return <section className="mt-8">
    <h2 className="text-2xl font-black uppercase">Customer reports</h2>
    <form onSubmit={event => void save(event)} className="mt-6 grid gap-4 border-y border-border py-6 sm:grid-cols-2">
      <div className="grid gap-2"><Label htmlFor="report-title">Report title</Label><Input id="report-title" name="title" required maxLength={200} /></div>
      <div className="grid gap-2"><Label htmlFor="report-category">Report type</Label><select id="report-category" name="category" className="h-10 rounded-md border border-input bg-background px-3 text-sm">{Object.entries(reportCategories).map(([key, title]) => <option key={key} value={key}>{title}</option>)}</select></div>
      <div className="grid gap-2"><Label htmlFor="report-number">Report number</Label><Input id="report-number" name="reportNumber" required maxLength={100} /></div>
      <div className="grid gap-2"><Label htmlFor="report-date">Publish date</Label><Input id="report-date" name="publishDate" type="date" required /></div>
      <div className="grid gap-2 sm:col-span-2"><Label htmlFor="report-file">Report file · PDF, DOCX, XLSX, PPTX · up to 20MB</Label><Input id="report-file" name="file" type="file" accept=".pdf,.docx,.xlsx,.pptx" required /></div>
      <Button type="submit" disabled={busy} className="justify-self-start"><Upload size={16} /> {busy ? "Saving…" : "Upload report"}</Button>
    </form>
    {message && <p role="status" className="my-4 text-sm text-primary">{message}</p>}
    <div className="mt-6 divide-y divide-border">{loading ? <p className="py-5 text-muted-foreground">Loading…</p> : !rows.length ? <p className="py-5 text-muted-foreground">No reports uploaded yet.</p> : rows.map(row => <div key={row.id} className="flex flex-wrap items-center justify-between gap-4 py-5"><div className="min-w-0"><h3 className="flex items-center gap-2 font-bold"><FileText size={16} /> {row.title}</h3><p className="mt-2 break-words text-sm text-muted-foreground">{row.report_number} · {row.publish_date} · {reportCategories[row.category as keyof typeof reportCategories]}</p><p className="mt-1 break-all text-xs text-muted-foreground">{row.file_name} · {(row.file_size / 1_000_000).toFixed(2)} MB</p></div><div className="flex items-center gap-3"><Label htmlFor={`report-active-${row.id}`}>{row.active ? "Available" : "Withdrawn"}</Label><Switch id={`report-active-${row.id}`} checked={row.active} disabled={busy} onCheckedChange={active => void toggle(row, active)} /></div></div>)}</div>
  </section>;
}