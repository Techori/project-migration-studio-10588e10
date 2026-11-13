import { useEffect, useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CheckCircle2, Download, Lightbulb, LoaderCircle, Square } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { studentFee, studentFeeTotal, studentIdeaSchema, studentRegistrationSchema } from "@/lib/young-innovators-forms";
import { registerStudentIdea } from "@/lib/young-innovators.functions";
import { consumeAssessmentLines } from "@/lib/prototype-assessment";

function ClassSelect({ value, onChange, id }: { value: number; onChange: (value: number) => void; id: string }) {
  return <Select value={String(value)} onValueChange={v => onChange(Number(v))}><SelectTrigger id={id}><SelectValue /></SelectTrigger><SelectContent>{[6, 7, 8, 9, 10, 11, 12].map(c => <SelectItem key={c} value={String(c)}>Class {c}</SelectItem>)}</SelectContent></Select>;
}
export function StudentMarketAdvisor() {
  const [schoolClass, setClass] = useState(6);
  const [idea, setIdea] = useState(""); const [customer, setCustomer] = useState("");
  const [consent, setConsent] = useState(false); const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState(""); const [error, setError] = useState(""); const [status, setStatus] = useState("");
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  async function submit(e: FormEvent) {
    e.preventDefault(); setError("");
    const parsed = studentIdeaSchema.safeParse({ schoolClass, idea, customer, consent });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check your details."); return; }
    const controller = new AbortController(); abort.current = controller; setBusy(true); setOutput(""); setStatus("Preparing your student market-validation plan…");
    try {
      const response = await fetch("/api/public/young-market-plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data), signal: controller.signal });
      if (!response.ok) { const body = await response.json(); throw new Error(body.message ?? "AI advice is unavailable."); }
      if (!response.body) throw new Error("The plan could not be read.");
      await consumeAssessmentLines(response.body.getReader(), part => {
        if (part.type === "text") setOutput(previous => previous + (part.text ?? ""));
        if (part.type === "error") { setError(part.message ?? "The plan is incomplete."); setStatus(""); }
        if (part.type === "done") setStatus("Your learning plan is ready. Review it with a parent or teacher.");
      });
    } catch (err) { if (controller.signal.aborted) setStatus("Stopped. Any partial plan is incomplete."); else { setError(err instanceof Error ? err.message : "The plan could not finish."); setStatus(""); } }
    finally { setBusy(false); abort.current = null; }
  }
  function download() { const url = URL.createObjectURL(new Blob([output], { type: "text/plain" })); const a = document.createElement("a"); a.href = url; a.download = "riloyd-student-market-plan.txt"; a.click(); URL.revokeObjectURL(url); }
  return <div className="grid gap-10 lg:grid-cols-2"><form onSubmit={submit} className="space-y-5"><div className="space-y-2"><Label htmlFor="market-class">Your class</Label><ClassSelect id="market-class" value={schoolClass} onChange={setClass} /></div><div className="space-y-2"><Label htmlFor="market-idea">Your business or startup idea</Label><Textarea id="market-idea" rows={5} required minLength={40} maxLength={3000} value={idea} onChange={e => setIdea(e.target.value)} disabled={busy} placeholder="What would you make or offer? What problem would it solve?" /></div><div className="space-y-2"><Label htmlFor="market-customer">Who might use or buy it?</Label><Textarea id="market-customer" rows={3} required minLength={10} maxLength={1000} value={customer} onChange={e => setCustomer(e.target.value)} disabled={busy} placeholder="Describe a group of customers, not anyone’s personal details." /></div><div className="flex items-start gap-3"><Checkbox id="market-consent" checked={consent} onCheckedChange={v => setConsent(v === true)} disabled={busy} /><Label htmlFor="market-consent" className="text-xs leading-relaxed">My parent or guardian approves sending this idea to AI. I have excluded names, contact details, identity documents and private information.</Label></div><p className="text-xs text-muted-foreground">Only the class and idea descriptions go to AI. This plan is not saved in the registration inbox and does not register you.</p><div className="flex flex-wrap gap-3"><Button disabled={busy || !consent} type="submit">{busy ? <LoaderCircle className="animate-spin" /> : <Lightbulb />}{busy ? "Preparing plan…" : "Create my market plan"}</Button>{busy && <Button variant="outline" type="button" onClick={() => abort.current?.abort()}><Square />Stop</Button>}</div></form><div className="min-w-0 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"><h3 className="text-xl font-bold">Your first market-validation plan</h3><p role="status" className="mt-3 text-sm text-muted-foreground">{status || "Awaiting your idea."}</p>{error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}{output && <div className="mt-5 whitespace-pre-wrap break-words text-sm leading-relaxed">{output}</div>}{output && !busy && !error && <Button variant="outline" className="mt-5" onClick={download}><Download />Save plan</Button>}<p className="mt-6 text-xs text-muted-foreground">AI can make mistakes. Market demand must be tested, not assumed. All research and testing should be supervised by an adult.</p></div></div>;
}

export function StudentRegistration() {
  const submitRegistration = useServerFn(registerStudentIdea);
  const [schoolClass, setClass] = useState(6); const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [code, setCode] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); const form = new FormData(e.currentTarget);
    const parsed = studentRegistrationSchema.safeParse({ ...Object.fromEntries(form.entries()), schoolClass, guardianConsent: consent });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Please check the form."); return; }
    setBusy(true);
    try { const result = await submitRegistration({ data: parsed.data }); setCode(result.applicationCode); }
    catch (err) { setError(err instanceof Error ? err.message : "Registration could not be saved."); }
    finally { setBusy(false); }
  }
  if (code) return <div className="border-l-2 border-primary py-4 pl-6"><CheckCircle2 className="text-primary" size={32} /><h3 className="mt-4 text-2xl font-bold">Registration received</h3><p className="mt-3 text-sm">Your reference: <strong>{code}</strong></p><p className="mt-3 text-sm text-muted-foreground">Your registration is in Riloyd’s private student inbox. It is not a payment receipt or a selection confirmation. Keep this reference; the team can contact your guardian about next steps.</p></div>;
  return <form onSubmit={submit} className="space-y-6"><p className="text-sm text-muted-foreground">A parent or legal guardian must complete or supervise this form. No student phone number, email, identity document or exact address is required.</p><fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">{[["studentName", "Student name", "text", 100], ["city", "City", "text", 100], ["guardianName", "Parent / guardian name", "text", 100], ["guardianEmail", "Parent / guardian email", "email", 254], ["guardianPhone", "Parent / guardian phone", "tel", 20], ["ideaTitle", "Business / startup idea name", "text", 120]].map(([name, label, type, max]) => <div key={String(name)} className="space-y-2"><Label htmlFor={`register-${name}`}>{label}</Label><Input id={`register-${name}`} name={String(name)} type={String(type)} maxLength={Number(max)} required /></div>)}<div className="space-y-2"><Label htmlFor="register-class">Student class</Label><ClassSelect id="register-class" value={schoolClass} onChange={setClass} /></div><div className="flex flex-col justify-center border-l-2 border-primary pl-4"><p className="text-xs text-muted-foreground">Registration fee</p><p className="mt-1 text-lg font-bold">₹{studentFee(schoolClass)} + 18% GST</p><p className="text-xs text-muted-foreground">Total ₹{studentFeeTotal(schoolClass).toFixed(2)} · Payment not collected here</p></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="register-idea">Describe the student’s idea</Label><Textarea id="register-idea" name="idea" rows={5} required minLength={40} maxLength={3000} placeholder="The problem, proposed business solution and who it could help. Do not include private customer information." /></div></fieldset><div className="flex items-start gap-3"><Checkbox id="register-consent" checked={consent} onCheckedChange={v => setConsent(v === true)} disabled={busy} /><Label htmlFor="register-consent" className="text-xs leading-relaxed">I am the parent or legal guardian and consent to Riloyd storing these registration details privately and contacting me about this student’s participation. I understand that registration does not guarantee selection, rewards or funding.</Label></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" disabled={busy || !consent}>{busy ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}{busy ? "Saving registration…" : "Submit student registration"}</Button></form>;
}