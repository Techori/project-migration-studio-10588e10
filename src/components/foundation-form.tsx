import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { submitFoundationForm } from "@/lib/foundation.functions";
import { foundationKindLabels, foundationPrograms, foundationSubmissionSchema, type FoundationKind } from "@/lib/foundation";

type Field = { name: string; label: string; type?: "text" | "textarea" | "select" | "number"; options?: readonly string[]; required?: boolean };
const programmeOptions = foundationPrograms.map(p => p.title);
const studentFields: Field[] = [
  { name: "studentName", label: "Student name", required: true },
  { name: "studentClass", label: "Class / course", required: true },
  { name: "schoolName", label: "School / college name", required: true },
  { name: "city", label: "City", required: true },
];

export const foundationFormFields: Record<Exclude<FoundationKind, "contact">, Field[]> = {
  scholarship: [...studentFields, { name: "scholarshipType", label: "Scholarship type", type: "select", options: ["Merit Scholarship", "Financial Need Scholarship", "Higher Education Assistance", "Books and Uniform Support"], required: true }, { name: "familyIncome", label: "Annual family income (₹)", type: "number" }, { name: "reason", label: "Why do you need this support?", type: "textarea", required: true }],
  school_fee: [...studentFields, { name: "feeAmount", label: "Fee amount needed (₹)", type: "number", required: true }, { name: "reason", label: "Tell us about the family situation", type: "textarea", required: true }],
  volunteer: [{ name: "city", label: "City", required: true }, { name: "interest", label: "Area you want to help with", type: "select", options: programmeOptions, required: true }, { name: "availability", label: "Availability (e.g. weekends)", required: true }, { name: "skills", label: "Skills or experience", type: "textarea" }],
  partner: [{ name: "organisation", label: "Organisation name", required: true }, { name: "city", label: "City", required: true }, { name: "interest", label: "Programme of interest", type: "select", options: programmeOptions, required: true }, { name: "idea", label: "How would you like to work together?", type: "textarea", required: true }],
  donation_pledge: [{ name: "city", label: "City", required: true }, { name: "interest", label: "Programme you want to support", type: "select", options: programmeOptions, required: true }, { name: "pledgeAmount", label: "Amount you wish to donate (₹)", type: "number", required: true }, { name: "note", label: "Note (optional)", type: "textarea" }],
  assistance: [{ name: "city", label: "City", required: true }, { name: "interest", label: "Type of help needed", type: "select", options: programmeOptions, required: true }, { name: "need", label: "Describe the help you need", type: "textarea", required: true }],
};

const notes: Partial<Record<FoundationKind, string>> = {
  donation_pledge: "No money is collected on this form. Our team will contact you with the official donation details.",
  scholarship: "Submitting an application does not guarantee assistance. Every application is reviewed and verified.",
  school_fee: "Submitting an application does not guarantee assistance. Every application is reviewed and verified.",
  assistance: "Submitting a request does not guarantee assistance. Every request is reviewed and verified.",
};

const inputClass = "mt-1 w-full rounded-lg border border-foundation-green/25 bg-foundation-paper px-3 py-2.5 text-sm text-foundation-ink outline-none focus:border-foundation-green focus:ring-2 focus:ring-foundation-green/20";

