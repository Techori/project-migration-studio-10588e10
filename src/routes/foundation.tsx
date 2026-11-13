import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, ClipboardCheck, FileText, Gavel, Handshake, HandHeart, Languages, Mail, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BasicContactFields, FoundationFormDialog, FoundationSent, useFoundationSubmit } from "@/components/foundation-form";
import { foundationImpact, foundationPrograms, PROFIT_COMMITMENT_PERCENT, type FoundationKind } from "@/lib/foundation";
import { foundationCopy, type FoundationLang } from "@/lib/foundation-copy";
import heroImage from "@/assets/foundation/hero-children.webp";
import heroImageSmall from "@/assets/foundation/hero-children-768.webp";
import educationImage from "@/assets/foundation/education.webp";
import animalImage from "@/assets/foundation/animal-welfare.webp";
import healthImage from "@/assets/foundation/healthcare.webp";
import reliefImage from "@/assets/foundation/humanitarian.webp";
import environmentImage from "@/assets/foundation/environment.webp";
import studentsImage from "@/assets/foundation/students-learning.webp";
import riloydLogo from "@/assets/local/riloyd-logo.png.optimized.nav.webp";

const TITLE = "RILOYD Foundation | Education, Animal Welfare, Healthcare & Relief";
const DESCRIPTION = "RILOYD Foundation supports scholarships, school fees, animal welfare, healthcare, food relief and tree plantation. Apply for help, volunteer, partner or pledge a donation.";

export const Route = createFileRoute("/foundation")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FoundationPage,
});

type DialogKind = Exclude<FoundationKind, "contact">;
const programImages: Record<string, string> = { education: educationImage, "animal-welfare": animalImage, healthcare: healthImage, humanitarian: reliefImage, environment: environmentImage };
const stepIcons = [FileText, Search, ClipboardCheck, Gavel];
const involvedIcons = { volunteer: Users, partner: Handshake, donation_pledge: HandHeart };

function Kicker({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`text-xs font-extrabold uppercase tracking-[0.22em] [&:lang(hi)]:tracking-normal ${light ? "text-foundation-gold" : "text-foundation-maroon"}`}>{children}</p>;
}

