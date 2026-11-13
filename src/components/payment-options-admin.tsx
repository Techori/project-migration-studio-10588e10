import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { paymentOptionsQuery } from "@/lib/payment-options-query";
import { savePaymentOption } from "@/lib/payment-options.functions";
import { isZohoCheckoutUrl, normalizePaymentLink, paymentOptionKeys, type PaymentOption, type PaymentOptionKey } from "@/lib/payment-options";

const inputClass = "mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm";

function OptionRow({ option }: { option: PaymentOption }) {
  const [link, setLinkRaw] = useState(option.payment_link ?? "");
  // Pasting the Zoho embed code keeps just its page address.
  const setLink = (v: string) => setLinkRaw(normalizePaymentLink(v) ?? v);
  const save = useServerFn(savePaymentOption);
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => save({ data: { key: option.key as PaymentOptionKey, paymentLink: link } }),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: paymentOptionsQuery.queryKey }); toast.success(`${option.label} saved.`); },
    onError: e => toast.error(e.message),
  });
  return <form className="grid gap-3 border-t border-border py-4 md:grid-cols-[1fr_2.8fr_auto] md:items-end" onSubmit={e => { e.preventDefault(); mutation.mutate(); }}>
    <p className="text-sm font-semibold">{option.label}</p>
    <label className="text-xs font-semibold">Payment page link or Zoho Checkout embed code<input className={inputClass} value={link} onChange={e => setLink(e.target.value)} placeholder='https://zohosecurepay.in/checkout/… or <iframe src="…">' />
      {isZohoCheckoutUrl(link) && <span className="mt-1 block font-normal text-muted-foreground">Zoho Checkout page: shown inside the scholarship form.</span>}</label>
    <Button type="submit" variant="outline" disabled={mutation.isPending}>{mutation.isPending ? "Saving…" : "Save"}</Button>
  </form>;
}

export function PaymentOptionsAdmin() {
  const query = useQuery(paymentOptionsQuery);
  const groups = new Map<string, PaymentOption[]>();
  for (const o of (query.data ?? []).filter(o => (paymentOptionKeys as readonly string[]).includes(o.key))) groups.set(o.programme, [...(groups.get(o.programme) ?? []), o]);
  return <section>
    <h2 className="text-xl font-bold">Payment links</h2>
    <p className="mt-2 text-sm text-muted-foreground">Paste the payment page link or the Zoho Checkout embed code for each fee. Leave it empty to hide the payment button. In Zoho, set the page\'s Thank You redirect to {origin}/payment-complete so the payment ID comes back to the form. Changes show on the website straight away.</p>
    {query.isPending && <p className="mt-4 text-sm">Loading…</p>}
    {query.error && <p className="mt-4 text-sm text-destructive">{query.error.message}</p>}
    {[...groups.entries()].map(([programme, options]) => <div key={programme} className="mt-6"><h3 className="font-bold">{programme}</h3>{options.map(o => <OptionRow key={`${o.key}:${o.payment_link}`} option={o} />)}</div>)}
  </section>;
}