export function FoundationFields({ fields }: { fields: Field[] }) {
  return <>{fields.map(field => <label key={field.name} className={`block text-sm font-semibold text-foundation-ink ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>{field.label}{field.required && <span className="text-foundation-maroon"> *</span>}
    {field.type === "textarea" ? <textarea name={field.name} required={field.required} maxLength={2000} rows={3} className={inputClass} />
      : field.type === "select" ? <select name={field.name} required={field.required} defaultValue="" className={inputClass}><option value="" disabled>Select…</option>{field.options?.map(o => <option key={o}>{o}</option>)}</select>
      : <input name={field.name} type={field.type === "number" ? "number" : "text"} min={field.type === "number" ? 0 : undefined} required={field.required} maxLength={200} className={inputClass} />}
  </label>)}</>;
}

export function BasicContactFields() {
  return <>
    <label className="block text-sm font-semibold text-foundation-ink">Full name<span className="text-foundation-maroon"> *</span><input name="fullName" required minLength={2} maxLength={100} autoComplete="name" className={inputClass} /></label>
    <label className="block text-sm font-semibold text-foundation-ink">Email<span className="text-foundation-maroon"> *</span><input name="email" type="email" required maxLength={255} autoComplete="email" className={inputClass} /></label>
    <label className="block text-sm font-semibold text-foundation-ink">Mobile number<span className="text-foundation-maroon"> *</span><input name="phone" type="tel" required inputMode="tel" autoComplete="tel" className={inputClass} /></label>
    <label className="block text-sm font-semibold text-foundation-ink">Employee / coordinator code <span className="font-normal text-foundation-ink/60">(optional)</span><input name="coordinatorCode" maxLength={40} className={`${inputClass} uppercase`} /></label>
  </>;
}

export function useFoundationSubmit(kind: FoundationKind, fieldNames: string[]) {
  const submit = useServerFn(submitFoundationForm);
  const [state, setState] = useState<{ status: "idle" | "sending" | "sent"; error?: string | undefined }>({ status: "idle" });
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "");
    const details: Record<string, string> = {};
    for (const n of fieldNames) { const v = get(n).trim(); if (v) details[n] = v; }
    const parsed = foundationSubmissionSchema.safeParse({ kind, fullName: get("fullName"), email: get("email"), phone: get("phone"), coordinatorCode: get("coordinatorCode"), details, message: get("message") });
    if (!parsed.success) { setState({ status: "idle", error: parsed.error.issues[0]?.message ?? "Please check the form and try again." }); return; }
    setState({ status: "sending" });
    try { await submit({ data: parsed.data }); setState({ status: "sent" }); }
    catch (error) { setState({ status: "idle", error: error instanceof Error ? error.message : "Something went wrong. Please try again." }); }
  }
  return { state, setState, onSubmit };
}

export function FoundationSent({ text }: { text: string }) {
  return <div role="status" className="flex flex-col items-center py-6 text-center text-foundation-ink"><CheckCircle2 className="h-12 w-12 text-foundation-green" aria-hidden="true" /><p className="mt-3 text-lg font-bold">Thank you!</p><p className="mt-1 max-w-sm text-sm text-foundation-ink/75">{text}</p></div>;
}

export function FoundationFormDialog({ kind, onClose }: { kind: Exclude<FoundationKind, "contact"> | null; onClose: () => void }) {
  return <Dialog open={kind !== null} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-2xl overflow-y-auto rounded-2xl border-foundation-green/20 bg-foundation-paper p-5 text-foundation-ink sm:p-7">
      {kind && <FoundationFormBody key={kind} kind={kind} onClose={onClose} />}
    </DialogContent>
  </Dialog>;
}

function FoundationFormBody({ kind, onClose }: { kind: Exclude<FoundationKind, "contact">; onClose: () => void }) {
  const fields = foundationFormFields[kind];
  const { state, onSubmit } = useFoundationSubmit(kind, fields.map(f => f.name));
  return <>
    <DialogHeader><DialogTitle className="text-2xl font-black text-foundation-green">{foundationKindLabels[kind]}</DialogTitle><DialogDescription className="text-foundation-ink/70">RILOYD Foundation · Fields marked * are required.</DialogDescription></DialogHeader>
    {state.status === "sent" ? <><FoundationSent text="Your form has reached the RILOYD Foundation team. We will contact you on the email or mobile number you shared." /><Button onClick={onClose} className="w-full rounded-full bg-foundation-green text-foundation-paper hover:bg-foundation-green/90">Close</Button></>
      : <form onSubmit={onSubmit} noValidate={false} className="mt-2 grid gap-4 sm:grid-cols-2">
        <BasicContactFields />
        <FoundationFields fields={fields} />
        {notes[kind] && <p className="rounded-lg bg-foundation-sage px-3 py-2 text-xs text-foundation-ink/80 sm:col-span-2">{notes[kind]}</p>}
        {state.error && <p role="alert" className="text-sm font-semibold text-foundation-maroon sm:col-span-2">{state.error}</p>}
        <Button type="submit" disabled={state.status === "sending"} className="h-11 rounded-full bg-foundation-maroon text-foundation-paper hover:bg-foundation-maroon/90 sm:col-span-2">{state.status === "sending" ? "Sending…" : "Submit"}</Button>
      </form>}
  </>;
}
