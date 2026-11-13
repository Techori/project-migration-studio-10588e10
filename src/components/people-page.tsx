import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Network, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
import { ProfileGrid } from "@/components/people-profiles";
import type { PersonGroup } from "@/lib/people-config";
import lobbyAsset from "@/assets/local/riloyd-sunset-corporate-lobby.png.optimized.webp";

type PeoplePageProps = {
  eyebrow: string;
  title: string;
  accent: string;
  intro: string;
  sectionTitle: string;
  items: [string, string][];
  cta: string;
  ctaTo: "/contact" | "/register/investor" | "/register/mentor" | "/register/startup" | "/register/business";
  group: PersonGroup;
  children?: ReactNode;
};

const principles = [
  [Network, "Connected perspective", "Business context matters as much as specialist expertise."],
  [ShieldCheck, "Professional integrity", "Clear thinking, discretion and responsible engagement guide every relationship."],
  [Sparkles, "Measurable contribution", "Every conversation should help a business make a stronger decision."],
] as const;

export function PeoplePage({ eyebrow, title, accent, intro, sectionTitle, items, cta, ctaTo, group, children }: PeoplePageProps) {
  return <main className="overflow-hidden bg-background text-foreground">
    <section className="relative min-h-[540px] overflow-hidden border-b border-border">
      <img src={lobbyAsset} alt="Riloyd corporate lobby and business community" className="absolute inset-0 h-full w-full object-cover object-center" decoding="async" fetchPriority="high" />
      <div className="hero-shade absolute inset-0" />
      <div className="relative z-10 mx-auto flex min-h-[540px] max-w-[1380px] items-center px-5 py-14 sm:px-6 lg:px-12"><div className="max-w-3xl"><p className="eyebrow text-xs font-bold uppercase text-soft">{eyebrow}</p><h1 className="headline mt-5 text-[clamp(2.7rem,5.5vw,5.4rem)] font-black uppercase leading-[.92]">{title}<br /><span className="text-primary">{accent}</span></h1><p className="mt-6 max-w-xl text-sm leading-relaxed text-soft sm:text-base">{intro}</p><Button asChild size="lg" className="mt-7 rounded-full px-7 font-bold"><Link to={ctaTo}>{cta} <ArrowRight size={16} /></Link></Button></div></div>
    </section>
    {children}
    <ProfileGrid group={group} />
    <section className="border-b border-border bg-card py-14 text-card-foreground sm:py-20"><div className="mx-auto max-w-[1380px] px-5 sm:px-6 lg:px-12"><p className="eyebrow text-[10px] font-bold uppercase">How we contribute</p><h2 className="mt-4 max-w-2xl text-3xl font-black uppercase leading-[1.02] sm:text-5xl">{sectionTitle}</h2><div className="mt-10 grid gap-px bg-secondary sm:grid-cols-2 lg:grid-cols-3">{items.map(([heading, copy]) => <article key={heading} className="bg-card p-6 sm:p-8"><Check className="text-primary" size={25} /><h3 className="mt-5 text-base font-extrabold">{heading}</h3><p className="mt-3 text-sm leading-relaxed text-card-foreground">{copy}</p></article>)}</div></div></section>
    <section className="border-b border-border py-14 sm:py-20"><div className="mx-auto grid max-w-[1380px] gap-5 px-5 sm:grid-cols-3 sm:px-6 lg:px-12">{principles.map(([Icon, heading, copy]) => <article key={heading} className="border-l-2 border-primary p-5"><Icon className="text-primary" size={30} /><h2 className="mt-5 font-extrabold">{heading}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p></article>)}</div></section>
    <section className="bg-surface py-14"><div className="mx-auto flex max-w-[1380px] flex-col items-start justify-between gap-6 px-5 sm:px-6 lg:flex-row lg:items-center lg:px-12"><div><p className="eyebrow text-[10px] font-bold uppercase text-soft">Work with Riloyd</p><h2 className="mt-3 text-3xl font-black uppercase">Build better decisions together.</h2></div><Button asChild size="lg" className="rounded-full px-7 font-bold"><Link to={ctaTo}>{cta} <ArrowRight size={16} /></Link></Button></div></section>
  </main>;
}