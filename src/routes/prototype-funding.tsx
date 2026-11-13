import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, type ReactNode } from "react";
import { ArrowRight, Check, Download, FlaskConical, Lightbulb, Mail, ShieldCheck, Sprout, Video, GraduationCap, Rocket, MapPin } from "lucide-react";
import { DeferredContent } from "@/components/deferred-content";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ideaVideoTimeline, prototypeEligibility, prototypePitchTimeline, prototypeProgramme, prototypeRegistrationTotal, prototypeScorecard } from "@/lib/prototype-programme";
import prototypeImage from "@/assets/prototype-young-india-hero.webp";
import campusImage from "@/assets/prototype-campus-founders.webp";
import videoImage from "@/assets/prototype-founder-video.webp";
import pitchImage from "@/assets/local/gathering-pitch.webp";
import indiaInnovation from "@/assets/prototype-india-innovation.webp";

const PrototypeAssessment = lazy(() => import("@/components/prototype-assessment").then(module => ({ default: module.PrototypeAssessment })));

const title = "Prototype & Seed Funding Programme | Riloyd";
const description = "Bring young India's ideas to life with Riloyd's Prototype & Seed Funding Programme. Simple eligibility, a 60-second idea video and ₹999 plus 18% GST registration.";

export const Route = createFileRoute("/prototype-funding")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: "/prototype-funding" }] }),
  component: PrototypeFundingPage,
});

function ProgrammeSection({ id, kicker, title: sectionTitle, children, surface = false }: { id?: string; kicker: string; title: string; children: ReactNode; surface?: boolean }) {
  return <section id={id} className={`scroll-mt-8 border-b border-border ${surface ? "bg-surface" : "bg-background"}`}>
    <div className="mx-auto max-w-[1380px] px-5 py-12 sm:px-6 lg:px-12 lg:py-16">
      <p className="flex items-center gap-3 text-xs font-bold uppercase text-primary"><span aria-hidden="true" className="h-0.5 w-8 bg-primary" />{kicker}</p>
      <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">{sectionTitle}</h2>
      <div className="mt-8">{children}</div>
    </div>
  </section>;
}

