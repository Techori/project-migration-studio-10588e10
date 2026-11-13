import { Link } from "@tanstack/react-router";
import {
  ArrowRight, BarChart3, ChartNoAxesCombined, ChevronRight,
  Funnel, Magnet, MonitorUp, Network, Rocket, Search, Settings2,
  Target, TrendingUp, UserRoundSearch, UsersRound, Waypoints,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImageAsset from "@/assets/local/growth-hero.jpg.optimized.webp";
const heroImage = heroImageAsset;
import targetImageAsset from "@/assets/local/growth-target.jpg.optimized.webp";
const targetImage = targetImageAsset;
import processImageAsset from "@/assets/local/growth-process.jpg.optimized.webp";
const processImage = processImageAsset;
import reportImageAsset from "@/assets/local/growth-report.jpg.optimized.webp";
const reportImage = reportImageAsset;
import ctaImageAsset from "@/assets/local/growth-cta.jpg.optimized.webp";
const ctaImage = ctaImageAsset;

const solutions = [
  [BarChart3, "Sales Strategy", "Build a clear sales roadmap aligned with business goals."],
  [UsersRound, "Lead Generation & Acquisition", "Create structured approaches to generate and convert qualified opportunities."],
  [Network, "Market & Channel Expansion", "Identify new markets, customer segments and distribution opportunities."],
  [ChartNoAxesCombined, "Revenue Optimization", "Improve conversion, pricing, sales productivity and revenue performance."],
] as const;

const steps = [
  [Search, "01", "Diagnose", "Understand your current sales and revenue performance."],
  [Waypoints, "02", "Strategize", "Build the sales and market-growth roadmap."],
  [Settings2, "03", "Build", "Strengthen channels, processes and sales systems."],
  [Rocket, "04", "Execute", "Implement the growth strategy with measurable actions."],
  [BarChart3, "05", "Scale", "Optimize performance and expand what works."],
] as const;

const deliverables = [
  [BarChart3, "Sales Growth Strategy"],
  [Target, "Go-to-Market Strategy"],
  [Magnet, "Lead Generation Framework"],
  [Funnel, "Sales Funnel Design"],
  [Network, "Channel & Distribution Strategy"],
  [UserRoundSearch, "Customer Acquisition Strategy"],
  [TrendingUp, "Revenue Optimization Plan"],
  [MonitorUp, "Sales Performance Dashboard"],
] as const;

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`flex items-center gap-3 text-[11px] font-bold uppercase ${light ? "text-card-foreground" : "text-soft"}`}><span className="h-0.5 w-9 shrink-0 bg-primary" />{children}</p>;
}

