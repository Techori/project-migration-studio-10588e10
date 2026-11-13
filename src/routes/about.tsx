import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  Check,
  Compass,
  Crown,
  Eye,
  Factory,
  Flag,
  Globe2,
  Handshake,
  Landmark,
  Lightbulb,
  Rocket,
  SearchCheck,
  Settings2,
  ShieldCheck,
  Target,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImageAsset from "@/assets/local/about-global-hero.jpg.optimized.webp";
const heroImage = heroImageAsset;
import leadershipImageAsset from "@/assets/local/about-leadership.jpg.optimized.webp";
const leadershipImage = leadershipImageAsset;
import visionImageAsset from "@/assets/local/about-vision.jpg.optimized.webp";
const visionImage = visionImageAsset;
import mapImageAsset from "@/assets/local/global-map.jpg.optimized.webp";
const mapImage = mapImageAsset;
import logoAsset from "@/assets/local/riloyd-logo.png.optimized.640.webp";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "About Riloyd | Insight, Decisions and Execution" },
      { name: "description", content: "RILOYD is a business advisory firm helping businesses make informed decisions across strategy, funding, growth, transformation and risk." },
      { property: "og:title", content: "About Riloyd | Insight, Decisions and Execution" },
      { property: "og:description", content: "Discover how RILOYD combines research, strategic thinking and an execution perspective to help businesses move forward with clarity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const advisoryOverview = [
  { icon: UsersRound, label: "Who We Serve", hash: "who-we-serve", copy: "Founders, growing businesses, enterprises, investors and stakeholders navigating important moments." },
  { icon: Compass, label: "What We Do", hash: "what-we-do", copy: "We bring structure to complex choices through research, strategy, commercial insight and execution planning." },
  { icon: Lightbulb, label: "How We Think", hash: "how-we-think", copy: "We examine the wider business context, challenge assumptions and connect each decision to measurable outcomes." },
  { icon: Handshake, label: "Our Difference", hash: "our-difference", copy: "We work as a long-term advisory partner—bringing direction, perspective and practical momentum." },
];

const missionPoints = [
  "Bring evidence and independent thinking to every important decision.",
  "Connect strategy, capital, operations and markets into one coherent direction.",
  "Stay alongside leadership teams from diagnosis through to execution.",
  "Build relationships measured by long-term business progress.",
];

const managementRoles = [
  { icon: Crown, title: "Chairman", copy: "Sets the long-term direction of the firm and safeguards its values and governance." },
  { icon: Briefcase, title: "Managing Director", copy: "Leads the firm's overall strategy, client relationships and growth priorities." },
  { icon: TrendingUp, title: "Chief Executive Officer", copy: "Turns strategy into delivery across services, markets and teams." },
  { icon: Settings2, title: "Chief Operating Officer", copy: "Owns operations, quality of delivery and the systems that support client work." },
  { icon: Landmark, title: "Chief Financial Officer", copy: "Oversees financial planning, controls and funding-related advisory standards." },
  { icon: Target, title: "Chief Strategy Officer", copy: "Shapes research, advisory methodology and the firm's strategic thinking." },
  { icon: Globe2, title: "Head of Global Partnerships", copy: "Builds and manages relationships across Riloyd's international markets." },
];

const thinkingPrinciples = [
  { icon: SearchCheck, title: "Evidence over assumption", copy: "We test beliefs against data, market signals and the economics of the business before forming a view." },
  { icon: Compass, title: "The whole business, not one problem", copy: "We look at how a decision affects strategy, capital, people, operations and risk together." },
  { icon: ShieldCheck, title: "Independent judgement", copy: "We say what we believe is right for the business, even when it is not the easiest message." },
  { icon: Target, title: "Outcomes we can measure", copy: "Every recommendation is linked to priorities, owners and results that can be tracked over time." },
];

const comparison = [
  ["Solves a defined problem", "Understands the wider business"],
  ["Project focused", "Relationship focused"],
  ["Recommendations", "Decisions + direction"],
  ["Short-term engagement", "Long-term partnership"],
  ["Advice", "Advisory + execution perspective"],
];

