import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Network, SearchCheck, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryOrder, registrationConfigs } from "@/lib/registration-config";
import teamAsset from "@/assets/local/riloyd-team.png.optimized.webp";

export const Route = createFileRoute("/register/")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Register With Us | Riloyd" },
    { name: "description", content: "Register with Riloyd as a startup, mentor, investor or business and join a growth-focused ecosystem." },
    { property: "og:title", content: "Register With Us | Riloyd" },
    { property: "og:description", content: "Startups, mentors, investors and businesses can join the Riloyd ecosystem." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: "/register" }]}),
  component: RegisterHub,
});

const steps = [
  ["01", "Register", "Choose your category and share your profile."], ["02", "Verification", "Our team reviews your information."], ["03", "Connect", "Meet relevant people and opportunities."], ["04", "Collaborate", "Build valuable working relationships."], ["05", "Grow", "Move forward with strategy and support."],
];

function RegisterHub() {
  return <main className="min-h-screen overflow-hidden bg-background text-foreground">
    <section className="registration-hero relative overflow-hidden border-b border-border"><img src={teamAsset} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" decoding="async" /><div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" /><div className="registration-grid absolute inset-0 opacity-50" /><div className="relative mx-auto grid min-h-[470px] max-w-[1380px] items-center gap-8 px-5 py-14 sm:px-6 lg:grid-cols-[1fr_.46fr] lg:px-12"><div><p className="eyebrow text-[10px] font-bold uppercase">Join the Riloyd ecosystem</p><h1 className="mt-6 text-[clamp(3.2rem,8vw,7.3rem)] font-black uppercase leading-[.84]">Register<br /><span className="text-primary">with us.</span></h1><p className="mt-6 max-w-xl text-sm leading-relaxed text-soft sm:text-base">Whether you are building, guiding, investing or growing — Riloyd connects you with the right opportunities, expertise and people.</p></div><div className="hidden border-l border-border pl-10 lg:block"><p className="text-sm font-black uppercase leading-[1.7]">Ideas<br />Funding<br />Partnership<br /><span className="text-primary">Progress</span></p></div></div></section>

    <section className="mx-auto max-w-[1380px] px-5 py-14 sm:px-6 lg:px-12 lg:py-20">
      <div className="max-w-2xl"><p className="section-label">Choose your path</p><h2 className="mt-5 text-3xl font-black uppercase sm:text-5xl">Who are you?</h2><p className="mt-4 text-sm text-soft">Select a category to open its dedicated registration form.</p></div>
      <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{categoryOrder.map((category,index) => { const item = registrationConfigs[category]; const Icon = item.icon; return <article key={category} className="registration-card group relative flex min-h-80 flex-col overflow-hidden border border-border bg-surface/40 p-6"><span className="absolute right-5 top-4 text-5xl font-black text-border">0{index+1}</span><span className="grid h-14 w-14 place-items-center rounded-full border border-primary text-primary"><Icon /></span><h3 className="mt-8 text-2xl font-black uppercase">{item.title.replace(" Registration", "")}</h3><span className="mt-3 h-0.5 w-8 bg-primary" /><p className="mt-4 text-sm leading-relaxed text-soft">{item.cardCopy}</p><Button asChild variant="outline" className="mt-auto h-11 rounded-full"><Link to={`/register/${category}`}>Register as {item.title.replace(" Registration", "")} <ArrowRight /></Link></Button></article>; })}</div>
    </section>

    <section className="border-y border-border bg-surface/40"><div className="mx-auto grid max-w-[1380px] gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-12 lg:py-20"><div><p className="section-label">Why register</p><h2 className="mt-5 text-3xl font-black uppercase sm:text-5xl">One ecosystem.<br /><span className="text-primary">Real opportunities.</span></h2><p className="mt-5 max-w-lg text-sm leading-relaxed text-soft">Riloyd brings people, knowledge, capital and execution together to create stronger outcomes.</p></div><div className="grid gap-px bg-border sm:grid-cols-2">{[[Network,"Curated Network","Connect with trusted founders, advisors and investors."],[SearchCheck,"Relevant Opportunities","Get matched with support aligned to your goals."],[Sparkles,"Expert Guidance","Access practical experience across business functions."],[TrendingUp,"Long-Term Growth","Build relationships designed for sustainable progress."]].map(([Icon,title,copy]) => { const ItemIcon = Icon as typeof Network; return <div key={String(title)} className="bg-background p-6"><ItemIcon className="text-primary" /><h3 className="mt-4 text-sm font-bold">{String(title)}</h3><p className="mt-2 text-xs leading-relaxed text-soft">{String(copy)}</p></div>; })}</div></div></section>

    <section className="mx-auto max-w-[1380px] px-5 py-14 sm:px-6 lg:px-12 lg:py-20"><p className="section-label">How it works</p><h2 className="mt-5 text-3xl font-black uppercase sm:text-5xl">Your journey with Riloyd</h2><div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{steps.map(([number,title,copy]) => <article key={number} className="border-t border-primary pt-5"><b className="text-4xl font-black text-border">{number}</b><h3 className="mt-4 flex items-center gap-2 text-sm font-bold"><Check size={15} className="text-primary" />{title}</h3><p className="mt-2 text-xs leading-relaxed text-soft">{copy}</p></article>)}</div></section>

    <section className="border-t border-border bg-primary"><div className="mx-auto flex max-w-[1380px] flex-col items-start justify-between gap-6 px-5 py-12 sm:px-6 lg:flex-row lg:items-center lg:px-12"><div><p className="text-[10px] font-bold uppercase text-primary-foreground/70">Ready to connect?</p><h2 className="mt-2 text-3xl font-black uppercase text-primary-foreground sm:text-5xl">Be part of something bigger.</h2></div><Button asChild variant="secondary" className="h-12 rounded-full px-8"><Link to="/register/startup">Start Registration <ArrowRight /></Link></Button></div></section>
  </main>;
}
