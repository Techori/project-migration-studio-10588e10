import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { enquirySchema } from "@/lib/submission-schemas";
import { submitEnquiry as saveEnquiry } from "@/lib/enquiries.functions";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Clock3,
  Instagram,
  Linkedin,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  MessageSquareText,
  Phone,
  UserRound,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import officeAsset from "@/assets/local/riloyd-contact-office.png.optimized.webp";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Contact Riloyd | Build a Stronger Tomorrow" },
      {
        name: "description",
        content: "Contact Riloyd in Gwalior for business funding, strategy, transformation, sales growth and manpower services.",
      },
      { property: "og:title", content: "Contact Riloyd | Let’s Build Together" },
      {
        property: "og:description",
        content: "Start a conversation with Riloyd about your next stage of business growth.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

type FormErrors = Partial<Record<"name" | "email" | "phone" | "service" | "industry" | "message", string>>;

const fieldClass = "min-h-12 w-full rounded-md border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";

const contactItems = [
  { icon: Phone, label: "Request a Call", value: "Email us your contact details", href: "mailto:info@riloyd.in?subject=Request%20a%20call" },
  { icon: Mail, label: "Email Us", value: "info@riloyd.in", href: "mailto:info@riloyd.in" },
  { icon: MessageSquareText, label: "Business Inquiries", value: "business@riloyd.in", href: "mailto:business@riloyd.in" },
  { icon: BriefcaseBusiness, label: "Careers", value: "careers@riloyd.in", href: "mailto:careers@riloyd.in" },
  { icon: Linkedin, label: "LinkedIn", value: "Riloyd on LinkedIn", href: "https://www.linkedin.com/company/145354558" },
  { icon: Instagram, label: "Instagram", value: "@riloyd.in", href: "https://www.instagram.com/riloyd.in/" },
];

const connectionTypes = [
  "Business Consultation",
  "Funding Advisory",
  "Sales Growth Strategy",
  "Transformation Projects",
  "Partnership Opportunities",
  "Career Opportunities",
  "General Queries",
];

const faqs = [
  ["How can RILOYD help my business?", "We combine research, funding guidance, revenue strategy and transformation support around your business goals."],
  ["What industries do you serve?", "We work across sectors with entrepreneurs, SMEs and established enterprises."],
  ["Do you work with startups and MSMEs?", "Yes. Our advisory approach is shaped to the size, stage and growth priorities of each business."],
  ["How can I schedule a consultation?", "Send the form or email us. Our team will respond to arrange a suitable time."],
];

function ContactPage() {
  const [errors, setErrors] = useState<FormErrors>({});
  const save = useServerFn(saveEnquiry);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    setMessage("");
    const values = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      service: String(form.get("service") ?? ""),
      industry: String(form.get("industry") ?? ""),
      message: String(form.get("message") ?? ""),
    };
    const result = enquirySchema.safeParse(values);
    if (!result.success) {
      const nextErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !(key in nextErrors)) nextErrors[key as keyof FormErrors] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSending(true);
    try {
      await save({ data: result.data });
      element.reset();
      setMessage("Your enquiry has been received.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your enquiry could not be saved. Please try again.");
    } finally { setSending(false); }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="contact-page-hero relative border-b border-border">
        <img src={officeAsset} alt="Riloyd reception office" className="absolute inset-0 h-full w-full object-cover object-center" fetchPriority="high" decoding="async" />
        <div className="contact-page-hero-shade absolute inset-0" />
        <div className="relative z-10 mx-auto flex min-h-[450px] max-w-[1380px] items-center px-5 pb-12 pt-6 sm:px-6 lg:px-12">
          <div className="max-w-xl">
            <p className="eyebrow text-[10px] font-bold uppercase">Contact Us</p>
            <h1 className="mt-4 text-[clamp(2.5rem,5vw,4.75rem)] font-black uppercase leading-[.92]">Let&apos;s build a stronger <span className="text-primary">tomorrow</span> together.</h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-soft sm:text-base">Have a question, a project idea, or need expert guidance? Reach out to our team and take the next step towards lasting growth.</p>
            <div className="mt-7 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase text-soft sm:gap-5"><span>Strategy</span><i className="h-1 w-1 bg-primary" /><span>Funding</span><i className="h-1 w-1 bg-primary" /><span>Sales</span><i className="h-1 w-1 bg-primary" /><span>Transformation</span></div>
          </div>
        </div>
      </section>

      <section id="message" className="border-b border-border">
        <div className="mx-auto grid max-w-[1380px] lg:grid-cols-[1.05fr_.95fr_.65fr]">
          <div className="border-border px-5 py-10 sm:px-6 lg:border-r lg:px-12 lg:py-14">
            <p className="section-label">Send us a message</p>
            <h2 className="mt-3 text-3xl font-black uppercase leading-none sm:text-4xl">Tell us how we can <span className="text-primary">help you.</span></h2>
            <form className="mt-7 space-y-3" onSubmit={submitEnquiry} noValidate>
              <FieldError message={errors.name}><label className="contact-field"><UserRound /><input className={fieldClass} name="name" placeholder="Full Name *" maxLength={100} aria-invalid={Boolean(errors.name)} /></label></FieldError>
              <FieldError message={errors.email}><label className="contact-field"><Mail /><input className={fieldClass} type="email" name="email" placeholder="Business Email *" maxLength={255} aria-invalid={Boolean(errors.email)} /></label></FieldError>
              <FieldError message={errors.phone}><label className="contact-field"><Phone /><input className={fieldClass} type="tel" name="phone" placeholder="Phone Number *" maxLength={20} aria-invalid={Boolean(errors.phone)} /></label></FieldError>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldError message={errors.service}><select className={fieldClass} name="service" defaultValue=""><option value="" disabled>Select Service *</option><option>Business Research & Strategy</option><option>Business Funding</option><option>Sales & Revenue Growth</option><option>Business Transformation</option><option>Manpower Service</option><option>Startup &amp; Business Incubation Centers</option></select></FieldError>
                <FieldError message={errors.industry}><select className={fieldClass} name="industry" defaultValue=""><option value="" disabled>Select Industry *</option><option>Startup / MSME</option><option>Manufacturing</option><option>Retail & Consumer</option><option>Technology</option><option>Professional Services</option><option>Other</option></select></FieldError>
              </div>
              <FieldError message={errors.message}><textarea className={`${fieldClass} min-h-32 resize-y py-3`} name="message" placeholder="Your Message *" maxLength={1000} aria-invalid={Boolean(errors.message)} /></FieldError>
              {message && <p role="status" className="text-sm text-primary">{message}</p>}
              <Button type="submit" disabled={sending} size="lg" className="mt-2 h-12 rounded-full px-8 font-bold">{sending ? "Sending…" : "Send Message"} <ArrowRight /></Button>
              <p className="flex items-center gap-2 pt-2 text-[10px] text-muted-foreground"><LockKeyhole size={13} /> Your information is used only to respond to your enquiry.</p>
            </form>
          </div>

          <div className="border-border px-5 py-10 sm:px-6 lg:border-r lg:px-10 lg:py-14">
            <p className="section-label">Get in touch</p>
            <div className="mt-7 flex gap-4">
              <MapPin className="shrink-0 text-primary" size={28} />
              <div className="min-w-0"><h3 className="font-bold">Our Location</h3><p className="mt-1 text-sm leading-relaxed text-soft">Gwalior, Madhya Pradesh, India</p><a className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold" href="https://maps.google.com/?q=Gwalior+Madhya+Pradesh" target="_blank" rel="noreferrer">View Gwalior <ArrowRight size={14} className="text-primary" /></a></div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 border-b border-border pb-8">
              {contactItems.map(({ icon: Icon, label, value, href }) => <a key={label} href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="flex min-w-0 items-center gap-3 lg:flex-col lg:items-start lg:gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary text-primary"><Icon size={16} /></span><span className="min-w-0"><b className="block text-[13px] leading-tight">{label}</b><span className="mt-0.5 block break-words text-[11px] leading-snug text-soft [hyphens:none]">{value}</span></span></a>)}
            </div>
          </div>

          <aside className="px-5 py-10 sm:px-6 lg:px-9 lg:py-14">
            <div className="flex gap-4"><Clock3 className="shrink-0 text-primary" size={28} /><div><h3 className="font-bold">Business Hours</h3><p className="mt-2 text-sm leading-relaxed text-soft">Email us to arrange a consultation</p></div></div>
            <div className="mt-10 border-t border-border pt-8"><p className="section-label">Let&apos;s connect for</p><ul className="mt-6 space-y-3">{connectionTypes.map((item) => <li key={item} className="flex items-center gap-3 text-sm"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Check size={12} /></span>{item}</li>)}</ul></div>
          </aside>
        </div>
      </section>

      <section className="location-band relative overflow-hidden border-b border-border">
        <div className="location-grid absolute inset-0" />
        <div className="relative mx-auto grid min-h-56 max-w-[1380px] items-center gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[.7fr_1.3fr] lg:px-12">
          <div><h2 className="text-3xl font-black uppercase sm:text-4xl">Gwalior, India</h2><p className="mt-3 max-w-sm text-sm text-soft">Contact us to arrange a conversation.</p><a className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs font-bold" href="https://maps.google.com/?q=Gwalior+Madhya+Pradesh" target="_blank" rel="noreferrer"><MapPin size={16} className="text-primary" /> View on Google Maps <ArrowRight size={14} className="text-primary" /></a></div>
          <div className="flex items-center justify-center gap-4 lg:justify-start"><MapPin className="shrink-0 fill-primary text-primary" size={54} /><div className="rounded-md border border-border bg-background/90 px-5 py-3"><b className="text-sm">RILOYD</b><p className="text-xs text-soft">Gwalior, Madhya Pradesh</p></div></div>
        </div>
      </section>

      <section className="border-b border-border px-5 py-10 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-[1380px]"><div className="flex items-center justify-between gap-4"><p className="section-label">Frequently asked questions</p><a href="mailto:info@riloyd.in" className="hidden text-xs font-bold sm:block">Still have questions? <span className="text-primary">Email Us →</span></a></div><div className="mt-6 grid gap-3 md:grid-cols-2">{faqs.map(([question, answer]) => <details key={question} className="faq-item border border-border bg-surface"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-sm font-semibold">{question}<span className="shrink-0 text-xl text-soft">+</span></summary><p className="px-4 pb-4 text-sm leading-relaxed text-soft">{answer}</p></details>)}</div></div>
      </section>


    </main>
  );
}

function FieldError({ message, children }: { message: string | undefined; children: React.ReactNode }) {
  return <div>{children}{message ? <p className="mt-1 text-xs text-primary" role="alert">{message}</p> : null}</div>;
}