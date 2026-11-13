import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { DeferredContent } from "@/components/deferred-content";
import { ResponsiveSiteImage } from '@/components/responsive-site-image';
import heroMobile from '@/assets/local/riloyd-mountain.png.optimized.mobile.webp';
import officeMobile from '@/assets/local/riloyd-office.png.optimized.mobile.webp';
import contactMobile from '@/assets/local/riloyd-contact-office.png.optimized.mobile.webp';
import diwaliHeroMobile from '@/assets/festive-diwali-hero-light.mobile.webp';
import chhathHeroMobile from '@/assets/chhath-home-hero.mobile.webp';
import diwaliOfficeMobile from '@/assets/festive-diwali-office-light.mobile.webp';
import chhathOfficeMobile from '@/assets/chhath-home-office.mobile.webp';
import diwaliContactMobile from '@/assets/festive-diwali-contact-light.mobile.webp';
import chhathContactMobile from '@/assets/chhath-home-contact.mobile.webp';
import { siteStats } from "@/lib/site-stats";
import {
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Play,
  SearchCheck,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  UserRoundPlus,
  UsersRound,
  Building2,
  Youtube,
} from "lucide-react";
import heroAsset from "@/assets/local/riloyd-mountain.png.optimized.webp";
import officeAsset from "@/assets/local/riloyd-office.png.optimized.webp";
import diwaliHero from "@/assets/festive-diwali-hero-light.webp";
import diwaliOffice from "@/assets/festive-diwali-office-light.webp";
import diwaliContact from "@/assets/festive-diwali-contact-light.webp";
import chhathHero from "@/assets/chhath-home-hero.webp";
import chhathOffice from "@/assets/chhath-home-office.webp";
import chhathContact from "@/assets/chhath-home-contact.webp";
import contactOfficeAsset from "@/assets/local/riloyd-contact-office.png.optimized.webp";
const ServiceAdvisor = lazy(() => import("@/components/service-advisor").then(module => ({ default: module.ServiceAdvisor })));
const FundingPopup = lazy(() => import("@/components/funding-popup").then(module => ({ default: module.FundingPopup })));

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Riloyd | Business Funding & Transformation" },
      {
        name: "description",
        content:
          "Riloyd helps ambitious businesses secure funding, sharpen strategy and achieve measurable growth.",
      },
      { property: "og:title", content: "Riloyd | Business Funding & Transformation" },
      {
        property: "og:description",
        content: "Strategy, funding and transformation for stronger businesses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const services = [
  {
    icon: SearchCheck,
    slug: "business-research-analysis-strategy",
    title: "Business Research, Analysis & Strategy",
    copy: "Data-driven insights for smarter decisions.",
  },
  {
    icon: CircleDollarSign,
    slug: "business-funding",
    title: "Business Funding",
    copy: "Connect with capital for your next phase.",
  },
  {
    icon: BarChart3,
    slug: "sales-revenue-growth",
    title: "Sales & Revenue Growth",
    copy: "Build markets. Scale faster.",
  },
  {
    icon: Settings,
    slug: "business-transformation",
    title: "Business Transformation",
    copy: "People, process and technology for tomorrow.",
  },
  {
    icon: UserRoundPlus,
    slug: "manpower-service",
    title: "Manpower Service",
    copy: "Get your staff at our payroll.",
  },
  {
    icon: Building2,
    slug: "startup-business-incubation-centers",
    title: "Startup & Business Incubation Centers",
    copy: "Workspace, support and connections for founders.",
  },
];

const stats = siteStats;

const strengths = [
  { icon: Target, title: "Strategic Advisory", copy: "From vision to execution" },
  { icon: UsersRound, title: "Experienced Team", copy: "Domain experts, real outcomes" },
  { icon: TrendingUp, title: "Measurable Results", copy: "Growth you can track" },
  { icon: ShieldCheck, title: "Trusted Partner", copy: "Long-term value, always" },
];

