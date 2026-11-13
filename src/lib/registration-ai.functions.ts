import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { registrationConfigs, type RegistrationCategory } from "./registration-config";

export type RegistrationAiSummary = { keyPoints: string[]; missingDetails: string[]; reviewQuestions: string[] };

const summarySchema = z.object({ keyPoints: z.array(z.string()), missingDetails: z.array(z.string()), reviewQuestions: z.array(z.string()) });

export const summarizeRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<{ summary: RegistrationAiSummary | null; error: string | null }> => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !admin) throw new Error("Admin access required.");
    const { data: row, error } = await context.supabase.from("registration_applications").select("category, details, document_name").eq("id", data.id).single();
    if (error || !row) throw new Error("Registration not found.");

    const config = registrationConfigs[row.category as RegistrationCategory];
    const details = (row.details ?? {}) as Record<string, unknown>;
    // Contact details (email, phone) are intentionally not sent to the AI.
    const lines = config.sections.flatMap(section => section.fields
      .filter(field => field.type !== "file" && !["email", "phone", "fullName"].includes(field.name))
      .map(field => {
        const value = details[field.name];
        const text = Array.isArray(value) ? value.join(", ") : String(value ?? "").trim();
        return `- ${field.label}${field.required ? " (required)" : ""}: ${text || "[not provided]"}`;
      }));
    lines.push(`- Supporting document: ${row.document_name ? "uploaded" : "[not provided]"}`);

    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    try {
      const response = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: "You help the Riloyd admin team review registrations from mentors, investors, startups and businesses before approval. Be concise, factual and neutral. Only use the submitted information; never invent facts. Write in clear English.",
        input: `Registration type: ${row.category}\n\nSubmitted details:\n${lines.join("\n")}\n\nReturn: 3-6 key points about this applicant; missing, vague or weak details worth checking (empty list if none); and 3-6 specific questions the admin could ask before approving.`,
        text: { format: { type: "json_schema", name: "registration_review", strict: true, schema: { type: "object", additionalProperties: false, required: ["keyPoints", "missingDetails", "reviewQuestions"], properties: { keyPoints: { type: "array", items: { type: "string" } }, missingDetails: { type: "array", items: { type: "string" } }, reviewQuestions: { type: "array", items: { type: "string" } } } } } },
      });
      const text = response.output.flatMap(item => item.type === "message" ? item.content : []).map(part => part.type === "output_text" ? part.text : "").join("");
      const parsed = summarySchema.safeParse(JSON.parse(text));
      if (!parsed.success) return { summary: null, error: "The AI response could not be read. Please try again." };
      return { summary: parsed.data, error: null };
    } catch (err) {
      if (err instanceof GatewayError) {
        console.error("AI summary failed", err.code, err.httpStatus);
        if (err.code === "payment_required") return { summary: null, error: "AI credits have run out. Please add credits and try again." };
        if (err.code === "rate_limited") return { summary: null, error: "Too many AI requests right now. Please wait a minute and try again." };
        return { summary: null, error: "The AI summary is unavailable right now. Please try again later." };
      }
      console.error("AI summary failed", err);
      return { summary: null, error: "The AI summary could not be created." };
    }
  });
