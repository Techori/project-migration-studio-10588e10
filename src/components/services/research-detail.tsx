import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, BarChart3, ChevronRight, ClipboardList, FileText, Heart, Lightbulb, LineChart,
  Presentation, Rocket, Search, Settings, ShieldCheck, Target, TrendingUp, Users, Zap, Plus, Minus,
} from "lucide-react";
import heroAsset from "@/assets/local/research-hero.png.optimized.webp";
import overviewAsset from "@/assets/local/research-overview.png.optimized.webp";

const stats = [
  [Search, "500+", "Research Projects Completed"],
  [Users, "15+", "Industries Served"],
  [Heart, "95%", "Client Satisfaction"],
  [Settings, "Strategic", "Insights for Real Growth"],
] as const;

const benefits = [
  [BarChart3, "Better Decisions"], [ShieldCheck, "Lower Business Risk"], [Lightbulb, "Identify New Opportunities"],
  [Zap, "Faster Market Entry"], [TrendingUp, "Sustainable Growth"],
] as const;

const areas = [
  [Search, "Market Research", ["Market size & trends", "Customer insights", "Growth opportunities", "Demand analysis"]],
  [Users, "Industry Research", ["Industry landscape", "Key players analysis", "Regulatory insights", "Future outlook"]],
  [LineChart, "Competitor Analysis", ["Competitor profiling", "Strengths & weaknesses", "Market positioning", "Competitive strategy"]],
  [BarChart3, "Business Analysis", ["Financial analysis", "Operational analysis", "Sales & revenue analysis", "Risk & gap analysis"]],
  [Target, "Strategy Development", ["Growth strategy", "Market entry strategy", "Go-to-market plan", "Transformation roadmap"]],
] as const;

const steps = [
  [Search, "01", "Understand", "Your business, challenges and goals."],
  [BarChart3, "02", "Research & Analyze", "In-depth market, industry and competitor analysis."],
  [Lightbulb, "03", "Strategize", "Develop actionable strategies and roadmap."],
  [Target, "04", "Deliver", "Clear recommendations for real impact."],
] as const;

const deliverables = [
  [FileText, "Research Reports", "Detailed market & industry insights"],
  [LineChart, "Financial & Commercial Analysis", "Revenue, cost and profitability insights"],
  [Rocket, "Strategic Roadmap", "Growth strategy and implementation plan"],
  [Presentation, "Presentation Deck", "Investor-ready business insights"],
  [ClipboardList, "Implementation Plan", "Clear next steps with timelines"],
] as const;

const faqs = [
  ["What types of businesses can benefit from this service?", "Startups, SMEs and established enterprises planning growth, market entry, funding or transformation all benefit from structured research and strategy."],
  ["How long does a typical research and strategy project take?", "Most engagements run 3–8 weeks depending on scope, markets covered and the depth of analysis required."],
  ["Will the insights be customized for my business?", "Yes. Every engagement is built around your goals, industry and stage — no generic templates."],
  ["Do you also support implementation?", "Yes. We can stay on to help your team execute the roadmap, track progress and adjust as the market moves."],
  ["How is this different from general market research?", "We go beyond data collection — we connect findings to decisions, owners and measurable next steps for your business."],
];

function Eyebrow({ children, onLight = false }: { children: React.ReactNode; onLight?: boolean }) {
  return (
    <p className={`flex items-center gap-4 text-xs font-bold uppercase tracking-[0.25em] ${onLight ? "text-card-foreground" : "text-muted-foreground"}`}>
      <span className="block h-0.5 w-10 bg-primary" />
      {children}
    </p>
  );
}

