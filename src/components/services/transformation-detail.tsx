import { Link } from "@tanstack/react-router";
import {
  ArrowRight, BarChart3, ChevronRight, ClipboardList, Cog,
  Coins, Gauge, GitBranch, Monitor, Search, Settings, Target, Users, Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroAsset from "@/assets/local/transformation-hero.png.optimized.webp";
import overviewAsset from "@/assets/local/transformation-overview.png.optimized.webp";
import processAsset from "@/assets/local/transformation-process.png.optimized.webp";
import reportAsset from "@/assets/local/transformation-report.png.optimized.webp";
import stairsAsset from "@/assets/local/transformation-stairs.png.optimized.webp";

const solutions = [
  [BarChart3, "Business Assessment & Transformation Strategy", "Understand your current position and build a clear transformation roadmap."],
  [Cog, "Process Optimization", "Streamline operations, improve efficiency and reduce costs."],
  [Users, "Organizational Restructuring", "Build agile teams and stronger decision-making structures."],
  [Monitor, "Digital Transformation", "Use technology to create smarter, scalable ways of working."],
] as const;

const steps = [
  [Search, "01", "Assess", "Analyse your business, identify gaps and growth opportunities."],
  [Workflow, "02", "Plan", "Develop a detailed transformation strategy."],
  [Settings, "03", "Implement", "Execute with the right tools, processes and technology."],
  [BarChart3, "04", "Measure", "Track progress with clear metrics and KPIs."],
  [Target, "05", "Transform", "Build a stronger, more competitive and future-ready business."],
] as const;

const deliverables = [
  [ClipboardList, "Business Transformation Roadmap"],
  [Cog, "Process Improvement Plan"],
  [GitBranch, "Organizational Restructuring Plan"],
  [Monitor, "Digital Transformation Strategy"],
  [Coins, "Cost Optimization Plan"],
  [Gauge, "Operational Efficiency Framework"],
  [Users, "Change Management Support"],
  [BarChart3, "Performance Tracking Dashboard"],
] as const;

function Eyebrow({ children, onLight = false }: { children: React.ReactNode; onLight?: boolean }) {
  return (
    <p className={`flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] ${onLight ? "text-card-foreground" : "text-soft"}`}>
      <span className="block h-0.5 w-9 shrink-0 bg-primary" />
      {children}
    </p>
  );
}

export function TransformationDetail() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <img src={heroAsset} alt="Chess pieces on a boardroom table overlooking a city at sunset" className="absolute inset-0 h-full w-full object-cover object-center" decoding="async" fetchPriority="high" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12 lg:py-24">
          <nav className="flex items-center gap-2 text-xs text-soft">
            <Link to="/">Home</Link><ChevronRight size={12} />
            <Link to="/services">Services</Link><ChevronRight size={12} />
            <span>Business Transformation</span>
          </nav>
          <div className="mt-7"><Eyebrow>Business transformation</Eyebrow></div>
          <h1 className="headline mt-4 max-w-[720px] text-[clamp(2.4rem,5vw,4.7rem)] font-black uppercase leading-[0.94]">
            Transform today for <span className="text-primary">a stronger tomorrow.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-soft md:text-lg">
            Riloyd helps businesses rethink, realign and transform to become more efficient, competitive and future-ready.
          </p>
          <Button asChild size="lg" className="mt-8 h-auto min-h-12 max-w-full whitespace-normal rounded-full px-7 py-3 text-sm font-extrabold">
            <Link to="/contact">Talk to Our Transformation Team <ArrowRight size={17} /></Link>
          </Button>
        </div>
      </section>

      <section className="border-b border-border bg-card text-card-foreground">
        <div className="mx-auto grid max-w-[1380px] items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:px-12">
          <img src={overviewAsset} alt="Riloyd office overlooking mountains at sunrise" className="aspect-[16/11] w-full rounded-md object-cover" loading="lazy" decoding="async" />
          <div>
            <Eyebrow onLight>What we do</Eyebrow>
            <h2 className="mt-4 text-3xl font-black uppercase leading-[0.98] sm:text-4xl">
              Build a stronger, more <span className="text-primary">future-ready business.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed sm:text-base">
              We work with businesses to identify challenges, unlock opportunities and implement transformation strategies that deliver measurable results.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {solutions.map(([Icon, title, copy]) => (
                <article key={title} className="flex gap-4 rounded-md border border-border p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon size={20} /></span>
                  <div>
                    <h3 className="text-sm font-extrabold leading-tight">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed">{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border">
        <img src={processAsset} alt="Mountain trail leading towards a summit" className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12">
          <Eyebrow>Our transformation process</Eyebrow>
          <h2 className="headline mt-4 text-3xl font-black uppercase leading-[0.98] sm:text-5xl">From insights<br /><span className="text-primary">to impact.</span></h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map(([Icon, n, title, copy]) => (
              <article key={n} className="min-w-0 rounded-md border border-border bg-background/80 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2 text-primary"><span className="text-2xl font-black">{n}</span><Icon size={23} /></div>
                <h3 className="mt-4 font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-soft">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card text-card-foreground">
        <div className="mx-auto grid max-w-[1380px] items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1.5fr_0.8fr] lg:px-12">
          <div>
            <Eyebrow onLight>Key deliverables</Eyebrow>
            <h2 className="mt-4 text-3xl font-black uppercase sm:text-4xl">What <span className="text-primary">you get</span></h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {deliverables.map(([Icon, title]) => (
                <article key={title} className="flex min-h-20 items-center gap-4 rounded-md border border-border p-4">
                  <Icon size={25} className="shrink-0 text-primary" />
                  <h3 className="text-sm font-bold leading-snug">{title}</h3>
                </article>
              ))}
            </div>
          </div>
          <img src={reportAsset} alt="Riloyd business transformation report on a desk" className="aspect-[4/3] w-full rounded-md object-cover" loading="lazy" decoding="async" />
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border">
        <img src={stairsAsset} alt="Illuminated staircase leading towards a city skyline" className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12">
          <h2 className="headline max-w-2xl text-3xl font-black uppercase leading-[0.98] sm:text-5xl">
            Ready to <span className="text-primary">transform</span> your business?
          </h2>
          <p className="mt-5 max-w-xl text-base text-soft">Let&apos;s build a smarter, stronger and more future-ready business.</p>
          <Button asChild size="lg" className="mt-8 h-12 rounded-full px-8 text-sm font-extrabold">
            <Link to="/contact">Talk to Riloyd <ArrowRight size={17} /></Link>
          </Button>
        </div>
      </section>
    </>
  );
}
