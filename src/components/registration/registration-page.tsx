import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, FileUp, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitRegistration } from "@/lib/registration.functions";
import type { RegistrationConfig, RegistrationField } from "@/lib/registration-config";
import teamAsset from "@/assets/local/riloyd-team.png.optimized.webp";

const inputClass = "min-h-12 w-full rounded-md border border-border bg-surface px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";

export function RegistrationPage({ config }: { config: RegistrationConfig }) {
  const submit = useServerFn(submitRegistration);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [applicationCode, setApplicationCode] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    for (const section of config.sections) {
      for (const field of section.fields) {
        if (!field.required || field.type === "file") continue;
        const hasValue = data.getAll(field.name).some((value) => String(value).trim().length > 0);
        if (!hasValue) {
          setError(`Please complete ${field.label}.`);
          return;
        }
      }
    }
    const file = data.get("document");
    if (file instanceof File && file.size > 0) {
      const limit = config.category === "mentor" ? 5_000_000 : 10_000_000;
      if (file.size > limit) { setError(`Document must be under ${config.category === "mentor" ? "5MB" : "10MB"}.`); return; }
    }
    setSending(true);
    try {
      const result = await submit({ data });
      setApplicationCode(result.applicationCode);
      form.reset();
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Registration could not be saved. Please try again.");
    } finally { setSending(false); }
  }

  const Icon = config.icon;
  if (success) return (
    <main className="min-h-screen bg-background text-foreground"><section className="mx-auto grid min-h-[620px] max-w-3xl place-items-center px-5 py-16 text-center"><div><span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-primary text-primary"><CheckCircle2 size={42} /></span><p className="section-label mt-8 inline-block">Registration received</p><h1 className="mt-4 text-4xl font-black uppercase sm:text-6xl">Thank you for joining <span className="text-primary">Riloyd.</span></h1><p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-soft">Our team will review your {config.category} registration and contact you using the details provided.</p><p className="mt-4 break-all text-sm font-bold">Your reference: {applicationCode}</p><Button asChild className="mt-8 h-12 rounded-full px-8"><Link to="/register">Explore other categories <ArrowRight /></Link></Button></div></section></main>
  );

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="registration-hero relative overflow-hidden border-b border-border">
        <img src={teamAsset} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="registration-grid absolute inset-0 opacity-50" />
        <div className="relative mx-auto flex min-h-[340px] max-w-[1380px] items-center px-5 py-12 sm:px-6 lg:px-12">
          <div className="max-w-3xl"><p className="eyebrow text-[10px] font-bold uppercase">{config.eyebrow}</p><h1 className="mt-5 text-[clamp(2.7rem,6vw,5.7rem)] font-black uppercase leading-[.86]">{config.headline}<br /><span className="text-primary">{config.accent}</span></h1><p className="mt-6 max-w-xl text-sm leading-relaxed text-soft sm:text-base">{config.description}</p></div>
        </div>
      </section>
      <div className="border-b border-border"><div className="mx-auto flex max-w-[1380px] items-center gap-2 px-5 py-4 text-xs text-soft sm:px-6 lg:px-12"><Link to="/">Home</Link><span>/</span><Link to="/register">Register With Us</Link><span>/</span><b className="text-primary">{config.title.replace(" Registration", "")}</b></div></div>
      <section className="mx-auto grid max-w-[1380px] gap-6 px-5 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-12 lg:py-12">
        <form className="registration-form border border-border bg-surface/40 p-5 sm:p-7" onSubmit={handleSubmit} noValidate={false}>
          <input type="hidden" name="category" value={config.category} />
          <div className="border-b border-border pb-5"><h2 className="text-2xl font-black uppercase sm:text-3xl">{config.title} Form</h2><p className="mt-2 text-xs text-soft">Complete the details below. Fields marked * are required.</p></div>
          {config.sections.map((section, sectionIndex) => <section key={section.title} className="border-b border-border py-6 last:border-b-0"><div className="mb-5 flex items-center gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-black text-primary-foreground">{sectionIndex + 1}</span><h3 className="text-sm font-bold">{section.title}</h3></div><div className="grid gap-4 sm:grid-cols-2">{section.fields.map(field => <FormField key={field.name} field={field} />)}</div></section>)}
          <label className="mt-5 flex items-start gap-3 text-xs leading-relaxed"><input className="mt-0.5 h-4 w-4 accent-primary" type="checkbox" name="consent" required /><span>I agree to the Terms of Use and Privacy Policy, and consent to Riloyd contacting me about this registration.</span></label>
          {error ? <p className="mt-4 border border-primary bg-primary/10 p-3 text-sm text-primary" role="alert">{error}</p> : null}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2 text-[10px] text-muted-foreground"><LockKeyhole size={13} /> Your information and documents are stored privately.</p><Button type="submit" disabled={sending} className="h-12 rounded-full px-8 font-bold">{sending ? "Submitting…" : "Submit Registration"} <ArrowRight /></Button></div>
        </form>
        <aside className="space-y-5 lg:sticky lg:top-5 lg:self-start">
          <div className="border border-border bg-surface/40 p-6"><Icon size={38} className="text-primary" /><h2 className="mt-4 text-xl font-black">{config.benefitsTitle}</h2><ul className="mt-5 space-y-3">{config.benefits.map(item => <li key={item} className="flex gap-3 text-xs leading-relaxed"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Check size={12} /></span>{item}</li>)}</ul></div>
          <div className="grid grid-cols-2 border border-border bg-surface/40">{config.stats.map(([value,label]) => <div key={label} className="border-b border-r border-border p-4 odd:border-r last:border-b-0 [&:nth-last-child(2)]:border-b-0"><b className="block text-xl font-black text-primary">{value}</b><span className="mt-1 block text-[10px] text-soft">{label}</span></div>)}</div>
          <div className="border border-border p-6"><p className="section-label">Need help?</p><h3 className="mt-4 text-xl font-black uppercase">Our team is here.</h3><Button asChild variant="outline" className="mt-5 h-11 w-full rounded-full"><Link to="/contact">Contact our team <ArrowRight /></Link></Button></div>
          <Link to="/register" className="inline-flex items-center gap-2 text-xs font-bold text-soft hover:text-foreground"><ArrowLeft size={15} /> Back to all categories</Link>
        </aside>
      </section>
    </main>
  );
}

