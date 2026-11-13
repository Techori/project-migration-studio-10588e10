import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { paymentOptionsQuery } from "@/lib/payment-options-query";
import { savePaymentOption } from "@/lib/payment-options.functions";
import { paymentOptionKeys, type PaymentOption, type PaymentOptionKey } from "@/lib/payment-options";

const inputClass = "mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm";

function OptionRow({ option }: { option: PaymentOption }) {
  const [link, setLink] = useState(option.payment_link ?? "");
  const [button, setButton] = useState(option.razorpay_button_id ?? "");
  const save = useServerFn(savePaymentOption);
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => save({ data: { key: option.key as PaymentOptionKey, paymentLink: link, razorpayButton: button } }),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: paymentOptionsQuery.queryKey }); toast.success(`${option.label} saved.`); },
    onError: e => toast.error(e.message),
  });
  return <form className="grid gap-3 border-t border-border py-4 md:grid-cols-[1fr_1.4fr_1.4fr_auto] md:items-end" onSubmit={e => { e.preventDefault(); mutation.mutate(); }}>
    <p className="text-sm font-semibold">{option.label}</p>
    <label className="text-xs font-semibold">Payment page link<input className={inputClass} value={link} onChange={e => setLink(e.target.value)} placeholder="https://rzp.io/…" /></label>
    <label className="text-xs font-semibold">Razorpay button ID or embed code<input className={inputClass} value={button} onChange={e => setButton(e.target.value)} placeholder="pl_… or <form><script …>" /></label>
    <Button type="submit" variant="outline" disabled={mutation.isPending}>{mutation.isPending ? "Saving…" : "Save"}</Button>
  </form>;
}

export function PaymentOptionsAdmin() {
  const query = useQuery(paymentOptionsQuery);
  const groups = new Map<string, PaymentOption[]>();
  for (const o of (query.data ?? []).filter(o => (paymentOptionKeys as readonly string[]).includes(o.key))) groups.set(o.programme, [...(groups.get(o.programme) ?? []), o]);
  return <section>
    <h2 className="text-xl font-bold">Payment links</h2>
    <p className="mt-2 text-sm text-muted-foreground">Change the payment page link and/or the Razorpay payment button for each form. Leave a field empty to hide it. Changes show on the website straight away.</p>
    {query.isPending && <p className="mt-4 text-sm">Loading…</p>}
    {query.error && <p className="mt-4 text-sm text-destructive">{query.error.message}</p>}
    {[...groups.entries()].map(([programme, options]) => <div key={programme} className="mt-6"><h3 className="font-bold">{programme}</h3>{options.map(o => <OptionRow key={`${o.key}:${o.payment_link}:${o.razorpay_button_id}`} option={o} />)}</div>)}
  </section>;
}
