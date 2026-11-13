import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, Download, Eye, RefreshCw, Search, Check, X, Shield, AlertTriangle, Sparkles, ShieldCheck, Pencil, Sheet } from "lucide-react";
import { EducationSupportForm } from "./education-support-form";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { listEducationSupport, reviewEducationSupport, getEducationPrivateDetails, runEducationChecks, confirmEducationChecks, getEducationRegistrationForEdit, syncEducationSheet } from "@/lib/education-support.functions";
import { approvalBlocker, flagCounts, flagFieldLabels, type ReviewFlag } from "@/lib/education-support/flags";
import { stateCodes } from '@/lib/education-support/numbering';
import { applicationTypeKeys, applicationTypes, paymentStatuses, paymentStatusLabels, registrationStatuses, registrationStatusLabels, studentCategories, type ApplicationType, type StudentCategory } from "@/lib/education-support/rules";

const categoryLabels: Record<StudentCategory, string> = { school: "School", ug: "UG", pg: "PG" };
type Filters = { search: string; category: StudentCategory | ""; applicationType: ApplicationType | ""; paymentStatus: (typeof paymentStatuses)[number] | ""; flags: "" | "flagged" | "unconfirmed" };
const selectClass = "h-9 rounded-md border border-border bg-background px-2 text-sm";

function csvCell(v: unknown) { const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v); return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s; }

