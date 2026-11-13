import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { triageInputSchema, triageJsonSchema, triageResultSchema, type TriageResult } from "./enquiry-triage";

const INSTRUCTIONS = `You help the RILOYD CRM admin team handle website and email enquiries.
RILOYD (Rishishwar Industry Private Limited) runs a startup Funding Programme with an offline summit in Gwalior, the RILOYD Foundation Education Support scholarship & sponsorship registration, the Young Innovators challenge for school students, a Prototype & Seed Funding programme, and business services.
Read the enquiry and return: the best category, an urgency level (high = time-sensitive, payment problem, complaint or deadline; medium = clear interest needing a reply soon; low = general information), a one-line reason, a two-sentence summary, the next step for the team, and a ready-to-send reply.
Rules for the reply: address the sender by name if given, answer only what you can from the enquiry, never invent prices, dates, deadlines, guarantees, selection outcomes or policies, and say a team member will confirm specifics. Do not ask for bank, Aadhaar or card details. Sign off as "Team RILOYD".`;

export const triageEnquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => triageInputSchema.parse(input))
  .handler(async ({ context, data }): Promise<{ result: TriageResult | null; error: string | null }> => {
    const { data: role } = await context.supabase.rpc("crm_role");
    const { data: siteAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (role !== "admin" && !siteAdmin) throw new Error("CRM admin access required.");
    const { streamResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    try {
      const stream = await streamResponse({
        model: "openai/gpt-6-astra",
        instructions: INSTRUCTIONS,
        input: JSON.stringify({ enquiry: data.message, senderName: data.senderName || null, replyTone: data.tone, replyLanguage: data.language }),
        reasoning: { effort: "low" },
        text: { format: { type: "json_schema", name: "enquiry_triage", strict: true, schema: triageJsonSchema } },
      });
      let text = ""; let refused = false; let incomplete = false;
      for await (const event of stream) {
        if (event.type === "response.output_text.delta") text += event.delta;
        if (event.type === "response.refusal.delta" || event.type === "response.refusal.done") refused = true;
        if (event.type === "response.incomplete") incomplete = true;
      }
      if (refused) return { result: null, error: "The AI declined to handle this message." };
      if (incomplete || !text) return { result: null, error: "The AI answer was incomplete. Please try again." };
      const parsed = triageResultSchema.safeParse(JSON.parse(text));
      if (!parsed.success) return { result: null, error: "The AI answer could not be read. Please try again." };
      return { result: parsed.data, error: null };
    } catch (err) {
      if (err instanceof GatewayError) {
        console.error("Enquiry triage failed", err.code, err.httpStatus);
        if (err.code === "payment_required") return { result: null, error: "AI credits have run out. Please add credits and try again." };
        if (err.code === "rate_limited") return { result: null, error: "Too many AI requests right now. Please wait a minute and try again." };
        if (err.code === "permission_denied") return { result: null, error: err.recovery?.message ?? "AI access is not available for this workspace." };
        return { result: null, error: "The AI helper is unavailable right now. Please try again later." };
      }
      console.error("Enquiry triage failed", err);
      return { result: null, error: "The AI helper could not process this message." };
    }
  });
