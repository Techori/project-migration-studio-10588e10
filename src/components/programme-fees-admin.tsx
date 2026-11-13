import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { marketConfigs, marketOrder } from "@/lib/market-config";
import { countryCurrencies, displayFee, type ProgrammeCountry } from "@/lib/international-programme";
import { programmeFeesQuery } from "@/lib/programme-fees-query";
import { saveProgrammeFee } from "@/lib/programme-fees.functions";
import { indiaRegistrationOptions } from "@/lib/international-programme";
import { prototypeProgramme } from "@/lib/prototype-programme";

export function ProgrammeFeesAdmin() {
  const { data: fees, error, isPending } = useQuery(programmeFeesQuery);
  const queryClient = useQueryClient();
  const save = useServerFn(saveProgrammeFee);
  const [country, setCountry] = useState<ProgrammeCountry>("usa");
  const [amount, setAmount] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const current = fees?.find(row => row.country === country);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const value = amount ?? (current?.amount?.toString() ?? "");
    try {
      await save({ data: { country, currency: countryCurrencies[country], amount: value.trim() === "" ? null : Number(value) } });
      await queryClient.invalidateQueries({ queryKey: programmeFeesQuery.queryKey });
      setAmount(null); setMessage("Registration fee saved.");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not save the fee."); }
    finally { setBusy(false); }
  }
  return <section className="mt-8"><h2 className="text-xl font-extrabold">Registration fees</h2>
    <div className="mt-5 grid gap-4 sm:grid-cols-3">{indiaRegistrationOptions.map(option => <article key={option.amount} className="rounded-md border border-border p-5"><h3 className="text-sm font-bold">India · Startup Funding</h3><p className="mt-3 text-2xl font-black">₹{option.amount.toLocaleString("en-IN")}</p><p className="mt-2 text-xs text-muted-foreground">+{option.gstPercent}% GST</p></article>)}<article className="rounded-md border border-border p-5"><h3 className="text-sm font-bold">Prototype &amp; Seed Funding</h3><p className="mt-3 text-2xl font-black">₹{prototypeProgramme.registrationFee}</p><p className="mt-2 text-xs text-muted-foreground">+{prototypeProgramme.gstPercent}% GST</p></article></div>
    <h3 className="mt-8 text-lg font-bold">International country fees</h3><p className="mt-2 text-sm text-muted-foreground">Startup Funding Programme · {current ? displayFee(current) : ""}</p>
    {error ? <p role="alert" className="mt-4 text-sm">Fees could not be loaded.</p> : isPending ? <p className="mt-4">Loading fees…</p> : <form onSubmit={submit} className="mt-5 grid max-w-lg gap-4">
      <div className="grid gap-2"><Label htmlFor="fee-country">Country / market</Label><select id="fee-country" value={country} onChange={e => { const next = marketOrder.find(key => key === e.target.value); if (next) { setCountry(next); setAmount(null); setMessage(""); } }} className="h-10 rounded-md border border-input bg-background px-3 text-sm">{marketOrder.filter(key => key !== "india").map(key => <option key={key} value={key}>{marketConfigs[key].name}</option>)}</select></div>
      <div className="grid gap-2"><Label htmlFor="fee-amount">Registration amount ({countryCurrencies[country]})</Label><Input id="fee-amount" type="number" min="0.01" max="1000000" step="0.01" value={amount ?? current?.amount ?? ""} onChange={e => setAmount(e.target.value)} placeholder="Not announced" /></div>
      <p className="text-xs text-muted-foreground">An empty amount keeps the fee unannounced. India's registration fee is shown above.</p>
      <Button type="submit" disabled={busy}><Save size={16} />{busy ? "Saving…" : "Save registration fee"}</Button>
      {message && <p role="status" className="text-sm">{message}</p>}
    </form>}
  </section>;
}