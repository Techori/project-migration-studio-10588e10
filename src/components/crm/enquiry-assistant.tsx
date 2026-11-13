import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { triageEnquiry } from "@/lib/crm/enquiry-triage.functions";
import type { TriageResult } from "@/lib/crm/enquiry-triage";

const input = "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
const urgencyStyle: Record<TriageResult["urgency"], string> = { high: "bg-destructive/15 text-destructive", medium: "bg-primary/15 text-primary", low: "bg-muted text-muted-foreground" };

/** CRM admins paste an enquiry; the AI suggests a category, urgency and a reply draft. Nothing is saved. */
export function CrmEnquiryAssistant() {
  const run = useServerFn(triageEnquiry);
  const [message, setMessage] = useState(""); const [name, setName] = useState("");
  const [tone, setTone] = useState<"friendly" | "formal">("friendly"); const [language, setLanguage] = useState<"English" | "Hindi">("English");
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [result, setResult] = useState<TriageResult | null>(null);
  const [reply, setReply] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setResult(null);
    try {
      const r = await run({ data: { message, senderName: name, tone, language } });
      if (r.error || !r.result) setError(r.error ?? "No answer."); else { setResult(r.result); setReply(`Subject: ${r.result.replySubject}\n\n${r.result.replyBody}`); }
    } catch (err) { setError(err instanceof Error ? err.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <div className="grid gap-6 lg:grid-cols-2">
    <form onSubmit={e => void submit(e)} className="space-y-4 rounded-lg border border-border p-5">
      <p className="text-sm text-muted-foreground">Paste an enquiry. The AI suggests the lead category, how urgent it is and a reply you can edit. Only the text below is sent to the AI; nothing is saved.</p>
      <label className="block text-sm font-semibold">Sender name (optional)<input className={input} value={name} maxLength={100} onChange={e => setName(e.target.value)} /></label>
      <label className="block text-sm font-semibold">Enquiry message<textarea required className={`${input} min-h-48`} value={message} maxLength={4000} onChange={e => setMessage(e.target.value)} placeholder="Paste the customer's message here. Leave out phone numbers or bank details." /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm font-semibold">Reply tone<select className={input} value={tone} onChange={e => setTone(e.target.value as "friendly" | "formal")}><option value="friendly">Friendly</option><option value="formal">Formal</option></select></label>
        <label className="text-sm font-semibold">Reply language<select className={input} value={language} onChange={e => setLanguage(e.target.value as "English" | "Hindi")}><option>English</option><option>Hindi</option></select></label>
      </div>
      <Button type="submit" disabled={busy || message.trim().length < 10}><Sparkles className="size-4" />{busy ? "Analysing…" : "Analyse enquiry"}</Button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>
    <div className="rounded-lg border border-border p-5">
      {!result && !busy && <p className="text-sm text-muted-foreground">The category, urgency and reply draft appear here.</p>}
      {busy && <p className="text-sm text-muted-foreground" aria-live="polite">Reading the enquiry…</p>}
      {result && <div className="space-y-4">
        <div className="flex flex-wrap gap-2"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold">{result.category}</span><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${urgencyStyle[result.urgency]}`}>{result.urgency} urgency</span></div>
        <p className="text-sm"><b>Why:</b> {result.urgencyReason}</p>
        <p className="text-sm"><b>Summary:</b> {result.summary}</p>
        <p className="text-sm"><b>Next step:</b> {result.suggestedNextStep}</p>
        <label className="block text-sm font-semibold">Reply draft (edit before sending)<textarea className={`${input} min-h-64`} value={reply} onChange={e => setReply(e.target.value)} /></label>
        <Button type="button" variant="outline" onClick={() => { void navigator.clipboard.writeText(reply).then(() => toast.success("Reply copied.")); }}><Copy className="size-4" />Copy reply</Button>
        <p className="text-xs text-muted-foreground">AI suggestions can be wrong. Check facts, prices and dates before sending.</p>
      </div>}
    </div>
  </div>;
}
