import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { paymentOptionsQuery } from "@/lib/payment-options-query";
import type { PaymentOptionKey } from "@/lib/payment-options";

/** Razorpay's own payment button; the script renders the button inside the form. */
function RazorpayButton({ id }: { id: string }) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const form = ref.current;
    if (!form) return;
    form.replaceChildren();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.async = true;
    script.setAttribute("data-payment_button_id", id);
    form.appendChild(script);
    return () => form.replaceChildren();
  }, [id]);
  return <form ref={ref} aria-label="Razorpay payment button" />;
}

/**
 * Shows the admin-configured payment link and/or Razorpay button for one fee.
 * `fallbackLink` keeps payment possible when saved options cannot be loaded.
 */
export function PaymentOptionButton({ optionKey, label, fallbackLink, className }: { optionKey: PaymentOptionKey; label: string; fallbackLink?: string; className?: string }) {
  const query = useQuery(paymentOptionsQuery);
  const option = query.data?.find(o => o.key === optionKey);
  const link = query.isSuccess ? option?.payment_link ?? null : query.isError ? fallbackLink ?? null : null;
  const buttonId = option?.razorpay_button_id ?? null;
  if (query.isPending) return <p className="text-xs opacity-70">Loading payment options…</p>;
  if (!link && !buttonId) return null;
  return <div className="flex flex-wrap items-center gap-3">
    {link && <a href={link} target="_blank" rel="noopener noreferrer" className={className ?? "inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary/90"}>{label}<ExternalLink className="h-4 w-4" aria-hidden="true" /></a>}
    {buttonId && <RazorpayButton id={buttonId} />}
  </div>;
}