function PrototypeFundingPage() {
  return <main className="prototype-page bg-background text-foreground">
    <section className="prototype-hero hero-shell relative border-b border-border">
      <img src={prototypeImage} width={1920} height={1088} alt="Young Indian founders testing an agricultural sensor prototype together in a campus makerspace" className="absolute inset-0 h-full w-full object-cover object-center" fetchPriority="high" />
      <div className="hero-shade absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-[1380px] px-5 py-14 sm:px-6 lg:px-12 lg:py-20">
        <p className="flex items-center gap-2 text-xs font-bold uppercase text-primary"><Rocket size={16} />Riloyd · Young India. Bold ideas.</p>
        <h1 className="headline mt-4 max-w-2xl text-4xl font-black uppercase leading-tight sm:text-5xl lg:text-6xl">Prototype &amp;<br />Seed Funding</h1>
        <p className="mt-5 max-w-xl text-xl font-bold text-foreground">Built in India. Ready for tomorrow.</p>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-soft sm:text-base">From a campus idea to your first working prototype. Bring your curiosity, identify a real problem, and pitch what you want to build. Your startup journey can begin before you have a company.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size="lg"><a href="#registration">Registration &amp; next steps <ArrowRight /></a></Button>
          <Button asChild size="lg" variant="outline"><a href="#eligibility">Check eligibility <ShieldCheck /></a></Button>
          <Button asChild size="lg" variant="outline"><a href="#idea-assessment">AI idea assessment <ArrowRight /></a></Button>
        </div>
        <p className="mt-6 text-sm font-bold text-soft">₹{prototypeProgramme.registrationFee}/- +{prototypeProgramme.gstPercent}% GST · Idea-stage founders welcome</p>
      </div>
    </section>

    <section className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-[1380px] grid-cols-2 gap-6 px-5 py-7 sm:grid-cols-4 sm:px-6 lg:px-12">
        {[["₹999 + GST", "Registration"], [`${prototypeProgramme.videoMaxSeconds} seconds`, "Idea video"], [`${prototypeProgramme.pitchMaxMinutes} minutes`, "Shortlisted pitch"], ["Idea → Prototype", "Programme focus"]].map(([value, label]) => <div key={label}><p className="text-xl font-black sm:text-2xl">{value}</p><p className="mt-1 text-xs">{label}</p></div>)}
      </div>
    </section>

    <ProgrammeSection id="built-for-india" kicker="India's startup spirit" title="Ideas from India. Possibilities for the world.">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <figure><img src={indiaInnovation} width={1536} height={1024} loading="lazy" decoding="async" alt="Young Indian founders building a water-filtration prototype beside the Indian tricolour in a campus workshop" className="aspect-[3/2] w-full rounded-md object-cover" /><figcaption className="mt-3 text-xs font-semibold text-muted-foreground">Designed here. Built here. Tested with real people.</figcaption></figure>
        <div><p className="text-xs font-bold uppercase text-primary">Dedicated to India's next generation</p><h3 className="mt-4 text-2xl font-black sm:text-3xl">A stronger India begins with people who build.</h3><p className="mt-4 text-sm leading-relaxed text-muted-foreground">From college workshops to small-town communities, Indian founders can turn everyday challenges into useful innovations. Start with a local problem, build a practical prototype, and show how your idea could improve lives.</p><div className="mt-6 grid gap-4 border-y border-border py-5 sm:grid-cols-3">{[["Local insight", "Solutions shaped around Indian communities."], ["Practical innovation", "Affordable, useful ideas tested in the real world."], ["Founder ambition", "A first step from an idea to a working prototype."]].map(([heading, copy]) => <div key={heading}><h4 className="text-sm font-bold">{heading}</h4><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{copy}</p></div>)}</div><p className="mt-5 text-sm leading-relaxed text-muted-foreground">Inspired by the entrepreneurial spirit of the Startup India ecosystem. Riloyd runs this programme independently; it is not a Government of India or Startup India funding scheme.</p><Button asChild variant="outline" className="mt-5"><a href="https://www.startupindia.gov.in/" target="_blank" rel="noopener noreferrer">Explore official Startup India resources <ArrowRight /></a></Button></div>
      </div>
    </ProgrammeSection>

    <ProgrammeSection kicker="The next generation of Indian founders" title="Young India doesn't just dream. It builds.">
      <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        <figure><img src={campusImage} width={1536} height={1024} alt="Young Indian makers collaborating on a clean-energy prototype in a college innovation studio" className="aspect-[3/2] w-full rounded-md object-cover" loading="lazy" /><figcaption className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground"><span className="h-2 w-2 rounded-full bg-primary" />Imagine it. Make it. Test it.</figcaption></figure>
        <div><p className="text-lg font-semibold leading-relaxed">Big possibilities can begin with a small prototype.</p><p className="mt-4 text-sm leading-relaxed text-muted-foreground">A classroom observation, a problem in your neighbourhood, or a better way to do everyday work—your starting point does not need to be perfect. Riloyd's programme puts the focus on original ideas, practical experiments, and the people ready to take the first step.</p>
          <div className="mt-6 space-y-5">{[
            [GraduationCap, "Campus curiosity", "Students and young makers can turn learning into a practical idea, subject to the programme's eligibility criteria."],
            [MapPin, "Local problems. Fresh solutions.", "Start with the people around you. Explain who needs your solution and how a prototype could help."],
            [Rocket, "First-time founder energy", "You do not need a registered company to begin. Bring an original idea, a clear plan, and honest progress."],
          ].map(([Icon, heading, copy]) => Icon && typeof Icon !== "string" && <div key={String(heading)} className="flex gap-4 border-b border-border pb-4"><Icon className="mt-1 shrink-0 text-primary" size={22} /><div><h3 className="text-sm font-bold">{String(heading)}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{String(copy)}</p></div></div>)}</div>
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">A Riloyd initiative for India's startup spirit. No official affiliation with the Government of India's Startup India initiative is claimed.</p>
        </div>
      </div>
    </ProgrammeSection>

    <ProgrammeSection kicker="Two focused pathways" title="Build the proof. Prepare the next step.">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="border-l-2 border-primary pl-6"><FlaskConical className="text-primary" /><h3 className="mt-4 text-xl font-bold">Prototype funding</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Turn a promising idea into a proof of concept, prototype or early product improvement. Present what needs to be built, the testing plan, budget and measurable milestones.</p><p className="mt-4 text-2xl font-black">₹25,000–₹50,000</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Indicative support per selected idea, subject to selection, available programme budget, due diligence and written approval. Not an assured entitlement.</p></div>
        <div className="border-l-2 border-primary pl-6"><Sprout className="text-primary" /><h3 className="mt-4 text-xl font-bold">Seed funding readiness</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Use your early validation, customer insight and product progress to explain the next stage of your venture. Eligible startups may be considered for separate seed-stage funding or investor-connect opportunities after evaluation.</p><p className="mt-4 text-sm font-semibold">Evaluation-led, not guaranteed</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">No fixed seed award is announced here. Availability, funding amount and terms depend on independent evaluation and investor or partner decisions.</p></div>
      </div>
    </ProgrammeSection>

    <ProgrammeSection id="eligibility" kicker="Simple eligibility" title="You do not need a registered company to start." surface>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prototypeEligibility.map(([heading, copy]) => <article key={heading} className="rounded-md border border-border bg-background p-5"><Check className="text-primary" size={20} /><h3 className="mt-3 text-base font-bold">{heading}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p></article>)}
      </div>
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">Eligible ideas should have a meaningful problem, a clear solution benefit, a realistic prototype plan and lawful, safe, ethical use. Founders should be available for screening, pitching and progress updates.</p>
    </ProgrammeSection>

    <ProgrammeSection id="idea-assessment" kicker="AI-powered eligibility review" title="Where does your idea fit?" surface>
      <DeferredContent className="min-h-[650px]" fallback={<div className="min-h-[650px]" aria-busy="true" />}><Suspense fallback={<div className="min-h-[650px]" aria-busy="true" />}><PrototypeAssessment /></Suspense></DeferredContent>
    </ProgrammeSection>

    <ProgrammeSection kicker="Application journey" title="From a short idea video to a focused pitch.">
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{[["Idea video", "Prepare a clear explanation of up to 60 seconds."], ["Registration", "Complete the application and provide accurate details."], ["Screening", "Eligibility, originality, clarity and feasibility are reviewed. Clarifications may be requested."], ["Pitching", "Only shortlisted applicants present a pitch of up to 5 minutes."]].map(([heading, copy], index) => <li key={heading} className="border-t border-border pt-5"><span className="text-3xl font-black text-primary">0{index + 1}</span><h3 className="mt-3 text-base font-bold">{heading}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p></li>)}</ol>
    </ProgrammeSection>

    <ProgrammeSection id="video-guidelines" kicker="Startup video submission guidelines" title="60 seconds. Your idea, clearly explained." surface>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div><img src={videoImage} width={1536} height={1024} alt="A young Indian founder explaining her water-quality sensor prototype to a smartphone camera" className="mb-5 aspect-[3/2] w-full rounded-md object-cover" loading="lazy" /><div className="flex items-center gap-3"><Video className="text-primary" size={24} /><h3 className="text-base font-bold">Your idea. Your voice.</h3></div><p className="mt-4 text-sm leading-relaxed text-muted-foreground">A simple explanation is enough—high production value is not required. MP4 is preferred; vertical 9:16 is recommended. Use a clear voice, steady frame, and simple background.</p><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Use original content. Do not include trade secrets or private customer information. You do not need to create a separate promotional reel for Riloyd.</p><Button asChild variant="outline" className="mt-5"><a href="/downloads/riloyd-prototype-applicant-checklist.pdf" download><Download />Download applicant checklist</a></Button></div>
        <ol className="space-y-4">{ideaVideoTimeline.map(([time, heading, copy]) => <li key={time} className="grid grid-cols-[90px_1fr] gap-4 border-b border-border pb-4"><span className="text-sm font-bold text-primary">{time}</span><div><h3 className="text-sm font-bold">{heading}</h3><p className="mt-1 text-sm text-muted-foreground">{copy}</p></div></li>)}</ol>
      </div>
    </ProgrammeSection>

    <ProgrammeSection kicker="Prepare your application" title="The facts that help us understand your idea.">
      <div className="grid gap-8 md:grid-cols-2"><ul className="space-y-4">{["Founder contact details and location; startup or idea name, sector and current stage.", "Short problem statement, solution summary, target users and your differentiator.", "Honest progress: idea, PoC, prototype, pilot, users or revenue."].map(text => <li key={text} className="flex gap-3 text-sm leading-relaxed text-muted-foreground"><Check className="mt-1 shrink-0 text-primary" size={16} />{text}</li>)}</ul><ul className="space-y-4">{["Prototype milestone: what you will build or test, expected timeline and estimated budget.", "Accurate claims and figures, rights to submitted material and availability for a shortlisted pitch.", "Separate consent choices for applicant contact and public features of your idea."].map(text => <li key={text} className="flex gap-3 text-sm leading-relaxed text-muted-foreground"><Check className="mt-1 shrink-0 text-primary" size={16} />{text}</li>)}</ul></div>
    </ProgrammeSection>

    <ProgrammeSection kicker="Selection framework" title="What reviewers look for." surface>
      <div className="space-y-3">{prototypeScorecard.map(([area, weight, detail]) => <div key={area} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border pb-3"><div><h3 className="text-sm font-bold">{area}</h3><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div><span className="text-xl font-black text-primary">{weight}<span className="ml-1 text-xs font-normal text-muted-foreground">pts</span></span></div>)}</div>
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">Proposed 100-point scorecard. Riloyd may update weightings or use additional checks, applying the same stated criteria consistently to comparable applications.</p>
    </ProgrammeSection>

    <ProgrammeSection kicker="For shortlisted founders" title="Your five-minute funding pitch.">
      <div className="grid gap-8 lg:grid-cols-2"><img src={pitchImage} alt="A founder presenting on the Riloyd startup pitch stage" className="h-72 w-full rounded-md object-cover lg:h-full" loading="lazy" /><ol className="space-y-4">{prototypePitchTimeline.map(([time, heading, copy]) => <li key={time} className="grid grid-cols-[100px_1fr] gap-3 border-b border-border pb-3"><span className="text-sm font-bold text-primary">{time}</span><div><h3 className="text-sm font-bold">{heading}</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{copy}</p></div></li>)}</ol></div>
    </ProgrammeSection>

    <ProgrammeSection id="registration" kicker="Registration fee" title="₹999/- +18% GST" surface>
      <div className="grid gap-8 lg:grid-cols-2"><div><p className="text-3xl font-black">₹{prototypeRegistrationTotal().toLocaleString("en-IN", { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-muted-foreground">including GST</span></p><p className="mt-4 text-sm leading-relaxed text-muted-foreground">This is the separate Prototype &amp; Seed Funding programme fee. Registration, screening, shortlisting or pitching does not guarantee a grant, investment, investor meeting or selection.</p><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Confirm the official application channel, current availability, and payment instructions with the Riloyd team before paying. Contact the team for the programme-specific application link.</p></div><div className="border-l-2 border-primary pl-6"><Lightbulb className="text-primary" /><h3 className="mt-4 text-xl font-bold">Ready to build your first big idea?</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Contact the team to request the Prototype Funding application and instructions for submitting your video securely.</p><div className="mt-5 flex flex-wrap gap-3"><Button asChild><a href="mailto:idea@riloyd.in?subject=Prototype%20Funding%20Programme%20Application"><Mail /> Request application details</a></Button><Button asChild variant="outline"><Link to="/contact" hash="message">Contact the team <ArrowRight /></Link></Button></div></div></div>
    </ProgrammeSection>

    <ProgrammeSection kicker="Funding conditions & fairness" title="Clear expectations. Responsible support.">
      <Accordion type="single" collapsible>
        {[
          ["Is funding guaranteed?", "No. Prototype support is indicative and conditional on selection, available budget, due diligence and written approval. Seed funding is a separate evaluation-led opportunity; no fixed seed award is promised."],
          ["What is required before disbursement?", "A clear prototype plan, itemised budget and measurable milestones; identity, bank and entity documents as applicable; required declarations; and written acceptance of funding terms. Progress updates and evidence of expenditure may be requested."],
          ["What can approved funds be used for?", "Only the approved prototype or project purpose. Personal expenses, unrelated debt repayment and unsupported costs are not eligible."],
          ["Must I promote Riloyd on social media?", "No separate promotional reel is required. Public startup features, idea highlights and pitch-day stories require the founder’s separate permission. Opting out of publicity should not, by itself, affect funding evaluation."],
          ["What can lead to rejection?", "False, misleading, fabricated or materially incomplete claims; plagiarism or unauthorized intellectual property; illegal, unsafe or ethically inappropriate projects. Disclose relevant conflicts of interest and cooperate with reasonable verification requests."],
          ["Are dates and final terms confirmed?", "Final dates, application channels, funding availability, award values, eligibility exceptions and legally binding terms must be confirmed in the official programme notice and any signed funding agreement. This page outlines the eligibility and selection framework provided."],
        ].map(([question, answer], index) => <AccordionItem key={question} value={`faq-${index}`}><AccordionTrigger className="text-left text-sm font-bold">{question}</AccordionTrigger><AccordionContent className="text-sm leading-relaxed text-muted-foreground">{answer}</AccordionContent></AccordionItem>)}
      </Accordion>
    </ProgrammeSection>
  </main>;
}