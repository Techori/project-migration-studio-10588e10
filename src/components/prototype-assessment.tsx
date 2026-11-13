import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Download, LoaderCircle, Sparkles, Square } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { consumeAssessmentLines, prototypeAssessmentSchema } from "@/lib/prototype-assessment";

export function PrototypeAssessment() {
  const [idea, setIdea] = useState("");
  const [prototype, setPrototype] = useState("");
  const [context, setContext] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");
  const [consent, setConsent] = useState(false);
  const [saveSubmission, setSaveSubmission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function assess(event: React.FormEvent) {
    event.preventDefault();
    const parsed = prototypeAssessmentSchema.safeParse({ idea, prototype, context, fundingGoal, consent, saveSubmission });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Please complete the form."); return; }
    const abort = new AbortController(); controller.current = abort;
    setLoading(true); setText(""); setError(""); setStatus("Reviewing your idea against the published criteria…");
    try {
      const response = await fetch("/api/public/prototype-assessment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data), signal: abort.signal });
      if (!response.ok) { const body = await response.json(); throw new Error(body.message ?? "The assessment is unavailable."); }
      if (!response.body) throw new Error("The assessment response could not be read.");
      await consumeAssessmentLines(response.body.getReader(), part => {
        if (part.type === "text") { setText(previous => previous + (part.text ?? "")); setStatus("Assessment in progress…"); }
        if (part.type === "error") { setError(part.message ?? "The assessment could not finish."); setStatus(""); }
        if (part.type === "done") setStatus("Assessment complete — preliminary guidance only.");
        if (part.type === "saved") setStatus("Assessment complete. Prototype details and AI guidance saved for Riloyd review.");
      });
    } catch (err) {
      if (abort.signal.aborted) setStatus("Assessment stopped — any partial guidance is incomplete.");
      else { setError(err instanceof Error ? err.message : "The assessment could not finish."); setStatus(""); }
    } finally { setLoading(false); controller.current = null; }
  }

  return <div className="grid gap-10 lg:grid-cols-2">
    <form onSubmit={assess} className="space-y-5">
      <p className="text-sm leading-relaxed text-muted-foreground">Get a preliminary review based on the published eligibility criteria. This is not an application or a funding decision.</p>
      <div className="space-y-2"><Label htmlFor="assessment-idea">Startup idea &amp; target users</Label><Textarea id="assessment-idea" value={idea} onChange={event => setIdea(event.target.value)} required minLength={40} maxLength={4000} rows={5} disabled={loading} placeholder="What problem are you solving, who faces it, and what makes your solution different?" /></div>
      <div className="space-y-2"><Label htmlFor="assessment-prototype">Prototype, progress &amp; next milestone</Label><Textarea id="assessment-prototype" value={prototype} onChange={event => setPrototype(event.target.value)} required minLength={30} maxLength={4000} rows={5} disabled={loading} placeholder="Idea, PoC or prototype? Describe evidence, what you will build or test, timeline and estimated budget." /></div>
      <div className="space-y-2"><Label htmlFor="assessment-funding">Funding goal &amp; use of funds</Label><Textarea id="assessment-funding" value={fundingGoal} onChange={event => setFundingGoal(event.target.value)} required minLength={20} maxLength={2000} rows={4} disabled={loading} placeholder="Amount and currency, what the funding will pay for, the milestone it will unlock, and your target timeline." /><p className="text-xs leading-relaxed text-muted-foreground">Get tailored budget, validation and pitch-preparation suggestions—not a funding offer.</p></div>
      <div className="space-y-2"><Label htmlFor="assessment-context">Eligibility context</Label><Textarea id="assessment-context" value={context} onChange={event => setContext(event.target.value)} required minLength={15} maxLength={2000} rows={3} disabled={loading} placeholder="India connection, whether you meet the age requirement, ownership or permission to use your idea, and availability to pitch." /></div>
      <div className="flex items-start gap-3"><Checkbox id="assessment-consent" checked={consent} onCheckedChange={value => setConsent(value === true)} disabled={loading} /><Label htmlFor="assessment-consent" className="text-xs leading-relaxed text-muted-foreground">I agree to send these descriptions to the AI service for this assessment. I have excluded contact details, identification, trade secrets and private customer data.</Label></div>
      <div className="flex items-start gap-3"><Checkbox id="assessment-save" checked={saveSubmission} onCheckedChange={value => setSaveSubmission(value === true)} disabled={loading} /><Label htmlFor="assessment-save" className="text-xs leading-relaxed text-muted-foreground">Save my prototype details, funding goal and completed AI guidance for private review by Riloyd admins. This does not register me for the programme or confirm funding.</Label></div>
      <div className="flex flex-wrap gap-3"><Button type="submit" disabled={loading || !consent}>{loading ? <LoaderCircle className="animate-spin" /> : <Sparkles />}{loading ? "Assessing…" : "Assess my idea"}</Button>{loading && <Button type="button" variant="outline" onClick={() => controller.current?.abort()}><Square />Stop</Button>}</div>
    </form>
    <div className="min-w-0 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
      <h3 className="text-xl font-bold">Your assessment &amp; preparation plan</h3>
      <p className="mt-3 text-sm text-muted-foreground" role="status" aria-live="polite">{status || (!text && !error ? "Awaiting your idea." : "")}</p>
      {error && <p role="alert" className="mt-4 border-l-2 border-destructive pl-4 text-sm text-foreground">{error}</p>}
      {text && <div className="mt-5 whitespace-pre-wrap break-words text-sm leading-relaxed">{text}</div>}
      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">AI can make mistakes and cannot verify your claims. Final eligibility, selection and funding terms are determined by the Riloyd team.</p>
      <div className="mt-5 flex flex-wrap gap-3"><Button asChild variant="outline"><a href="/downloads/riloyd-prototype-applicant-checklist.pdf" download><Download />Applicant checklist</a></Button><Button asChild variant="outline"><Link to="/contact" hash="message">Contact the team <ArrowRight /></Link></Button></div>
    </div>
  </div>;
}