const audiences = [
  { icon: Rocket, title: "Founders & Entrepreneurs", copy: "For businesses building their next stage of growth." },
  { icon: TrendingUp, title: "SMEs & Growing Businesses", copy: "For businesses looking to scale, transform or restructure." },
  { icon: Factory, title: "Manufacturers & Enterprises", copy: "For operational, strategic and market challenges." },
  { icon: Building2, title: "Startups", copy: "For strategy, funding readiness and growth planning." },
  { icon: BarChart3, title: "Investors & Business Stakeholders", copy: "For research, analysis and business evaluation." },
];

const solutionApproach = [
  { icon: SearchCheck, title: "Understand the context", copy: "We begin with evidence—your market, business model, constraints and opportunities." },
  { icon: Target, title: "Clarify the decision", copy: "We identify what matters most, frame the choices and establish a clear direction." },
  { icon: Compass, title: "Shape the path forward", copy: "We translate strategy into priorities, responsibilities and an achievable action plan." },
  { icon: Check, title: "Keep action measurable", copy: "We stay focused on outcomes so progress can be evaluated and decisions can evolve." },
];

const differentiators = [
  { icon: SearchCheck, title: "Insight Before Action", copy: "Every recommendation begins with evidence, context and a clear understanding of the decision." },
  { icon: Compass, title: "Wider Business Perspective", copy: "We connect strategy, capital, operations, markets and risk rather than viewing challenges in isolation." },
  { icon: Handshake, title: "Partnership Mindset", copy: "We build relationships around long-term business progress, not only the delivery of a single project." },
  { icon: Target, title: "Execution-Oriented Advice", copy: "Our thinking is designed to become practical priorities, informed choices and measurable action." },
  { icon: Globe2, title: "Global Outlook, Local Context", copy: "International perspective is balanced with the commercial realities of each business and market." },
];

const markets = ["India", "Singapore", "UAE", "UK", "USA", "Canada", "Australia", "Europe"];

function ImageBrand() {
  return <img src={logoAsset} alt="Riloyd" className="absolute right-5 top-5 z-20 h-9 w-auto object-contain sm:right-8 sm:top-8 sm:h-11" decoding="async" />;
}

