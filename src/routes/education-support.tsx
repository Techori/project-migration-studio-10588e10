import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, BookOpenCheck, GraduationCap, Languages, School, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EducationSupportForm } from "@/components/education-support-form";
import { applicationTypeKeys, applicationTypes } from "@/lib/education-support/rules";
import type { EduLang } from "@/lib/education-support/labels";
import riloydLogo from "@/assets/local/riloyd-logo.png.optimized.nav.webp";
import studentsImage from "@/assets/foundation/students-learning.webp";

const TITLE = "Education Support | RILOYD Foundation Scholarship & Sponsorship Registration";
const DESCRIPTION = "Register for RILOYD Foundation education support: sponsorship or scholarships up to ₹25,000 and ₹50,000 for school (Class 4–12), UG and PG students across India.";

export const Route = createFileRoute("/education-support")({
  staticData: { sitemap: true },
  validateSearch: (search: Record<string, unknown>): { ref?: string } => {
    const raw = search["ref"];
    const ref = typeof raw === "string" && /^[A-Za-z0-9-]{1,40}$/.test(raw) ? raw : undefined;
    return ref ? { ref } : {};
  },
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
  component: EducationSupportPage,
});

const copy = {
  en: {
    kicker: "RILOYD Foundation · Education Support", title: "Student Scholarship & Sponsorship Registration",
    text: "For school students from Class 4 to 12 and undergraduate and postgraduate students across India. Register in a few simple steps, pay the registration fee securely and get your acknowledgement number instantly.",
    start: "Start registration", toggle: "हिंदी", toggleLabel: "Switch to Hindi",
    who: [["School students", "Class 4 to Class 12, any board"], ["UG students", "All recognised undergraduate programmes"], ["PG students", "All recognised postgraduate programmes"]],
    feeTitle: "Choose what you apply for", fee: "registration fee", upTo: "Maximum potential award",
    formTitle: "Registration form", formText: "Your education and contact draft is saved on this device. Bank and Aadhaar details are not saved in the draft.",
    notes: ["Scholarship amounts are maximum potential awards, not guaranteed payments.", "Admin approval requires confirmed payment and is separate from scholarship selection.", "Students under 18 register with a parent or guardian's consent.", "Enter bank and Aadhaar details in the form. No document or image uploads are required."],
    faqTitle: "Questions", back: "Back to RILOYD Foundation",
    faq: [["How do I pay the fee?", "In step 2 the secure Zoho payment page for your selected fee (₹149, ₹249 or ₹599) opens inside the form. Pay by UPI, card or net banking; the payment ID is filled in for you when Zoho sends it back, otherwise type it from your receipt."], ["When do I get my acknowledgement number?", "Immediately after you submit the form. Your payment status stays 'pending' until our team confirms the payment."], ["Is the scholarship amount guaranteed?", "No. ₹25,000 and ₹50,000 are the maximum possible amounts. Final eligibility and amounts depend on verification and the official decision."], ["What is a coordinator?", "A school, college or independent coordinator who helped you register. If nobody helped you, tick 'registering without a coordinator'."]],
  },
  hi: {
    kicker: "RILOYD फ़ाउंडेशन · शिक्षा सहायता", title: "विद्यार्थी छात्रवृत्ति और स्पॉन्सरशिप पंजीकरण",
    text: "पूरे भारत के कक्षा 4 से 12 के स्कूल विद्यार्थियों और स्नातक व स्नातकोत्तर विद्यार्थियों के लिए। कुछ आसान चरणों में पंजीकरण करें, शुल्क सुरक्षित रूप से भरें और तुरंत अपनी पावती संख्या पाएँ।",
    start: "पंजीकरण शुरू करें", toggle: "English", toggleLabel: "Switch to English",
    who: [["स्कूल विद्यार्थी", "कक्षा 4 से 12, कोई भी बोर्ड"], ["UG विद्यार्थी", "सभी मान्यता प्राप्त स्नातक कोर्स"], ["PG विद्यार्थी", "सभी मान्यता प्राप्त स्नातकोत्तर कोर्स"]],
    feeTitle: "चुनें कि आप किसके लिए आवेदन कर रहे हैं", fee: "पंजीकरण शुल्क", upTo: "अधिकतम संभावित राशि",
    formTitle: "पंजीकरण फ़ॉर्म", formText: "शिक्षा और संपर्क जानकारी का ड्राफ्ट डिवाइस पर सेव रहता है। बैंक और आधार जानकारी ड्राफ्ट में सेव नहीं होती।",
    notes: ["छात्रवृत्ति राशि अधिकतम संभावित राशि है, गारंटीशुदा भुगतान नहीं।", "एडमिन की मंजूरी के लिए भुगतान की पुष्टि ज़रूरी है; यह छात्रवृत्ति चयन से अलग है।", "18 वर्ष से कम आयु के विद्यार्थी माता-पिता या अभिभावक की सहमति से पंजीकरण करते हैं।", "बैंक और आधार जानकारी फ़ॉर्म में भरें। कोई दस्तावेज़ या फोटो अपलोड नहीं करना है।"],
    faqTitle: "प्रश्न", back: "RILOYD फ़ाउंडेशन पर वापस जाएँ",
    faq: [["शुल्क कैसे भरें?", "चरण 2 में चुने गए शुल्क (₹149, ₹249 या ₹599) का सुरक्षित Zoho भुगतान पेज फ़ॉर्म के अंदर खुलेगा। UPI, कार्ड या नेट बैंकिंग से भरें; Zoho पेमेंट आईडी वापस भेजे तो वह अपने आप भर जाएगी, नहीं तो रसीद से लिखें।"], ["पावती संख्या कब मिलेगी?", "फ़ॉर्म जमा करते ही। टीम द्वारा भुगतान की पुष्टि होने तक भुगतान स्थिति 'लंबित' रहेगी।"], ["क्या छात्रवृत्ति राशि पक्की है?", "नहीं। ₹25,000 और ₹50,000 अधिकतम संभावित राशि हैं। अंतिम पात्रता और राशि सत्यापन व आधिकारिक निर्णय पर निर्भर है।"], ["कोऑर्डिनेटर कौन है?", "स्कूल, कॉलेज या स्वतंत्र कोऑर्डिनेटर जिसने पंजीकरण में मदद की। किसी ने मदद नहीं की तो 'बिना कोऑर्डिनेटर' चुनें।"]],
  },
};

