import type * as React from "react";
import { useState } from "react";
import { InternationalEnrolment } from "@/components/international-enrolment";
import { programmeFeesQuery } from "@/lib/programme-fees-query";
import { marketConfigs, marketOrder } from "@/lib/market-config";
import { indiaRegistrationOptions, indiaRegistrationSummary, summitParticipation, fundingProcess, type ProgrammeCountry } from "@/lib/international-programme";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Coins,
  Globe2,
  Handshake,
  MapPin,
  Network,
  Presentation,
  Rocket,
  SearchCheck,
  ShieldCheck,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import posterAsset from "@/assets/local/funding-programme-poster.webp";
import mentorAsset from "@/assets/local/funding-mentorship.webp";
import gwaliorAsset from "@/assets/local/funding-gwalior.webp";
import prototypeAsset from "@/assets/local/summit-prototype-india.webp";
import stayAsset from "@/assets/local/free-stay.webp";
import foodAsset from "@/assets/local/free-food.webp";
import localAsset from "@/assets/local/free-local.webp";
import { BedDouble, Car, Landmark, Utensils } from "lucide-react";
import gatheringRegistration from "@/assets/local/gathering-registration.webp";
import gatheringKit from "@/assets/local/gathering-kit.webp";
import gatheringStage from "@/assets/local/gathering-stage.webp";
import gatheringPitch from "@/assets/local/gathering-pitch.webp";
import gatheringExpo from "@/assets/local/gathering-expo.webp";
import gatheringBadges from "@/assets/local/gathering-badges.webp";
import gatheringHall from "@/assets/local/gathering-hall.webp";
import gatheringVideo from "@/assets/videos/funding-gathering-autoplay.mp4.asset.json";
import gatheringVideoWebm from "@/assets/videos/funding-gathering-autoplay.webm.asset.json";
import { ViewportVideo } from "@/components/viewport-video";
import { RegistrationCountdown } from "@/components/registration-countdown";

const ZOHOPUBLIC = "https://forms.zohopublic.in/RIPLSTORES/form/StartupIdeaRegistrationForm/formperma/1SNzTjiKwSF14T0BCEyJLvZCZDDowZl3NYWbAjpy1KE";

const pillars = [
  { icon: Presentation, label: "PITCH", copy: "Your startup" },
  { icon: Handshake, label: "CONNECT", copy: "With investors" },
  { icon: Coins, label: "RAISE", copy: "Up to ₹5 Crore" },
  { icon: TrendingUp, label: "GROW", copy: "Your business" },
];

const tiers = [
  ["1st", "₹10 Lakhs"],
  ["2nd", "₹5 Lakhs"],
  ["3rd", "₹2.5 Lakhs"],
  ["4th", "₹1.5 Lakhs"],
  ["5th", "₹1 Lakh"],
];

const why = [
  "Funding Opportunities",
  "Investor Connect",
  "Mentorship Support",
  "Business Evaluation",
  "Strategic Networking",
  "National Visibility",
];

const journey = [
  ["01", "Register", "Register online and submit your startup details to the Riloyd funding team."],
  ["02", "Startup Scanning", "Online within 15 days, Riloyd evaluates your startup, understands your business and provides a rating."],
  ["03", "First Pitch", "Pitch online to our jury panel with support from Riloyd mentors."],
  ["04", "Senior Jury Pitch", "Selected startups pitch online to the senior jury panel with continued mentor support."],
  ["05", "Investor Pitch", "Final selected startups pitch online to participating investors for potential funding."],
];

const benefits = [
  { icon: UsersRound, title: "Mentor Support", copy: "Get guidance from experienced mentors to refine your business idea and pitch." },
  { icon: Handshake, title: "Investor Connect", copy: "Pitch to investors and connect with industry experts." },
  { icon: SearchCheck, title: "Business Evaluation", copy: "Understand your startup’s strengths and growth potential." },
  { icon: Network, title: "Strategic Networking", copy: "Connect with founders, industry leaders and ecosystem partners." },
  { icon: Globe2, title: "National Visibility", copy: "Showcase your startup on a national platform." },
  { icon: TrendingUp, title: "Growth Support", copy: "Access opportunities to scale your business on a larger platform." },
];