function AboutPage() {
  return (
    <main className="overflow-hidden bg-background text-foreground">
      <section className="relative min-h-[590px] overflow-hidden border-b border-border sm:min-h-[650px]">
        <img src={heroImage} width={1920} height={900} alt="Earth connected by international business routes" className="absolute inset-0 h-full w-full object-cover object-[64%_center]" decoding="async" fetchPriority="high" />
        <div className="about-hero-shade absolute inset-0" />
        <ImageBrand />
        <div className="relative z-10 mx-auto flex min-h-[590px] max-w-[1380px] items-center px-5 py-20 sm:min-h-[650px] sm:px-6 lg:px-12">
          <div className="max-w-3xl">
            <p className="eyebrow text-[10px] font-bold uppercase text-soft">About Riloyd</p>
            <h1 className="headline mt-5 text-[clamp(2.55rem,5.3vw,5.25rem)] font-black uppercase leading-[.92]">Business decisions.<br /><span className="text-primary">Backed by insight.</span><br />Driven by execution.</h1>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-soft sm:text-base">RILOYD is a business advisory firm helping leaders navigate critical decisions across strategy, funding, sales growth, transformation and risk management.</p>
            <p className="mt-3 max-w-2xl text-xs leading-relaxed text-soft sm:text-sm">We combine research, rigorous analysis and strategic thinking with an execution-oriented perspective—helping businesses move from uncertainty to clarity, and from plans to measurable action.</p>
            <Button asChild size="lg" className="mt-8 rounded-full px-7 font-bold"><Link to="/contact">Start a Conversation <ArrowRight size={16} /></Link></Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-[1380px] sm:grid-cols-2 lg:grid-cols-4">
          {advisoryOverview.map(({ icon: Icon, label, copy, hash }) => <Link key={label} to="/about" hash={hash} className="group border-b border-border px-5 py-8 transition-colors hover:bg-background sm:border-r sm:px-6 lg:border-b-0 lg:px-7 last:border-r-0"><Icon size={28} strokeWidth={1.7} className="text-primary" /><h2 className="mt-4 flex items-center gap-2 text-sm font-extrabold uppercase">{label}<ArrowRight size={13} className="text-primary opacity-0 transition-opacity group-hover:opacity-100" /></h2><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{copy}</p></Link>)}
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-b border-border bg-background">
        <div className="absolute inset-0 lg:hidden">
          <img src={leadershipImage} width={1600} height={900} loading="lazy" alt="Business leader considering a city growth strategy" className="absolute inset-0 h-full w-full object-cover object-center" decoding="async" />
          <div className="about-image-shade absolute inset-0" />
          <div className="absolute inset-0 bg-background/80" />
          <ImageBrand />
        </div>
        <div className="relative z-10 mx-auto grid max-w-[1380px] lg:grid-cols-[.9fr_1.1fr]">
          <div className="flex flex-col justify-center px-5 py-14 sm:px-6 lg:px-12 lg:py-20">
            <p className="eyebrow text-[10px] font-bold uppercase text-soft">Who we are</p>
            <h2 className="mt-4 text-3xl font-black uppercase leading-[.98] sm:text-5xl">More than consultants. <span className="text-primary">Partners in better decisions.</span></h2>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">We look beyond an isolated problem to understand the business around it—its ambitions, economics, market realities and ability to execute. That wider view helps us provide advice that is commercially grounded, connected and useful.</p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">Our role is to help leadership teams ask sharper questions, evaluate choices with confidence and turn the right decisions into forward movement.</p>
          </div>
          <div className="relative hidden min-h-[560px] lg:block"><img src={leadershipImage} width={1600} height={900} loading="lazy" alt="Business leader considering a city growth strategy" className="absolute inset-0 h-full w-full object-cover object-center" decoding="async" /><div className="about-image-shade absolute inset-0" /><ImageBrand /></div>
        </div>
      </section>

      <section className="border-b border-border bg-card text-card-foreground">
        <div className="mx-auto grid max-w-[1380px] md:grid-cols-2">
          <article id="vision" className="scroll-mt-6 border-b border-border px-5 py-14 sm:px-6 md:border-b-0 md:border-r lg:px-12 lg:py-20"><Eye size={32} strokeWidth={1.6} className="text-primary" /><p className="eyebrow mt-6 text-[10px] font-bold uppercase">Our vision</p><h2 className="mt-4 text-2xl font-black uppercase leading-[1.02] sm:text-4xl">To be the trusted partner behind <span className="text-primary">better business decisions</span>—everywhere we work.</h2><p className="mt-5 max-w-lg text-sm leading-relaxed text-card-foreground">We see a future where every growing business has access to clear insight, sound judgement and the confidence to act on it, regardless of size or market.</p></article>
          <article id="mission" className="scroll-mt-6 px-5 py-14 sm:px-6 lg:px-12 lg:py-20"><Flag size={32} strokeWidth={1.6} className="text-primary" /><p className="eyebrow mt-6 text-[10px] font-bold uppercase">Our mission</p><h2 className="mt-4 text-2xl font-black uppercase leading-[1.02] sm:text-4xl">Turn complexity into clarity, <span className="text-primary">and clarity into measurable action.</span></h2><ul className="mt-5 grid max-w-lg gap-2 text-sm leading-relaxed text-card-foreground">{missionPoints.map((point) => <li key={point} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-primary" />{point}</li>)}</ul></article>
        </div>
      </section>

      <section id="management" className="scroll-mt-6 border-b border-border bg-background py-14 sm:py-20">
        <div className="mx-auto max-w-[1380px] px-5 sm:px-6 lg:px-12">
          <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="eyebrow text-[10px] font-bold uppercase text-soft">Our management</p><h2 className="mt-4 text-3xl font-black uppercase leading-[.98] sm:text-5xl">Leadership with <span className="text-primary">clear accountability.</span></h2></div><p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">RILOYD is guided by a leadership structure in which each role owns a defined part of how we serve clients, grow the firm and protect its standards.</p></div>
          <div className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">{managementRoles.map(({ icon: Icon, title, copy }) => <article key={title} className="bg-background p-6"><Icon size={28} strokeWidth={1.7} className="text-primary" /><h3 className="mt-5 text-sm font-extrabold leading-snug">{title}</h3><p className="mt-3 text-xs leading-relaxed text-muted-foreground">{copy}</p></article>)}<Link to="/team" className="group flex flex-col justify-between bg-surface p-6"><UsersRound size={28} strokeWidth={1.7} className="text-primary" /><span className="mt-5 flex items-center gap-2 text-sm font-extrabold">Meet our team <ArrowRight size={14} className="text-primary transition-transform group-hover:translate-x-1" /></span></Link></div>
        </div>
      </section>


      <section id="what-we-do" className="scroll-mt-6 border-b border-border bg-card py-14 text-card-foreground sm:py-20">
        <div className="mx-auto max-w-[1380px] px-5 sm:px-6 lg:px-12">
          <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="eyebrow text-[10px] font-bold uppercase">What we do</p><h2 className="mt-4 text-3xl font-black uppercase sm:text-5xl">End-to-end business solutions</h2></div><p className="max-w-2xl text-sm leading-relaxed text-card-foreground">Our work connects insight, decisions and implementation. Rather than repeating a fixed list of services, we shape the right combination of expertise around the business question—then create a practical route from diagnosis to action.</p></div>
          <div className="mt-10 grid gap-px bg-secondary sm:grid-cols-2 lg:grid-cols-4">
            {solutionApproach.map(({ icon: Icon, title, copy }, index) => <article key={title} className="bg-card p-6"><span className="text-xs font-black text-primary">0{index + 1}</span><Icon size={29} className="mt-7 text-primary" /><h3 className="mt-4 text-sm font-extrabold">{title}</h3><p className="mt-2 text-xs leading-relaxed text-card-foreground">{copy}</p></article>)}
          </div>
          <Button asChild variant="outline" className="mt-8 rounded-full border-primary px-6 text-xs font-bold"><Link to="/services">View Our Services <ArrowRight size={14} /></Link></Button>
        </div>
      </section>

      <section id="how-we-think" className="scroll-mt-6 border-b border-border bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-[1380px] px-5 sm:px-6 lg:px-12">
          <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="eyebrow text-[10px] font-bold uppercase text-soft">How we think</p><h2 className="mt-4 text-3xl font-black uppercase leading-[.98] sm:text-5xl">Context first. <span className="text-primary">Conclusions second.</span></h2></div><p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Good advice depends on the quality of thinking behind it. These principles guide how we approach every business question.</p></div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{thinkingPrinciples.map(({ icon: Icon, title, copy }) => <article key={title} className="border border-border bg-background p-6"><Icon size={28} strokeWidth={1.7} className="text-primary" /><h3 className="mt-5 text-sm font-extrabold leading-snug">{title}</h3><p className="mt-3 text-xs leading-relaxed text-muted-foreground">{copy}</p></article>)}</div>
        </div>
      </section>


      <section className="border-b border-border bg-background py-14 sm:py-20">
        <div className="mx-auto max-w-[1380px] px-5 sm:px-6 lg:px-12">
          <p className="eyebrow text-[10px] font-bold uppercase text-soft">Consultant vs advisory partner</p>
          <h2 className="mt-4 max-w-4xl text-3xl font-black uppercase leading-[.98] sm:text-5xl">We don&apos;t just give answers. <span className="text-primary">We help businesses make better decisions.</span></h2>
          <div className="mt-10 overflow-hidden border border-border">
            <div className="grid grid-cols-2 bg-surface text-[11px] font-extrabold uppercase sm:text-sm"><div className="p-4 sm:p-6">Traditional Consultant</div><div className="border-l border-border p-4 text-primary sm:p-6">RILOYD Business Advisory Partner</div></div>
            {comparison.map(([consultant, riloyd]) => <div key={consultant} className="grid grid-cols-2 border-t border-border text-[11px] leading-relaxed sm:text-sm"><div className="p-4 text-muted-foreground sm:p-6">{consultant}</div><div className="flex items-start gap-2 border-l border-border p-4 font-semibold sm:p-6"><Check size={16} className="mt-0.5 shrink-0 text-primary" />{riloyd}</div></div>)}
          </div>
        </div>
      </section>

      <section id="who-we-serve" className="scroll-mt-6 border-b border-border bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-[1380px] px-5 sm:px-6 lg:px-12">
          <p className="eyebrow text-[10px] font-bold uppercase text-soft">Who we serve</p>
          <h2 className="mt-4 text-3xl font-black uppercase sm:text-5xl">Built around business realities.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">We work with the people who carry responsibility for important business outcomes—whether they are building something new, scaling what works or protecting long-term value.</p>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{audiences.map(({ icon: Icon, title, copy }) => <article key={title} className="border border-border bg-background p-5"><Icon size={30} className="text-primary" /><h3 className="mt-5 text-sm font-extrabold leading-snug">{title}</h3><p className="mt-3 text-xs leading-relaxed text-muted-foreground">{copy}</p></article>)}</div>
        </div>
      </section>

      <section id="our-difference" className="scroll-mt-6 border-b border-border bg-background py-14 sm:py-20">
        <div className="mx-auto max-w-[1380px] px-5 sm:px-6 lg:px-12">
          <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><p className="eyebrow text-[10px] font-bold uppercase text-soft">Why businesses choose Riloyd</p><h2 className="mt-4 text-3xl font-black uppercase leading-[.98] sm:text-5xl">Clarity for the decision. <span className="text-primary">Momentum for what follows.</span></h2></div><p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Businesses choose RILOYD when the answer cannot come from a template. We bring disciplined analysis, independent thinking and a practical execution perspective to decisions that shape growth, resilience and long-term value.</p></div>
          <div className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-5">{differentiators.map(({ icon: Icon, title, copy }) => <article key={title} className="bg-background p-6"><Icon size={30} strokeWidth={1.7} className="text-primary" /><h3 className="mt-5 text-sm font-extrabold leading-snug">{title}</h3><p className="mt-3 text-xs leading-relaxed text-muted-foreground">{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="relative min-h-[560px] overflow-hidden border-b border-border">
        <img src={mapImage} width={1600} height={656} loading="lazy" alt="World map with subtle connections between Riloyd markets" className="absolute inset-0 h-full w-full object-cover object-center" decoding="async" />
        <div className="about-global-shade absolute inset-0" />
        <ImageBrand />
        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-[1380px] items-center px-5 py-16 sm:px-6 lg:px-12">
          <div className="max-w-3xl"><p className="eyebrow text-[10px] font-bold uppercase text-soft">Our global perspective</p><h2 className="mt-4 text-4xl font-black uppercase leading-[.95] sm:text-6xl">Business has <span className="text-primary">no borders.</span></h2><p className="mt-5 max-w-xl text-sm leading-relaxed text-soft">RILOYD brings an international perspective to business decisions while respecting the commercial realities of each market. We connect insight, networks and opportunity across regions.</p><div className="mt-8 flex max-w-2xl flex-wrap gap-2">{markets.map((market) => <span key={market} className="border border-border bg-background/70 px-4 py-2 text-xs font-bold">{market}</span>)}</div></div>
        </div>
      </section>

      <section className="relative min-h-[540px] overflow-hidden border-b border-border">
        <img src={visionImage} width={1600} height={700} loading="lazy" alt="Leader looking beyond a mountain horizon" className="absolute inset-0 h-full w-full object-cover object-[67%_center]" decoding="async" />
        <div className="about-vision-shade absolute inset-0" />
        <ImageBrand />
        <div className="relative z-10 mx-auto flex min-h-[540px] max-w-[1380px] items-center px-5 py-16 sm:px-6 lg:px-12"><div className="max-w-2xl"><p className="eyebrow text-[10px] font-bold uppercase text-soft">Our philosophy</p><h2 className="mt-5 text-4xl font-black uppercase leading-[.94] sm:text-6xl">Think beyond today.<br /><span className="text-primary">Build for tomorrow.</span></h2><p className="mt-6 max-w-xl text-sm leading-relaxed text-soft sm:text-base">Businesses evolve. Markets change. Opportunities emerge. Risks shift. RILOYD exists to help businesses understand these changes, make informed decisions and build what comes next.</p></div></div>
      </section>

      <section className="relative min-h-[340px] overflow-hidden">
        <img src={heroImage} width={1920} height={900} loading="lazy" alt="Connected global business landscape" className="absolute inset-0 h-full w-full object-cover object-[66%_center]" decoding="async" />
        <div className="about-hero-shade absolute inset-0" />
        <ImageBrand />
        <div className="relative z-10 mx-auto flex min-h-[340px] max-w-[1380px] items-center px-5 py-14 sm:px-6 lg:px-12"><div className="max-w-2xl"><p className="eyebrow text-[10px] font-bold uppercase text-soft">The next decision</p><h2 className="mt-4 text-4xl font-black uppercase leading-[.95] sm:text-5xl">Move forward with <span className="text-primary">clarity.</span></h2><p className="mt-4 max-w-lg text-sm text-soft">Talk to RILOYD about the business decision in front of you.</p><Button asChild size="lg" className="mt-6 rounded-full px-7 font-bold"><Link to="/contact">Start a Conversation <ArrowRight size={16} /></Link></Button></div></div>
      </section>
    </main>
  );
}