export function EducationSupportAdmin() {
  const [page, setPage] = useState(0);
  const [draft, setDraft] = useState("");
  const [filters, setFilters] = useState<Filters>({ search: "", category: "", applicationType: "", paymentStatus: "", flags: "" });
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [exportFile, setExportFile] = useState<{ url: string; name: string } | null>(null);
  const [details, setDetails] = useState<Record<string, string> | null>(null);
  const [detailsBusy, setDetailsBusy] = useState(false);
  const privateDetails = useServerFn(getEducationPrivateDetails);
  const runChecks = useServerFn(runEducationChecks);
  const confirmChecks = useServerFn(confirmEducationChecks);
  const [checkedEveryFlag, setCheckedEveryFlag] = useState(false);
  const [confirmNote, setConfirmNote] = useState("");
  const list = useServerFn(listEducationSupport);
  const loadForEdit = useServerFn(getEducationRegistrationForEdit);
  const syncSheet = useServerFn(syncEducationSheet);
  const [editing, setEditing] = useState<{ id: string; values: Record<string, string | boolean> } | null>(null);
  const syncMutation = useMutation({
    mutationFn: () => syncSheet(),
    onSuccess: async r => { await queryClient.invalidateQueries({ queryKey: ["admin-education-support"] }); toast.success(`Google Sheet sync: ${r.imported} added to the database, ${r.appended} added to the sheet.`); if (r.skipped.length) toast.warning(`${r.skipped.length} sheet row(s) skipped: ${r.skipped.slice(0, 3).map(x => `${x.ackNumber} (${x.reason})`).join("; ")}`); },
    onError: e => toast.error(e.message),
  });
  const review = useServerFn(reviewEducationSupport);
  const queryClient = useQueryClient();
  const params = { page, ...(filters.search ? { search: filters.search } : {}), ...(filters.category ? { category: filters.category } : {}), ...(filters.applicationType ? { applicationType: filters.applicationType } : {}), ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}), ...(filters.flags ? { flags: filters.flags } : {}) };
  const query = useQuery({ queryKey: ["admin-education-support", params], queryFn: () => list({ data: params }) });
  const mutation = useMutation({
    mutationFn: (data: { id: string; status?: (typeof registrationStatuses)[number]; paymentStatus?: (typeof paymentStatuses)[number]; reason?: string; approvalStatus?: 'pending'|'approved'|'rejected' }) => review({ data }),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["admin-education-support"] }); toast.success("Registration updated."); },
    onError: e => toast.error(e.message),
  });
  const checksMutation = useMutation({
    mutationFn: (data: { id: string; ai: boolean }) => runChecks({ data }),
    onSuccess: async r => { setCheckedEveryFlag(false); await queryClient.invalidateQueries({ queryKey: ["admin-education-support"] }); if (r.aiError) toast.warning(r.aiError); else toast.success(r.count ? `${r.count} flag${r.count === 1 ? "" : "s"} to review.` : "No mismatches found."); },
    onError: e => toast.error(e.message),
  });
  const confirmMutation = useMutation({
    mutationFn: (id: string) => confirmChecks({ data: { id, note: confirmNote, checkedEveryFlag: true } }),
    onSuccess: async () => { setCheckedEveryFlag(false); setConfirmNote(""); await queryClient.invalidateQueries({ queryKey: ["admin-education-support"] }); toast.success("Check confirmed. You can now approve or reject."); },
    onError: e => toast.error(e.message),
  });
  const exportMutation = useMutation({
    mutationFn: async (format: 'csv'|'xlsx') => {
      const rows: Record<string, unknown>[] = [];
      for (let p = 0; ; p++) { const r = await list({ data: { ...params, page: p, all: true } }); rows.push(...r.rows); if (rows.length >= r.count || r.rows.length === 0) break; }
      const cols = Object.keys(rows[0] ?? { ack_number: '' });
      let blob: Blob;
      if (format === 'csv') { const safeCell = (v: unknown) => csvCell(typeof v === 'string' && /^[=+@-]/.test(v) ? `'${v}` : v); blob = new Blob(['\ufeff' + [cols.join(','), ...rows.map(r => cols.map(c => safeCell(r[c])).join(','))].join('\n')], { type: 'text/csv;charset=utf-8' }); }
      else { const ExcelJS = await import('exceljs'); const book = new ExcelJS.Workbook(); const sheet = book.addWorksheet('Registrations'); sheet.addRow(cols); rows.forEach(r => sheet.addRow(cols.map(c => typeof r[c] === 'object' ? JSON.stringify(r[c]) : r[c]))); sheet.views = [{ state: 'frozen', ySplit: 1 }]; sheet.getRow(1).font = { bold: true }; sheet.columns.forEach(c => { c.width = 24; }); const buffer = await book.xlsx.writeBuffer(); blob = new Blob([new Uint8Array(buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); }
      return { blob, format };
    },
    onSuccess: r => {
      if (exportFile) URL.revokeObjectURL(exportFile.url);
      setExportFile({ url: URL.createObjectURL(r.blob), name: `education-support-${new Date().toISOString().slice(0,10)}.${r.format}` });
    },
    onError: e => toast.error(e.message),
  });
  const row = query.data?.rows.find(r => r.id === selected);
  const setFilter = (patch: Partial<Filters>) => { setFilters(f => ({ ...f, ...patch })); setPage(0); setSelected(null); };

  return <section className="mt-8">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-bold">Education Support registrations</h2>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => exportMutation.mutate('csv')} disabled={exportMutation.isPending}><Download /> Export CSV</Button>
        <Button variant="outline" onClick={() => exportMutation.mutate('xlsx')} disabled={exportMutation.isPending}><Download /> {exportMutation.isPending ? 'Preparing…' : 'Prepare Excel'}</Button>
        {exportFile && <Button asChild><a href={exportFile.url} download={exportFile.name}><Download />Download {exportFile.name.endsWith('xlsx') ? 'Excel' : 'CSV'}</a></Button>}
        <Button variant="outline" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}><Sheet /> {syncMutation.isPending ? "Syncing…" : "Sync Google Sheet"}</Button>
        <Button variant="outline" size="icon" aria-label="Refresh education support registrations" onClick={() => query.refetch()}><RefreshCw /></Button>
      </div>
    </div>
    <form className="mt-4 flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); setFilter({ search: draft.trim() }); }}>
      <label className="sr-only" htmlFor="edu-admin-search">Search</label>
      <input id="edu-admin-search" value={draft} onChange={e => setDraft(e.target.value)} placeholder="Acknowledgement no., name, mobile or email" className="h-9 min-w-64 flex-1 rounded-md border border-border bg-background px-3 text-sm" />
      <Button type="submit" variant="outline" size="icon" aria-label="Search"><Search /></Button>
      <select aria-label="Student category" className={selectClass} value={filters.category} onChange={e => setFilter({ category: e.target.value as Filters["category"] })}><option value="">All categories</option>{studentCategories.map(c => <option key={c} value={c}>{categoryLabels[c]}</option>)}</select>
      <select aria-label="Applied for" className={selectClass} value={filters.applicationType} onChange={e => setFilter({ applicationType: e.target.value as Filters["applicationType"] })}><option value="">All applications</option>{applicationTypeKeys.map(k => <option key={k} value={k}>{applicationTypes[k].en}</option>)}</select>
      <select aria-label="Payment status" className={selectClass} value={filters.paymentStatus} onChange={e => setFilter({ paymentStatus: e.target.value as Filters["paymentStatus"] })}><option value="">All payments</option>{paymentStatuses.map(p => <option key={p} value={p}>{paymentStatusLabels[p]}</option>)}</select>
      <select aria-label="Mismatch flags" className={selectClass} value={filters.flags} onChange={e => setFilter({ flags: e.target.value as Filters["flags"] })}><option value="">All flags</option><option value="flagged">With mismatch flags</option><option value="unconfirmed">Not yet confirmed by a person</option></select>
    </form>
    {query.error && <p role="alert" className="mt-4">{query.error.message}</p>}
    {query.isPending && <p className="mt-4">Loading registrations…</p>}
    <p className="mt-4 text-sm text-muted-foreground">{query.data?.count ?? 0} registrations · Payment status changes to confirmed only when you mark it after checking Zoho Checkout payments.</p>
    <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[1040px] text-left text-sm">
      <thead className="border-b border-border bg-surface"><tr>{["Ack. no.", "Student", "Category", "Class / course", "Applied for", "Payment", "Flags", "Status", ""].map(h => <th key={h} className="px-3 py-3 font-bold">{h}</th>)}</tr></thead>
      <tbody>{query.data?.rows.map(r => <tr key={r.id} className="border-b border-border">
        <td className="whitespace-nowrap px-3 py-3 text-xs font-semibold">{r.ack_number}</td>
        <td className="px-3 py-3">{r.student_name}<br /><span className="text-xs text-muted-foreground">{r.mobile}</span></td>
        <td className="px-3 py-3">{categoryLabels[r.student_category as StudentCategory] ?? r.student_category}</td>
        <td className="max-w-48 px-3 py-3">{r.current_class ? `Class ${r.current_class}` : r.course_name}<br /><span className="text-xs text-muted-foreground">{r.education_sector ?? ""}</span></td>
        <td className="px-3 py-3">{applicationTypes[r.application_type as ApplicationType]?.en ?? r.application_type}<br /><span className="text-xs text-muted-foreground">₹{r.registration_fee}</span></td>
        <td className="px-3 py-3 text-xs">{paymentStatusLabels[r.payment_status as keyof typeof paymentStatusLabels] ?? r.payment_status}{r.payment_reference && <><br /><span className="font-mono">{r.payment_reference}</span></>}</td>
        <td className="px-3 py-3 text-xs"><FlagBadge flags={r.review_flags as ReviewFlag[]} confirmed={Boolean(r.flags_confirmed_at)} /></td>
        <td className="px-3 py-3 text-xs">{r.form_status === "started" ? <strong className="text-destructive">Form not finished</strong> : registrationStatusLabels[r.status as keyof typeof registrationStatusLabels] ?? r.status}<br /><strong>{r.approval_status}</strong>{r.employee_verified_at && <><br /><span className="text-primary">Verified by employee</span></>}</td>
        <td className="px-3 py-3"><Button variant="outline" size="icon" aria-label={`View ${r.ack_number}`} onClick={() => { setSelected(r.id); setReason(r.status_reason); setDetails(null); setCheckedEveryFlag(false); setConfirmNote(""); }}><Eye /></Button></td>
      </tr>)}</tbody>
    </table></div>
    {!query.isPending && !query.error && query.data?.count === 0 && <p className="py-8 text-sm text-muted-foreground">No registrations yet.</p>}
    <div className="mt-4 flex items-center gap-3">
      <Button variant="outline" size="icon" aria-label="Previous registrations" disabled={page === 0} onClick={() => { setPage(page - 1); setSelected(null); }}><ChevronLeft /></Button>
      <span>Page {page + 1}</span>
      <Button variant="outline" size="icon" aria-label="Next registrations" disabled={(page + 1) * 20 >= (query.data?.count ?? 0)} onClick={() => { setPage(page + 1); setSelected(null); }}><ChevronRight /></Button>
    </div>

    {row && <div className="mt-8 border-t border-border pt-6">
      <h3 className="text-lg font-bold">{row.ack_number} · {row.student_name}</h3>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button disabled={mutation.isPending || Boolean(approvalBlocker(row))} title={approvalBlocker(row) ?? undefined} onClick={() => mutation.mutate({ id: row.id, approvalStatus: 'approved', reason })}><Check />Approve registration</Button>
        <Button variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: row.id, approvalStatus: 'rejected', reason })}><X />Reject registration</Button>
        <Button variant="outline" disabled={detailsBusy} onClick={() => { setDetailsBusy(true); void privateDetails({ data: { id: row.id } }).then(r => setDetails(r.details)).catch(e => toast.error(e.message)).finally(() => setDetailsBusy(false)); }}><Shield />View private bank & KYC</Button>
        <Button variant="outline" onClick={() => { void loadForEdit({ data: { id: row.id } }).then(r => setEditing({ id: row.id, values: r.values })).catch(e => toast.error(e.message)); }}><Pencil />Edit registration</Button>
      </div>
      {row.employee_verified_at && <p className="mt-3 text-sm">Verified by employee on {new Date(row.employee_verified_at).toLocaleString("en-IN")}{row.employee_verification_note ? ` — ${row.employee_verification_note}` : ""}</p>}
      {editing?.id === row.id && <div className="mt-6"><EducationSupportForm lang="en" adminEdit={{ id: row.id, values: editing.values, onCancel: () => setEditing(null), onDone: () => { setEditing(null); toast.success("Registration saved."); void queryClient.invalidateQueries({ queryKey: ["admin-education-support"] }); } }} /></div>}
      {approvalBlocker(row) && row.approval_status !== "approved" && <p className="mt-2 text-sm text-muted-foreground">Approval locked: {approvalBlocker(row)}</p>}
      <ReviewChecks row={row} busy={checksMutation.isPending || confirmMutation.isPending} checkedEveryFlag={checkedEveryFlag} setCheckedEveryFlag={setCheckedEveryFlag} note={confirmNote} setNote={setConfirmNote}
        onRun={ai => checksMutation.mutate({ id: row.id, ai })} onConfirm={() => confirmMutation.mutate(row.id)} />
      {details && <dl className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(details).map(([k,v]) => <div key={k}><dt className="font-bold">{k}</dt><dd className="break-all">{v}</dd></div>)}{Object.keys(details).length === 0 && <p>Not collected for this earlier registration.</p>}<Button variant="outline" onClick={() => setDetails(null)}>Hide private details</Button></dl>}
      <div className="mt-4 grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-3">
        <label className="text-sm font-semibold">Payment
          <select className={`${selectClass} mt-1 w-full`} value={row.payment_status} disabled={mutation.isPending} onChange={e => mutation.mutate({ id: row.id, paymentStatus: e.target.value as (typeof paymentStatuses)[number] })}>{paymentStatuses.map(p => <option key={p} value={p}>{paymentStatusLabels[p]}</option>)}</select>
        </label>
        <label className="text-sm font-semibold">Registration status
          <select className={`${selectClass} mt-1 w-full`} value={row.status} disabled={mutation.isPending} onChange={e => mutation.mutate({ id: row.id, status: e.target.value as (typeof registrationStatuses)[number], reason })}>{registrationStatuses.map(s => <option key={s} value={s}>{registrationStatusLabels[s]}</option>)}</select>
        </label>
        <form className="text-sm font-semibold" onSubmit={e => { e.preventDefault(); mutation.mutate({ id: row.id, status: row.status as (typeof registrationStatuses)[number], reason }); }}>Reason / note
          <div className="mt-1 flex gap-2"><input value={reason} maxLength={500} onChange={e => setReason(e.target.value)} className="h-9 flex-1 rounded-md border border-border bg-background px-2 font-normal" /><Button type="submit" size="sm" variant="outline" disabled={mutation.isPending}>Save</Button></div>
        </form>
      </div>
      <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        {([["Category", categoryLabels[row.student_category as StudentCategory]], ["Education", Object.entries((row.education ?? {}) as Record<string, string>).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(" · ")], ["Education sector", row.education_sector ?? "—"], ["Father / mother", `${row.father_name} / ${row.mother_name}`], ["Date of birth", `${row.date_of_birth}${row.is_minor ? " (minor)" : ""}`], ["Gender / nationality", `${row.gender} / ${row.nationality}`], ["Mobile / WhatsApp", `${row.mobile} / ${row.whatsapp ?? "—"}`], ["Email", row.email], ["Permanent address", row.permanent_address], ["Current address", `${row.current_address}, ${row.city}, ${row.district}, ${row.state} – ${row.pin_code}`],
          ...(row.is_minor ? [["Guardian", `${row.guardian_name ?? "—"} (${row.guardian_relationship ?? "—"}) · ${row.guardian_mobile ?? ""} ${row.guardian_email ?? ""}`], ["Guardian consent", row.guardian_consent_at ? new Date(row.guardian_consent_at).toLocaleString("en-IN") : "—"]] : []),
          ["Coordinator", row.without_coordinator ? "Registered without a coordinator" : Object.entries((row.coordinator ?? {}) as Record<string, string>).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(" · ")], ["Coordinator code", row.coordinator_code ?? "—"],
          ["Applied for", `${applicationTypes[row.application_type as ApplicationType]?.en ?? row.application_type} · ₹${row.registration_fee}`], ["Payment ID", row.payment_reference ? `${row.payment_reference} (${row.payment_reference_at ? new Date(row.payment_reference_at).toLocaleString("en-IN") : ""})` : "Not shared yet"], ["Registered", new Date(row.created_at).toLocaleString("en-IN")]] as [string, string][]).map(([k, v]) => <div key={k}><dt className="font-bold text-primary">{k}</dt><dd className="mt-0.5 whitespace-pre-wrap break-words">{v}</dd></div>)}
      </dl>
    </div>}
    <details className="mt-8 border-t border-border pt-4"><summary className="cursor-pointer font-semibold">State / UT acknowledgement codes</summary><div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">{stateCodes.map(s => <p key={s.code}>{s.code} · {s.name}</p>)}</div><p className="mt-3 text-sm text-muted-foreground">Districts receive a permanent two-digit code on first registration within their state. Student serial numbers are global and do not reset daily. Earlier acknowledgement numbers remain valid.</p></details>
  </section>;
}