function FoundationPage() {
  const [lang, setLang] = useState<FoundationLang>("en");
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  useEffect(() => { if (localStorage.getItem("riloyd-foundation-lang") === "hi") setLang("hi"); }, []);
  function toggleLang() {
    const next = lang === "en" ? "hi" : "en";
    setLang(next);
    localStorage.setItem("riloyd-foundation-lang", next);
  }
  const t = foundationCopy[lang];

  return <main lang={lang} className="foundation-page bg-foundation-paper text-foundation-ink">
    <section id="top" className="relative isolate overflow-hidden bg-foundation-green text-foundation-paper">
      <picture>
        <source media="(max-width: 767px)" srcSet={heroImageSmall} />
        <img src={heroImage} alt="" width={1600} height={907} fetchPriority="high" decoding="async" className="absolute inset-0 -z-10 h-full w-full object-cover object-[60%_center]" />
      </picture>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-foundation-green via-foundation-green/85 to-foundation-green/20 max-md:bg-gradient-to-t max-md:from-foundation-green max-md:via-foundation-green/85 max-md:to-foundation-green/30" aria-hidden="true" />
      <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-24 sm:px-6 md:py-28 lg:px-10 lg:py-36">
        <div className="max-w-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <img src={riloydLogo} alt="RILOYD" width={480} height={240} decoding="async" className="h-16 w-auto sm:h-20" />
            <Button type="button" variant="outline" size="sm" onClick={toggleLang} aria-label={t.langLabel} className="h-8 rounded-full border-foundation-paper/50 bg-transparent px-3 text-xs font-bold text-foundation-paper hover:bg-foundation-paper/10 hover:text-foundation-paper"><Languages className="h-3.5 w-3.5" aria-hidden="true" />{t.langToggle}</Button>
          </div>
          <div className="mt-6"><Kicker light>{t.hero.kicker}</Kicker></div>
          <h1 className="mt-4 text-[clamp(2.1rem,5vw,3.8rem)] font-black leading-[1.05]">{t.hero.title}</h1>
          <p className="mt-5 text-base leading-relaxed text-foundation-paper/90 sm:text-lg">{t.hero.text}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button type="button" onClick={() => setDialog("assistance")} className="h-12 rounded-full bg-foundation-gold px-6 text-sm font-extrabold text-foundation-ink hover:bg-foundation-gold/90">{t.hero.apply} <ArrowRight className="h-4 w-4" /></Button>
            <Button type="button" onClick={() => setDialog("donation_pledge")} className="h-12 rounded-full bg-foundation-maroon px-6 text-sm font-extrabold text-foundation-paper hover:bg-foundation-maroon/90">{t.donate}</Button>
            <Button type="button" variant="outline" onClick={() => setDialog("volunteer")} className="h-12 rounded-full border-foundation-paper/60 bg-transparent px-6 text-sm font-extrabold text-foundation-paper hover:bg-foundation-paper/10 hover:text-foundation-paper">{t.hero.volunteer}</Button>
          </div>
        </div>
      </div>
    </section>

    <section id="about" className="scroll-mt-4">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.2fr_.8fr] lg:px-10">
        <div>
          <Kicker>{t.about.kicker}</Kicker>
          <h2 className="mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)] font-black leading-tight text-foundation-green">{t.about.title}</h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foundation-ink/80">{t.about.text}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {t.about.values.map(([title, text]) => <div key={title} className="rounded-2xl border border-foundation-green/15 bg-foundation-sage/60 p-5"><h3 className="font-extrabold text-foundation-green">{title}</h3><p className="mt-2 text-sm leading-relaxed text-foundation-ink/75">{text}</p></div>)}
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-3xl bg-foundation-maroon p-8 text-foundation-paper sm:p-10">
          <p className="text-[clamp(4rem,9vw,6.5rem)] font-black leading-none text-foundation-gold">{PROFIT_COMMITMENT_PERCENT}%</p>
          <p className="mt-2 text-lg font-extrabold uppercase tracking-wide">{t.about.commitmentTitle}</p>
          <p className="mt-4 text-sm leading-relaxed text-foundation-paper/85">{t.about.commitmentText}</p>
        </div>
      </div>
    </section>

    <section id="programmes" className="scroll-mt-4 bg-foundation-sage/70">
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 md:py-24 lg:px-10">
        <Kicker>{t.programmes.kicker}</Kicker>
        <h2 className="mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)] font-black leading-tight text-foundation-green">{t.programmes.title}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {foundationPrograms.map(program => {
            const copy = t.programs[program.id]!;
            return <article key={program.id} id={program.id} className="flex scroll-mt-4 flex-col overflow-hidden rounded-2xl border border-foundation-green/10 bg-foundation-paper shadow-sm">
              <img src={programImages[program.id]} alt="" width={800} height={608} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-black text-foundation-green">{copy.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foundation-ink/75">{copy.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2">{copy.items.map(item => <li key={item} className="rounded-full bg-foundation-sage px-3 py-1 text-xs font-semibold text-foundation-green">{item}</li>)}</ul>
                <div className="mt-auto pt-6">{program.id === "education"
                  ? <Button asChild variant="outline" className="h-10 w-full rounded-full border-foundation-maroon/40 bg-transparent text-sm font-bold text-foundation-maroon hover:bg-foundation-maroon hover:text-foundation-paper"><Link to="/education-support">{copy.cta} <ArrowRight className="h-4 w-4" /></Link></Button>
                  : <Button type="button" onClick={() => setDialog(program.kind as DialogKind)} variant="outline" className="h-10 w-full rounded-full border-foundation-maroon/40 bg-transparent text-sm font-bold text-foundation-maroon hover:bg-foundation-maroon hover:text-foundation-paper">{copy.cta} <ArrowRight className="h-4 w-4" /></Button>}</div>
              </div>
            </article>;
          })}
        </div>
      </div>
    </section>

    <section id="students" className="scroll-mt-4">
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:px-10">
        <img src={studentsImage} alt="" width={1280} height={806} loading="lazy" decoding="async" className="aspect-[16/10] w-full rounded-3xl object-cover" />
        <div>
          <Kicker>{t.students.kicker}</Kicker>
          <h2 className="mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)] font-black leading-tight text-foundation-green">{t.students.title}</h2>
          <p className="mt-5 text-base leading-relaxed text-foundation-ink/80">{t.students.text}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-12 rounded-full bg-foundation-green px-6 text-sm font-extrabold text-foundation-paper hover:bg-foundation-green/90"><Link to="/education-support"><BookOpen className="h-4 w-4" />{t.students.scholarship}</Link></Button>
            <Button type="button" variant="outline" onClick={() => setDialog("school_fee")} className="h-12 rounded-full border-foundation-green/40 bg-transparent px-6 text-sm font-extrabold text-foundation-green hover:bg-foundation-sage hover:text-foundation-green">{t.students.schoolFee}</Button>
          </div>
        </div>
      </div>
    </section>

    <section id="how-we-help" className="scroll-mt-4 bg-foundation-green text-foundation-paper">
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 md:py-24 lg:px-10">
        <Kicker light>{t.help.kicker}</Kicker>
        <h2 className="mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)] font-black leading-tight">{t.help.title}</h2>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.steps.map(([title, text], i) => { const Icon = stepIcons[i]!; return <li key={title} className="rounded-2xl border border-foundation-paper/15 bg-foundation-paper/5 p-6">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-foundation-gold text-sm font-black text-foundation-ink">{i + 1}</span><Icon className="h-5 w-5 text-foundation-gold" aria-hidden="true" /></div>
            <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foundation-paper/80">{text}</p>
          </li>; })}
        </ol>
      </div>
    </section>

    <section id="impact" className="scroll-mt-4">
      <div className="mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-6 md:py-24 lg:px-10">
        <Kicker>{t.impact.kicker}</Kicker>
        <h2 className="mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)] font-black leading-tight text-foundation-green">{t.impact.title}</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {foundationImpact.map((item, i) => <div key={item.label} className="rounded-2xl border border-foundation-green/15 bg-foundation-sage/50 p-6">
            <p className="text-4xl font-black text-foundation-maroon">{item.value === null ? "—" : item.value.toLocaleString("en-IN")}</p>
            <p className="mt-2 text-sm font-bold text-foundation-green">{t.impactLabels[i]}</p>
          </div>)}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-sm text-foundation-ink/70">{t.impact.note}</p>
      </div>
    </section>

    <section id="get-involved" className="scroll-mt-4 bg-foundation-sage/70">
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 md:py-24 lg:px-10">
        <Kicker>{t.involved.kicker}</Kicker>
        <h2 className="mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)] font-black leading-tight text-foundation-green">{t.involved.title}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {t.involved.cards.map(card => { const Icon = involvedIcons[card.kind]; const donate = card.kind === "donation_pledge"; return <div key={card.kind} id={donate ? "donate" : undefined} className={`flex scroll-mt-4 flex-col rounded-2xl p-7 ${donate ? "bg-foundation-maroon text-foundation-paper" : "border border-foundation-green/15 bg-foundation-paper"}`}>
            <Icon className={`h-8 w-8 ${donate ? "text-foundation-gold" : "text-foundation-maroon"}`} aria-hidden="true" />
            <h3 className={`mt-4 text-xl font-black ${donate ? "" : "text-foundation-green"}`}>{card.title}</h3>
            <p className={`mt-2 flex-1 text-sm leading-relaxed ${donate ? "text-foundation-paper/85" : "text-foundation-ink/75"}`}>{card.text}</p>
            <Button type="button" onClick={() => setDialog(card.kind)} className={`mt-6 h-11 rounded-full text-sm font-bold ${donate ? "bg-foundation-gold text-foundation-ink hover:bg-foundation-gold/90" : "bg-foundation-green text-foundation-paper hover:bg-foundation-green/90"}`}>{card.cta}</Button>
          </div>; })}
        </div>
      </div>
    </section>

    <section className="border-b border-foundation-green/10">
      <div className="mx-auto max-w-[960px] px-4 py-16 sm:px-6 md:py-20">
        <Kicker>{t.faq.kicker}</Kicker>
        <h2 className="mt-3 text-[clamp(1.6rem,3vw,2.4rem)] font-black leading-tight text-foundation-green">{t.faq.title}</h2>
        <Accordion type="single" collapsible className="mt-6">
          {t.faq.items.map(([q, a], i) => <AccordionItem key={i} value={`faq-${i}`} className="border-foundation-green/15"><AccordionTrigger className="text-left text-sm font-bold text-foundation-ink hover:no-underline">{q}</AccordionTrigger><AccordionContent className="text-sm leading-relaxed text-foundation-ink/75">{a}</AccordionContent></AccordionItem>)}
        </Accordion>
      </div>
    </section>

    <ContactSection lang={lang} />

    <div className="bg-foundation-green px-4 py-5 text-center text-xs text-foundation-paper/80">{t.footer}</div>
    <FoundationFormDialog kind={dialog} onClose={() => setDialog(null)} />
  </main>;
}

