import { useState } from "react";
import { BadgeCheck, ShieldAlert, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { initials } from "@/lib/people-config";

const schema = z.object({
  employeeId: z.string().trim().min(2, "Enter the Employee ID").max(40),
  code: z.string().trim().min(4, "Enter the Employee Code").max(64),
});

type Card = { employee_id: string; full_name: string; photo_url: string | null; designation: string; department: string; status: string; valid_until: string | null };

export function EmployeeVerify() {
  const [employeeId, setEmployeeId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCard(null); setError(null);
    const parsed = schema.safeParse({ employeeId, code });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check the details"); return; }
    setLoading(true);
    const { data, error: rpcError } = await supabase.rpc("verify_employee", { _employee_id: parsed.data.employeeId, _code: parsed.data.code });
    setLoading(false);
    if (rpcError) { setError(rpcError.message.includes("too_many_attempts") ? "Too many failed attempts. Please try again after 15 minutes." : "Verification is unavailable right now. Please try again."); return; }
    const row = data?.[0];
    if (!row) { setError("No match found. Both the Employee ID and Employee Code must be correct."); return; }
    setCard(row as Card);
  }

  const expired = card?.valid_until ? new Date(card.valid_until) < new Date() : false;
  const active = card?.status === "active" && !expired;

  return <section id="verify" className="border-b border-border bg-card py-14 text-card-foreground sm:py-20">
    <div className="mx-auto grid max-w-[1380px] gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:px-12">
      <div>
        <p className="eyebrow text-[10px] font-bold uppercase">Employee verification</p>
        <h2 className="mt-4 text-3xl font-black uppercase leading-[1.02] sm:text-5xl">Is this person really from Riloyd?</h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-card-foreground">Ask the person for their Employee ID and Employee Code. Details are shown only when both match. Only ID-card information is displayed — never personal information.</p>
        <form onSubmit={onSubmit} className="mt-7 grid max-w-lg gap-4">
          <div className="grid gap-2"><Label htmlFor="emp-id">Employee ID</Label><Input id="emp-id" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="e.g. RLY-1024" maxLength={40} autoComplete="off" /></div>
          <div className="grid gap-2"><Label htmlFor="emp-code">Employee Code</Label><Input id="emp-code" type="password" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Security code" maxLength={64} autoComplete="off" /></div>
          <Button type="submit" disabled={loading} className="w-fit rounded-full px-7 font-bold"><ShieldCheck size={16} /> {loading ? "Checking…" : "Verify Employee"}</Button>
        </form>
      </div>
      <div className="flex items-center" aria-live="polite">
        {error && <div className="flex w-full items-start gap-3 border border-destructive/50 p-5 text-sm"><ShieldAlert className="shrink-0 text-destructive" size={20} />{error}</div>}
        {card && <article className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-xl">
          <div className="bg-primary px-5 py-3 text-xs font-black uppercase tracking-wider text-primary-foreground">Riloyd · Employee ID Card</div>
          <div className="flex gap-5 p-5">
            {card.photo_url ? <img src={card.photo_url} width={96} height={112} decoding="async" alt={card.full_name} className="h-28 w-24 shrink-0 rounded object-cover" /> : <span className="flex h-28 w-24 shrink-0 items-center justify-center rounded bg-surface text-2xl font-black">{initials(card.full_name)}</span>}
            <div className="min-w-0 text-sm">
              <h3 className="text-lg font-black">{card.full_name}</h3>
              <p className="font-bold text-primary">{card.designation}</p>
              <p className="text-muted-foreground">{card.department}</p>
              <p className="mt-3 text-xs text-muted-foreground">ID: <span className="font-bold text-foreground">{card.employee_id}</span></p>
              {card.valid_until && <p className="text-xs text-muted-foreground">Valid until: <span className="font-bold text-foreground">{new Date(card.valid_until).toLocaleDateString()}</span></p>}
            </div>
          </div>
          <div className={`flex items-center gap-2 border-t border-border px-5 py-3 text-sm font-bold ${active ? "text-primary" : "text-destructive"}`}>{active ? <><BadgeCheck size={18} /> Verified active employee</> : <><ShieldAlert size={18} /> {expired ? "ID card expired" : "Not currently active"}</>}</div>
        </article>}
        {!error && !card && <p className="text-sm text-card-foreground">Verification result will appear here.</p>}
      </div>
    </div>
  </section>;
}