const summitPackageBenefits = [
  ["Accommodation", "Stay"],
  ["Food", "Meals"],
  ["Local Travel", "In Gwalior"],
  ["Local Tour", "Gwalior highlights"],
];

const canApply = [
  "Early-Stage Startups",
  "Student-Led Startups",
  "Innovative Business Ideas",
  "Product or Service Based",
  "Growth-Stage Businesses",
  "Funding-Ready Startups",
];

const faqs = [
  [
    "What is the registration fee?",
    `For India: ${indiaRegistrationSummary()}. Current international country-specific fees are shown in the international registration section.`,
  ],
  [
    "Who can participate?",
    "Indian and international early-stage startups, student-led startups, founders with innovative business ideas, product or service based businesses, growth-stage businesses and funding-ready startups can apply.",
  ],
  [
    "Is there support for early ideas?",
    "Yes. The top 20 ideas can get a ₹25,000–₹50,000 prototype grant opportunity, and 25 selected ideas receive a flat ₹10,000 reward each.",
  ],
  [
    "Is the funding guaranteed?",
    "No. The non-refundable grant is awarded to the top five startups based on evaluation, eligibility, performance and the applicable Terms and Conditions. Selected startups also pitch to participating investors, and any additional funding is at the investors’ discretion.",
  ],
  [
    "What if my startup is not selected in screening?",
    "If your idea or startup is not selected in the screening stage, 50% of the registration amount will be refunded. T&C applicable.",
  ],
  [
    "What does the registration include?",
    "Registration covers the online process: startup evaluation and rating, jury and senior jury pitches, mentor support, business evaluation and investor connect. Only the three-day summit in Gwalior is offline; the optional summit package is ₹3,599 per participant.",
  ],
  [
    "Is there an optional summit package?",
    "Selected participants can opt for accommodation, meals, local travel in Gwalior and a local tour for ₹3,599 per participant. This package is optional and subject to Terms and Conditions.",
  ],
  [
    "What is the last date to register?",
    "Registration closes on 10 November 2026. Check the countdown and registration form for the current status.",
  ],
  [
    "Can a student-led startup apply?",
    "Yes. Student-led startups are listed among the applicants who can apply for the programme.",
  ],
  [
    "Where will the event be held?",
    "The summit is held in Gwalior, Madhya Pradesh, India, from 29 to 31 December 2026 as a three-day programme.",
  ],
];

export const Route = createFileRoute("/funding-programme")({
  staticData: { sitemap: true },
  loader: ({ context }) => context.queryClient.ensureQueryData(programmeFeesQuery),
  head: () => ({
    meta: [
      { title: "Startup Funding Programme | Riloyd" },
      { name: "description", content: "The Riloyd Startup Funding Programme gives eligible founders a non-refundable grant of up to ₹20 Lakhs across the top five startups, plus mentorship, business evaluation and investor connections at a three-day summit in Gwalior." },
      { property: "og:title", content: "Startup Funding Programme | Riloyd" },
      { property: "og:description", content: "Pitch, connect, raise and grow. Non-refundable grants of up to ₹20 Lakhs for the top five startups, with mentorship and investor connect." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/funding-programme" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/funding-programme" }],
  }),
  component: FundingProgramme,
});

