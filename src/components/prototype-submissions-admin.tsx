import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, Eye, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { listPrototypeSubmissions } from "@/lib/prototype-submissions.functions";

export function PrototypeSubmissionsAdmin() {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const list = useServerFn(listPrototypeSubmissions);
  const query = useQuery({ queryKey: ["admin-prototypes", page], queryFn: () => list({ data: { page } }) });
  const row = query.data?.rows.find(item => item.id === selected);
  return <section className="mt-8 min-w-0">
    <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-extrabold">Prototype submissions</h2><Button variant="outline" size="icon" aria-label="Refresh submissions" onClick={() => query.refetch()}><RefreshCw size={16} /></Button></div>
    {query.isPending ? <p className="mt-5">Loading submissions…</p> : query.error ? <p role="alert" className="mt-5">{query.error.message}</p> : <>
      <p className="mt-3 text-sm text-muted-foreground">{query.data?.count ?? 0} submissions</p>
      <div className="mt-5 divide-y divide-border border-y border-border">{query.data?.rows.map(item => <div key={item.id} className="flex min-w-0 items-center justify-between gap-4 py-4"><div className="min-w-0"><p className="line-clamp-2 break-words text-sm font-bold">{item.idea}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()} · {item.id.slice(0, 8)}</p></div><Button variant="outline" onClick={() => setSelected(item.id)}><Eye size={16} />View</Button></div>)}</div>
      {!query.data?.count && <p className="mt-5 text-sm text-muted-foreground">No submissions yet.</p>}
      <div className="mt-4 flex items-center gap-3"><Button variant="outline" size="icon" aria-label="Previous page" disabled={page === 0} onClick={() => { setPage(page - 1); setSelected(null); }}><ChevronLeft /></Button><span className="text-sm">Page {page + 1}</span><Button variant="outline" size="icon" aria-label="Next page" disabled={(page + 1) * 20 >= (query.data?.count ?? 0)} onClick={() => { setPage(page + 1); setSelected(null); }}><ChevronRight /></Button></div>
    </>}
    {row && <div className="mt-8 border-t border-border pt-6"><div className="flex justify-between gap-4"><h3 className="text-lg font-bold">Submission details · {row.id.slice(0, 8)}</h3><Button variant="ghost" onClick={() => setSelected(null)}>Close</Button></div>{[["Startup idea", row.idea], ["Prototype & progress", row.prototype], ["Funding goal", row.funding_goal], ["Eligibility context", row.eligibility_context], ["AI advisor output", row.ai_output]].map(([title, value]) => <div key={title} className="mt-6"><h4 className="font-bold text-primary">{title}</h4><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{value}</p></div>)}</div>}
  </section>;
}