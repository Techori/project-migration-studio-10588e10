import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Landmark, ArrowRight, ShieldCheck, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountryLogo } from "@/components/country-logo";
import { accountHolder, paymentAccounts } from "@/lib/payment-accounts";
import { marketConfigs, marketOrder } from "@/lib/market-config";

export const Route = createFileRoute("/payment")({
  staticData: { sitemap: true },
  validateSearch: (search: Record<string, unknown>) => ({ country: marketOrder.find(key => key === search["country"]) ?? "usa" }),
  head: () => ({ meta: [{ title: "Payment Account Details | Riloyd" }, { name: "description", content: "Six published Rishishwar Industry Private Limited payment accounts in USD, GBP, AED, EUR, CAD and AUD for Riloyd applicants." }, { property: "og:title", content: "Payment Account Details | Riloyd" }, { property: "og:description", content: "Bank details and payment methods for six Riloyd programme payment accounts." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: "/payment" }] }),
  component: PaymentPage,
});

function PaymentPage() {
  const search = Route.useSearch();
  const [copied, setCopied] = useState("");
  const [copyError, setCopyError] = useState("");
  const accounts = paymentAccounts.filter(account => account.methods.length > 0);
  async function copy(account: typeof paymentAccounts[number]) {
    try { await navigator.clipboard.writeText([accountHolder, `Currency: ${account.currency} only`, ...account.methods.flatMap(method => [`Payment method: ${method.name}`, ...method.fields.map(([label, value]) => `${label}: ${value}`)]), `Bank: ${account.bank}`, `${account.addressLabel ?? "Bank address"}: ${account.address}`].join("\n")); setCopied(account.country); setCopyError(""); }
    catch { setCopyError(account.country); }
  }
  return <main className="bg-background text-foreground">
    <section className="border-b border-border bg-surface"><div className="mx-auto max-w-[1380px] px-5 py-12 sm:px-6 lg:px-12">
      <p className="flex items-center gap-2 text-xs font-bold uppercase text-primary"><Globe2 size={18} />Riloyd · International payments</p>
      <h1 className="mt-4 text-4xl font-black sm:text-5xl">Payment account details</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{accountHolder}</p>
      <div className="mt-8 grid gap-6 border-t border-border pt-6 sm:grid-cols-3"><div><p className="text-3xl font-black text-primary">06</p><p className="mt-1 text-xs text-muted-foreground">Published payment accounts</p></div><div><p className="text-lg font-bold">USD · GBP · AED</p><p className="mt-1 text-lg font-bold">EUR · CAD · AUD</p></div><div className="flex items-start gap-3"><ShieldCheck className="shrink-0 text-primary" /><p className="text-xs leading-relaxed text-muted-foreground">Confirm the beneficiary, fee and transfer instructions with the team before paying.</p></div></div>
    </div></section>
    <div className="mx-auto max-w-[1380px] px-5 py-10 sm:px-6 lg:px-12">
      <nav aria-label="Payment accounts" className="mb-8 flex flex-wrap gap-2">{accounts.map(account => <Button key={account.country} asChild variant={account.country === search.country ? "default" : "outline"} size="sm"><a href={`#account-${account.country}`}>{account.currency} <ArrowRight size={14} /></a></Button>)}</nav>
      <div className="grid items-start gap-6 lg:grid-cols-2">{accounts.map(account => {
        const market = marketOrder.find(key => key === account.country);
        if (!market) return null;
        return <article key={account.country} id={`account-${account.country}`} className="min-w-0 scroll-mt-6 rounded-md border border-border bg-surface p-5 sm:p-7" aria-label={`${account.currency} payment account`}>
          <div className="flex items-center justify-between gap-4"><CountryLogo market={marketConfigs[market]} className="h-12 w-44 max-w-[65%] object-contain object-left" /><span className="text-2xl font-black text-primary">{account.currency}</span></div>
          <h2 className="mt-5 text-xl font-bold">{marketConfigs[market].name} account</h2><p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Landmark size={15} />{account.bank} · {account.currency} only</p>
          <dl className="mt-5"><div className="border-b border-border pb-4"><dt className="text-xs text-muted-foreground">Account holder</dt><dd className="mt-1 break-words text-sm font-semibold">{accountHolder}</dd></div>{account.methods.map(method => <div key={method.name} className="border-b border-border py-4"><dt className="text-xs font-bold text-primary">{method.name}</dt><dd className="mt-3 grid gap-3 sm:grid-cols-2">{method.fields.map(([label,value]) => <div key={label} className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-all font-mono text-sm font-semibold">{value}</p></div>)}</dd></div>)}<div className="py-4"><dt className="text-xs text-muted-foreground">{account.addressLabel ?? "Bank address"}</dt><dd className="mt-1 break-words text-sm leading-relaxed">{account.address}</dd></div></dl>
          <Button variant="outline" onClick={() => copy(account)} aria-label={`Copy ${account.currency} account details`}>{copied === account.country ? <Check size={16} /> : <Copy size={16} />}{copied === account.country ? "Copied" : "Copy account details"}</Button>{copyError === account.country && <p role="alert" className="mt-3 text-xs">Copy is unavailable. Select the details directly.</p>}
        </article>;
      })}</div>
      <div className="mt-10 flex flex-col gap-5 border-t border-border pt-6 sm:flex-row sm:items-start sm:justify-between"><div className="max-w-3xl"><h2 className="text-base font-bold">Before you transfer</h2><p className="mt-3 text-xs leading-relaxed text-muted-foreground">India and Singapore account details are not published here. Please contact the team for instructions. This page does not process payments or confirm registration.</p><p className="mt-3 text-xs text-muted-foreground">Source: <a href="https://www.rishishwarindustry.in/payment" target="_blank" rel="noopener noreferrer" className="underline">Rishishwar Industry payment page</a> · Details recorded 29 October 2026.</p></div><Button asChild><Link to="/contact">Confirm payment details <ArrowRight size={16} /></Link></Button></div>
    </div>
  </main>;
}