import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { displayFee, indiaRegistrationSummary, type ProgrammeCountry } from "@/lib/international-programme";
import { programmeFeesQuery } from "@/lib/programme-fees-query";
import founders from "@/assets/international-founders.webp";
import { marketConfigs } from "@/lib/market-config";

export function InternationalEnrolment({ country }: { country: ProgrammeCountry }) {
  const { data: fees } = useSuspenseQuery(programmeFeesQuery);
  const fee = fees.find(row => row.country === country);
  return <section id="programme" className="border-b border-border bg-surface py-12 sm:py-16"><div className="mx-auto max-w-[1380px] px-5 sm:px-6 lg:px-12">
    <p className="flex items-center gap-2 text-xs font-bold uppercase text-primary"><Globe2 size={18} />{marketConfigs[country].name} → Gwalior, India</p><h2 className="mt-4 max-w-3xl text-3xl font-black sm:text-4xl">Startup Funding Programme</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">International startups, student founders and innovative ideas are welcome to apply for evaluation, mentorship and investor-pitch opportunities through Riloyd's programme in India. Funding depends on eligibility, selection and funder decisions.</p>
    <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-center"><img src={founders} alt="Indian and international founders developing a startup prototype together" width={1440} height={960} loading="lazy" className="aspect-[3/2] w-full rounded-md object-cover" /><div>
      <p className="text-xs font-bold uppercase text-muted-foreground">{marketConfigs[country].name} registration fee</p><p className="mt-3 text-4xl font-black text-primary">{displayFee(fee)}</p>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">{country === "india" ? indiaRegistrationSummary() : fee?.amount == null ? "Please confirm the country-specific registration fee with Riloyd before paying." : "Country-specific programme registration charge. Confirm applicable taxes, participation and travel terms before payment."}</p>
      <div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link to="/funding-programme" hash="register">Register your startup or idea <ArrowRight size={16} /></Link></Button><Button asChild variant="outline"><Link to="/payment" search={{ country }}>Payment account details</Link></Button></div>
      <p className="mt-4 text-xs leading-6 text-muted-foreground">Registration is reviewed by the programme team. International travel, visa support and reimbursement are not confirmed; verify these separately before booking.</p>
    </div></div>
  </div></section>;
}