const whoIcons = [School, BookOpenCheck, GraduationCap];

function EducationSupportPage() {
  const { ref } = Route.useSearch();
  const [lang, setLang] = useState<EduLang>("en");
  useEffect(() => { if (localStorage.getItem("riloyd-foundation-lang") === "hi") setLang("hi"); }, []);
  const toggle = () => { const n = lang === "en" ? "hi" : "en"; setLang(n); localStorage.setItem("riloyd-foundation-lang", n); };
  const t = copy[lang];

  return <main lang={lang} className="education-support-page bg-edu-sky/40 text-edu-ink">
    <section className="relative isolate overflow-hidden bg-edu-navy text-edu-paper">
      <img src={studentsImage} alt="" width={1280} height={806} decoding="async" fetchPriority="high" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-edu-navy via-edu-navy/90 to-edu-navy/40" aria-hidden="true" />
      <div className="mx-auto max-w-[1200px] px-4 pb-14 pt-24 sm:px-6 md:pb-20 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <img src={riloydLogo} alt="RILOYD" width={480} height={240} decoding="async" className="h-16 w-auto sm:h-20" />
          <Button type="button" variant="outline" size="sm" onClick={toggle} aria-label={t.toggleLabel} className="h-8 rounded-full border-edu-paper/50 bg-transparent px-3 text-xs font-bold text-edu-paper hover:bg-edu-paper/10 hover:text-edu-paper"><Languages className="h-3.5 w-3.5" aria-hidden="true" />{t.toggle}</Button>
        </div>
        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.2em] text-edu-paper/80 [&:lang(hi)]:tracking-normal">{t.kicker}</p>
        <h1 className="mt-3 max-w-3xl text-[clamp(2rem,4.6vw,3.6rem)] font-black leading-[1.05]">{t.title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-edu-paper/85 sm:text-lg">{t.text}</p>
        <a href="#registration-form" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-edu-paper px-7 text-sm font-black text-edu-navy hover:bg-edu-sky">{t.start}<ArrowRight className="h-4 w-4" /></a>
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {t.who.map(([title, text], i) => { const Icon = whoIcons[i]!; return <div key={title} className="flex items-start gap-3 rounded-2xl border border-edu-paper/15 bg-edu-paper/5 p-4"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-edu-paper" aria-hidden="true" /><div><p className="font-bold">{title}</p><p className="text-sm text-edu-paper/75">{text}</p></div></div>; })}
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-10">
      <h2 className="text-2xl font-black text-edu-navy sm:text-3xl">{t.feeTitle}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {applicationTypeKeys.map(k => { const a = applicationTypes[k]; return <div key={k} className="rounded-2xl border border-edu-navy/10 bg-edu-paper p-6">
          <p className="font-black text-edu-navy">{lang === "en" ? a.en : a.hi}</p>
          <p className="mt-3 text-4xl font-black text-edu-royal">₹{a.fee}</p>
          <p className="text-xs text-edu-ink/60">{t.fee}</p>
          {a.maxAward && <p className="mt-3 text-sm text-edu-ink/75">{t.upTo}: <strong className="text-edu-navy">₹{a.maxAward.toLocaleString("en-IN")}</strong></p>}
        </div>; })}
      </div>
    </section>

    <section className="mx-auto grid max-w-[1200px] gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-10">
      <div>
        <h2 className="text-2xl font-black text-edu-navy sm:text-3xl">{t.formTitle}</h2>
        <p className="mt-2 text-sm text-edu-ink/70">{t.formText}</p>
        <div className="mt-6"><EducationSupportForm lang={lang} initialCode={ref} /></div>
      </div>
      <aside className="space-y-3 lg:pt-20">
        {t.notes.map((n, i) => <div key={i} className="flex gap-3 rounded-2xl bg-edu-paper p-4 text-sm text-edu-ink/80">{i < 2 ? <BadgeCheck className="h-5 w-5 shrink-0 text-edu-royal" aria-hidden="true" /> : <ShieldCheck className="h-5 w-5 shrink-0 text-edu-royal" aria-hidden="true" />}<p>{n}</p></div>)}
      </aside>
    </section>

    <section className="bg-edu-paper">
      <div className="mx-auto max-w-[960px] px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-black text-edu-navy">{t.faqTitle}</h2>
        <Accordion type="single" collapsible className="mt-4">
          {t.faq.map(([q, a], i) => <AccordionItem key={i} value={`q${i}`} className="border-edu-navy/10"><AccordionTrigger className="text-left text-sm font-bold text-edu-ink hover:no-underline">{q}</AccordionTrigger><AccordionContent className="text-sm leading-relaxed text-edu-ink/75">{a}</AccordionContent></AccordionItem>)}
        </Accordion>
        <Link to="/foundation" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-edu-royal hover:underline">{t.back}<ArrowRight className="h-4 w-4" /></Link>
      </div>
    </section>
  </main>;
}
