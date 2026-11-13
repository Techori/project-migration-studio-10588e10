import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "./ui/button";
import { Check, ChevronLeft, ChevronRight, Eye, RefreshCw, X } from "lucide-react";
import { listStudentRegistrations, reviewStudentRegistration } from "@/lib/young-innovators.functions";
import { toast } from "sonner";

export function YoungRegistrationsAdmin() {
  const [page, setPage] = useState(0); const [selected, setSelected] = useState<string | null>(null);
  const list = useServerFn(listStudentRegistrations);
  const review = useServerFn(reviewStudentRegistration);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: { id: string; status: "approved" | "rejected" }) => review({ data }),
    onSuccess: async (result) => { await queryClient.invalidateQueries({ queryKey: ["admin-young-registrations"] }); toast.success(`Registration ${result.status}.`); },
    onError: (error) => toast.error(error.message),
  });
  const query = useQuery({ queryKey: ["admin-young-registrations", page], queryFn: () => list({ data: { page } }) });
  const row = query.data?.rows.find(r => r.id === selected);
  return <section className="mt-8"><div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold">Young Innovators registrations</h2><Button variant="outline" size="icon" aria-label="Refresh student registrations" onClick={() => query.refetch()}><RefreshCw /></Button></div>{query.error && <p role="alert" className="mt-4">{query.error.message}</p>}{query.isPending && <p className="mt-4">Loading registrations…</p>}<p className="mt-4 text-sm text-muted-foreground">{query.data?.count ?? 0} registrations · Private student and guardian details</p>
    <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-border bg-surface text-foreground"><tr>{["Reference", "Student", "Class / City", "Idea", "Guardian", "Status", "Review"].map(label => <th key={label} className="px-3 py-3 font-bold">{label}</th>)}</tr></thead><tbody>{query.data?.rows.map(r => <tr key={r.id} className="border-b border-border"><td className="px-3 py-4 text-xs">{r.application_code}</td><td className="px-3 py-4 font-semibold">{r.student_name}</td><td className="px-3 py-4">Class {r.school_class}<br/>{r.city}</td><td className="max-w-48 break-words px-3 py-4">{r.idea_title}</td><td className="px-3 py-4">{r.guardian_name}<br/><span className="text-xs text-muted-foreground">{r.guardian_email}</span></td><td className="px-3 py-4 capitalize" aria-live="polite">{r.status}</td><td className="px-3 py-4"><div className="flex gap-2"><Button variant="outline" size="icon" aria-label={`View ${r.application_code}`} title="View registration" onClick={() => setSelected(r.id)}><Eye /></Button><Button variant="outline" size="icon" aria-label={`Approve ${r.application_code}`} title="Approve registration" disabled={mutation.isPending || r.status === "approved"} onClick={() => mutation.mutate({ id: r.id, status: "approved" })}><Check /></Button><Button variant="outline" size="icon" aria-label={`Reject ${r.application_code}`} title="Reject registration" disabled={mutation.isPending || r.status === "rejected"} onClick={() => mutation.mutate({ id: r.id, status: "rejected" })}><X /></Button></div></td></tr>)}</tbody></table></div>
    {!query.isPending && !query.error && query.data?.count === 0 && <p className="py-8 text-sm text-muted-foreground">No student registrations yet.</p>}
    {mutation.error && <p role="alert" className="mt-4 text-destructive">{mutation.error.message}</p>}
    <div className="mt-4 flex items-center gap-3"><Button variant="outline" size="icon" aria-label="Previous registrations" disabled={page === 0} onClick={() => { setPage(page - 1); setSelected(null); }}><ChevronLeft /></Button><span>Page {page + 1}</span><Button variant="outline" size="icon" aria-label="Next registrations" disabled={(page + 1) * 20 >= (query.data?.count ?? 0)} onClick={() => { setPage(page + 1); setSelected(null); }}><ChevronRight /></Button></div>{row && <div className="mt-8 border-t border-border pt-6"><h3 className="font-bold">{row.application_code} · {row.status}</h3>{[["Student", row.student_name], ["Class", String(row.school_class)], ["City", row.city], ["Guardian", row.guardian_name], ["Guardian email", row.guardian_email], ["Guardian phone", row.guardian_phone], ["Idea", row.idea], ["Fee", `₹${row.fee_amount} + ${row.gst_percent}% GST · not a payment receipt`], ["Guardian consent recorded", new Date(row.consent_at).toLocaleString()]].map(([label, value]) => <div className="mt-4" key={label}><h4 className="text-sm font-bold text-primary">{label}</h4><p className="mt-1 whitespace-pre-wrap break-words text-sm">{value}</p></div>)}</div>}</section>;
}