function IconRing({ icon: Icon, size = "h-12 w-12" }: { icon: typeof Search; size?: string }) {
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary`}>
      <Icon size={20} />
    </span>
  );
}

export function ResearchDetail() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <img src={heroAsset} alt="Riloyd strategy boardroom with market intelligence dashboard" className="absolute inset-0 h-full w-full object-cover" decoding="async" fetchPriority="high" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12 lg:py-24">
          <nav className="flex items-center gap-2 text-xs text-soft">
            <Link to="/">Home</Link><ChevronRight size={12} />
            <Link to="/services">Services</Link><ChevronRight size={12} />
            <span>Business Research, Analysis &amp; Strategy</span>
          </nav>
          <div className="mt-6"><Eyebrow>Business research, analysis &amp; strategy</Eyebrow></div>
          <h1 className="headline mt-4 max-w-4xl text-[clamp(2.25rem,5vw,4.5rem)] font-black uppercase leading-[0.92]">
            Turn data into bigger <span className="text-primary">opportunities.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-soft md:text-lg">
            Deep research. Clear analysis. Actionable strategy. We help businesses make smarter decisions, identify new opportunities, reduce risks and build sustainable growth.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/contact" className="solid-cta inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-extrabold text-primary-foreground">
              Talk to Our Experts <ArrowRight size={17} />
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-3 rounded-full border border-foreground/60 px-7 py-3.5 text-sm font-bold">
              Request Service Brochure <FileText size={16} className="text-primary" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1380px] gap-6 px-5 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-12">
          {stats.map(([icon, value, label]) => (
            <div key={label} className="flex items-center gap-4">
              <IconRing icon={icon} />
              <div>
                <p className="text-2xl font-black">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-border bg-card text-card-foreground">
        <div className="mx-auto grid max-w-[1380px] items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr_0.8fr] lg:px-12">
          <div>
            <Eyebrow onLight>Overview</Eyebrow>
            <h2 className="mt-4 text-3xl font-black uppercase leading-[0.95] sm:text-4xl">
              Research today. A stronger <span className="text-primary">tomorrow.</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-card-foreground sm:text-base">
              Riloyd's Business Research, Analysis &amp; Strategy service provides data-driven insights and practical strategies to help businesses identify opportunities, reduce risks and achieve sustainable growth.
            </p>
            <Link to="/contact" className="solid-cta mt-7 inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3 text-sm font-extrabold text-primary-foreground">
              Discuss Your Requirements <ArrowRight size={16} />
            </Link>
          </div>
          <img src={overviewAsset} alt="Riloyd boardroom with city skyline at sunset" className="aspect-[16/10] w-full rounded-md object-cover object-[65%_center]" loading="lazy" decoding="async" />
          <ul className="grid gap-4">
            {benefits.map(([icon, label]) => (
              <li key={label} className="flex items-center gap-4 text-sm font-semibold">
                <IconRing icon={icon} size="h-10 w-10" />{label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12">
          <Eyebrow>Our service areas</Eyebrow>
          <h2 className="mt-4 text-3xl font-black uppercase leading-[0.95] sm:text-4xl">
            Complete solutions<br />from insights to <span className="text-primary">strategy.</span>
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {areas.map(([Icon, title, items]) => (
              <article key={title} className="border border-border bg-card p-6 text-card-foreground transition-colors hover:border-primary">
                <Icon size={36} className="text-primary" />
                <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
                <ul className="mt-3 grid gap-1.5 text-sm text-card-foreground">
                  {items.map((i) => (
                    <li key={i} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{i}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card text-card-foreground">
        <div className="mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Eyebrow onLight>Our process</Eyebrow>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-card-foreground">A structured approach for measurable results.</p>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([icon, n, title, copy]) => (
              <div key={n} className="flex items-start gap-4">
                <IconRing icon={icon} size="h-16 w-16" />
                <div>
                  <p className="text-3xl font-light text-card-foreground">{n}</p>
                  <h3 className="font-extrabold">{title}</h3>
                  <p className="mt-1 text-sm text-card-foreground">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Eyebrow>Key deliverables</Eyebrow>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Tailored reports. Actionable outcomes.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {deliverables.map(([Icon, title, copy]) => (
              <article key={title} className="border border-border bg-card p-6 text-center text-card-foreground">
                <Icon size={34} className="mx-auto text-primary" />
                <h3 className="mt-4 font-extrabold">{title}</h3>
                <p className="mt-2 text-sm text-card-foreground">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1380px] gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
          <div>
            <Eyebrow>Frequently asked questions</Eyebrow>
            <h2 className="mt-4 text-3xl font-black uppercase leading-[0.95] sm:text-4xl">
              Your questions.<br />Our <span className="text-primary">answers.</span>
            </h2>
            <p className="mt-5 text-sm text-muted-foreground sm:text-base">Quick answers to common queries about our Business Research, Analysis &amp; Strategy services.</p>
          </div>
          <div className="grid gap-3">
            {faqs.map(([q, a], i) => (
              <div key={q} className="rounded-md border border-border bg-card text-card-foreground">
                <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold">
                  {q}{open === i ? <Minus size={16} /> : <Plus size={16} />}
                </button>
                {open === i ? <p className="px-5 pb-4 text-sm text-card-foreground">{a}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