function ContactSection({ lang }: { lang: FoundationLang }) {
  const t = foundationCopy[lang].contact;
  const { state, onSubmit } = useFoundationSubmit("contact", []);
  return <section id="contact" className="scroll-mt-4">
    <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[.8fr_1.2fr] lg:px-10">
      <div>
        <Kicker>{t.kicker}</Kicker>
        <h2 className="mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)] font-black leading-tight text-foundation-green">{t.title}</h2>
        <p className="mt-5 text-base leading-relaxed text-foundation-ink/80">{t.text}</p>
        <a href="mailto:info@riloyd.in" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-foundation-maroon hover:underline"><Mail className="h-4 w-4" aria-hidden="true" />{t.email}: info@riloyd.in</a>
      </div>
      <div className="rounded-3xl border border-foundation-green/15 bg-foundation-sage/50 p-5 sm:p-8">
        {state.status === "sent" ? <FoundationSent text={t.sent} />
          : <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <BasicContactFields />
            <label className="block text-sm font-semibold text-foundation-ink sm:col-span-2">{t.message}<span className="text-foundation-maroon"> *</span><textarea name="message" required minLength={10} maxLength={2000} rows={4} className="mt-1 w-full rounded-lg border border-foundation-green/25 bg-foundation-paper px-3 py-2.5 text-sm text-foundation-ink outline-none focus:border-foundation-green focus:ring-2 focus:ring-foundation-green/20" /></label>
            {state.error && <p role="alert" className="text-sm font-semibold text-foundation-maroon sm:col-span-2">{state.error}</p>}
            <Button type="submit" disabled={state.status === "sending"} className="h-11 rounded-full bg-foundation-maroon text-foundation-paper hover:bg-foundation-maroon/90 sm:col-span-2">{state.status === "sending" ? t.sending : t.send}</Button>
          </form>}
      </div>
    </div>
  </section>;
}