function FlagBadge({ flags, confirmed }: { flags: ReviewFlag[]; confirmed: boolean }) {
  const { high, medium } = flagCounts(flags ?? []);
  return <span className="inline-flex flex-col gap-1">
    {high + medium === 0 ? <span className="text-muted-foreground">None</span> : <span className="inline-flex items-center gap-1 font-semibold"><AlertTriangle className="size-3.5 text-destructive" />{high > 0 && <span className="text-destructive">{high} high</span>}{medium > 0 && <span>{high > 0 ? " · " : ""}{medium} check</span>}</span>}
    <span className={confirmed ? "text-primary" : "text-muted-foreground"}>{confirmed ? "Confirmed" : "Not confirmed"}</span>
  </span>;
}

type CheckRow = { review_flags: unknown; ai_review: string; flags_checked_at: string | null; flags_confirmed_at: string | null; flags_confirm_note: string };
function ReviewChecks({ row, busy, checkedEveryFlag, setCheckedEveryFlag, note, setNote, onRun, onConfirm }: { row: CheckRow; busy: boolean; checkedEveryFlag: boolean; setCheckedEveryFlag: (v: boolean) => void; note: string; setNote: (v: string) => void; onRun: (ai: boolean) => void; onConfirm: () => void }) {
  const flags = (row.review_flags ?? []) as ReviewFlag[];
  return <div className="mt-6 rounded-lg border border-border p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h4 className="font-bold">Mismatch check</h4><p className="text-xs text-muted-foreground">Name, class, payment and coordinator code. {row.flags_checked_at ? `Last checked ${new Date(row.flags_checked_at).toLocaleString("en-IN")}.` : "Not checked yet."}</p></div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled={busy} onClick={() => onRun(false)}><RefreshCw />Re-check rules</Button>
        <Button size="sm" disabled={busy} onClick={() => onRun(true)}><Sparkles />{busy ? "Checking…" : "Check with AI"}</Button>
      </div>
    </div>
    {flags.length === 0 ? <p className="mt-3 text-sm">{row.flags_checked_at ? "No mismatches found." : "Run the check to look for mismatches."}</p> :
      <ul className="mt-3 divide-y divide-border">{flags.map((f, i) => <li key={i} className="flex gap-3 py-2 text-sm">
        <AlertTriangle className={`mt-0.5 size-4 shrink-0 ${f.severity === "high" ? "text-destructive" : "text-muted-foreground"}`} />
        <span><strong>{flagFieldLabels[f.field] ?? f.field}</strong> · {f.severity === "high" ? "High" : "Check"}{f.source === "ai" ? " · AI" : ""}<br />{f.message}</span>
      </li>)}</ul>}
    {row.ai_review && <p className="mt-3 rounded-md bg-surface p-3 text-sm"><Sparkles className="mr-1 inline size-3.5" />AI note: {row.ai_review}</p>}
    <p className="mt-2 text-xs text-muted-foreground">Flags are suggestions only. AI sees names, class/course, age and fee type — never contact, bank account or Aadhaar details.</p>
    <div className="mt-4 border-t border-border pt-4">
      {row.flags_confirmed_at ? <p className="flex items-center gap-2 text-sm font-semibold text-primary"><ShieldCheck className="size-4" />Confirmed by a person on {new Date(row.flags_confirmed_at).toLocaleString("en-IN")}{row.flags_confirm_note ? ` — ${row.flags_confirm_note}` : ""}</p> :
        <form className="grid gap-3" onSubmit={e => { e.preventDefault(); onConfirm(); }}>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={checkedEveryFlag} onChange={e => setCheckedEveryFlag(e.target.checked)} />I have personally checked {flags.length ? "every flag above" : "this registration"} against the student's details and the Zoho payment.</label>
          <input aria-label="Confirmation note" value={note} maxLength={500} onChange={e => setNote(e.target.value)} placeholder="Note (optional), e.g. bank account is in father's name — verified" className="h-9 rounded-md border border-border bg-background px-2 text-sm" />
          <Button type="submit" variant="outline" className="justify-self-start" disabled={busy || !checkedEveryFlag || !row.flags_checked_at}><ShieldCheck />Confirm check</Button>
        </form>}
    </div>
  </div>;
}
