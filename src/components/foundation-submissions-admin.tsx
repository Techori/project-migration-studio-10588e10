import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, CheckCheck, ChevronLeft, ChevronRight, Eye, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { listFoundationSubmissions, reviewFoundationSubmission } from "@/lib/foundation.functions";
import { foundationKindLabels, foundationKinds, type FoundationKind } from "@/lib/foundation";
import { foundationFormFields } from "./foundation-form";

type ReviewStatus = "reviewed" | "approved" | "rejected";

const fieldLabels: Record<string, string> = { message: "Message" };
for (const fields of Object.values(foundationFormFields)) for (const f of fields) fieldLabels[f.name] = f.label;

function detailEntries(details: unknown): [string, string][] {
  if (!details || typeof details !== "object" || Array.isArray(details)) return [];
  return Object.entries(details as Record<string, unknown>).map(([k, v]) => [fieldLabels[k] ?? k, String(v ?? "")]);
}

export function FoundationSubmissionsAdmin() {
  const [page, setPage] = useState(0);
  const [kind, setKind] = useState<FoundationKind | "">("");
  const [selected, setSelected] = useState<string | null>(null);
  const list = useServerFn(listFoundationSubmissions);
  const review = useServerFn(reviewFoundationSubmission);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin-foundation-submissions", page, kind], queryFn: () => list({ data: { page, ...(kind ? { kind } : {}) } }) });
  const mutation = useMutation({
    mutationFn: (data: { id: string; status: ReviewStatus }) => review({ data }),
    onSuccess: async result => { await queryClient.invalidateQueries({ queryKey: ["admin-foundation-submissions"] }); toast.success(`Marked ${result.status}.`); },
    onError: error => toast.error(error.message),
  });
  const row = query.data?.rows.find(r => r.id === selected);
  const label = (k: string) => foundationKindLabels[k as FoundationKind] ?? k;

  return <section className="mt-8">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 className="text-xl font-bold">RILOYD Foundation forms</h2>
      <div className="flex items-center gap-2">
        <label className="text-sm">
          <span className="sr-only">Filter by form type</span>
          <select value={kind} onChange={e => { setKind(e.target.value as FoundationKind | ""); setPage(0); setSelected(null); }} className="h-9 rounded-md border border-border bg-background px-3 text-sm">
            <option value="">All forms</option>
            {foundationKinds.map(k => <option key={k} value={k}>{foundationKindLabels[k]}</option>)}
          </select>
        </label>
        <Button variant="outline" size="icon" aria-label="Refresh Foundation forms" onClick={() => query.refetch()}><RefreshCw /></Button>
      </div>
    </div>
    {query.error && <p role="alert" className="mt-4">{query.error.message}</p>}
    {query.isPending && <p className="mt-4">Loading Foundation forms…</p>}
    <p className="mt-4 text-sm text-muted-foreground">{query.data?.count ?? 0} forms · Scholarship, school fee, volunteer, partner, donation pledge, assistance and contact. Donation pledges are promises only — no money was collected.</p>
    <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm">
      <thead className="border-b border-border bg-surface text-foreground"><tr>{["Received", "Form", "Name", "Contact", "Coordinator", "Status", "Review"].map(h => <th key={h} className="px-3 py-3 font-bold">{h}</th>)}</tr></thead>
      <tbody>{query.data?.rows.map(r => <tr key={r.id} className="border-b border-border">
        <td className="whitespace-nowrap px-3 py-4 text-xs">{new Date(r.created_at).toLocaleString("en-IN")}</td>
        <td className="px-3 py-4 font-semibold">{label(r.kind)}</td>
        <td className="px-3 py-4">{r.full_name}</td>
        <td className="px-3 py-4">{r.email}<br /><span className="text-xs text-muted-foreground">{r.phone}</span></td>
        <td className="px-3 py-4 text-xs">{r.coordinator_code ?? "—"}</td>
        <td className="px-3 py-4 capitalize" aria-live="polite">{r.status}</td>
        <td className="px-3 py-4"><div className="flex gap-2">
          <Button variant="outline" size="icon" aria-label={`View form from ${r.full_name}`} title="View details" onClick={() => setSelected(r.id)}><Eye /></Button>
          <Button variant="outline" size="icon" aria-label={`Mark form from ${r.full_name} reviewed`} title="Mark reviewed" disabled={mutation.isPending || r.status === "reviewed"} onClick={() => mutation.mutate({ id: r.id, status: "reviewed" })}><CheckCheck /></Button>
          <Button variant="outline" size="icon" aria-label={`Approve form from ${r.full_name}`} title="Approve" disabled={mutation.isPending || r.status === "approved"} onClick={() => mutation.mutate({ id: r.id, status: "approved" })}><Check /></Button>
          <Button variant="outline" size="icon" aria-label={`Reject form from ${r.full_name}`} title="Reject" disabled={mutation.isPending || r.status === "rejected"} onClick={() => mutation.mutate({ id: r.id, status: "rejected" })}><X /></Button>
        </div></td>
      </tr>)}</tbody>
    </table></div>
    {!query.isPending && !query.error && query.data?.count === 0 && <p className="py-8 text-sm text-muted-foreground">No Foundation forms yet.</p>}
    <div className="mt-4 flex items-center gap-3">
      <Button variant="outline" size="icon" aria-label="Previous Foundation forms" disabled={page === 0} onClick={() => { setPage(page - 1); setSelected(null); }}><ChevronLeft /></Button>
      <span>Page {page + 1}</span>
      <Button variant="outline" size="icon" aria-label="Next Foundation forms" disabled={(page + 1) * 20 >= (query.data?.count ?? 0)} onClick={() => { setPage(page + 1); setSelected(null); }}><ChevronRight /></Button>
    </div>
    {row && <div className="mt-8 border-t border-border pt-6">
      <h3 className="font-bold">{label(row.kind)} · {row.full_name} · <span className="capitalize">{row.status}</span></h3>
      {([["Email", row.email], ["Mobile", row.phone], ["Coordinator code", row.coordinator_code ?? "—"], ...detailEntries(row.details), ["Received", new Date(row.created_at).toLocaleString("en-IN")]] as [string, string][]).map(([k, v]) => <div className="mt-4" key={k}><h4 className="text-sm font-bold text-primary">{k}</h4><p className="mt-1 whitespace-pre-wrap break-words text-sm">{v}</p></div>)}
    </div>}
  </section>;
}