function Index() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section id="home" className="hero-shell relative min-h-[560px] border-b border-border sm:min-h-[640px] lg:min-h-[660px]">
        <ResponsiveSiteImage mobile={heroMobile}
          src={heroAsset}
          alt="Two mountaineers helping each other reach a summit"
          className="base-art absolute inset-0 h-full w-full object-cover object-[63%_38%] lg:object-[75%_38%]" decoding="async" fetchPriority="high" />
        <ResponsiveSiteImage mobile={diwaliHeroMobile} src={diwaliHero} alt="" aria-hidden="true" width={1600} height={864} className="diwali-art absolute inset-0 h-full w-full object-cover object-[70%_40%]" loading="lazy" decoding="async" />
        <ResponsiveSiteImage mobile={chhathHeroMobile} src={chhathHero} alt="" aria-hidden="true" width={1600} height={853} className="chhath-art absolute inset-0 h-full w-full object-cover object-[70%_40%]" loading="lazy" decoding="async" />
        <div className="diwali-sparkles" aria-hidden="true" />
        <div className="hero-shade absolute inset-0" />

        <div className="relative z-10 mx-auto flex max-w-[1380px] px-5 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-12 lg:pt-12">
          <div className="min-w-0 max-w-2xl">
            <p className="eyebrow mb-4 text-xs font-bold uppercase">Business beyond limits</p>
            <h1 className="headline text-[clamp(2.75rem,5.2vw,5.5rem)] font-black uppercase leading-[0.87]">
              Strategy today.<br />A stronger<br /><span className="text-primary">tomorrow.</span>
            </h1>
            <p className="hero-copy mt-6 max-w-xl text-base leading-relaxed text-soft md:text-lg">
              RILOYD partners with ambitious businesses to analyze opportunities, secure funding,
              scale sales and drive transformation — turning vision into measurable growth.
            </p>
            <Link to="/contact" className="solid-cta mt-6 inline-flex items-center gap-3 rounded-md bg-primary px-8 py-3.5 text-sm font-extrabold text-primary-foreground">
              Let&apos;s Talk <ArrowRight size={17} />
            </Link>
            <div className="hero-pillars mt-5 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-soft sm:tracking-[0.38em]">
              <span>People</span><i /><span>Ideas</span><i /><span>Capital</span><i /><span>Growth</span><b />
            </div>
          </div>
          <div className="hero-tagline ml-auto hidden self-start pt-16 text-right lg:block">
            <p className="text-lg font-semibold uppercase leading-[1.45] tracking-[0.2em]">Bigger<br />Bolder<br />Brighter<br />Together</p>
            <span className="mt-4 ml-auto block h-0.5 w-10 bg-primary" />
          </div>
        </div>
      </section>

      <section id="services" className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-[1380px] grid-cols-2 px-5 sm:grid-cols-3 sm:px-6 lg:px-12 xl:grid-cols-6">
          {services.map(({ icon: Icon, title, slug, copy }) => (
            <article key={title} className="service-item min-w-0 border-border odd:border-r sm:border-r xl:last:border-r-0">
              <Link to="/services/$slug" params={{ slug }} aria-label={`Learn more about ${title}`} className="flex h-[189px] min-w-0 flex-col items-start justify-center px-3 py-4 transition-colors hover:bg-surface sm:px-4 xl:px-3">
                <Icon className="shrink-0 text-primary" size={26} strokeWidth={1.7} />
                <h2 className="mt-3 min-w-0 text-[13px] font-extrabold leading-tight sm:text-sm lg:text-[15px]">{title}</h2>
                <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground sm:text-xs lg:text-[13px]">{copy}</p>
                <ArrowRight size={14} className="ml-auto hidden shrink-0 text-primary lg:block" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-[1380px] grid-cols-2 px-6 lg:grid-cols-4 lg:px-12">
          {stats.map(([value, label]) => (
            <div key={label} className="stat-block border-border px-3 py-6 lg:border-r lg:px-10 lg:last:border-r-0">
              <strong className="block text-3xl font-black leading-none text-primary">{value}</strong>
              <span className="mt-2 block text-sm text-soft">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-[1380px] lg:grid-cols-[2.15fr_1fr]">
          <div className="why-panel relative min-h-[350px] overflow-hidden px-5 py-10 sm:px-6 lg:min-h-[380px] lg:px-12 lg:py-11">
            <ResponsiveSiteImage mobile={officeMobile} src={officeAsset} alt="Riloyd corporate office at sunset" className="base-art absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
            <ResponsiveSiteImage mobile={diwaliOfficeMobile} src={diwaliOffice} alt="" aria-hidden="true" width={1536} height={768} className="diwali-art absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
            <ResponsiveSiteImage mobile={chhathOfficeMobile} src={chhathOffice} alt="" aria-hidden="true" width={1536} height={768} className="chhath-art absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
            <div className="why-shade absolute inset-0" />
            <div className="relative z-10 max-w-xl">
              <p className="eyebrow text-[10px] font-bold uppercase">Why Riloyd</p>
              <h2 className="mt-3 text-3xl font-black uppercase leading-[0.98] sm:text-4xl lg:text-5xl">We build businesses that <span className="text-primary">create impact.</span></h2>
              <p className="why-copy mt-4 max-w-lg text-sm leading-relaxed text-soft">RILOYD is a business advisory and transformation company helping ambitious entrepreneurs, SMEs and enterprises build a stronger, sustainable future.</p>
              <Link to="/about" className="solid-cta mt-5 inline-flex items-center gap-3 rounded-md bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground">About Riloyd <ArrowRight size={16} /></Link>
            </div>
          </div>
          <div className="grid grid-cols-1 content-center gap-5 px-5 py-9 sm:grid-cols-2 sm:px-6 lg:grid-cols-1 lg:px-10 lg:py-8">
            {strengths.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="flex items-center gap-5">
                <Icon className="shrink-0 text-primary" size={38} strokeWidth={1.7} />
                <div><h3 className="text-sm font-extrabold">{title}</h3><p className="mt-1 text-xs text-muted-foreground">{copy}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DeferredContent className="min-h-[540px]" fallback={<section className="min-h-[540px] border-b border-border bg-background" aria-busy="true" />}><Suspense fallback={<section className="min-h-[540px] border-b border-border bg-background" aria-busy="true" />}><ServiceAdvisor /></Suspense></DeferredContent>

      <section id="contact" className="contact-band relative min-h-[8cm] overflow-hidden border-b border-border sm:h-[8cm]">
        <ResponsiveSiteImage mobile={contactMobile} src={contactOfficeAsset} alt="Riloyd reception office overlooking a city at sunset" className="base-art contact-background absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
        <ResponsiveSiteImage mobile={diwaliContactMobile} src={diwaliContact} alt="" aria-hidden="true" width={1920} height={640} className="diwali-art absolute inset-0 h-full w-full object-cover object-right" loading="lazy" decoding="async" />
        <ResponsiveSiteImage mobile={chhathContactMobile} src={chhathContact} alt="" aria-hidden="true" width={1920} height={640} className="chhath-art absolute inset-0 h-full w-full object-cover object-right" loading="lazy" decoding="async" />
        <div className="contact-shade absolute inset-0" />
        <div className="relative mx-auto flex h-full max-w-[1380px] flex-col justify-center px-5 py-6 sm:px-6 lg:px-12">
          <div className="max-w-4xl">
            <h2 className="text-[37.5px] font-black leading-none sm:text-[45px]">Get in <span className="text-primary">Touch</span></h2>
            <p className="mt-1.5 text-[10px] font-medium uppercase text-soft sm:text-xs">Let&apos;s create a stronger tomorrow together</p>
          </div>
          <div className="mt-[38px] flex flex-wrap items-start justify-start gap-x-8 gap-y-5 sm:gap-x-[2cm]">
            <a className="contact-link" href="mailto:info@riloyd.in" aria-label="Write to us by email at info@riloyd.in"><Mail aria-hidden="true" /><span><b>Write to Us</b><small>We&apos;re just an email away</small></span></a>
            <Link className="contact-link" to="/contact" aria-label="Request a call back from the Riloyd team"><Phone aria-hidden="true" /><span><b>Request a Call</b><small>Send us your details</small></span></Link>
            <Link className="contact-link" to="/contact" aria-label="Send a message to Riloyd"><MessageCircle aria-hidden="true" /><span><b>Send a Message</b><small>We&apos;re here to help</small></span></Link>
            <Link className="contact-link" to="/contact" aria-label="Find the Riloyd office in Gwalior, India"><MapPin aria-hidden="true" /><span><b>Find Us</b><small>Gwalior, India</small></span></Link>
          </div>
        </div>
      </section>


      <DeferredContent mode="idle"><Suspense fallback={null}><FundingPopup /></Suspense></DeferredContent>
    </main>
  );
}