function Section({ kicker, title, intro, tone = "plain", children, id, compact = false }: { kicker: string; title: React.ReactNode; intro?: string; tone?: "plain" | "surface"; children: React.ReactNode; id?: string; compact?: boolean }) {
  return (
    <section id={id} className={`scroll-mt-6 border-b border-border ${tone === "surface" ? "bg-surface" : ""}`}>
      <div className={`mx-auto w-full max-w-[1380px] px-5 sm:px-6 lg:px-12 ${compact ? "py-8 lg:py-11" : "py-10 lg:py-14"}`}>
        <div className={`mx-auto max-w-3xl text-center ${compact ? "mb-6" : "mb-7"}`}>
          <p className="eyebrow text-[10px] font-bold uppercase">{kicker}</p>
          <h2 className="mt-3 text-[clamp(1.8rem,3.4vw,3rem)] font-black uppercase leading-[0.95]">{title}</h2>
          {intro && <p className="mt-4 text-sm leading-relaxed text-soft md:text-base">{intro}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

const highlights = ["Grant", "Prototype", "Mentorship", "Investor Connect", "Technology", "Legal Support"];
const prototypeUses = ["MVP Development", "Prototype Creation", "Product Development", "Proof of Concept"];
const investorSteps = ["Business Evaluation", "Funding Readiness", "Investor Pitch", "Investor Connect", "Potential Funding"];
const included = [
  { icon: UsersRound, label: "Mentorship", value: "3 Months", copy: "Strategy, funding and pitch guidance — free." },
  { icon: Globe2, label: "Technology", value: "Up to ₹3 Lakh", copy: "Domain, website, hosting and digital setup." },
  { icon: ShieldCheck, label: "Legal", value: "Startup Legal", copy: "Agreements, compliance and IP guidance." },
];

function FundingProgramme() {
  const [programmeCountry, setProgrammeCountry] = useState<ProgrammeCountry>("usa");
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="hero-shell relative border-b border-border lg:flex lg:min-h-[92svh] lg:items-center">
        <img src={gwaliorAsset} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" decoding="async" fetchPriority="high" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative z-10 mx-auto w-full max-w-[1380px] px-5 py-16 sm:px-6 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="eyebrow mb-4 text-xs font-bold uppercase">Riloyd Startup Summit 2026 · Gwalior</p>
              <h1 className="headline text-[clamp(2.4rem,5vw,4.8rem)] font-black uppercase leading-[0.9]">Turn your idea into a <span className="text-primary">fundable</span> &amp; scalable business</h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-soft md:text-lg">Indian and international startups and ideas. Three days. One stage. ₹20 Lakhs in grants for the top five startups and up to ₹5 Crore investor funding opportunity.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#register" className="solid-cta inline-flex items-center gap-3 rounded-md bg-primary px-8 py-3.5 text-sm font-extrabold text-primary-foreground">Apply Now <ArrowRight size={17} /></a>
                <a href="#prototype" className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3.5 text-sm font-bold">Submit Your Idea</a>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                {pillars.map(({ icon: Icon, label, copy }) => (
                  <div key={label}><Icon className="text-primary" size={22} strokeWidth={1.7} /><p className="mt-2 text-xs font-extrabold uppercase tracking-[0.18em]">{label}</p><p className="mt-1 text-xs leading-snug text-muted-foreground">{copy}</p></div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background/85 p-6 sm:p-7">
              <p className="eyebrow text-[10px] font-bold uppercase">Event details</p>
              <p className="mt-3 text-4xl font-black leading-none">29 · 30 · 31</p>
              <p className="mt-1 text-sm font-bold uppercase tracking-[0.2em] text-primary">December 2026</p>
              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <p className="flex items-start gap-2"><CalendarDays className="mt-0.5 shrink-0 text-primary" size={15} />3-day summit</p>
                <p className="flex items-start gap-2"><MapPin className="mt-0.5 shrink-0 text-primary" size={15} />Gwalior, Madhya Pradesh, India</p>
                <p className="flex items-start gap-2"><ShieldCheck className="mt-0.5 shrink-0 text-primary" size={15} />50% refund if not selected in screening*</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">{highlights.map((w) => <span key={w} className="rounded-full border border-border px-3 py-1 text-[11px] text-soft">{w}</span>)}</div>
            </div>
          </div>
        </div>
      </section>


      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-[1380px] grid-cols-2 gap-px px-5 py-6 sm:px-6 md:grid-cols-4 lg:px-12">
          {[["₹20 Lakhs","Grant for top 5"],["₹5 Crore","Investor funding opportunity"],["Top 20","₹25K–₹50K prototype grant"],["25 Ideas","₹10,000 reward each"]].map(([v,l]) => <div key={l} className="px-2 py-2 text-center"><p className="text-2xl font-black sm:text-3xl">{v}</p><p className="mt-1 text-[11px] font-semibold uppercase tracking-wider opacity-90">{l}</p></div>)}
        </div>
      </section>

      <Section kicker="Non-Refundable Grant Pool" title={<>Up to <span className="text-primary">₹20 Lakhs</span> for the top five</>} intro="Shared by the five top-performing startups. Grant ≠ investment." tone="surface" compact>
        <div className="grid gap-4 md:grid-cols-[240px_1fr] md:items-stretch lg:grid-cols-[330px_1fr]">
          <img src={posterAsset} alt="Riloyd Startup Funding Programme poster with the five winning grant tiers" width={1088} height={1456} loading="lazy" decoding="async" className="mx-auto h-auto max-w-[230px] w-full md:max-w-none rounded-lg border border-border object-contain md:h-full md:max-h-[290px] lg:max-h-[430px] md:object-contain md:object-top" />
          <div className="flex flex-col">
            <div className="grid flex-1 grid-cols-2 gap-2.5 md:gap-2">
              {tiers.map(([rank, amount]) => (
                <div key={rank} className="flex flex-col justify-center rounded-md border border-border bg-background px-5 py-4 md:py-2.5 lg:py-4 transition hover:-translate-y-0.5 hover:border-primary/60"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{rank} Startup</p><p className="mt-1 whitespace-nowrap text-lg font-black sm:text-2xl">{amount}</p><p className="text-[11px] text-muted-foreground">Non-refundable grant</p></div>
              ))}
              <div className="flex flex-col justify-center rounded-md border border-primary/40 bg-primary/10 px-5 py-4 md:py-2.5 lg:py-4"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Total</p><p className="mt-1 whitespace-nowrap text-lg font-black sm:text-2xl">₹20 Lakhs</p><p className="text-[11px] text-muted-foreground">Across five startups</p></div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Subject to eligibility, evaluation, selection and Terms &amp; Conditions.</p>
          </div>
        </div>
      </Section>

      <Section id="prototype" kicker="Ideas get funded too" title={<>Have an idea? <span className="text-primary">Build it.</span></>}>
        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <div className="flex flex-col gap-4">
            <article className="rounded-lg border border-border bg-surface p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Top 20 prototype grant</p>
              <p className="mt-2 text-3xl font-black sm:text-4xl">₹25,000 – ₹50,000</p>
              <p className="mt-1.5 text-sm text-soft">Prototype grant opportunity for the top 20 ideas.</p>
              <ul className="mt-4 grid grid-cols-2 gap-2">{prototypeUses.map((u) => <li key={u} className="flex items-center gap-2 text-sm"><Check className="shrink-0 text-primary" size={15} />{u}</li>)}</ul>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Idea → Prototype → Validation → Funding</p>
            </article>
            <article className="flex-1 rounded-lg border border-primary/40 bg-primary/10 p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">₹10,000 idea reward</p>
              <p className="mt-2 text-2xl font-black sm:text-3xl">25 ideas. ₹10,000 each.</p>
              <p className="mt-1.5 text-sm text-soft">A flat ₹10,000 reward for 25 selected ideas — a total reward pool of ₹2.5 Lakhs.</p>
              <blockquote className="mt-4 border-l-2 border-primary pl-4 text-sm italic">“Even early-stage ideas deserve recognition.”</blockquote>
            </article>
          </div>
          <img src={prototypeAsset} alt="Young Indian founders building a product prototype together" width={1200} height={912} loading="lazy" decoding="async" className="h-64 w-full rounded-lg border border-border object-cover sm:h-80 lg:h-full" />
        </div>
      </Section>

      <Section kicker="Investor Funding Opportunity" title={<>Up to <span className="text-primary">₹5 Crore</span> for investment-ready startups</>} intro="Subject to investor interest, due diligence and applicable terms." tone="surface">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <img src={gatheringExpo} alt="Founders shaking hands with investors after a successful pitch" width={1440} height={1094} loading="lazy" decoding="async" className="h-64 w-full rounded-lg border border-border object-cover lg:h-80" />
          <ol className="space-y-3">{investorSteps.map((s, i) => <li key={s} className="flex items-center gap-4 rounded-md border border-border bg-background px-5 py-3.5"><span className="text-xl font-black text-primary">0{i + 1}</span><span className="text-sm font-bold uppercase tracking-wide">{s}</span></li>)}</ol>
        </div>
      </Section>

      <Section kicker="From Idea to Investment" title={<>The five-stage <span className="text-primary">startup journey</span></>} intro={`Registration, evaluation, mentorship and all pitches are ${fundingProcess.registration}. Only the summit in ${fundingProcess.summitCity} is ${fundingProcess.summit}.`}>
        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-5">
          {journey.map(([step, title, copy]) => (
            <div key={step} className="rounded-md border border-border bg-surface px-4 py-5 last:col-span-2 xl:last:col-span-1 md:px-5 md:py-6"><p className="text-4xl font-black text-primary/40">{step}</p><h3 className="mt-3 text-sm font-extrabold uppercase tracking-wide">{title}</h3><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{copy}</p></div>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-primary/40 bg-primary/10 p-5 sm:flex-row sm:items-center sm:gap-5">
          <ShieldCheck className="shrink-0 text-primary" size={32} strokeWidth={1.6} />
          <p className="text-sm font-semibold sm:text-base">If any idea or startup is not selected in the screening, 50% of the registration amount will be refunded. <span className="text-primary">T&amp;C applicable.</span></p>
        </div>
      </Section>

      <Section kicker="What You Get" title={<>Support that goes <span className="text-primary">beyond the grant</span></>} tone="surface">
        <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr] lg:items-stretch">
          <img src={mentorAsset} alt="A mentor guiding two startup founders" width={1200} height={912} loading="lazy" decoding="async" className="h-64 w-full rounded-lg border border-border object-cover lg:h-full" />
          <div className="grid gap-3 sm:grid-cols-2">
            {benefits.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="rounded-md border border-border bg-background px-5 py-5"><Icon className="text-primary" size={22} strokeWidth={1.7} /><h3 className="mt-3 text-sm font-extrabold uppercase tracking-wide">{title}</h3><p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{copy}</p></div>
            ))}
          </div>
        </div>
        <p className="eyebrow mt-8 text-center text-[10px] font-bold uppercase">Also included · beyond the summit</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {included.map(({ icon: Icon, label, value, copy }) => (
            <div key={label} className="rounded-md border border-border bg-background px-5 py-5"><Icon className="text-primary" size={22} strokeWidth={1.7} /><p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{label}</p><p className="mt-1 text-2xl font-black">{value}</p><p className="mt-1 text-xs text-muted-foreground">{copy}</p></div>
          ))}
        </div>
      </Section>

      <section className="border-b border-border px-5 py-8 sm:px-6 lg:px-12"><div className="mx-auto max-w-[1380px]"><h2 className="text-2xl font-black">International startup & idea registration</h2><label htmlFor="programme-country" className="mt-5 block text-sm font-bold">Applicant country / market</label><select id="programme-country" value={programmeCountry} onChange={event => { const next = marketOrder.find(key => key === event.target.value); if (next) setProgrammeCountry(next); }} className="mt-2 h-11 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm">{marketOrder.map(key => <option key={key} value={key}>{marketConfigs[key].name}</option>)}</select></div></section>
      <InternationalEnrolment country={programmeCountry} />

      <Section kicker="India Fees & Optional Summit Package" title={<>Simple pricing, <span className="text-primary">stay covered</span></>}>
        <div className="mx-auto mb-6 max-w-2xl"><RegistrationCountdown /></div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr_1fr]">
          <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
            <p className="border-b border-border bg-primary px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-primary-foreground">Registration Fee</p>
            <div className="flex flex-1 flex-col gap-3 p-4">
              {indiaRegistrationOptions.map(option => <div key={option.amount} className="flex items-center gap-4 rounded-md bg-primary/15 px-4 py-4"><UsersRound className="shrink-0 text-primary" size={26} /><div><p className="text-3xl font-black">₹{option.amount.toLocaleString("en-IN")}/-</p><p className="text-xs text-muted-foreground">+{option.gstPercent}% GST ·</p></div></div>)}
              <div className="mt-auto rounded-md border border-primary/40 bg-primary/10 px-4 py-3 text-xs"><b>50% refund</b> if not selected in screening. T&amp;C applicable.</div>
            </div>
          </div>
          <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
            <p className="border-b border-border bg-primary px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-primary-foreground">Optional package for selected participants</p>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="grid grid-cols-4 gap-1 text-center">
                {summitPackageBenefits.map(([title, note], i) => {
                  const Icon = [BedDouble, Utensils, Car, MapPin][i] ?? MapPin;
                  return <div key={title}><Icon className="mx-auto text-primary" size={24} strokeWidth={1.7} /><p className="mt-1.5 text-[10px] font-extrabold leading-tight sm:text-xs">{title}</p><p className="text-[9px] text-muted-foreground sm:text-[10px]">({note})</p></div>;
                })}
              </div>
              <div className="grid h-28 grid-cols-4 overflow-hidden rounded-md">
                {[[stayAsset, "Hotel stay"], [foodAsset, "Indian meals"], [localAsset, "Local travel in Gwalior"], [gwaliorAsset, "Gwalior Fort tour"]].map(([src, alt]) => (
                  <img key={alt} src={src} alt={alt} width={480} height={480} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                ))}
              </div>
              <div className="mt-auto rounded-md bg-primary/15 px-4 py-2.5 text-center"><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Stay · Food · Local travel · Local tour</p><p className="text-2xl font-black">₹{summitParticipation.amount.toLocaleString("en-IN")}/-</p><p className="text-xs font-semibold">Per participant · Optional</p></div>
              <p className="text-[10px] text-muted-foreground">Subject to policy, eligibility and Terms and Conditions.</p>
            </div>
          </div>
          <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
            <p className="border-b border-border bg-primary px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-primary-foreground">Event Details</p>
            <div className="flex flex-1 flex-col gap-3 p-4 text-sm">
              <p className="flex gap-3"><CalendarDays className="shrink-0 text-primary" size={18} /><span><b>29 – 31 December 2026</b><br /><span className="text-xs text-muted-foreground">3-Day Offline Summit</span></span></p>
              <p className="flex gap-3"><MapPin className="shrink-0 text-primary" size={18} /><b>Gwalior, Madhya Pradesh, India</b></p>
              <p className="flex gap-3"><Check className="shrink-0 text-primary" size={18} /><span>Venue shared with confirmed participants</span></p>
              <img src={gwaliorAsset} alt="Gwalior Fort at sunset" loading="lazy" decoding="async" className="h-32 w-full rounded-md object-cover" />
              <a href="#register" className="mt-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Apply Now <ArrowRight size={16} /></a>
            </div>
          </div>
        </div>
      </Section>

      <Section kicker="Venue & Eligibility" title={<>Gwalior · <span className="text-primary">29–31 Dec 2026</span></>} tone="surface">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
          <img src={gatheringStage} alt="The Riloyd startup gathering stage" width={1440} height={821} loading="lazy" decoding="async" className="h-64 w-full rounded-lg border border-border object-cover lg:h-[24rem]" />
          <div>
            <p className="flex items-start gap-2 text-sm text-soft"><MapPin className="mt-0.5 shrink-0 text-primary" size={16} />Gwalior, Madhya Pradesh, India — venue shared with confirmed participants.</p>
            <p className="mt-2 text-xs text-muted-foreground">Organised by Riloyd, a unit of RISHISHWAR INDUSTRY PRIVATE LIMITED.</p>
            <p className="eyebrow mt-6 text-[10px] font-bold uppercase">Who can apply</p>
            <div className="mt-3 grid grid-cols-2 gap-2">{canApply.map((c) => <span key={c} className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5 text-xs font-medium"><Check className="shrink-0 text-primary" size={14} />{c}</span>)}</div>
          </div>
        </div>
      </Section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[1380px] px-5 py-10 sm:px-6 lg:px-12 lg:py-14">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div><p className="eyebrow text-xs font-bold uppercase">Previous Riloyd Startup Gathering</p><h2 className="mt-2 text-[clamp(1.7rem,3.2vw,2.8rem)] font-black uppercase leading-[0.95]">Moments from <span className="text-primary">our last gathering</span></h2></div>
            <p className="max-w-md text-sm text-soft">Founders, mentors and investors under one roof — this is what the Riloyd stage looks like.</p>
          </div>
          <div className="grid auto-rows-[150px] grid-cols-2 gap-2.5 sm:auto-rows-[180px] md:grid-cols-4">
            <div className="relative col-span-2 row-span-2 overflow-hidden rounded-lg border border-border bg-background">
              <ViewportVideo src={gatheringVideo.url} fallbackSrc={gatheringVideoWebm.url} className="h-full w-full object-cover" label="Highlights from the previous Riloyd startup gathering" />
              <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary-foreground">● Event highlights</span>
            </div>
            {[[gatheringPitch,"Founders pitching on the Riloyd stage"],[gatheringExpo,"Networking across the expo floor"],[gatheringRegistration,"Registration desk"],[gatheringBadges,"Startup, investor & mentor passes"],[gatheringHall,"The main summit hall"],[gatheringKit,"Participant welcome kit"]].map(([src,label], i) => (
              <figure key={label} className={`group relative overflow-hidden rounded-lg border border-border ${i >= 4 ? "md:col-span-2" : ""}`}><img src={src} alt={label} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/60 to-transparent px-3 pb-2.5 pt-10 text-[11px] font-extrabold uppercase tracking-wide">{label}</figcaption></figure>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border">
        <img src={gwaliorAsset} alt="" aria-hidden loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative mx-auto grid max-w-[1380px] gap-6 px-5 py-12 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-12 lg:py-16">
          <div>
            <p className="eyebrow text-xs font-bold uppercase">Host city · Gwalior</p>
            <h2 className="mt-2 text-[clamp(1.8rem,3.6vw,3.2rem)] font-black uppercase leading-[0.95]">Where heritage meets <span className="text-primary">new ventures</span></h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-soft">Three days in the city of the great Gwalior Fort, royal palaces and Tansen's music — a fitting home for founders who want to build something that lasts.</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[["Gwalior Fort","The \"pearl among fortresses\" crowning the city"],["Jai Vilas Palace","Royal Scindia heritage"],["City of Music","Home of Tansen & a UNESCO Creative City"],["Heart of MP","Well connected by rail & road"]].map(([t,c]) => <div key={t} className="rounded-md border border-border bg-background/80 p-4"><Landmark className="text-primary" size={20} strokeWidth={1.7} /><p className="mt-2 text-xs font-extrabold uppercase tracking-wide">{t}</p><p className="mt-1 text-[11px] leading-snug text-muted-foreground">{c}</p></div>)}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1380px] px-5 py-16 text-center sm:px-6 lg:px-12">
          <h2 className="text-[clamp(1.8rem,3.6vw,3.2rem)] font-black uppercase leading-[0.95]">Your idea doesn't have to be <span className="text-primary">perfect.</span><br />It has to have <span className="text-primary">potential.</span></h2>
          <a href="#register" className="solid-cta mt-8 inline-flex items-center gap-3 rounded-md bg-primary px-8 py-3.5 text-sm font-extrabold text-primary-foreground">Submit Your Idea <ArrowRight size={17} /></a>
        </div>
      </section>

      <Section id="register" kicker="Startup Summit 2026" title={<>Register <span className="text-primary">now</span></>} tone="surface">
        <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="text-sm leading-relaxed text-muted-foreground">Register online and tell us about your startup or idea. Evaluation, mentorship and all pitches take place online. Only the summit in Gwalior is offline.</p>
            <a href={ZOHOPUBLIC} target="_blank" rel="noreferrer" className="solid-cta mt-6 inline-flex items-center gap-3 rounded-md bg-primary px-7 py-3 text-sm font-extrabold text-primary-foreground"><Rocket size={16} /> Open Registration Form <ArrowRight size={16} /></a>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-card"><iframe title="Startup Idea Registration Form" src={ZOHOPUBLIC} className="block h-[80vh] w-full border-0" loading="lazy" /></div>
        </div>
      </Section>

      <Section kicker="Frequently Asked Questions" title={<>Answers before <span className="text-primary">you apply</span></>}>
        <Accordion type="single" collapsible className="grid gap-x-6 lg:grid-cols-2">
          {faqs.map(([q, a], i) => (
            <AccordionItem key={q} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-sm font-bold hover:no-underline">{q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-6 text-center text-sm text-soft">Still have questions? <Link to="/contact" className="font-semibold text-primary hover:underline">Get in touch with our team.</Link></p>
      </Section>
    </main>
  );
}