export function GrowthDetail() {
  return (
    <>
      <section className="relative min-h-[490px] overflow-hidden border-b border-border sm:min-h-[550px] lg:min-h-[590px]">
        <img src={heroImage} width={1600} height={864} alt="Laptop showing a rising sales chart in a city boardroom at sunset" className="absolute inset-0 h-full w-full object-cover object-[65%_center]" decoding="async" fetchPriority="high" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative z-10 mx-auto flex min-h-[490px] max-w-[1380px] flex-col justify-center px-5 py-12 sm:min-h-[550px] sm:px-6 lg:min-h-[590px] lg:px-12">
          <nav aria-label="Breadcrumb" className="mb-9 flex items-center gap-2 text-xs text-soft"><Link to="/">Home</Link><ChevronRight size={12} /><Link to="/services">Services</Link><ChevronRight size={12} /><span>Sales & Revenue Growth</span></nav>
          <Eyebrow>Sales & revenue growth</Eyebrow>
          <h1 className="headline mt-5 max-w-[740px] text-[clamp(2.4rem,5vw,5rem)] font-black uppercase leading-[0.96]">Sales &<br />revenue <span className="text-primary">growth.</span></h1>
          <p className="mt-5 max-w-xl text-base font-semibold leading-snug sm:text-lg">Build markets. Scale revenue. Grow with a system.</p>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-soft sm:text-base">RILOYD helps businesses strengthen their sales engine, improve customer acquisition, expand markets and build predictable revenue growth.</p>
          <Button asChild size="lg" className="mt-7 h-auto min-h-12 w-fit max-w-full whitespace-normal rounded-full px-7 py-3 text-sm font-extrabold"><Link to="/contact">Talk to Our Growth Team <ArrowRight size={17} /></Link></Button>
        </div>
      </section>

      <section className="border-b border-border bg-card text-card-foreground">
        <div className="mx-auto grid max-w-[1380px] items-center gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.1fr] lg:gap-12 lg:px-12 lg:py-16">
          <img src={targetImage} width={1104} height={912} loading="lazy" alt="Red arrow striking the center of a target" className="aspect-[5/4] w-full object-cover" decoding="async" />
          <div>
            <Eyebrow light>What we do</Eyebrow>
            <h2 className="mt-4 text-3xl font-black uppercase leading-[1.03] sm:text-4xl lg:text-5xl">Turn sales into<br />a <span className="text-primary">growth engine.</span></h2>
            <div className="mt-7 grid sm:grid-cols-2">
              {solutions.map(([Icon, title, copy]) => (
                <article key={title} className="flex min-w-0 gap-4 border-b border-border/20 py-5 sm:px-4 sm:even:border-l sm:first:pl-0 sm:nth-[3]:pl-0 sm:nth-[n+3]:border-b-0">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon size={21} /></span>
                  <div><h3 className="text-sm font-extrabold leading-tight">{title}</h3><p className="mt-2 text-xs leading-relaxed sm:text-sm">{copy}</p></div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border">
        <img src={processImage} width={1600} height={800} loading="lazy" alt="Business leader climbing illuminated steps toward a city skyline" className="absolute inset-0 h-full w-full object-cover object-[65%_center]" decoding="async" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-[1380px] px-5 py-14 sm:px-6 lg:px-12 lg:py-20">
          <Eyebrow>Our growth process</Eyebrow>
          <h2 className="headline mt-4 max-w-2xl text-3xl font-black uppercase leading-[1.02] sm:text-5xl">From opportunity<br /><span className="text-primary">to revenue.</span></h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map(([Icon, number, title, copy]) => (
              <article key={number} className="min-w-0 rounded-md border border-border bg-background/85 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-4 text-primary"><span className="text-xl font-black">{number}</span><Icon size={24} /></div>
                <h3 className="mt-4 text-base font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-soft">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card text-card-foreground">
        <div className="mx-auto grid max-w-[1380px] items-center gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[1.55fr_0.9fr] lg:gap-10 lg:px-12 lg:py-16">
          <div>
            <Eyebrow light>Key deliverables</Eyebrow>
            <h2 className="mt-4 text-3xl font-black uppercase sm:text-4xl lg:text-5xl">What <span className="text-primary">you get</span></h2>
            <div className="mt-7 grid gap-2 sm:grid-cols-2">
              {deliverables.map(([Icon, title]) => (
                <article key={title} className="flex min-h-20 items-center gap-4 rounded-md bg-primary/5 px-4 py-3">
                  <Icon size={25} className="shrink-0 text-primary" /><h3 className="text-sm font-bold leading-snug">{title}</h3>
                </article>
              ))}
            </div>
          </div>
          <img src={reportImage} width={1104} height={912} loading="lazy" alt="Sales growth charts in a strategy report on an executive desk" className="aspect-[4/3] w-full object-cover" decoding="async" />
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border">
        <img src={ctaImage} width={1600} height={656} loading="lazy" alt="Rising red revenue chart against a sunset skyline" className="absolute inset-0 h-full w-full object-cover object-[65%_center]" decoding="async" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12 lg:py-24">
          <h2 className="headline max-w-xl text-3xl font-black uppercase leading-[1.02] sm:text-5xl">Ready to scale<br /><span className="text-primary">your revenue?</span></h2>
          <p className="mt-4 max-w-lg text-base text-soft">Let&apos;s build a stronger sales engine for your business.</p>
          <Button asChild size="lg" className="mt-7 h-12 rounded-full px-8 text-sm font-extrabold"><Link to="/contact">Talk to RILOYD <ArrowRight size={17} /></Link></Button>
        </div>
      </section>
    </>
  );
}