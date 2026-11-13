import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, BarChart3, Building2, Calculator, ChevronRight, Coins, FileText, Handshake,
  Landmark, Minus, Plus, RefreshCw, Search, Sprout, Users, Wallet,
} from "lucide-react";
import heroAsset from "@/assets/local/funding-hero.png.optimized.webp";
import equityAsset from "@/assets/local/funding-equity.png.optimized.webp";
import debtAsset from "@/assets/local/funding-debt.png.optimized.webp";
import grantsAsset from "@/assets/local/funding-grants.png.optimized.webp";
import investorsAsset from "@/assets/local/funding-investors.png.optimized.webp";

const fundingTypes = [
  [equityAsset, Coins, "Equity Funding", ["Investor connections", "Pitch support", "Valuation guidance"]],
  [debtAsset, Landmark, "Debt Funding", ["Bank loans", "Working capital", "Term loans"]],
  [grantsAsset, BarChart3, "Government Grants", ["MSME schemes", "Subsidies & incentives", "Policy support"]],
  [investorsAsset, Handshake, "Strategic Investors", ["Industry investors", "Growth partners", "Long-term collaboration"]],
] as const;

const steps = [
  [Search, "01", "Understand", "Your business, goals and funding needs."],
  [BarChart3, "02", "Prepare", "Financials, pitch deck and documentation."],
  [Users, "03", "Connect", "Engage with the right investors and lenders."],
  [FileText, "04", "Support", "Negotiation, closure and post-funding guidance."],
] as const;

const capitalTypes = [
  [Sprout, "Seed Funding", "For early-stage businesses"],
  [TrendingIcon, "Growth Capital", "For expanding businesses"],
  [RefreshCw, "Working Capital", "For operational requirements"],
  [Wallet, "Equipment Financing", "For asset purchase and expansion"],
  [Building2, "Government Schemes", "For eligible MSMEs and startups"],
  [Handshake, "Strategic Partnerships", "For long-term growth and scale"],
] as const;

const deliverables = [
  [FileText, "Funding Strategy Report", "Right funding options with detailed roadmap"],
  [BarChart3, "Investor-Ready Pitch Deck", "Powerful and professional presentation"],
  [Calculator, "Financial Modelling", "Realistic projections and funding plan"],
  [Users, "Investor / Lender Introductions", "Access to relevant funding partners"],
  [FileText, "Documentation Support", "End-to-end assistance for a smooth process"],
] as const;

const faqs = [
  ["What types of funding can RILOYD help me with?", "We support equity funding, debt funding, government grants and schemes, and strategic investor partnerships — matched to your stage and goals."],
  ["Do you charge an upfront fee?", "Our engagement models are transparent and discussed before we begin. Depending on the mandate, we work on a fixed-fee, success-fee or hybrid basis."],
  ["How long does the funding process take?", "Timelines vary by funding type — typically 6–16 weeks from preparation to closure, depending on investor or lender processes."],
  ["What kind of businesses do you support?", "Startups, MSMEs and growing enterprises across industries — from seed stage to established businesses planning expansion."],
  ["Can you also help with government grants and schemes?", "Yes. We identify eligible MSME schemes, subsidies and incentives, and support you through the application and documentation process."],
];

function TrendingIcon(props: { size?: number; className?: string }) {
  return <BarChart3 {...props} />;
}

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

export function FundingDetail() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <img src={heroAsset} alt="Riloyd office desk with growth charts and city skyline at sunset" className="absolute inset-0 h-full w-full object-cover" decoding="async" fetchPriority="high" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12 lg:py-24">
          <nav className="flex items-center gap-2 text-xs text-soft">
            <Link to="/">Home</Link><ChevronRight size={12} />
            <Link to="/services">Services</Link><ChevronRight size={12} />
            <span>Business Funding</span>
          </nav>
          <div className="mt-6"><Eyebrow>Business funding</Eyebrow></div>
          <h1 className="headline mt-4 max-w-4xl text-[clamp(2.25rem,5vw,4.5rem)] font-black uppercase leading-[0.92]">
            Funding for a bigger <span className="text-primary">tomorrow.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-soft md:text-lg">
            We help businesses access the right capital through our network of investors, financial institutions and funding partners to accelerate growth.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/contact" className="solid-cta inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-extrabold text-primary-foreground">
              Get Funding Support <ArrowRight size={17} />
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-3 rounded-full border border-foreground/60 px-7 py-3.5 text-sm font-bold">
              Request Service Brochure <FileText size={16} className="text-primary" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fundingTypes.map(([img, Icon, title, items]) => (
              <article key={title} className="group relative overflow-hidden rounded-md border border-border">
                <img src={img} alt={title} className="h-44 w-full object-cover" loading="lazy" decoding="async" />
                <div className="bg-card p-6 text-card-foreground">
                  <span className="relative z-10 -mt-12 mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-primary">
                    <Icon size={22} />
                  </span>
                  <h3 className="text-lg font-extrabold">{title}</h3>
                  <ul className="mt-3 grid gap-1.5 text-sm text-card-foreground">
                    {items.map((i) => (
                      <li key={i} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{i}</li>
                    ))}
                  </ul>
                  <Link to="/contact" className="mt-4 inline-flex items-center gap-2 text-xs font-bold">
                    Learn More <ArrowRight size={14} className="text-primary" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card text-card-foreground">
        <div className="mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Eyebrow onLight>Our process</Eyebrow>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-card-foreground">From opportunity to capital.</p>
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
            <Eyebrow>Types of funding we support</Eyebrow>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Capital solutions for every stage.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {capitalTypes.map(([Icon, title, copy]) => (
              <article key={title} className="border border-border bg-card p-6 text-center text-card-foreground transition-colors hover:border-primary">
                <Icon size={34} className="mx-auto text-primary" />
                <h3 className="mt-4 font-extrabold">{title}</h3>
                <p className="mt-2 text-sm text-card-foreground">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Eyebrow>Key deliverables</Eyebrow>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Practical support. Measurable results.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {deliverables.map(([Icon, title, copy]) => (
              <article key={title} className="border border-border bg-card p-6 text-card-foreground">
                <Icon size={34} className="text-primary" />
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
            <p className="mt-5 text-sm text-muted-foreground sm:text-base">Quick answers to common queries about our Business Funding services.</p>
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
