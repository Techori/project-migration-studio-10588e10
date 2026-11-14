import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PAYMENT_MESSAGE_TYPE, PAYMENT_RETURN_KEY, paymentIdFromSearch } from "@/lib/payment-options";

const TITLE = "Payment complete | RILOYD";
const DESCRIPTION = "Return page after paying a RILOYD registration fee. Your payment ID is passed back to your open registration form.";

export const Route = createFileRoute("/payment-complete")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaymentCompletePage,
});

function PaymentCompletePage() {
  const [state, setState] = useState<{ ready: boolean; id: string | null; embedded: boolean }>({ ready: false, id: null, embedded: false });
  useEffect(() => {
    const id = paymentIdFromSearch(new URLSearchParams(window.location.search));
    const embedded = window.parent !== window;
    if (id) {
      try { localStorage.setItem(PAYMENT_RETURN_KEY, JSON.stringify({ id, at: Date.now() })); } catch { /* storage blocked */ }
      const message = { type: PAYMENT_MESSAGE_TYPE, paymentId: id };
      // Same-site only: the form page listens and checks the origin.
      try { if (embedded) window.parent.postMessage(message, window.location.origin); } catch { /* different site */ }
      try { window.opener?.postMessage(message, window.location.origin); } catch { /* different site */ }
    }
    setState({ ready: true, id, embedded });
  }, []);

  return <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
    <CheckCircle2 className="h-12 w-12 text-primary" aria-hidden="true" />
    <h1 className="mt-4 text-2xl font-black">Thank you for your payment</h1>
    {!state.ready ? <p className="mt-3 text-sm text-muted-foreground">One moment…</p>
      : state.id ? <>
        <p className="mt-3 text-sm text-muted-foreground">Your payment ID</p>
        <p className="mt-1 select-all rounded-lg bg-muted px-4 py-2 font-mono text-lg font-bold">{state.id}</p>
        <p className="mt-4 text-sm text-muted-foreground">It has been added to your registration form. Our team still checks every payment before confirming it.</p>
      </> : <p className="mt-3 text-sm text-muted-foreground">We could not read the payment ID from the payment page. Please copy it from your payment receipt email or SMS and enter it in the registration form.</p>}
    {!state.embedded && <Link to="/education-support" hash="registration-form" className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary/90">Back to the registration form</Link>}
  </main>;
}
