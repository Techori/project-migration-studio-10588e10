import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { paymentOptionsQuery } from "@/lib/payment-options-query";
import { isZohoCheckoutUrl, zohoPrefillUrl, type PaymentOptionKey } from "@/lib/payment-options";

type Prefill = { name?: string; email?: string; mobile?: string };

/**
 * Shows the admin-configured payment page for one fee. With `embed`, a Zoho Checkout page opens inside
 * the page (pre-filled with `prefill`); other links open in a new tab.
 * `fallbackLink` keeps payment possible when saved options cannot be loaded.
 */
export function PaymentOptionButton({ optionKey, label, fallbackLink, className, embed, prefill }: { optionKey: PaymentOptionKey; label: string; fallbackLink?: string; className?: string; embed?: boolean; prefill?: Prefill }) {
  const query = useQuery(paymentOptionsQuery);
  const option = query.data?.find(o => o.key === optionKey);
  const saved = query.isSuccess ? option?.payment_link ?? null : query.isError ? fallbackLink ?? null : null;
  if (query.isPending) return <p className="text-xs opacity-70">Loading payment options…</p>;
  if (!saved) return null;
  const zoho = isZohoCheckoutUrl(saved);
  const link = zoho && prefill ? zohoPrefillUrl(saved, prefill) : saved;
  const button = <a href={link} target="_blank" rel="noopener noreferrer" className={className ?? "inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary/90"}>{label}<ExternalLink className="h-4 w-4" aria-hidden="true" /></a>;
  if (!(embed && zoho)) return <div className="flex flex-wrap items-center gap-3">{button}</div>;
  return <div className="space-y-3">
    <iframe title={label} src={link} allow="payment" loading="lazy" className="h-[1000px] w-full rounded-xl border-0 bg-background" />
    <p className="text-xs opacity-80">Payment page not showing? <a href={link} target="_blank" rel="noopener noreferrer" className="font-semibold underline">Open it in a new tab</a>.</p>
  </div>;
}