function FormField({ field }: { field: RegistrationField }) {
  const required = Boolean(field.required);
  const label = <span className="mb-2 block text-xs font-semibold">{field.label}{required ? " *" : ""}</span>;
  const common = { name: field.name, required, maxLength: field.maxLength ?? 2000 };
  if (field.type === "textarea") return <label className={field.full ? "sm:col-span-2" : ""}>{label}<textarea {...common} className={`${inputClass} min-h-24 resize-y py-3`} placeholder={field.placeholder} /></label>;
  if (field.type === "select") return <label className={field.full ? "sm:col-span-2" : ""}>{label}<select name={field.name} required={required} className={inputClass} defaultValue=""><option value="" disabled>Select option</option>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
  if (field.type === "radio") return <fieldset className={field.full ? "sm:col-span-2" : ""}><legend className="mb-2 text-xs font-semibold">{field.label}{required ? " *" : ""}</legend><div className="flex min-h-12 flex-wrap gap-4 border border-border bg-surface p-3">{field.options?.map(option => <label key={option.value} className="flex items-center gap-2 text-xs"><input type="radio" name={field.name} value={option.value} required={required} className="accent-primary" />{option.label}</label>)}</div></fieldset>;
  if (field.type === "checkboxes") return <fieldset className={field.full ? "sm:col-span-2" : ""}><legend className="mb-2 text-xs font-semibold">{field.label}{required ? " *" : ""}</legend><div className="grid gap-3 border border-border bg-surface p-4 sm:grid-cols-2">{field.options?.map((option) => <label key={option.value} className="flex items-center gap-2 text-xs"><input type="checkbox" name={field.name} value={option.value} className="h-4 w-4 accent-primary" />{option.label}</label>)}</div></fieldset>;
  if (field.type === "file") return <label className={field.full ? "sm:col-span-2" : ""}>{label}<span className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border bg-surface p-4 text-center text-xs text-soft"><FileUp className="text-primary" /><span>{field.help}</span><input type="file" name={field.name} accept={field.accept} required={required} className="max-w-full text-xs" /></span></label>;
  return <label className={field.full ? "sm:col-span-2" : ""}>{label}<input {...common} type={field.type ?? "text"} className={inputClass} placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}`} /></label>;
}
